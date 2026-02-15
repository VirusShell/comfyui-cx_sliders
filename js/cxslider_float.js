// ComfyUI - cxSlider Float
// Custom slider node for floating-point values
// Based on mxToolkit slider design by Max Smirnov

import { app } from "../../scripts/app.js";

// Utility function to clamp values
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Get decimal places from padding string (e.g., "0.000" = 3 decimals)
function getDecimalPlaces(padding) {
  if (typeof padding !== "string") {
    padding = String(padding);
  }
  const match = padding.match(/\.(\d+)/);
  return match ? match[1].length : 0;
}

// Format number with specified decimal places
function formatValue(value, decimals) {
  return value.toFixed(decimals);
}

// Validate hex color string (#RGB or #RRGGBB)
function isValidHexColor(str) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
}

// Helper to remove internal LiteGraph properties from Properties Panel
function cleanProperties(node) {
  if (node.properties) {
    delete node.properties.aux_id;
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
        node.widgets && node.widgets.find((w) => w.name === inp.name);
      if (!hasWidget) numInputSlots++;
    }
  }
  return Math.max(numInputSlots, numOutputs) * SLOT_HEIGHT;
}

app.registerExtension({
  name: "cxSlider.Float",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxSliderFloat") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties (separate from node.properties to avoid aux_id issue)
      this.sliderProps = {
        current: 1.0,
        min: 0.0,
        max: 100.0,
        step: 0.5,
        snap: true,
        padding: "0.000",
        fillColor: "#d99a4a",
        borderColor: "#666666",
        textColor: "#ffffff",
      };

      // Sync with node.properties for Properties Panel
      this.properties = this.properties || {};
      this.properties.current = this.sliderProps.current;
      this.properties.min = this.sliderProps.min;
      this.properties.max = this.sliderProps.max;
      this.properties.step = this.sliderProps.step;
      this.properties.snap = this.sliderProps.snap;
      this.properties.padding = this.sliderProps.padding;
      this.properties.fillColor = this.sliderProps.fillColor;
      this.properties.borderColor = this.sliderProps.borderColor;
      this.properties.textColor = this.sliderProps.textColor;

      // Remove internal LiteGraph properties
      cleanProperties(this);

      // Internal state for slider interaction
      this.capture = false;
      this.unlock = false;

      // Layout constants
      this.sliderHeight = 24;
      this.sliderPadding = 10;

      // Position slider below input/output slot area to avoid overlap
      const contentY = getContentStartY(this);
      this.sliderY = contentY + 4;

      // Set initial node size
      this.size = [200, this.sliderY + this.sliderHeight + 6];

      // Find the widget
      this._setupWidget();
    };

    // Setup widget reference and hide it
    nodeType.prototype._setupWidget = function () {
      if (!this.widgets) return;
      this._valueWidget = this.widgets.find((w) => w.name === "float");
      if (this._valueWidget) {
        this._valueWidget.value = this.sliderProps.current;
        // Hide the widget - we only use the slider for interaction
        this._valueWidget.hidden = true;
        if (this._valueWidget.options) {
          this._valueWidget.options.hidden = true;
        }
      }
    };

    // Get the widget
    nodeType.prototype._getWidget = function () {
      if (!this._valueWidget && this.widgets) {
        this._valueWidget = this.widgets.find((w) => w.name === "float");
      }
      return this._valueWidget;
    };

    // Get decimal places
    nodeType.prototype._getDecimals = function () {
      return getDecimalPlaces(this.sliderProps.padding);
    };

    // Format value with decimals
    nodeType.prototype._formatValue = function (value) {
      return formatValue(value, this._getDecimals());
    };

    // Get current value
    nodeType.prototype._getValue = function () {
      const widget = this._getWidget();
      if (widget) {
        this.sliderProps.current = widget.value;
        this.properties.current = widget.value;
        return widget.value;
      }
      return this.sliderProps.current;
    };

    // Set value
    nodeType.prototype._setValue = function (value) {
      // Round to decimal precision
      const decimals = this._getDecimals();
      const multiplier = Math.pow(10, decimals);
      value = Math.round(value * multiplier) / multiplier;

      this.sliderProps.current = value;
      this.properties.current = value;

      const widget = this._getWidget();
      if (widget) {
        widget.value = value;
      }
    };

    // Property change handler (for Properties Panel)
    nodeType.prototype.onPropertyChanged = function (name, value) {
      // Remove internal properties if they appear
      cleanProperties(this);

      if (name === "current") {
        value = parseFloat(value);
        value = clamp(value, this.sliderProps.min, this.sliderProps.max);
        this._setValue(value);
        this.sliderProps.current = value;
      } else if (name === "min") {
        this.sliderProps.min = parseFloat(value);
        this.properties.min = this.sliderProps.min;
        // Clamp current if needed
        if (this.sliderProps.current < this.sliderProps.min) {
          this._setValue(this.sliderProps.min);
        }
      } else if (name === "max") {
        this.sliderProps.max = parseFloat(value);
        this.properties.max = this.sliderProps.max;
        // Clamp current if needed
        if (this.sliderProps.current > this.sliderProps.max) {
          this._setValue(this.sliderProps.max);
        }
      } else if (name === "step") {
        const stepVal = parseFloat(value);
        this.sliderProps.step = stepVal > 0 ? stepVal : 0.001;
        this.properties.step = this.sliderProps.step;
      } else if (name === "snap") {
        this.sliderProps.snap = Boolean(value);
        this.properties.snap = this.sliderProps.snap;
      } else if (name === "padding") {
        // Validate padding format (should be like "0.000")
        if (typeof value === "string" && /^0\.0+$/.test(value)) {
          this.sliderProps.padding = value;
          this.properties.padding = value;
        } else if (typeof value === "number") {
          const decimals = Math.max(1, Math.floor(value));
          this.sliderProps.padding = "0." + "0".repeat(decimals);
          this.properties.padding = this.sliderProps.padding;
        }
      } else if (name === "fillColor") {
        if (isValidHexColor(value)) {
          this.sliderProps.fillColor = value;
          this.properties.fillColor = value;
        }
      } else if (name === "borderColor") {
        if (isValidHexColor(value)) {
          this.sliderProps.borderColor = value;
          this.properties.borderColor = value;
        }
      } else if (name === "textColor") {
        if (isValidHexColor(value)) {
          this.sliderProps.textColor = value;
          this.properties.textColor = value;
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler for loading saved values
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.sliderProps.current = parseFloat(info.properties.current ?? 1.0);
        this.sliderProps.min = parseFloat(info.properties.min ?? 0.0);
        this.sliderProps.max = parseFloat(info.properties.max ?? 100.0);
        this.sliderProps.step = parseFloat(info.properties.step ?? 0.5);
        if (this.sliderProps.step <= 0) this.sliderProps.step = 0.001;
        this.sliderProps.snap = info.properties.snap ?? true;
        this.sliderProps.padding = info.properties.padding ?? "0.000";
        this.sliderProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#d99a4a";
        this.sliderProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        this.sliderProps.textColor = isValidHexColor(info.properties.textColor)
          ? info.properties.textColor
          : "#ffffff";

        // Sync to properties
        this.properties.current = this.sliderProps.current;
        this.properties.min = this.sliderProps.min;
        this.properties.max = this.sliderProps.max;
        this.properties.step = this.sliderProps.step;
        this.properties.snap = this.sliderProps.snap;
        this.properties.padding = this.sliderProps.padding;
        this.properties.fillColor = this.sliderProps.fillColor;
        this.properties.borderColor = this.sliderProps.borderColor;
        this.properties.textColor = this.sliderProps.textColor;

        // Remove internal properties
        cleanProperties(this);

        // Sync widget and ensure it stays hidden
        const widget = this._getWidget();
        if (widget) {
          widget.value = this.sliderProps.current;
          widget.hidden = true;
          if (widget.options) {
            widget.options.hidden = true;
          }
        }
      }
    };

    // Draw the slider
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      const width = this.size[0];
      const padding = this.sliderPadding;
      const sliderHeight = this.sliderHeight;
      // Recalculate Y position in case slots changed
      const sliderY = getContentStartY(this) + 4;
      this.sliderY = sliderY;

      // Get values
      const min = this.sliderProps.min;
      const max = this.sliderProps.max;
      const current = this._getValue();
      const range = max - min;
      const ratio = range > 0 ? clamp((current - min) / range, 0, 1) : 0;

      // Draw slider background
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.roundRect(padding, sliderY, width - padding * 2, sliderHeight, 4);
      ctx.fill();

      // Draw slider fill
      const fillWidth = (width - padding * 2) * ratio;
      if (fillWidth > 0) {
        ctx.fillStyle = this.sliderProps.fillColor;
        ctx.beginPath();
        ctx.roundRect(padding, sliderY, fillWidth, sliderHeight, 4);
        ctx.fill();
      }

      // Draw slider border
      ctx.strokeStyle = this.sliderProps.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(padding, sliderY, width - padding * 2, sliderHeight, 4);
      ctx.stroke();

      // Draw value text centered on slider (with proper decimals)
      ctx.fillStyle = this.sliderProps.textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this._formatValue(current),
        width / 2,
        sliderY + sliderHeight / 2,
      );
    };

    // Check if position is in slider bounds
    nodeType.prototype._isInSliderBounds = function (e) {
      const localX = e.canvasX - this.pos[0];
      const localY = e.canvasY - this.pos[1];
      const padding = this.sliderPadding;

      return (
        localX >= padding - 5 &&
        localX <= this.size[0] - padding + 5 &&
        localY >= this.sliderY - 5 &&
        localY <= this.sliderY + this.sliderHeight + 5
      );
    };

    // Mouse down handler
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;
      if (e.canvasY - this.pos[1] < 0) return false;

      if (this._isInSliderBounds(e)) {
        this.capture = true;
        this.unlock = false;
        this.captureInput(true);
        this._valueUpdate(e);
        return true;
      }

      return false;
    };

    // Mouse move handler
    nodeType.prototype.onMouseMove = function (e, pos, canvas) {
      if (!this.capture) return;

      // Safety check - if pointer is not down, release capture
      if (canvas && canvas.pointer && canvas.pointer.isDown === false) {
        this.onMouseUp(e);
        return;
      }

      this._valueUpdate(e);
    };

    // Mouse up handler
    nodeType.prototype.onMouseUp = function (e) {
      if (!this.capture) return;
      this.capture = false;
      this.captureInput(false);

      // Sync widget value
      const widget = this._getWidget();
      if (widget) {
        widget.value = this.sliderProps.current;
      }
    };

    // Value update from mouse position
    nodeType.prototype._valueUpdate = function (e) {
      const padding = this.sliderPadding;
      const sliderWidth = this.size[0] - padding * 2;
      let vX = (e.canvasX - this.pos[0] - padding) / sliderWidth;

      // Ctrl key allows values outside range
      if (e.ctrlKey) this.unlock = true;

      // Shift inverts snap behavior
      let shouldSnap = this.sliderProps.snap;
      if (e.shiftKey) shouldSnap = !shouldSnap;

      // Apply snapping
      if (shouldSnap && this.sliderProps.step > 0) {
        const stepRatio =
          this.sliderProps.step / (this.sliderProps.max - this.sliderProps.min);
        vX = Math.round(vX / stepRatio) * stepRatio;
      }

      // Clamp position (unless unlocked)
      const clampedX = clamp(vX, 0, 1);

      // Calculate value
      const decimals = this._getDecimals();
      const multiplier = Math.pow(10, decimals);
      let value =
        this.sliderProps.min +
        (this.sliderProps.max - this.sliderProps.min) *
          (this.unlock ? vX : clampedX);
      value = Math.round(value * multiplier) / multiplier;

      this._setValue(value);
      this.setDirtyCanvas(true, true);
    };

    // Double click handler for manual entry
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      if (this._isInSliderBounds(e)) {
        canvas.prompt(
          "Value",
          this._formatValue(this.sliderProps.current),
          (v) => {
            if (!isNaN(Number(v))) {
              let value = parseFloat(v);
              value = clamp(value, this.sliderProps.min, this.sliderProps.max);
              this._setValue(value);
              this.setDirtyCanvas(true, true);
            }
          },
          e,
        );
        return true;
      }
      return false;
    };

    // Release capture when node is selected (safety measure)
    nodeType.prototype.onSelected = function (e) {
      this.onMouseUp(e);
    };

    // Serialize properties
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        current: this.sliderProps.current,
        min: this.sliderProps.min,
        max: this.sliderProps.max,
        step: this.sliderProps.step,
        snap: this.sliderProps.snap,
        padding: this.sliderProps.padding,
        fillColor: this.sliderProps.fillColor,
        borderColor: this.sliderProps.borderColor,
        textColor: this.sliderProps.textColor,
      };
    };

    // Compute minimum size - accounts for slot area + slider
    nodeType.prototype.computeSize = function () {
      const contentY = getContentStartY(this);
      return [100, contentY + 4 + this.sliderHeight + 6];
    };

    // Get extra menu options
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      options.push(null);
      options.push({
        content: "Reset to Defaults",
        callback: () => {
          this.sliderProps.current = 1.0;
          this.sliderProps.min = 0.0;
          this.sliderProps.max = 100.0;
          this.sliderProps.step = 0.5;
          this.sliderProps.snap = true;
          this.sliderProps.padding = "0.000";
          this.sliderProps.fillColor = "#d99a4a";
          this.sliderProps.borderColor = "#666666";
          this.sliderProps.textColor = "#ffffff";

          this.properties.current = 1.0;
          this.properties.min = 0.0;
          this.properties.max = 100.0;
          this.properties.step = 0.5;
          this.properties.snap = true;
          this.properties.padding = "0.000";
          this.properties.fillColor = "#d99a4a";
          this.properties.borderColor = "#666666";
          this.properties.textColor = "#ffffff";

          cleanProperties(this);

          this._setValue(1.0);
          this.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
