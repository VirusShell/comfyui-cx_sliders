// ComfyUI - cxSlider Int
// Custom slider node for integer values
// Based on mxToolkit slider design by Max Smirnov

import { app } from "../../scripts/app.js";

const CX_VERSION = "1.2.3";

// Utility function to clamp values
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Validate hex color string (#RGB or #RRGGBB)
function isValidHexColor(str) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
}

// Open native color picker dialog
function openColorPicker(currentColor, callback) {
  const input = document.createElement("input");
  input.type = "color";
  input.value = currentColor;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.addEventListener("input", (e) => callback(e.target.value));
  input.addEventListener("change", () => {
    if (input.parentNode) document.body.removeChild(input);
  });
  input.showPicker();
}

// Get contrasting text color based on background luminance
function getContrastColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// Helper to remove internal LiteGraph properties from Properties Panel
function cleanProperties(node) {
  if (node.properties) {
    delete node.properties.aux_id;
    node.properties.ver = CX_VERSION;
  }
}

// Calculate Y offset for custom content (below input/output slot area)
// LiteGraph draws slot dots/labels from the top of the content area at
// SLOT_HEIGHT intervals. Custom drawing must start below this region.
function getContentStartY(node) {
  const SLOT_HEIGHT =
    (typeof LiteGraph !== "undefined" && LiteGraph.NODE_SLOT_HEIGHT) || 20;
  const numOutputs = node.outputs ? node.outputs.length : 0;
  // Count non-widget inputs (forceInput slots that appear as connection dots)
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
  name: "cxSlider.Int",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxSliderInt") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties (separate from node.properties to avoid aux_id issue)
      this.sliderProps = {
        current: 1,
        min: 0,
        max: 100,
        step: 1,
        snap: true,
        fillColor: "#4a90d9",
        borderColor: "#666666",
        textColor: "auto",
      };

      // Sync with node.properties for Properties Panel
      this.properties = this.properties || {};
      this.properties.current = this.sliderProps.current;
      this.properties.min = this.sliderProps.min;
      this.properties.max = this.sliderProps.max;
      this.properties.step = this.sliderProps.step;
      this.properties.snap = this.sliderProps.snap;
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
      this.sliderY = contentY + 8;

      // Set initial node size
      this.size = [200, this.sliderY + this.sliderHeight + 6];

      // Find the widget
      this._setupWidget();

      // Set output labels to lowercase
      if (this.outputs) {
        for (const out of this.outputs) {
          out.label = out.name.toLowerCase();
        }
      }
    };

    // Setup widget reference and hide it
    nodeType.prototype._setupWidget = function () {
      if (!this.widgets) return;
      this._valueWidget = this.widgets.find((w) => w.name === "int");
      if (this._valueWidget) {
        this._valueWidget.value = this.sliderProps.current;
        // Hide the widget - we only use the slider for interaction
        this._valueWidget.hidden = true;
        if (this._valueWidget.options) {
          this._valueWidget.options.hidden = true;
        }
        this._valueWidget.computeSize = () => [0, -4];
      }
    };

    // Get the widget
    nodeType.prototype._getWidget = function () {
      if (!this._valueWidget && this.widgets) {
        this._valueWidget = this.widgets.find((w) => w.name === "int");
      }
      return this._valueWidget;
    };

    // Get current value
    nodeType.prototype._getValue = function () {
      const widget = this._getWidget();
      if (widget) {
        const val = Math.round(widget.value);
        this.sliderProps.current = val;
        this.properties.current = val;
        return val;
      }
      return this.sliderProps.current;
    };

    // Set value
    nodeType.prototype._setValue = function (value) {
      value = Math.round(value);
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
        value = Math.round(value);
        value = clamp(value, this.sliderProps.min, this.sliderProps.max);
        this._setValue(value);
        this.sliderProps.current = value;
      } else if (name === "min") {
        this.sliderProps.min = Math.round(value);
        this.properties.min = this.sliderProps.min;
        // Clamp current if needed
        if (this.sliderProps.current < this.sliderProps.min) {
          this._setValue(this.sliderProps.min);
        }
      } else if (name === "max") {
        this.sliderProps.max = Math.round(value);
        this.properties.max = this.sliderProps.max;
        // Clamp current if needed
        if (this.sliderProps.current > this.sliderProps.max) {
          this._setValue(this.sliderProps.max);
        }
      } else if (name === "step") {
        this.sliderProps.step = Math.max(1, Math.round(value));
        this.properties.step = this.sliderProps.step;
      } else if (name === "snap") {
        this.sliderProps.snap = Boolean(value);
        this.properties.snap = this.sliderProps.snap;
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
        if (isValidHexColor(value) || value === "auto") {
          this.sliderProps.textColor = value;
          this.properties.textColor = value;
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler for loading saved values
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.sliderProps.current = Math.round(info.properties.current ?? 1);
        this.sliderProps.min = Math.round(info.properties.min ?? 0);
        this.sliderProps.max = Math.round(info.properties.max ?? 100);
        this.sliderProps.step = Math.max(
          1,
          Math.round(info.properties.step ?? 1),
        );
        this.sliderProps.snap = info.properties.snap ?? true;
        this.sliderProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#4a90d9";
        this.sliderProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        const tc = info.properties.textColor;
        this.sliderProps.textColor =
          isValidHexColor(tc) || tc === "auto" ? tc : "auto";

        // Sync to properties
        this.properties.current = this.sliderProps.current;
        this.properties.min = this.sliderProps.min;
        this.properties.max = this.sliderProps.max;
        this.properties.step = this.sliderProps.step;
        this.properties.snap = this.sliderProps.snap;
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
          widget.computeSize = () => [0, -4];
        }

        // Set output labels to lowercase
        if (this.outputs) {
          for (const out of this.outputs) {
            out.label = out.name.toLowerCase();
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
      const sliderY = getContentStartY(this) + 8;
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

      // Draw value text centered on slider
      const textColor =
        this.sliderProps.textColor === "auto"
          ? getContrastColor(this.sliderProps.fillColor)
          : this.sliderProps.textColor;
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(current), width / 2, sliderY + sliderHeight / 2);
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
      let value =
        this.sliderProps.min +
        (this.sliderProps.max - this.sliderProps.min) *
          (this.unlock ? vX : clampedX);
      value = Math.round(value);

      this._setValue(value);
      this.setDirtyCanvas(true, true);
    };

    // Double click handler for manual entry
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      if (this._isInSliderBounds(e)) {
        canvas.prompt(
          "Value",
          this.sliderProps.current,
          (v) => {
            if (!isNaN(Number(v))) {
              let value = Math.round(Number(v));
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
        fillColor: this.sliderProps.fillColor,
        borderColor: this.sliderProps.borderColor,
        textColor: this.sliderProps.textColor,
      };
    };

    // Compute minimum size - accounts for slot area + slider
    nodeType.prototype.computeSize = function () {
      const contentY = getContentStartY(this);
      return [150, contentY + 8 + this.sliderHeight + 6];
    };

    // Resize handler - enforce minimum dimensions
    nodeType.prototype.onResize = function (size) {
      const computed = this.computeSize();
      size[0] = Math.max(size[0], computed[0]);
      size[1] = Math.max(size[1], computed[1]);
    };

    // Get extra menu options
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      options.push(null); // separator
      options.push({
        content: "Slider Fill Color...",
        callback: () => {
          openColorPicker(this.sliderProps.fillColor, (c) => {
            this.sliderProps.fillColor = c;
            this.properties.fillColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Slider Border Color...",
        callback: () => {
          openColorPicker(this.sliderProps.borderColor, (c) => {
            this.sliderProps.borderColor = c;
            this.properties.borderColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Slider Text Color...",
        callback: () => {
          openColorPicker(
            this.sliderProps.textColor === "auto"
              ? getContrastColor(this.sliderProps.fillColor)
              : this.sliderProps.textColor,
            (c) => {
              this.sliderProps.textColor = c;
              this.properties.textColor = c;
              this.setDirtyCanvas(true, true);
            },
          );
        },
      });
      options.push(null);
      options.push({
        content: "Reset to Defaults",
        callback: () => {
          this.sliderProps.current = 1;
          this.sliderProps.min = 0;
          this.sliderProps.max = 100;
          this.sliderProps.step = 1;
          this.sliderProps.snap = true;
          this.sliderProps.fillColor = "#4a90d9";
          this.sliderProps.borderColor = "#666666";
          this.sliderProps.textColor = "auto";

          this.properties.current = 1;
          this.properties.min = 0;
          this.properties.max = 100;
          this.properties.step = 1;
          this.properties.snap = true;
          this.properties.fillColor = "#4a90d9";
          this.properties.borderColor = "#666666";
          this.properties.textColor = "auto";

          cleanProperties(this);

          this._setValue(1);
          this.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
