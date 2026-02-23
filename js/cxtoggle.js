// cxtoggle.js — cxToggle custom widget using CxBaseWidget
// Button-style toggle with configurable states and custom labels

import { app } from "../../scripts/app.js";
import { clamp, MARGIN, COLORS, cxLog, openColorPicker } from "./cx_utils.js";
import { CxBaseWidget } from "./cx_base_widget.js";

export class CxToggleWidget extends CxBaseWidget {
  static HEIGHT = 28;

  constructor(name, defaultValue) {
    super(name, defaultValue);
  }

  computeSize(width) {
    return [width, CxToggleWidget.HEIGHT];
  }

  _draw(ctx, node, width, y, height) {
    const m = MARGIN;
    const barW = width - m * 2;
    const min = this._getProp("min", 0);
    const max = this._getProp("max", 1);
    const isActive = this.value > min;
    const fillColor = this._getProp("fillColor", COLORS.toggle.fill);
    const borderColor = this._getProp("borderColor", COLORS.widget.border);

    // Button background
    this._drawBackground(ctx, m, y, barW, height, isActive ? fillColor : COLORS.widget.background);
    this._drawBorder(ctx, m, y, barW, height, borderColor);

    // Label text
    if (!this._isLowQuality()) {
      const textColor = this._resolveTextColor(fillColor);
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this._getCurrentLabel(), width / 2, y + height / 2);
    }

    // Hit area: full widget
    this._hitAreas.button = {
      bounds: [m, barW],
      onDown: (event, pos, node) => {
        let next = this.value + 1;
        if (next > max) next = min;
        this.value = next;
        node.setDirtyCanvas(true, true);
        return true;
      }
    };
  }

  _getLabels() {
    const min = this._getProp("min", 0);
    const max = this._getProp("max", 1);
    const labelStr = this._getProp("labels", "Off,On");
    const stateCount = max - min + 1;
    let labels = labelStr.split(",").map(s => s.trim());
    while (labels.length < stateCount) labels.push(String(min + labels.length));
    if (labels.length > stateCount) labels.length = stateCount;
    return labels;
  }

  _getCurrentLabel() {
    const labels = this._getLabels();
    const min = this._getProp("min", 0);
    const idx = clamp(this.value - min, 0, labels.length - 1);
    return labels[idx] || String(this.value);
  }
}

app.registerExtension({
  name: "cx.toggle",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "cxToggle") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function() {
      onNodeCreated?.apply(this, arguments);
      try {
        // Remove framework-created "toggle" widget, replace with custom at same index
        const idx = this.widgets?.findIndex(w => w.name === "toggle") ?? -1;
        if (idx >= 0) this.widgets.splice(idx, 1);

        // Set default properties (config-only state, NOT in widget.value)
        this.properties = this.properties || {};
        Object.assign(this.properties, {
          min: 0,
          max: 1,
          labels: "Off,On",
          fillColor: COLORS.toggle.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });

        const widget = new CxToggleWidget("toggle", 0);

        // Insert at same index (preserves widgets_values serialization order)
        if (idx >= 0) {
          this.widgets.splice(idx, 0, widget);
        } else {
          this.addCustomWidget(widget);
        }

        this.setSize(this.computeSize());

        // Lowercase output labels
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });

        cxLog("debug", "cxToggle widget created");
      } catch (err) {
        cxLog("error", "cxToggle onNodeCreated:", err);
      }
    };

    // onDblClick -- manual numeric entry
    nodeType.prototype.onDblClick = function(e, pos, canvas) {
      const w = this.widgets?.find(w => w.name === "toggle");
      if (!w) return;
      const current = String(w.value);
      canvas.prompt("Value", current, (v) => {
        const num = parseInt(v);
        if (!isNaN(num)) {
          w.value = clamp(num, this.properties.min ?? 0, this.properties.max ?? 1);
          this.setDirtyCanvas(true, true);
        }
      }, e);
    };

    // getExtraMenuOptions -- color pickers + reset
    nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
      options.push(null); // separator
      options.push({
        content: "🎨 Fill Color",
        callback: () => openColorPicker(this.properties.fillColor || COLORS.toggle.fill, (c) => {
          this.properties.fillColor = c;
          this.setDirtyCanvas(true, true);
        })
      });
      options.push({
        content: "🎨 Border Color",
        callback: () => openColorPicker(this.properties.borderColor || COLORS.widget.border, (c) => {
          this.properties.borderColor = c;
          this.setDirtyCanvas(true, true);
        })
      });
      options.push({
        content: "🎨 Text Color",
        callback: () => openColorPicker(this.properties.textColor || "auto", (c) => {
          this.properties.textColor = c;
          this.setDirtyCanvas(true, true);
        })
      });
      options.push(null); // separator
      options.push({
        content: "↺ Reset to Defaults",
        callback: () => {
          Object.assign(this.properties, {
            min: 0, max: 1, labels: "Off,On",
            fillColor: COLORS.toggle.fill,
            borderColor: COLORS.widget.border,
            textColor: "auto",
          });
          const w = this.widgets?.find(w => w.name === "toggle");
          if (w) w.value = clamp(w.value, 0, 1);
          this.setDirtyCanvas(true, true);
        }
      });
    };

    // onPropertyChanged -- sync from Properties Panel
    nodeType.prototype.onPropertyChanged = function(name, value) {
      const w = this.widgets?.find(w => w.name === "toggle");
      if (!w) return;
      if (name === "min" || name === "max") {
        w.value = clamp(w.value, this.properties.min ?? 0, this.properties.max ?? 1);
      }
      this.setDirtyCanvas(true, true);
    };
  }
});
