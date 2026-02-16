// ComfyUI - cxToggle
// Button-style toggle with configurable states and custom labels
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
  name: "cxToggle",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxToggle") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties
      this.toggleProps = {
        current: 0,
        min: 0,
        max: 1,
        labels: "Off,On",
        fillColor: "#5a9a5a",
        borderColor: "#666666",
        textColor: "auto",
      };

      // Sync with node.properties for Properties Panel
      this.properties = this.properties || {};
      this.properties.current = this.toggleProps.current;
      this.properties.min = this.toggleProps.min;
      this.properties.max = this.toggleProps.max;
      this.properties.labels = this.toggleProps.labels;
      this.properties.fillColor = this.toggleProps.fillColor;
      this.properties.borderColor = this.toggleProps.borderColor;
      this.properties.textColor = this.toggleProps.textColor;

      // Remove internal LiteGraph properties
      cleanProperties(this);

      // Set initial node size
      const contentY = getContentStartY(this);
      this.size = [160, contentY + 36];

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
      this._valueWidget = this.widgets.find((w) => w.name === "toggle");
      if (this._valueWidget) {
        this._valueWidget.value = this.toggleProps.current;
        this._valueWidget.hidden = true;
        if (this._valueWidget.options) {
          this._valueWidget.options.hidden = true;
        }
      }
    };

    // Get the widget
    nodeType.prototype._getWidget = function () {
      if (!this._valueWidget && this.widgets) {
        this._valueWidget = this.widgets.find((w) => w.name === "toggle");
      }
      return this._valueWidget;
    };

    // Get labels array, padded or truncated to match state count
    nodeType.prototype._getLabels = function () {
      const stateCount = this.toggleProps.max - this.toggleProps.min + 1;
      let labels = this.toggleProps.labels.split(",").map((s) => s.trim());

      // Pad with numeric values if fewer labels than states
      while (labels.length < stateCount) {
        labels.push(String(this.toggleProps.min + labels.length));
      }
      // Truncate if more labels than states
      if (labels.length > stateCount) {
        labels.length = stateCount;
      }
      return labels;
    };

    // Get current label for current state
    nodeType.prototype._getCurrentLabel = function () {
      const labels = this._getLabels();
      const index = this.toggleProps.current - this.toggleProps.min;
      return (
        labels[clamp(index, 0, labels.length - 1)] ||
        String(this.toggleProps.current)
      );
    };

    // Get current value
    nodeType.prototype._getValue = function () {
      const widget = this._getWidget();
      if (widget) {
        const val = Math.round(widget.value);
        this.toggleProps.current = val;
        this.properties.current = val;
        return val;
      }
      return this.toggleProps.current;
    };

    // Set value
    nodeType.prototype._setValue = function (value) {
      value = Math.round(value);
      value = clamp(value, this.toggleProps.min, this.toggleProps.max);
      this.toggleProps.current = value;
      this.properties.current = value;

      const widget = this._getWidget();
      if (widget) {
        widget.value = value;
      }
    };

    // Property change handler (for Properties Panel)
    nodeType.prototype.onPropertyChanged = function (name, value) {
      cleanProperties(this);

      if (name === "current") {
        value = Math.round(value);
        value = clamp(value, this.toggleProps.min, this.toggleProps.max);
        this._setValue(value);
      } else if (name === "min") {
        this.toggleProps.min = Math.round(value);
        this.properties.min = this.toggleProps.min;
        if (this.toggleProps.current < this.toggleProps.min) {
          this._setValue(this.toggleProps.min);
        }
      } else if (name === "max") {
        this.toggleProps.max = Math.round(value);
        this.properties.max = this.toggleProps.max;
        if (this.toggleProps.current > this.toggleProps.max) {
          this._setValue(this.toggleProps.max);
        }
      } else if (name === "labels") {
        if (typeof value === "string") {
          this.toggleProps.labels = value;
          this.properties.labels = value;
        }
      } else if (name === "fillColor") {
        if (isValidHexColor(value)) {
          this.toggleProps.fillColor = value;
          this.properties.fillColor = value;
        }
      } else if (name === "borderColor") {
        if (isValidHexColor(value)) {
          this.toggleProps.borderColor = value;
          this.properties.borderColor = value;
        }
      } else if (name === "textColor") {
        if (isValidHexColor(value) || value === "auto") {
          this.toggleProps.textColor = value;
          this.properties.textColor = value;
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler for loading saved values
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.toggleProps.current = info.properties.current ?? 0;
        this.toggleProps.min = info.properties.min ?? 0;
        this.toggleProps.max = info.properties.max ?? 1;
        this.toggleProps.labels = info.properties.labels ?? "Off,On";
        this.toggleProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#5a9a5a";
        this.toggleProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        const tc = info.properties.textColor;
        this.toggleProps.textColor =
          isValidHexColor(tc) || tc === "auto" ? tc : "auto";

        // Sync to properties
        this.properties.current = this.toggleProps.current;
        this.properties.min = this.toggleProps.min;
        this.properties.max = this.toggleProps.max;
        this.properties.labels = this.toggleProps.labels;
        this.properties.fillColor = this.toggleProps.fillColor;
        this.properties.borderColor = this.toggleProps.borderColor;
        this.properties.textColor = this.toggleProps.textColor;

        // Remove internal properties
        cleanProperties(this);

        // Sync widget and ensure it stays hidden
        const widget = this._getWidget();
        if (widget) {
          widget.value = this.toggleProps.current;
          widget.hidden = true;
          if (widget.options) {
            widget.options.hidden = true;
          }
        }

        // Set output labels to lowercase
        if (this.outputs) {
          for (const out of this.outputs) {
            out.label = out.name.toLowerCase();
          }
        }
      }
    };

    // Draw the toggle button
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      const width = this.size[0];
      const height = this.size[1];
      const padding = 8;
      const contentY = getContentStartY(this);
      const btnHeight = Math.min(28, height - contentY - 4);
      const btnY = contentY + (height - contentY - btnHeight) / 2;

      const current = this._getValue();
      const isActive = current > this.toggleProps.min;

      // Draw button background
      ctx.fillStyle = isActive ? this.toggleProps.fillColor : "#444";
      ctx.beginPath();
      ctx.roundRect(padding, btnY, width - padding * 2, btnHeight, 6);
      ctx.fill();

      // Draw button border
      ctx.strokeStyle = this.toggleProps.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(padding, btnY, width - padding * 2, btnHeight, 6);
      ctx.stroke();

      // Draw label text centered
      const textColor =
        this.toggleProps.textColor === "auto"
          ? getContrastColor(this.toggleProps.fillColor)
          : this.toggleProps.textColor;
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this._getCurrentLabel(), width / 2, btnY + btnHeight / 2);
    };

    // Mouse down handler - click cycles state
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;
      if (e.canvasY - this.pos[1] < 0) return false;

      const localX = pos[0];
      const localY = pos[1];
      const padding = 8;

      // Check if click is within the button area
      const contentY = getContentStartY(this);
      if (
        localX >= padding &&
        localX <= this.size[0] - padding &&
        localY >= contentY &&
        localY <= this.size[1]
      ) {
        // Cycle forward, wrap to min
        let next = this.toggleProps.current + 1;
        if (next > this.toggleProps.max) {
          next = this.toggleProps.min;
        }
        this._setValue(next);
        this.setDirtyCanvas(true, true);
        return true;
      }

      return false;
    };

    // Double click handler for manual entry
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      const localX = pos[0];
      const localY = pos[1];
      const padding = 8;

      const contentY = getContentStartY(this);
      if (
        localX >= padding &&
        localX <= this.size[0] - padding &&
        localY >= contentY &&
        localY <= this.size[1]
      ) {
        canvas.prompt(
          "Value",
          this.toggleProps.current,
          (v) => {
            if (!isNaN(Number(v))) {
              let value = Math.round(Number(v));
              value = clamp(value, this.toggleProps.min, this.toggleProps.max);
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

    // Serialize properties
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        current: this.toggleProps.current,
        min: this.toggleProps.min,
        max: this.toggleProps.max,
        labels: this.toggleProps.labels,
        fillColor: this.toggleProps.fillColor,
        borderColor: this.toggleProps.borderColor,
        textColor: this.toggleProps.textColor,
      };
    };

    // Compute minimum size
    nodeType.prototype.computeSize = function () {
      const contentY = getContentStartY(this);
      return [100, contentY + 36];
    };

    // Resize handler - enforce minimum dimensions
    nodeType.prototype.onResize = function (size) {
      const computed = this.computeSize();
      size[0] = Math.max(size[0], computed[0]);
      size[1] = Math.max(size[1], computed[1]);
    };

    // Get extra menu options
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      options.push(null);
      options.push({
        content: "Pick Fill Color...",
        callback: () => {
          openColorPicker(this.toggleProps.fillColor, (c) => {
            this.toggleProps.fillColor = c;
            this.properties.fillColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Pick Border Color...",
        callback: () => {
          openColorPicker(this.toggleProps.borderColor, (c) => {
            this.toggleProps.borderColor = c;
            this.properties.borderColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Pick Text Color...",
        callback: () => {
          openColorPicker(
            this.toggleProps.textColor === "auto"
              ? getContrastColor(this.toggleProps.fillColor)
              : this.toggleProps.textColor,
            (c) => {
              this.toggleProps.textColor = c;
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
          this.toggleProps.current = 0;
          this.toggleProps.min = 0;
          this.toggleProps.max = 1;
          this.toggleProps.labels = "Off,On";
          this.toggleProps.fillColor = "#5a9a5a";
          this.toggleProps.borderColor = "#666666";
          this.toggleProps.textColor = "auto";

          this.properties.current = 0;
          this.properties.min = 0;
          this.properties.max = 1;
          this.properties.labels = "Off,On";
          this.properties.fillColor = "#5a9a5a";
          this.properties.borderColor = "#666666";
          this.properties.textColor = "auto";

          cleanProperties(this);

          this._setValue(0);
          this.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
