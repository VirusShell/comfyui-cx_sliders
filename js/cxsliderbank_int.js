// ComfyUI - cxSliderBank Int
// Vertically stacked slider bank for integer values with dynamic outputs
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

const MAX_SLIDERS = 8;
const DEFAULT_COUNT = 3;

app.registerExtension({
  name: "cxSliderBank.Int",

  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxSliderBankInt") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      if (onNodeCreated) {
        onNodeCreated.apply(this, arguments);
      }

      // Initialize custom properties
      this.bankProps = {
        sliderCount: DEFAULT_COUNT,
        min: 0,
        max: 100,
        step: 1,
        snap: true,
        labels:
          "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8",
        values: [0, 0, 0, 0, 0, 0, 0, 0],
        fillColor: "#4a90d9",
        borderColor: "#666666",
        textColor: "auto",
      };

      // Sync with node.properties
      this.properties = this.properties || {};
      this._syncPropsToProperties();

      cleanProperties(this);

      // Internal state
      this.capture = false;
      this.activeSliderIndex = -1;

      // Layout constants
      this.buttonRowHeight = 22;
      this.buttonGap = 6;
      this.miniSliderHeight = 20;
      this.miniSliderGap = 2;
      this.labelWidth = 50;
      this.sidePadding = 6;

      // Find and hide all 8 widgets
      this._setupWidgets();

      // Remove extra outputs to match default count
      this._reconcileOutputs();

      // Set output labels to lowercase
      if (this.outputs) {
        for (const out of this.outputs) {
          out.label = out.name.toLowerCase();
        }
      }

      // Set initial size
      this._updateSize();
    };

    // Sync bankProps to node.properties
    nodeType.prototype._syncPropsToProperties = function () {
      this.properties.sliderCount = this.bankProps.sliderCount;
      this.properties.min = this.bankProps.min;
      this.properties.max = this.bankProps.max;
      this.properties.step = this.bankProps.step;
      this.properties.snap = this.bankProps.snap;
      this.properties.labels = this.bankProps.labels;
      this.properties.fillColor = this.bankProps.fillColor;
      this.properties.borderColor = this.bankProps.borderColor;
      this.properties.textColor = this.bankProps.textColor;
      // Store individual values as properties for Properties Panel
      for (let i = 0; i < MAX_SLIDERS; i++) {
        this.properties["value_" + (i + 1)] = this.bankProps.values[i];
      }
    };

    // Setup widget references and hide them
    nodeType.prototype._setupWidgets = function () {
      if (!this.widgets) return;
      this._sliderWidgets = [];
      for (let i = 1; i <= MAX_SLIDERS; i++) {
        const w = this.widgets.find((w) => w.name === "slider_" + i);
        if (w) {
          w.value = this.bankProps.values[i - 1];
          w.hidden = true;
          if (w.options) w.options.hidden = true;
          w.computeSize = () => [0, -4];
          w.type = "converted-widget";
        }
        this._sliderWidgets.push(w || null);
      }
    };

    // Reconcile output count with bankProps.sliderCount
    nodeType.prototype._reconcileOutputs = function () {
      if (!this.outputs) return;
      const target = this.bankProps.sliderCount;
      // Remove from end
      while (this.outputs.length > target) {
        this.removeOutput(this.outputs.length - 1);
      }
      // Add if needed
      while (this.outputs.length < target) {
        this.addOutput("OUT_" + (this.outputs.length + 1), "INT");
      }
    };

    // Update node size based on slider count
    nodeType.prototype._updateSize = function () {
      const count = this.bankProps.sliderCount;
      const contentY = getContentStartY(this);
      const contentHeight =
        this.buttonRowHeight +
        this.buttonGap +
        count * this.miniSliderHeight +
        Math.max(0, count - 1) * this.miniSliderGap;
      this.size = [220, contentY + contentHeight + 10];
    };

    // Get labels array
    nodeType.prototype._getLabels = function () {
      let labels = this.bankProps.labels.split(",").map((s) => s.trim());
      while (labels.length < MAX_SLIDERS) {
        labels.push("Slider " + (labels.length + 1));
      }
      return labels;
    };

    // Set value for a specific slider index (0-based)
    nodeType.prototype._setSliderValue = function (index, value) {
      value = Math.round(value);
      value = clamp(value, this.bankProps.min, this.bankProps.max);
      this.bankProps.values[index] = value;
      this.properties["value_" + (index + 1)] = value;
      if (this._sliderWidgets && this._sliderWidgets[index]) {
        this._sliderWidgets[index].value = value;
      }
    };

    // Get button bounds
    nodeType.prototype._getButtonBounds = function () {
      const width = this.size[0];
      const btnW = 28;
      const gap = 6;
      const totalW = btnW * 2 + gap;
      const startX = (width - totalW) / 2;
      const contentY = getContentStartY(this);
      const y = contentY + 2;
      return {
        add: { x: startX, y: y, width: btnW, height: this.buttonRowHeight },
        remove: {
          x: startX + btnW + gap,
          y: y,
          width: btnW,
          height: this.buttonRowHeight,
        },
      };
    };

    // Get mini-slider bounds for a given index (0-based)
    nodeType.prototype._getMiniSliderBounds = function (index) {
      const contentY = getContentStartY(this);
      const startY = contentY + this.buttonRowHeight + this.buttonGap;
      const y = startY + index * (this.miniSliderHeight + this.miniSliderGap);
      return {
        labelX: this.sidePadding,
        labelWidth: this.labelWidth,
        barX: this.sidePadding + this.labelWidth + 4,
        barWidth:
          this.size[0] - this.sidePadding * 2 - this.labelWidth - 4 - 40,
        y: y,
        height: this.miniSliderHeight,
      };
    };

    // Property change handler
    nodeType.prototype.onPropertyChanged = function (name, value) {
      cleanProperties(this);

      if (name === "sliderCount") {
        const count = clamp(Math.round(value), 1, MAX_SLIDERS);
        this.bankProps.sliderCount = count;
        this.properties.sliderCount = count;
        this._reconcileOutputs();
        this._updateSize();
      } else if (name === "min") {
        this.bankProps.min = Math.round(value);
        this.properties.min = this.bankProps.min;
        for (let i = 0; i < MAX_SLIDERS; i++) {
          if (this.bankProps.values[i] < this.bankProps.min) {
            this._setSliderValue(i, this.bankProps.min);
          }
        }
      } else if (name === "max") {
        this.bankProps.max = Math.round(value);
        this.properties.max = this.bankProps.max;
        for (let i = 0; i < MAX_SLIDERS; i++) {
          if (this.bankProps.values[i] > this.bankProps.max) {
            this._setSliderValue(i, this.bankProps.max);
          }
        }
      } else if (name === "step") {
        this.bankProps.step = Math.max(1, Math.round(value));
        this.properties.step = this.bankProps.step;
      } else if (name === "snap") {
        this.bankProps.snap = Boolean(value);
        this.properties.snap = this.bankProps.snap;
      } else if (name === "labels") {
        if (typeof value === "string") {
          this.bankProps.labels = value;
          this.properties.labels = value;
        }
      } else if (name === "fillColor") {
        if (isValidHexColor(value)) {
          this.bankProps.fillColor = value;
          this.properties.fillColor = value;
        }
      } else if (name === "borderColor") {
        if (isValidHexColor(value)) {
          this.bankProps.borderColor = value;
          this.properties.borderColor = value;
        }
      } else if (name === "textColor") {
        if (isValidHexColor(value) || value === "auto") {
          this.bankProps.textColor = value;
          this.properties.textColor = value;
        }
      } else if (name.startsWith("value_")) {
        const idx = parseInt(name.split("_")[1]) - 1;
        if (idx >= 0 && idx < MAX_SLIDERS) {
          this._setSliderValue(idx, Math.round(value));
        }
      }
      this.setDirtyCanvas(true, true);
    };

    // Configure handler
    nodeType.prototype.onConfigure = function (info) {
      if (info.properties) {
        this.bankProps.sliderCount = clamp(
          info.properties.sliderCount ?? DEFAULT_COUNT,
          1,
          MAX_SLIDERS,
        );
        this.bankProps.min = info.properties.min ?? 0;
        this.bankProps.max = info.properties.max ?? 100;
        this.bankProps.step = Math.max(
          1,
          Math.round(info.properties.step ?? 1),
        );
        this.bankProps.snap = info.properties.snap ?? true;
        this.bankProps.labels =
          info.properties.labels ??
          "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8";
        this.bankProps.fillColor = isValidHexColor(info.properties.fillColor)
          ? info.properties.fillColor
          : "#4a90d9";
        this.bankProps.borderColor = isValidHexColor(
          info.properties.borderColor,
        )
          ? info.properties.borderColor
          : "#666666";
        const tc = info.properties.textColor;
        this.bankProps.textColor =
          isValidHexColor(tc) || tc === "auto" ? tc : "auto";

        // Load individual values
        for (let i = 0; i < MAX_SLIDERS; i++) {
          const val = info.properties["value_" + (i + 1)];
          this.bankProps.values[i] = val !== undefined ? val : 0;
        }

        this._syncPropsToProperties();
        cleanProperties(this);

        // Reconcile outputs and widgets
        this._setupWidgets();
        this._reconcileOutputs();

        // Set output labels to lowercase
        if (this.outputs) {
          for (const out of this.outputs) {
            out.label = out.name.toLowerCase();
          }
        }

        this._updateSize();
      }
    };

    // Draw
    nodeType.prototype.onDrawForeground = function (ctx) {
      if (this.flags.collapsed) return;

      const width = this.size[0];
      const bounds = this._getButtonBounds();
      const labels = this._getLabels();
      const count = this.bankProps.sliderCount;

      // Draw [+] button
      ctx.fillStyle = count < MAX_SLIDERS ? "#4a6a4a" : "#3a3a3a";
      ctx.beginPath();
      ctx.roundRect(
        bounds.add.x,
        bounds.add.y,
        bounds.add.width,
        bounds.add.height,
        3,
      );
      ctx.fill();
      ctx.strokeStyle = count < MAX_SLIDERS ? "#6a8a6a" : "#4a4a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(
        bounds.add.x,
        bounds.add.y,
        bounds.add.width,
        bounds.add.height,
        3,
      );
      ctx.stroke();
      ctx.fillStyle = count < MAX_SLIDERS ? "#fff" : "#666";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "+",
        bounds.add.x + bounds.add.width / 2,
        bounds.add.y + bounds.add.height / 2,
      );

      // Draw [-] button
      ctx.fillStyle = count > 1 ? "#6a4a4a" : "#3a3a3a";
      ctx.beginPath();
      ctx.roundRect(
        bounds.remove.x,
        bounds.remove.y,
        bounds.remove.width,
        bounds.remove.height,
        3,
      );
      ctx.fill();
      ctx.strokeStyle = count > 1 ? "#8a6a6a" : "#4a4a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(
        bounds.remove.x,
        bounds.remove.y,
        bounds.remove.width,
        bounds.remove.height,
        3,
      );
      ctx.stroke();
      ctx.fillStyle = count > 1 ? "#fff" : "#666";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "\u2212",
        bounds.remove.x + bounds.remove.width / 2,
        bounds.remove.y + bounds.remove.height / 2,
      );

      // Draw mini-sliders
      const min = this.bankProps.min;
      const max = this.bankProps.max;
      const range = max - min;

      for (let i = 0; i < count; i++) {
        const sb = this._getMiniSliderBounds(i);
        const value = this.bankProps.values[i];
        const ratio = range > 0 ? clamp((value - min) / range, 0, 1) : 0;

        // Label
        ctx.fillStyle = "#ccc";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        let label = labels[i] || "Slider " + (i + 1);
        // Truncate label if too wide
        const maxLabelW = sb.labelWidth - 2;
        if (ctx.measureText(label).width > maxLabelW) {
          while (
            label.length > 2 &&
            ctx.measureText(label + "..").width > maxLabelW
          ) {
            label = label.slice(0, -1);
          }
          label += "..";
        }
        ctx.fillText(label, sb.labelX + sb.labelWidth, sb.y + sb.height / 2);

        // Slider background
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.roundRect(sb.barX, sb.y, sb.barWidth, sb.height, 3);
        ctx.fill();

        // Slider fill
        const fillW = sb.barWidth * ratio;
        if (fillW > 0) {
          ctx.fillStyle = this.bankProps.fillColor;
          ctx.beginPath();
          ctx.roundRect(sb.barX, sb.y, fillW, sb.height, 3);
          ctx.fill();
        }

        // Slider border
        ctx.strokeStyle = this.bankProps.borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sb.barX, sb.y, sb.barWidth, sb.height, 3);
        ctx.stroke();

        // Value text
        const textColor =
          this.bankProps.textColor === "auto"
            ? getContrastColor(this.bankProps.fillColor)
            : this.bankProps.textColor;
        ctx.fillStyle = textColor;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          String(value),
          sb.barX + sb.barWidth / 2,
          sb.y + sb.height / 2,
        );
      }
    };

    // Check if point is in button
    nodeType.prototype._isInButton = function (x, y, btn) {
      return (
        x >= btn.x &&
        x <= btn.x + btn.width &&
        y >= btn.y &&
        y <= btn.y + btn.height
      );
    };

    // Mouse down
    nodeType.prototype.onMouseDown = function (e, pos, canvas) {
      if (this.flags.collapsed) return false;

      const localX = pos[0];
      const localY = pos[1];
      const bounds = this._getButtonBounds();

      // Check [+] button
      if (this._isInButton(localX, localY, bounds.add)) {
        if (this.bankProps.sliderCount < MAX_SLIDERS) {
          this.bankProps.sliderCount++;
          this.properties.sliderCount = this.bankProps.sliderCount;
          this.addOutput("OUT_" + this.bankProps.sliderCount, "INT");
          if (this.outputs[this.outputs.length - 1]) {
            this.outputs[this.outputs.length - 1].label =
              this.outputs[this.outputs.length - 1].name.toLowerCase();
          }
          this._updateSize();
          this.setDirtyCanvas(true, true);
        }
        return true;
      }

      // Check [-] button
      if (this._isInButton(localX, localY, bounds.remove)) {
        if (this.bankProps.sliderCount > 1) {
          this.removeOutput(this.bankProps.sliderCount - 1);
          this.bankProps.sliderCount--;
          this.properties.sliderCount = this.bankProps.sliderCount;
          this._updateSize();
          this.setDirtyCanvas(true, true);
        }
        return true;
      }

      // Check mini-sliders
      for (let i = 0; i < this.bankProps.sliderCount; i++) {
        const sb = this._getMiniSliderBounds(i);
        if (
          localX >= sb.barX &&
          localX <= sb.barX + sb.barWidth &&
          localY >= sb.y &&
          localY <= sb.y + sb.height
        ) {
          this.activeSliderIndex = i;
          this.capture = true;
          this.captureInput(true);
          this._sliderUpdate(i, localX);
          return true;
        }
      }

      return false;
    };

    // Mouse move
    nodeType.prototype.onMouseMove = function (e, pos, canvas) {
      if (!this.capture || this.activeSliderIndex < 0) return;

      if (canvas && canvas.pointer && canvas.pointer.isDown === false) {
        this.onMouseUp(e);
        return;
      }

      this._sliderUpdate(this.activeSliderIndex, pos[0]);
    };

    // Mouse up
    nodeType.prototype.onMouseUp = function (e) {
      if (!this.capture) return;
      this.capture = false;
      this.activeSliderIndex = -1;
      this.captureInput(false);
    };

    // Update slider value from X position
    nodeType.prototype._sliderUpdate = function (index, localX) {
      const sb = this._getMiniSliderBounds(index);
      let vX = (localX - sb.barX) / sb.barWidth;
      vX = clamp(vX, 0, 1);

      let shouldSnap = this.bankProps.snap;
      let value =
        this.bankProps.min + (this.bankProps.max - this.bankProps.min) * vX;

      if (shouldSnap && this.bankProps.step > 0) {
        value = Math.round(value / this.bankProps.step) * this.bankProps.step;
      }

      value = Math.round(value);
      this._setSliderValue(index, value);
      this.setDirtyCanvas(true, true);
    };

    // Double click on a slider for manual entry
    nodeType.prototype.onDblClick = function (e, pos, canvas) {
      const localX = pos[0];
      const localY = pos[1];

      for (let i = 0; i < this.bankProps.sliderCount; i++) {
        const sb = this._getMiniSliderBounds(i);
        if (
          localX >= sb.barX &&
          localX <= sb.barX + sb.barWidth &&
          localY >= sb.y &&
          localY <= sb.y + sb.height
        ) {
          const labels = this._getLabels();
          canvas.prompt(
            labels[i] || "Slider " + (i + 1),
            this.bankProps.values[i],
            (v) => {
              if (!isNaN(Number(v))) {
                this._setSliderValue(i, Math.round(Number(v)));
                this.setDirtyCanvas(true, true);
              }
            },
            e,
          );
          return true;
        }
      }
      return false;
    };

    // Release on select
    nodeType.prototype.onSelected = function (e) {
      this.onMouseUp(e);
    };

    // Serialize
    nodeType.prototype.onSerialize = function (info) {
      info.properties = {
        sliderCount: this.bankProps.sliderCount,
        min: this.bankProps.min,
        max: this.bankProps.max,
        step: this.bankProps.step,
        snap: this.bankProps.snap,
        labels: this.bankProps.labels,
        fillColor: this.bankProps.fillColor,
        borderColor: this.bankProps.borderColor,
        textColor: this.bankProps.textColor,
      };
      for (let i = 0; i < MAX_SLIDERS; i++) {
        info.properties["value_" + (i + 1)] = this.bankProps.values[i];
      }
    };

    // Compute minimum size
    nodeType.prototype.computeSize = function () {
      const count = this.bankProps ? this.bankProps.sliderCount : DEFAULT_COUNT;
      const contentY = getContentStartY(this);
      const h =
        contentY +
        this.buttonRowHeight +
        this.buttonGap +
        count * this.miniSliderHeight +
        Math.max(0, count - 1) * this.miniSliderGap +
        10;
      return [160, h];
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
        content: "Slider Fill Color...",
        callback: () => {
          openColorPicker(this.bankProps.fillColor, (c) => {
            this.bankProps.fillColor = c;
            this.properties.fillColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Slider Border Color...",
        callback: () => {
          openColorPicker(this.bankProps.borderColor, (c) => {
            this.bankProps.borderColor = c;
            this.properties.borderColor = c;
            this.setDirtyCanvas(true, true);
          });
        },
      });
      options.push({
        content: "Slider Text Color...",
        callback: () => {
          openColorPicker(
            this.bankProps.textColor === "auto"
              ? getContrastColor(this.bankProps.fillColor)
              : this.bankProps.textColor,
            (c) => {
              this.bankProps.textColor = c;
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
          this.bankProps.sliderCount = DEFAULT_COUNT;
          this.bankProps.min = 0;
          this.bankProps.max = 100;
          this.bankProps.step = 1;
          this.bankProps.snap = true;
          this.bankProps.labels =
            "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8";
          this.bankProps.values = [0, 0, 0, 0, 0, 0, 0, 0];
          this.bankProps.fillColor = "#4a90d9";
          this.bankProps.borderColor = "#666666";
          this.bankProps.textColor = "auto";

          this._syncPropsToProperties();
          cleanProperties(this);

          // Sync widget values
          for (let i = 0; i < MAX_SLIDERS; i++) {
            if (this._sliderWidgets && this._sliderWidgets[i]) {
              this._sliderWidgets[i].value = 0;
            }
          }

          this._reconcileOutputs();
          this._updateSize();
          this.setDirtyCanvas(true, true);
        },
      });
    };
  },
});
