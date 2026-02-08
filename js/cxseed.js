// ComfyUI - cxSeed
// Custom seed generation node with control options
// Part of the cxSlider package

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// Utility function to clamp values
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Generate random seed within range
function randomSeed(min, max) {
    // Use BigInt for large seed values
    const range = BigInt(max) - BigInt(min) + 1n;
    const randomBig = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    return Number(BigInt(min) + (randomBig % range));
}

// Calculate max value from digit count
function maxFromDigits(digits) {
    if (digits <= 0) return 0xffffffffffffffff;
    return Math.pow(10, digits) - 1;
}

// Helper to remove internal LiteGraph properties from Properties Panel
function cleanProperties(node) {
    if (node.properties) {
        delete node.properties.aux_id;
    }
}

app.registerExtension({
    name: "cxSeed",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "cxSeed") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        
        nodeType.prototype.onNodeCreated = function() {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            
            // Initialize custom properties
            this.seedProps = {
                min: 0,
                max: 0xffffffffffffffff,
                max_digits: 0, // 0 means no digit limit
                lastSeed: null
            };
            
            // Sync with node.properties for Properties Panel
            this.properties = this.properties || {};
            this.properties.min = this.seedProps.min;
            this.properties.max = this.seedProps.max;
            this.properties.max_digits = this.seedProps.max_digits;
            
            // Remove internal LiteGraph properties
            cleanProperties(this);
            
            // Layout constants
            this.buttonAreaY = 0; // Will be calculated
            this.buttonHeight = 22;
            this.buttonPadding = 5;
            
            // Hover state for tooltips
            this.hoveredButton = null;
            
            // Find widgets
            this._setupWidgets();
            
            // Set up execution listener
            this._setupExecutionListener();
        };
        
        // Setup widget references
        nodeType.prototype._setupWidgets = function() {
            if (!this.widgets) return;

            this._seedWidget = this.widgets.find(w => w.name === "seed");
            // ComfyUI creates a linked control widget for seeds.
            // Node 2.0 frontend may name it based on the control_after_generate
            // value (e.g. "randomize") instead of "control_after_generate".
            // Use linkedWidgets first, then fall back to name-based lookups.
            this._controlWidget = null;
            if (this._seedWidget && this._seedWidget.linkedWidgets) {
                this._controlWidget = this._seedWidget.linkedWidgets[0] || null;
            }
            if (!this._controlWidget) {
                const controlValues = ["fixed", "increment", "decrement", "randomize"];
                this._controlWidget = this.widgets.find(w =>
                    w.name === "control_after_generate" ||
                    (w.type === "combo" &&
                     w.options && w.options.values &&
                     controlValues.every(v => w.options.values.includes(v)))
                ) || null;
            }

            // Calculate button area position (below widgets)
            if (this.widgets.length > 0) {
                // Widgets start around y=26, each widget is ~26px
                this.buttonAreaY = 26 + (this.widgets.length * 26) + 5;
            }
        };
        
        // Get seed widget
        nodeType.prototype._getSeedWidget = function() {
            if (!this._seedWidget && this.widgets) {
                this._seedWidget = this.widgets.find(w => w.name === "seed");
            }
            return this._seedWidget;
        };
        
        // Get built-in control widget
        nodeType.prototype._getControlWidget = function() {
            if (!this._controlWidget && this.widgets) {
                // Try linkedWidgets first (Node 2.0 pattern)
                const seedWidget = this._getSeedWidget();
                if (seedWidget && seedWidget.linkedWidgets) {
                    this._controlWidget = seedWidget.linkedWidgets[0] || null;
                }
                // Fall back to name/type matching
                if (!this._controlWidget) {
                    const controlValues = ["fixed", "increment", "decrement", "randomize"];
                    this._controlWidget = this.widgets.find(w =>
                        w.name === "control_after_generate" ||
                        (w.type === "combo" &&
                         w.options && w.options.values &&
                         controlValues.every(v => w.options.values.includes(v)))
                    ) || null;
                }
            }
            return this._controlWidget;
        };
        
        // Get effective max (considering max_digits)
        nodeType.prototype._getEffectiveMax = function() {
            const maxDigits = this.seedProps.max_digits;
            if (maxDigits > 0) {
                const digitMax = maxFromDigits(maxDigits);
                return Math.min(this.seedProps.max, digitMax);
            }
            return this.seedProps.max;
        };
        
        // Get current seed value
        nodeType.prototype._getSeed = function() {
            const widget = this._getSeedWidget();
            return widget ? widget.value : 0;
        };
        
        // Set seed value
        nodeType.prototype._setSeed = function(value) {
            value = Math.floor(value);
            value = clamp(value, this.seedProps.min, this._getEffectiveMax());
            
            const widget = this._getSeedWidget();
            if (widget) {
                widget.value = value;
            }
        };
        
        // Get control mode from built-in widget
        nodeType.prototype._getControlMode = function() {
            const widget = this._getControlWidget();
            return widget ? widget.value : "randomize";
        };
        
        // Set control mode on built-in widget
        nodeType.prototype._setControlMode = function(mode) {
            const widget = this._getControlWidget();
            if (widget) {
                widget.value = mode;
            }
        };
        
        // Setup execution listener to track last seed
        nodeType.prototype._setupExecutionListener = function() {
            const self = this;
            
            // Listen for execution complete
            const onExecuted = function(event) {
                if (!event.detail || !event.detail.output) return;
                
                // Check if this node was part of the execution
                const nodeId = String(self.id);
                if (event.detail.node !== nodeId) return;
                
                // Store the last used seed
                self.seedProps.lastSeed = self._getSeed();
                self.setDirtyCanvas(true, true);
            };
            
            api.addEventListener("executed", onExecuted);
            
            // Store reference for cleanup
            this._executedHandler = onExecuted;
        };
        
        // Property change handler (for Properties Panel)
        nodeType.prototype.onPropertyChanged = function(name, value) {
            // Remove internal properties if they appear
            cleanProperties(this);
            
            if (name === "min") {
                this.seedProps.min = Math.max(0, Math.floor(value));
                this.properties.min = this.seedProps.min;
                // Clamp current seed if needed
                const currentSeed = this._getSeed();
                if (currentSeed < this.seedProps.min) {
                    this._setSeed(this.seedProps.min);
                }
            } else if (name === "max") {
                this.seedProps.max = Math.floor(value);
                this.properties.max = this.seedProps.max;
                // Clamp current seed if needed
                const currentSeed = this._getSeed();
                const effectiveMax = this._getEffectiveMax();
                if (currentSeed > effectiveMax) {
                    this._setSeed(effectiveMax);
                }
            } else if (name === "max_digits") {
                this.seedProps.max_digits = Math.max(0, Math.min(19, Math.floor(value))); // 0-19 digits
                this.properties.max_digits = this.seedProps.max_digits;
                // Clamp current seed if needed
                const currentSeed = this._getSeed();
                const effectiveMax = this._getEffectiveMax();
                if (currentSeed > effectiveMax) {
                    this._setSeed(effectiveMax);
                }
            }
            this.setDirtyCanvas(true, true);
        };
        
        // Configure handler for loading saved values
        nodeType.prototype.onConfigure = function(info) {
            if (info.properties) {
                this.seedProps.min = info.properties.min ?? 0;
                this.seedProps.max = info.properties.max ?? 0xffffffffffffffff;
                this.seedProps.max_digits = info.properties.max_digits ?? 0;
                this.seedProps.lastSeed = info.properties.lastSeed ?? null;
                
                // Sync to properties
                this.properties.min = this.seedProps.min;
                this.properties.max = this.seedProps.max;
                this.properties.max_digits = this.seedProps.max_digits;
            }
            
            // Remove internal properties
            cleanProperties(this);
            
            // Re-setup widgets after configure
            this._setupWidgets();
        };
        
        // Calculate button positions (centered)
        nodeType.prototype._getButtonBounds = function() {
            const width = this.size[0];
            const y = this.buttonAreaY;
            const height = this.buttonHeight;
            const buttonWidth = 24; // Small square buttons for emoji
            const gap = 8; // Gap between buttons
            const totalButtonsWidth = buttonWidth * 2 + gap;
            const startX = (width - totalButtonsWidth) / 2; // Center
            
            return {
                useLastSeed: {
                    x: startX,
                    y: y + 16, // Below "Last Seed" label
                    width: buttonWidth,
                    height: height,
                    tooltip: "Use Last → Fixed"
                },
                resetRandom: {
                    x: startX + buttonWidth + gap,
                    y: y + 16,
                    width: buttonWidth,
                    height: height,
                    tooltip: "Randomize"
                }
            };
        };
        
        // Draw the custom UI elements
        nodeType.prototype.onDrawForeground = function(ctx) {
            if (this.flags.collapsed) return;
            
            const width = this.size[0];
            const padding = this.buttonPadding;
            
            // Recalculate button area position
            if (this.widgets && this.widgets.length > 0) {
                this.buttonAreaY = 26 + (this.widgets.length * 26) + 5;
            }
            
            const y = this.buttonAreaY;
            const bounds = this._getButtonBounds();
            
            // Draw "Last:" label and value (centered)
            ctx.fillStyle = "#aaa";
            ctx.font = "11px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            const lastSeedText = this.seedProps.lastSeed !== null 
                ? String(this.seedProps.lastSeed) 
                : "(none)";
            ctx.fillText("Last: " + lastSeedText, width / 2, y);
            
            // Draw "Use Last → Fixed" button (recycle emoji)
            const useBtn = bounds.useLastSeed;
            const useBtnEnabled = this.seedProps.lastSeed !== null;
            const useBtnHovered = this.hoveredButton === "useLastSeed";
            
            ctx.fillStyle = useBtnHovered ? "#5a7a9a" : (useBtnEnabled ? "#4a6a8a" : "#3a3a3a");
            ctx.beginPath();
            ctx.roundRect(useBtn.x, useBtn.y, useBtn.width, useBtn.height, 3);
            ctx.fill();
            
            ctx.strokeStyle = useBtnHovered ? "#7a9aba" : (useBtnEnabled ? "#6a8aaa" : "#4a4a4a");
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(useBtn.x, useBtn.y, useBtn.width, useBtn.height, 3);
            ctx.stroke();
            
            ctx.fillStyle = useBtnEnabled ? "#fff" : "#666";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♻️", useBtn.x + useBtn.width / 2, useBtn.y + useBtn.height / 2);
            
            // Draw "Randomize" button (dice emoji)
            const randBtn = bounds.resetRandom;
            const randBtnHovered = this.hoveredButton === "resetRandom";
            
            ctx.fillStyle = randBtnHovered ? "#6a5a7a" : "#5a4a6a";
            ctx.beginPath();
            ctx.roundRect(randBtn.x, randBtn.y, randBtn.width, randBtn.height, 3);
            ctx.fill();
            
            ctx.strokeStyle = randBtnHovered ? "#8a7a9a" : "#7a6a8a";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(randBtn.x, randBtn.y, randBtn.width, randBtn.height, 3);
            ctx.stroke();
            
            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🎲", randBtn.x + randBtn.width / 2, randBtn.y + randBtn.height / 2);
            
            // Draw tooltip if hovering
            if (this.hoveredButton) {
                const hoveredBounds = bounds[this.hoveredButton];
                if (hoveredBounds && hoveredBounds.tooltip) {
                    ctx.font = "11px Arial";
                    const tooltipText = hoveredBounds.tooltip;
                    const textWidth = ctx.measureText(tooltipText).width;
                    const tooltipX = hoveredBounds.x + hoveredBounds.width / 2 - textWidth / 2 - 4;
                    const tooltipY = hoveredBounds.y - 20;
                    const tooltipWidth = textWidth + 8;
                    const tooltipHeight = 16;
                    
                    // Tooltip background
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.beginPath();
                    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 3);
                    ctx.fill();
                    
                    // Tooltip text
                    ctx.fillStyle = "#fff";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(tooltipText, hoveredBounds.x + hoveredBounds.width / 2, tooltipY + tooltipHeight / 2);
                }
            }
        };
        
        // Check if point is in button
        nodeType.prototype._isInButton = function(x, y, button) {
            return x >= button.x && x <= button.x + button.width &&
                   y >= button.y && y <= button.y + button.height;
        };
        
        // Mouse move handler for hover tooltips
        nodeType.prototype.onMouseMove = function(e, pos, canvas) {
            if (this.flags.collapsed) return;
            
            const localX = pos[0];
            const localY = pos[1];
            const bounds = this._getButtonBounds();
            
            let newHovered = null;
            
            if (this._isInButton(localX, localY, bounds.useLastSeed)) {
                newHovered = "useLastSeed";
            } else if (this._isInButton(localX, localY, bounds.resetRandom)) {
                newHovered = "resetRandom";
            }
            
            if (newHovered !== this.hoveredButton) {
                this.hoveredButton = newHovered;
                this.setDirtyCanvas(true, false);
            }
        };
        
        // Mouse leave handler
        nodeType.prototype.onMouseLeave = function(e) {
            if (this.hoveredButton) {
                this.hoveredButton = null;
                this.setDirtyCanvas(true, false);
            }
        };
        
        // Mouse down handler
        nodeType.prototype.onMouseDown = function(e, pos, canvas) {
            if (this.flags.collapsed) return false;
            
            // Clear hover state when clicking
            this.hoveredButton = null;
            
            const localX = pos[0];
            const localY = pos[1];
            const bounds = this._getButtonBounds();
            
            // Check "Use Last → Fixed" button
            if (this._isInButton(localX, localY, bounds.useLastSeed)) {
                if (this.seedProps.lastSeed !== null) {
                    this._setSeed(this.seedProps.lastSeed);
                    this._setControlMode("fixed");
                    this.setDirtyCanvas(true, true);
                }
                return true;
            }
            
            // Check "Randomize" button
            if (this._isInButton(localX, localY, bounds.resetRandom)) {
                this._setControlMode("randomize");
                this._setSeed(randomSeed(this.seedProps.min, this._getEffectiveMax()));
                this.setDirtyCanvas(true, true);
                return true;
            }
            
            return false;
        };
        
        // Serialize properties
        nodeType.prototype.onSerialize = function(info) {
            info.properties = {
                min: this.seedProps.min,
                max: this.seedProps.max,
                max_digits: this.seedProps.max_digits,
                lastSeed: this.seedProps.lastSeed
            };
        };
        
        // Compute minimum size - return small values to allow free resizing
        nodeType.prototype.computeSize = function() {
            // Return minimum dimensions - user can resize larger
            // Height based on widget count + button area
            const widgetHeight = this.widgets ? (26 + this.widgets.length * 26) : 52;
            const buttonAreaHeight = 45;
            return [100, widgetHeight + buttonAreaHeight]; // Small min width allows shrinking
        };
        
        // Get extra menu options
        nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
            const self = this;
            
            options.push(null);
            options.push({
                content: "Randomize Seed Now",
                callback: () => {
                    self._setSeed(randomSeed(self.seedProps.min, self._getEffectiveMax()));
                    self.setDirtyCanvas(true, true);
                }
            });
            options.push({
                content: "Reset to Defaults",
                callback: () => {
                    self.seedProps.min = 0;
                    self.seedProps.max = 0xffffffffffffffff;
                    self.seedProps.max_digits = 0;
                    
                    self.properties.min = 0;
                    self.properties.max = 0xffffffffffffffff;
                    self.properties.max_digits = 0;
                    
                    cleanProperties(self);
                    
                    self._setControlMode("randomize");
                    self._setSeed(randomSeed(0, 0xffffffffffffffff));
                    self.setDirtyCanvas(true, true);
                }
            });
        };
        
        // Cleanup on removal
        nodeType.prototype.onRemoved = function() {
            if (this._executedHandler) {
                api.removeEventListener("executed", this._executedHandler);
            }
        };
    }
});
