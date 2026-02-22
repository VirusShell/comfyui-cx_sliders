// ComfyUI - cxSeed
// Custom seed generation node with control options
// Part of the cxSlider package

import { app } from "../../scripts/app.js";

const CX_VERSION = "1.2.3";

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
    node.properties.ver = CX_VERSION;
  }
}

// Calculate Y offset for custom content (below input/output slot area)
function getContentStartY(node) {
  const SLOT_HEIGHT =
    (typeof LiteGraph !== "undefined" && LiteGraph.NODE_SLOT_HEIGHT) || 20;
  const numOutputs = node.outputs ? node.outputs.length : 0;
  let numInputSlots = 0;
  if (node.inputs) {
    for (const inp of node.inputs) {
      const hasWidget =
        node.widgets &&
        node.widgets.find(
          (w) => w.name === inp.name && w.type !== "converted-widget",
        );
      if (!hasWidget) numInputSlots++;
    }
  }
  return Math.max(numInputSlots, numOutputs) * SLOT_HEIGHT;
}

app.registerExtension({
  name: "cxSeed",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxSeed") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties
      this.seedProps = {
        min: 0,
        max: 0xffffffffffffffff,
        max_digits: 0, // 0 means no digit limit
        lastSeed: null, // single-level undo for Recall button
      };

      // Sync with node.properties for Properties Panel
      this.properties = this.properties || {};
      this.properties.min = this.seedProps.min;
      this.properties.max = this.seedProps.max;
      this.properties.max_digits = this.seedProps.max_digits;

      // Remove internal LiteGraph properties
      cleanProperties(this);

      // Layout constants
      this.buttonPadding = 5;

      // Hover state
      this.hoveredButton = null;

      // Defer widget setup to next frame (Node 2.0 links widgets async)
      const self = this;
      requestAnimationFrame(() => {
        self._setupWidgets();
        // Set output labels to lowercase
        if (self.outputs) {
          for (const out of self.outputs) {
            out.label = out.name.toLowerCase();
          }
        }
        const computed = self.computeSize();
        self.size = [Math.max(200, computed[0]), computed[1]];
        self.setDirtyCanvas(true, true);
      });
    };

    // Setup widget references
    nodeType.prototype._setupWidgets = function () {
      if (!this.widgets) return;

      this._seedWidget = this.widgets.find((w) => w.name === "seed");
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
        this._controlWidget =
          this.widgets.find(
            (w) =>
              w.name === "control_after_generate" ||
              (w.type === "combo" &&
                w.options &&
                w.options.values &&
                controlValues.every((v) => w.options.values.includes(v))),
          ) || null;
      }
    };

    // Get seed widget
    nodeType.prototype._getSeedWidget = function () {
      if (!this._seedWidget && this.widgets) {
        this._seedWidget = this.widgets.find((w) => w.name === "seed");
      }
      return this._seedWidget;
    };

    // Get built-in control widget
    nodeType.prototype._getControlWidget = function () {
      if (!this._controlWidget && this.widgets) {
        // Try linkedWidgets first (Node 2.0 pattern)
        const seedWidget = this._getSeedWidget();
        if (seedWidget && seedWidget.linkedWidgets) {
          this._controlWidget = seedWidget.linkedWidgets[0] || null;
        }
        // Fall back to name/type matching
        if (!this._controlWidget) {
          const controlValues = [
            "fixed",
            "increment",
            "decrement",
            "randomize",
          ];
          this._controlWidget =
            this.widgets.find(
              (w) =>
                w.name === "control_after_generate" ||
                (w.type === "combo" &&
                  w.options &&
                  w.options.values &&
                  controlValues.every((v) => w.options.values.includes(v))),
            ) || null;
        }
      }
      return this._controlWidget;
    };

    // Get effective max (considering max_digits)
    nodeType.prototype._getEffectiveMax = function () {
      const maxDigits = this.seedProps.max_digits;
      if (maxDigits > 0) {
        const digitMax = maxFromDigits(maxDigits);
        return Math.min(this.seedProps.max, digitMax);
      }
      return this.seedProps.max;
    };

    // Get current seed value
    nodeType.prototype._getSeed = function () {
      const widget = this._getSeedWidget();
      return widget ? widget.value : 0;
    };

    // Set seed value
    nodeType.prototype._setSeed = function (value) {
      value = Math.floor(value);
      value = clamp(value, this.seedProps.min, this._getEffectiveMax());

      const widget = this._getSeedWidget();
      if (widget) {
        widget.value = value;
      }
    };

    // Get control mode from built-in widget
    nodeType.prototype._getControlMode = function () {
      const widget = this._getControlWidget();
      return widget ? widget.value : "randomize";
    };

    // Set control mode on built-in widget
    nodeType.prototype._setControlMode = function (mode) {
      const widget = this._getControlWidget();
      if (widget) {
        widget.value = mode;
      }
    };

    // Property change handler (for Properties Panel)
    nodeType.prototype.onPropertyChanged = function (name, value) {
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
        this.seedProps.max_digits = Math.max(
          0,
          Math.min(19, Math.floor(value)),
        ); // 0-19 digits
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
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.seedProps.min = info.properties.min ?? 0;
        this.seedProps.max = info.properties.max ?? 0xffffffffffffffff;
        this.seedProps.max_digits = info.properties.max_digits ?? 0;

        // Sync to properties
        this.properties.min = this.seedProps.min;
        this.properties.max = this.seedProps.max;
        this.properties.max_digits = this.seedProps.max_digits;
      }

      // Remove internal properties
      cleanProperties(this);

      // Re-setup widgets after configure
      this._setupWidgets();

      // Ensure node size after configure
      const computed = this.computeSize();
      this.size = [
        Math.max(this.size[0], computed[0]),
        Math.max(this.size[1], computed[1]),
      ];

      // Set output labels to lowercase
      if (this.outputs) {
        for (const out of this.outputs) {
          out.label = out.name.toLowerCase();
        }
      }
    };

    // Get button bounds — buttons sit on the output slot row (left-aligned)
    nodeType.prototype._getButtonBounds = function () {
      const buttonSize = 20;
      const gap = 6;
      const totalWidth = buttonSize * 2 + gap;
      const startX = (this.size[0] - totalWidth) / 2;
      // Slot row is at y=0 in the content area
      const slotRowY = 1;

      return {
        useLastSeed: {
          x: startX,
          y: slotRowY,
          width: buttonSize,
          height: buttonSize,
        },
        resetRandom: {
          x: startX + buttonSize + gap,
          y: slotRowY,
          width: buttonSize,
          height: buttonSize,
        },
      };
    };

    // Draw the custom UI elements
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      // Safety check — deferred setup may not have run yet
      if (!this._seedWidget) {
        this._setupWidgets();
      }

      const bounds = this._getButtonBounds();
      const hasLastSeed = this.seedProps.lastSeed !== null;

      // Draw "Recall" button (recycle emoji) on slot row
      const useBtn = bounds.useLastSeed;
      const useBtnHovered = this.hoveredButton === "useLastSeed";

      ctx.fillStyle = useBtnHovered
        ? "#5a7a9a"
        : hasLastSeed
          ? "#4a6a8a"
          : "#3a3a3a";
      ctx.beginPath();
      ctx.roundRect(useBtn.x, useBtn.y, useBtn.width, useBtn.height, 3);
      ctx.fill();

      ctx.strokeStyle = useBtnHovered
        ? "#7a9aba"
        : hasLastSeed
          ? "#6a8aaa"
          : "#4a4a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(useBtn.x, useBtn.y, useBtn.width, useBtn.height, 3);
      ctx.stroke();

      ctx.fillStyle = hasLastSeed ? "#fff" : "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "\u267b\ufe0f",
        useBtn.x + useBtn.width / 2,
        useBtn.y + useBtn.height / 2,
      );

      // Draw "Randomize" button (dice emoji) on slot row
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
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "\ud83c\udfb2",
        randBtn.x + randBtn.width / 2,
        randBtn.y + randBtn.height / 2,
      );

      // Draw tooltip if hovering a button
      if (this.hoveredButton) {
        const hoveredBounds = bounds[this.hoveredButton];
        const tooltipText =
          this.hoveredButton === "useLastSeed" ? "Recall" : "Randomize";
        ctx.font = "11px Arial";
        const textWidth = ctx.measureText(tooltipText).width;
        const tooltipWidth = textWidth + 8;
        const tooltipHeight = 16;
        const tooltipX =
          hoveredBounds.x + hoveredBounds.width / 2 - textWidth / 2 - 4;
        const tooltipY = Math.max(0, hoveredBounds.y - tooltipHeight - 4);

        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 3);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          tooltipText,
          hoveredBounds.x + hoveredBounds.width / 2,
          tooltipY + tooltipHeight / 2,
        );
      }
    };

    // Check if point is in button
    nodeType.prototype._isInButton = function (x, y, button) {
      return (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
      );
    };

    // Mouse move handler for hover
    nodeType.prototype.onMouseMove = function (e, pos, canvas) {
      if (this.flags.collapsed) return;

      const localX = pos[0];
      const localY = pos[1];
      const bounds = this._getButtonBounds();

      // Check button hover
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
    nodeType.prototype.onMouseLeave = function (e) {
      if (this.hoveredButton) {
        this.hoveredButton = null;
        this.setDirtyCanvas(true, false);
      }
    };

    // Mouse down handler
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;

      // Clear hover state when clicking
      this.hoveredButton = null;

      const localX = pos[0];
      const localY = pos[1];
      const bounds = this._getButtonBounds();

      // Check "Recall" button — restore lastSeed and switch to fixed
      if (this._isInButton(localX, localY, bounds.useLastSeed)) {
        if (this.seedProps.lastSeed !== null) {
          this._setSeed(this.seedProps.lastSeed);
          this._setControlMode("fixed");
          this.setDirtyCanvas(true, true);
        }
        return true;
      }

      // Check "Randomize" button — save current, then randomize
      if (this._isInButton(localX, localY, bounds.resetRandom)) {
        this.seedProps.lastSeed = this._getSeed();
        this._setControlMode("randomize");
        this._setSeed(randomSeed(this.seedProps.min, this._getEffectiveMax()));
        this.setDirtyCanvas(true, true);
        return true;
      }

      return false;
    };

    // Serialize properties
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        min: this.seedProps.min,
        max: this.seedProps.max,
        max_digits: this.seedProps.max_digits,
      };
    };

    // Compute minimum size — widgets + padding
    nodeType.prototype.computeSize = function () {
      const widgetHeight = this.widgets ? 26 + this.widgets.length * 26 : 52;
      const slotAreaEnd = getContentStartY(this);
      const contentEnd = Math.max(widgetHeight, slotAreaEnd);
      return [150, contentEnd + 6];
    };

    // Resize handler
    nodeType.prototype.onResize = function (size) {
      const computed = this.computeSize();
      size[0] = Math.max(size[0], computed[0]);
      size[1] = Math.max(size[1], computed[1]);
    };

    // Get extra menu options
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      const self = this;

      options.push(null);
      options.push({
        content: "Randomize Seed Now",
        callback: () => {
          self.seedProps.lastSeed = self._getSeed();
          self._setSeed(
            randomSeed(self.seedProps.min, self._getEffectiveMax()),
          );
          self.setDirtyCanvas(true, true);
        },
      });

      options.push({
        content: "Reset to Defaults",
        callback: () => {
          self.seedProps.min = 0;
          self.seedProps.max = 0xffffffffffffffff;
          self.seedProps.max_digits = 0;
          self.seedProps.lastSeed = null;

          self.properties.min = 0;
          self.properties.max = 0xffffffffffffffff;
          self.properties.max_digits = 0;

          cleanProperties(self);

          self._setControlMode("randomize");
          self._setSeed(randomSeed(0, 0xffffffffffffffff));
          self.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
