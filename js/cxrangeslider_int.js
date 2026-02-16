// ComfyUI - cxRangeSlider Int
// Two-handle range slider for integer values
// Part of the cxSlider package

import { app } from "../../scripts/app.js";

const CX_VERSION = "1.2.2";

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
  name: "cxRangeSlider.Int",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxRangeSliderInt") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties
      this.rangeProps = {
        low: 25,
        high: 75,
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
      this.properties.low = this.rangeProps.low;
      this.properties.high = this.rangeProps.high;
      this.properties.min = this.rangeProps.min;
      this.properties.max = this.rangeProps.max;
      this.properties.step = this.rangeProps.step;
      this.properties.snap = this.rangeProps.snap;
      this.properties.fillColor = this.rangeProps.fillColor;
      this.properties.borderColor = this.rangeProps.borderColor;
      this.properties.textColor = this.rangeProps.textColor;

      cleanProperties(this);

      // Internal state
      this.capture = false;
      this.activeHandle = null; // "low" or "high"
      this.unlock = false;

      // Layout constants
      this.sliderHeight = 24;
      this.sliderPadding = 10;
      const contentY = getContentStartY(this);
      this.sliderY = contentY + 8;

      // Set initial node size
      this.size = [220, this.sliderY + this.sliderHeight + 6];

      // Find widgets
      this._setupWidgets();

      // Set output labels to lowercase
      if (this.outputs) {
        for (const out of this.outputs) {
          out.label = out.name.toLowerCase();
        }
      }
    };

    // Setup widget references and hide them
    nodeType.prototype._setupWidgets = function () {
      if (!this.widgets) return;
      this._lowWidget = this.widgets.find((w) => w.name === "low");
      this._highWidget = this.widgets.find((w) => w.name === "high");

      if (this._lowWidget) {
        this._lowWidget.value = this.rangeProps.low;
        this._lowWidget.hidden = true;
        if (this._lowWidget.options) this._lowWidget.options.hidden = true;
      }
      if (this._highWidget) {
        this._highWidget.value = this.rangeProps.high;
        this._highWidget.hidden = true;
        if (this._highWidget.options) this._highWidget.options.hidden = true;
      }
    };

    // Get widget helpers
    nodeType.prototype._getLowWidget = function () {
      if (!this._lowWidget && this.widgets) {
        this._lowWidget = this.widgets.find((w) => w.name === "low");
      }
      return this._lowWidget;
    };

    nodeType.prototype._getHighWidget = function () {
      if (!this._highWidget && this.widgets) {
        this._highWidget = this.widgets.find((w) => w.name === "high");
      }
      return this._highWidget;
    };

    // Get values
    nodeType.prototype._getLow = function () {
      const widget = this._getLowWidget();
      if (widget) {
        this.rangeProps.low = widget.value;
        this.properties.low = widget.value;
        return widget.value;
      }
      return this.rangeProps.low;
    };

    nodeType.prototype._getHigh = function () {
      const widget = this._getHighWidget();
      if (widget) {
        this.rangeProps.high = widget.value;
        this.properties.high = widget.value;
        return widget.value;
      }
      return this.rangeProps.high;
    };

    // Set values
    nodeType.prototype._setLow = function (value) {
      value = Math.round(value);
      this.rangeProps.low = value;
      this.properties.low = value;
      const widget = this._getLowWidget();
      if (widget) widget.value = value;
    };

    nodeType.prototype._setHigh = function (value) {
      value = Math.round(value);
      this.rangeProps.high = value;
      this.properties.high = value;
      const widget = this._getHighWidget();
      if (widget) widget.value = value;
    };

    // Property change handler
    nodeType.prototype.onPropertyChanged = function (name, value) {
      cleanProperties(this);

      if (name === "low") {
        value = Math.round(value);
        value = clamp(value, this.rangeProps.min, this.rangeProps.high);
        this._setLow(value);
      } else if (name === "high") {
        value = Math.round(value);
        value = clamp(value, this.rangeProps.low, this.rangeProps.max);
        this._setHigh(value);
      } else if (name === "min") {
        this.rangeProps.min = Math.round(value);
        this.properties.min = this.rangeProps.min;
        if (this.rangeProps.low < this.rangeProps.min) {
          this._setLow(this.rangeProps.min);
        }
      } else if (name === "max") {
        this.rangeProps.max = Math.round(value);
        this.properties.max = this.rangeProps.max;
        if (this.rangeProps.high > this.rangeProps.max) {
          this._setHigh(this.rangeProps.max);
        }
      } else if (name === "step") {
        this.rangeProps.step = Math.max(1, Math.round(value));
        this.properties.step = this.rangeProps.step;
      } else if (name === "snap") {
        this.rangeProps.snap = Boolean(value);
        this.properties.snap = this.rangeProps.snap;
      } else if (name === "fillColor") {
        if (isValidHexColor(value)) {
          this.rangeProps.fillColor = value;
          this.properties.fillColor = value;
        }
      } else if (name === "borderColor") {
        if (isValidHexColor(value)) {
          this.rangeProps.borderColor = value;
          this.properties.borderColor = value;
        }
      } else if (name === "textColor") {
        if (isValidHexColor(value) || value === "auto") {
          this.rangeProps.textColor = value;
          this.properties.textColor = value;
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.rangeProps.low = info.properties.low ?? 25;
        this.rangeProps.high = info.properties.high ?? 75;
        this.rangeProps.min = info.properties.min ?? 0;
        this.rangeProps.max = info.properties.max ?? 100;
        this.rangeProps.step = Math.max(
          1,
          Math.round(info.properties.step ?? 1),
        );
        this.rangeProps.snap = info.properties.snap ?? true;
        this.rangeProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#4a90d9";
        this.rangeProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        const tc = info.properties.textColor;
        this.rangeProps.textColor =
          isValidHexColor(tc) || tc === "auto" ? tc : "auto";

        this.properties.low = this.rangeProps.low;
        this.properties.high = this.rangeProps.high;
        this.properties.min = this.rangeProps.min;
        this.properties.max = this.rangeProps.max;
        this.properties.step = this.rangeProps.step;
        this.properties.snap = this.rangeProps.snap;
        this.properties.fillColor = this.rangeProps.fillColor;
        this.properties.borderColor = this.rangeProps.borderColor;
        this.properties.textColor = this.rangeProps.textColor;

        cleanProperties(this);

        const lowW = this._getLowWidget();
        if (lowW) {
          lowW.value = this.rangeProps.low;
          lowW.hidden = true;
          if (lowW.options) lowW.options.hidden = true;
        }
        const highW = this._getHighWidget();
        if (highW) {
          highW.value = this.rangeProps.high;
          highW.hidden = true;
          if (highW.options) highW.options.hidden = true;
        }

        // Set output labels to lowercase
        if (this.outputs) {
          for (const out of this.outputs) {
            out.label = out.name.toLowerCase();
          }
        }
      }
    };

    // Draw the range slider
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      const width = this.size[0];
      const padding = this.sliderPadding;
      const sliderHeight = this.sliderHeight;
      const sliderY = getContentStartY(this) + 8;
      this.sliderY = sliderY;
      const sliderWidth = width - padding * 2;

      const min = this.rangeProps.min;
      const max = this.rangeProps.max;
      const low = this._getLow();
      const high = this._getHigh();
      const range = max - min;
      const lowRatio = range > 0 ? clamp((low - min) / range, 0, 1) : 0;
      const highRatio = range > 0 ? clamp((high - min) / range, 0, 1) : 1;

      // Draw slider background
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.roundRect(padding, sliderY, sliderWidth, sliderHeight, 4);
      ctx.fill();

      // Draw fill between low and high
      const lowX = padding + sliderWidth * lowRatio;
      const highX = padding + sliderWidth * highRatio;
      const fillWidth = highX - lowX;
      if (fillWidth > 0) {
        ctx.fillStyle = this.rangeProps.fillColor;
        ctx.beginPath();
        ctx.rect(lowX, sliderY, fillWidth, sliderHeight);
        ctx.fill();
      }

      // Draw slider border
      ctx.strokeStyle = this.rangeProps.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(padding, sliderY, sliderWidth, sliderHeight, 4);
      ctx.stroke();

      // Draw handle indicators (3px white vertical lines)
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;

      // Low handle
      ctx.beginPath();
      ctx.moveTo(lowX, sliderY + 2);
      ctx.lineTo(lowX, sliderY + sliderHeight - 2);
      ctx.stroke();

      // High handle
      ctx.beginPath();
      ctx.moveTo(highX, sliderY + 2);
      ctx.lineTo(highX, sliderY + sliderHeight - 2);
      ctx.stroke();

      // Draw value text centered
      const textColor =
        this.rangeProps.textColor === "auto"
          ? getContrastColor(this.rangeProps.fillColor)
          : this.rangeProps.textColor;
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(low + " - " + high, width / 2, sliderY + sliderHeight / 2);
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

    // Get handle X positions
    nodeType.prototype._getHandlePositions = function () {
      const padding = this.sliderPadding;
      const sliderWidth = this.size[0] - padding * 2;
      const range = this.rangeProps.max - this.rangeProps.min;
      const lowRatio =
        range > 0 ? (this.rangeProps.low - this.rangeProps.min) / range : 0;
      const highRatio =
        range > 0 ? (this.rangeProps.high - this.rangeProps.min) / range : 1;
      return {
        lowX: padding + sliderWidth * lowRatio,
        highX: padding + sliderWidth * highRatio,
      };
    };

    // Mouse down handler
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;
      if (e.canvasY - this.pos[1] < 0) return false;

      if (this._isInSliderBounds(e)) {
        const localX = e.canvasX - this.pos[0];
        const handles = this._getHandlePositions();

        // Determine which handle is closer
        const distLow = Math.abs(localX - handles.lowX);
        const distHigh = Math.abs(localX - handles.highX);
        this.activeHandle = distLow <= distHigh ? "low" : "high";

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
      this.activeHandle = null;
      this.captureInput(false);

      const lowW = this._getLowWidget();
      if (lowW) lowW.value = this.rangeProps.low;
      const highW = this._getHighWidget();
      if (highW) highW.value = this.rangeProps.high;
    };

    // Value update from mouse position
    nodeType.prototype._valueUpdate = function (e) {
      const padding = this.sliderPadding;
      const sliderWidth = this.size[0] - padding * 2;
      let vX = (e.canvasX - this.pos[0] - padding) / sliderWidth;

      if (e.ctrlKey) this.unlock = true;

      let shouldSnap = this.rangeProps.snap;
      if (e.shiftKey) shouldSnap = !shouldSnap;

      if (shouldSnap && this.rangeProps.step > 0) {
        const stepRatio =
          this.rangeProps.step / (this.rangeProps.max - this.rangeProps.min);
        vX = Math.round(vX / stepRatio) * stepRatio;
      }

      const clampedX = clamp(vX, 0, 1);
      let value =
        this.rangeProps.min +
        (this.rangeProps.max - this.rangeProps.min) *
          (this.unlock ? vX : clampedX);
      value = Math.round(value);

      if (this.activeHandle === "low") {
        value = clamp(value, this.rangeProps.min, this.rangeProps.high);
        this._setLow(value);
      } else if (this.activeHandle === "high") {
        value = clamp(value, this.rangeProps.low, this.rangeProps.max);
        this._setHigh(value);
      }

      this.setDirtyCanvas(true, true);
    };

    // Double click - prompt for closer handle
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      if (this._isInSliderBounds(e)) {
        const localX = e.canvasX - this.pos[0];
        const handles = this._getHandlePositions();
        const distLow = Math.abs(localX - handles.lowX);
        const distHigh = Math.abs(localX - handles.highX);
        const handle = distLow <= distHigh ? "low" : "high";
        const currentVal =
          handle === "low" ? this.rangeProps.low : this.rangeProps.high;

        canvas.prompt(
          handle === "low" ? "Low Value" : "High Value",
          currentVal,
          (v) => {
            if (!isNaN(Number(v))) {
              let value = Math.round(Number(v));
              if (handle === "low") {
                value = clamp(value, this.rangeProps.min, this.rangeProps.high);
                this._setLow(value);
              } else {
                value = clamp(value, this.rangeProps.low, this.rangeProps.max);
                this._setHigh(value);
              }
              this.setDirtyCanvas(true, true);
            }
          },
          e,
        );
        return true;
      }
      return false;
    };

    // Release capture on select
    nodeType.prototype.onSelected = function (e) {
      this.onMouseUp(e);
    };

    // Serialize
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        low: this.rangeProps.low,
        high: this.rangeProps.high,
        min: this.rangeProps.min,
        max: this.rangeProps.max,
        step: this.rangeProps.step,
        snap: this.rangeProps.snap,
        fillColor: this.rangeProps.fillColor,
        borderColor: this.rangeProps.borderColor,
        textColor: this.rangeProps.textColor,
      };
    };

    // Compute minimum size
    nodeType.prototype.computeSize = function () {
      const contentY = getContentStartY(this);
      return [120, contentY + 8 + this.sliderHeight + 6];
    };

    // Resize handler - enforce minimum dimensions
    nodeType.prototype.onResize = function (size) {
      const computed = this.computeSize();
      size[0] = Math.max(size[0], computed[0]);
      size[1] = Math.max(size[1], computed[1]);
    };

    // Extra menu options
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      options.push(null);
      options.push({
        content: "Pick Fill Color...",
        callback: () => {
          openColorPicker(this.rangeProps.fillColor, (c) => {
            this.rangeProps.fillColor = c;
            this.properties.fillColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Pick Border Color...",
        callback: () => {
          openColorPicker(this.rangeProps.borderColor, (c) => {
            this.rangeProps.borderColor = c;
            this.properties.borderColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Pick Text Color...",
        callback: () => {
          openColorPicker(
            this.rangeProps.textColor === "auto"
              ? getContrastColor(this.rangeProps.fillColor)
              : this.rangeProps.textColor,
            (c) => {
              this.rangeProps.textColor = c;
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
          this.rangeProps.low = 25;
          this.rangeProps.high = 75;
          this.rangeProps.min = 0;
          this.rangeProps.max = 100;
          this.rangeProps.step = 1;
          this.rangeProps.snap = true;
          this.rangeProps.fillColor = "#4a90d9";
          this.rangeProps.borderColor = "#666666";
          this.rangeProps.textColor = "auto";

          this.properties.low = 25;
          this.properties.high = 75;
          this.properties.min = 0;
          this.properties.max = 100;
          this.properties.step = 1;
          this.properties.snap = true;
          this.properties.fillColor = "#4a90d9";
          this.properties.borderColor = "#666666";
          this.properties.textColor = "auto";

          cleanProperties(this);

          this._setLow(25);
          this._setHigh(75);
          this.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
