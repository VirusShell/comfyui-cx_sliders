// ComfyUI - cxDial Int
// 270-degree rotary knob for integer values
// Part of the cxSlider package

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

// Arc constants
const START_ANGLE = 0.75 * Math.PI; // 7:30 position (135 degrees)
const SWEEP = 1.5 * Math.PI; // 270 degrees
const END_ANGLE = START_ANGLE + SWEEP;
const DEAD_ZONE_START = END_ANGLE;
const DEAD_ZONE_END = START_ANGLE + 2 * Math.PI;

app.registerExtension({
  name: "cxDial.Int",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxDialInt") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties
      this.dialProps = {
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
      this.properties.current = this.dialProps.current;
      this.properties.min = this.dialProps.min;
      this.properties.max = this.dialProps.max;
      this.properties.step = this.dialProps.step;
      this.properties.snap = this.dialProps.snap;
      this.properties.fillColor = this.dialProps.fillColor;
      this.properties.borderColor = this.dialProps.borderColor;
      this.properties.textColor = this.dialProps.textColor;

      cleanProperties(this);

      // Internal state
      this.capture = false;
      this.unlock = false;

      // Set initial node size (square + slot offset)
      const contentY = getContentStartY(this);
      this.size = [120, contentY + 120];

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
        this._valueWidget.value = this.dialProps.current;
        this._valueWidget.hidden = true;
        if (this._valueWidget.options) {
          this._valueWidget.options.hidden = true;
        }
        this._valueWidget.computeSize = () => [0, -4];
        this._valueWidget.type = "converted-widget";
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
        this.dialProps.current = widget.value;
        this.properties.current = widget.value;
        return widget.value;
      }
      return this.dialProps.current;
    };

    // Set value
    nodeType.prototype._setValue = function (value) {
      value = Math.round(value);
      this.dialProps.current = value;
      this.properties.current = value;
      const widget = this._getWidget();
      if (widget) widget.value = value;
    };

    // Get dial geometry (responsive to resize)
    nodeType.prototype._getDialGeometry = function () {
      const width = this.size[0];
      const height = this.size[1];
      const contentY = getContentStartY(this);
      const pad = 10;
      const textSpace = 20;
      const availableHeight = height - contentY;
      const radius =
        Math.min(width - pad * 2, availableHeight - pad * 2 - textSpace) / 2;
      const cx = width / 2;
      const cy = contentY + pad + radius;
      return { cx, cy, radius };
    };

    // Property change handler
    nodeType.prototype.onPropertyChanged = function (name, value) {
      cleanProperties(this);

      if (name === "current") {
        value = Math.round(value);
        value = clamp(value, this.dialProps.min, this.dialProps.max);
        this._setValue(value);
      } else if (name === "min") {
        this.dialProps.min = Math.round(value);
        this.properties.min = this.dialProps.min;
        if (this.dialProps.current < this.dialProps.min) {
          this._setValue(this.dialProps.min);
        }
      } else if (name === "max") {
        this.dialProps.max = Math.round(value);
        this.properties.max = this.dialProps.max;
        if (this.dialProps.current > this.dialProps.max) {
          this._setValue(this.dialProps.max);
        }
      } else if (name === "step") {
        this.dialProps.step = Math.max(1, Math.round(value));
        this.properties.step = this.dialProps.step;
      } else if (name === "snap") {
        this.dialProps.snap = Boolean(value);
        this.properties.snap = this.dialProps.snap;
      } else if (name === "fillColor") {
        if (isValidHexColor(value)) {
          this.dialProps.fillColor = value;
          this.properties.fillColor = value;
        }
      } else if (name === "borderColor") {
        if (isValidHexColor(value)) {
          this.dialProps.borderColor = value;
          this.properties.borderColor = value;
        }
      } else if (name === "textColor") {
        if (isValidHexColor(value) || value === "auto") {
          this.dialProps.textColor = value;
          this.properties.textColor = value;
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.dialProps.current = info.properties.current ?? 1;
        this.dialProps.min = info.properties.min ?? 0;
        this.dialProps.max = info.properties.max ?? 100;
        this.dialProps.step = Math.max(
          1,
          Math.round(info.properties.step ?? 1),
        );
        this.dialProps.snap = info.properties.snap ?? true;
        this.dialProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#4a90d9";
        this.dialProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        const tc = info.properties.textColor;
        this.dialProps.textColor =
          isValidHexColor(tc) || tc === "auto" ? tc : "auto";

        this.properties.current = this.dialProps.current;
        this.properties.min = this.dialProps.min;
        this.properties.max = this.dialProps.max;
        this.properties.step = this.dialProps.step;
        this.properties.snap = this.dialProps.snap;
        this.properties.fillColor = this.dialProps.fillColor;
        this.properties.borderColor = this.dialProps.borderColor;
        this.properties.textColor = this.dialProps.textColor;

        cleanProperties(this);

        const widget = this._getWidget();
        if (widget) {
          widget.value = this.dialProps.current;
          widget.hidden = true;
          if (widget.options) widget.options.hidden = true;
          widget.computeSize = () => [0, -4];
          widget.type = "converted-widget";
        }

        // Set output labels to lowercase
        if (this.outputs) {
          for (const out of this.outputs) {
            out.label = out.name.toLowerCase();
          }
        }
      }
    };

    // Draw the dial
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      const { cx, cy, radius } = this._getDialGeometry();
      const current = this._getValue();
      const min = this.dialProps.min;
      const max = this.dialProps.max;
      const range = max - min;
      const ratio = range > 0 ? clamp((current - min) / range, 0, 1) : 0;
      const currentAngle = START_ANGLE + SWEEP * ratio;
      const textColor =
        this.dialProps.textColor === "auto"
          ? getContrastColor(this.dialProps.fillColor)
          : this.dialProps.textColor;

      // 1. Background arc (track)
      ctx.beginPath();
      ctx.arc(cx, cy, radius, START_ANGLE, END_ANGLE);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();

      // 2. Fill arc (value)
      if (ratio > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, START_ANGLE, currentAngle);
        ctx.strokeStyle = this.dialProps.fillColor;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // 3. Indicator line from center to edge
      const indicatorLen = radius * 0.7;
      const indX = cx + Math.cos(currentAngle) * indicatorLen;
      const indY = cy + Math.sin(currentAngle) * indicatorLen;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(indX, indY);
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // 4. Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = this.dialProps.borderColor;
      ctx.fill();

      // 5. Value text below dial
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(String(current), cx, cy + radius + 6);
    };

    // Hit test - is point within dial area
    nodeType.prototype._isInDialBounds = function (localX, localY) {
      const { cx, cy, radius } = this._getDialGeometry();
      const dx = localX - cx;
      const dy = localY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= radius * 1.3;
    };

    // Convert mouse position to value
    nodeType.prototype._mouseToValue = function (localX, localY) {
      const { cx, cy } = this._getDialGeometry();
      const dx = localX - cx;
      const dy = localY - cy;
      let angle = Math.atan2(dy, dx);

      // Normalize angle to [0, 2*PI]
      if (angle < 0) angle += Math.PI * 2;

      // Calculate relative angle from START_ANGLE
      let relAngle = angle - START_ANGLE;
      if (relAngle < 0) relAngle += Math.PI * 2;

      // Check if in dead zone (bottom 90 degrees)
      if (relAngle > SWEEP) {
        // Snap to nearest end
        const midDeadZone = SWEEP + (Math.PI * 2 - SWEEP) / 2;
        relAngle = relAngle < midDeadZone ? SWEEP : 0;
      }

      const ratio = clamp(relAngle / SWEEP, 0, 1);
      return (
        this.dialProps.min + (this.dialProps.max - this.dialProps.min) * ratio
      );
    };

    // Mouse down handler
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;
      if (e.canvasY - this.pos[1] < 0) return false;

      const localX = pos[0];
      const localY = pos[1];

      if (this._isInDialBounds(localX, localY)) {
        this.capture = true;
        this.unlock = false;
        this.captureInput(true);
        this._dialUpdate(pos, e);
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

      this._dialUpdate(pos, e);
    };

    // Mouse up handler
    nodeType.prototype.onMouseUp = function (e) {
      if (!this.capture) return;
      this.capture = false;
      this.captureInput(false);

      const widget = this._getWidget();
      if (widget) widget.value = this.dialProps.current;
    };

    // Update value from dial interaction
    nodeType.prototype._dialUpdate = function (pos, e) {
      let value = this._mouseToValue(pos[0], pos[1]);

      // Shift inverts snap
      let shouldSnap = this.dialProps.snap;
      if (e && e.shiftKey) shouldSnap = !shouldSnap;

      if (shouldSnap && this.dialProps.step > 0) {
        value = Math.round(value / this.dialProps.step) * this.dialProps.step;
      }

      value = Math.round(value);
      value = clamp(value, this.dialProps.min, this.dialProps.max);
      this._setValue(value);
      this.setDirtyCanvas(true, true);
    };

    // Double click for manual entry
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      const localX = pos[0];
      const localY = pos[1];

      if (this._isInDialBounds(localX, localY)) {
        canvas.prompt(
          "Value",
          this.dialProps.current,
          (v) => {
            if (!isNaN(Number(v))) {
              let value = Math.round(Number(v));
              value = clamp(value, this.dialProps.min, this.dialProps.max);
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

    // Release capture on select
    nodeType.prototype.onSelected = function (e) {
      this.onMouseUp(e);
    };

    // Serialize
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        current: this.dialProps.current,
        min: this.dialProps.min,
        max: this.dialProps.max,
        step: this.dialProps.step,
        snap: this.dialProps.snap,
        fillColor: this.dialProps.fillColor,
        borderColor: this.dialProps.borderColor,
        textColor: this.dialProps.textColor,
      };
    };

    // Compute minimum size
    nodeType.prototype.computeSize = function () {
      const contentY = getContentStartY(this);
      return [80, contentY + 80];
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
        content: "Dial Fill Color...",
        callback: () => {
          openColorPicker(this.dialProps.fillColor, (c) => {
            this.dialProps.fillColor = c;
            this.properties.fillColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Dial Border Color...",
        callback: () => {
          openColorPicker(this.dialProps.borderColor, (c) => {
            this.dialProps.borderColor = c;
            this.properties.borderColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Dial Text Color...",
        callback: () => {
          openColorPicker(
            this.dialProps.textColor === "auto"
              ? getContrastColor(this.dialProps.fillColor)
              : this.dialProps.textColor,
            (c) => {
              this.dialProps.textColor = c;
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
          this.dialProps.current = 1;
          this.dialProps.min = 0;
          this.dialProps.max = 100;
          this.dialProps.step = 1;
          this.dialProps.snap = true;
          this.dialProps.fillColor = "#4a90d9";
          this.dialProps.borderColor = "#666666";
          this.dialProps.textColor = "auto";

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
