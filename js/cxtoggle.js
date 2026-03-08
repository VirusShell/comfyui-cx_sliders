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

  _onDblClick(event, pos, node) {
    const current = String(this.value);
    app.canvas.prompt("Value", current, (v) => {
      const num = parseInt(v);
      if (!isNaN(num)) {
        this.value = clamp(num, this._getProp("min", 0), this._getProp("max", 1));
        node.setDirtyCanvas(true, true);
      }
    }, event);
    return true;
  }

  _getLabels() {
    const min = this._getProp("min", 0);
    const max = this._getProp("max", 1);
    const labelStr = this._getProp("labels", "Off, On");
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

// Module-level migration function for v1.x workflows
function migrateToggleProps(node, info) {
  const p = info.properties || {};
  const wasOldFormat = p.current !== undefined      // v1.2 format
                     || p.toggleProps !== undefined;  // v1.0 format

  if (!wasOldFormat) return;

  cxLog("debug", "Migrating v1.x toggle properties");

  // Extract old values
  const oldCurrent = p.current ?? 0;
  const oldMin = p.min ?? 0;
  const oldMax = p.max ?? 1;

  // Write config to node.properties (new format)
  node.properties.min = oldMin;
  node.properties.max = oldMax;
  node.properties.labels = p.labels ?? "Off, On";

  // Colors: reset to new defaults (config loss accepted per AC-9.3)
  node.properties.fillColor = COLORS.toggle.fill;
  node.properties.borderColor = COLORS.widget.border;
  node.properties.textColor = "auto";

  // Set widget value (numeric value preserved per AC-9.2)
  const w = node.widgets?.find(w => w.name === "toggle");
  if (w) {
    w.value = clamp(oldCurrent, oldMin, oldMax);
  } else {
    cxLog("warn", "cxToggle migration: 'toggle' widget not found");
  }

  // Clean up old properties
  delete node.properties.current;
  delete node.properties.toggleProps;
  delete node.properties.ver;
  delete node.properties.aux_id;
}

app.registerExtension({
  name: "cx.sliders.toggle",
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
          labels: "Off, On",
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

    // onPropertyChanged -- sync from Properties Panel
    nodeType.prototype.onPropertyChanged = function(name, value) {
      const w = this.widgets?.find(w => w.name === "toggle");
      if (!w) { cxLog("warn", "cxToggle onPropertyChanged: 'toggle' widget not found"); return; }
      if (name === "min" || name === "max") {
        const num = Number(value);
        if (!isFinite(num)) {
          cxLog("warn", `cxToggle onPropertyChanged: invalid ${name} "${value}", reverting`);
          this.properties[name] = name === "min" ? 0 : 1;
        } else if (name === "min") {
          this.properties.min = clamp(Math.round(num), 0, this.properties.max ?? 1);
        } else {
          this.properties.max = clamp(Math.round(num), this.properties.min ?? 0, 20);
        }
      }
      if (name === "labels" && typeof value !== "string") {
        cxLog("warn", `cxToggle onPropertyChanged: labels must be string, got ${typeof value}`);
        this.properties.labels = String(value ?? "Off, On");
      }
      const cVal = Number(w.value);
      w.value = isFinite(cVal) ? clamp(cVal, this.properties.min ?? 0, this.properties.max ?? 1) : (this.properties.min ?? 0);
      this.setDirtyCanvas(true, true);
    };

    // onConfigure -- migration + restore
    nodeType.prototype.onConfigure = function(info) {
      try {
        migrateToggleProps(this, info);
        const w = this.widgets?.find(w => w.name === "toggle");
        if (!w) { cxLog("warn", "cxToggle onConfigure: 'toggle' widget not found"); return; }
        if (info.widgets_values) {
          // Framework restores widget.value from widgets_values automatically
          // Guard against NaN/undefined from corrupted workflows
          const restored = Number(w.value);
          if (!isFinite(restored)) {
            cxLog("warn", `cxToggle onConfigure: invalid value "${w.value}", defaulting to min`);
            w.value = this.properties.min ?? 0;
          } else {
            w.value = clamp(restored, this.properties.min ?? 0, this.properties.max ?? 1);
          }
        }
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
      } catch (err) {
        cxLog("error", "cxToggle onConfigure:", err);
      }
    };
  },
  getNodeMenuItems(node) {
    if (node.comfyClass !== "cxToggle") return [];
    const w = node.widgets?.find(w => w.name === "toggle");
    if (!w) return [];
    const items = [null];
    items.push({
      content: "🎨 Fill Color",
      callback: () => openColorPicker(node.properties.fillColor || COLORS.toggle.fill, (c) => {
        node.properties.fillColor = c;
        node.setDirtyCanvas(true, true);
      })
    });
    items.push({
      content: "🎨 Border Color",
      callback: () => openColorPicker(node.properties.borderColor || COLORS.widget.border, (c) => {
        node.properties.borderColor = c;
        node.setDirtyCanvas(true, true);
      })
    });
    items.push({
      content: "🎨 Text Color",
      callback: () => openColorPicker(node.properties.textColor || "auto", (c) => {
        node.properties.textColor = c;
        node.setDirtyCanvas(true, true);
      })
    });
    items.push({
      content: "↺ Reset to Defaults",
      callback: () => {
        Object.assign(node.properties, {
          min: 0, max: 1, labels: "Off, On",
          fillColor: COLORS.toggle.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });
        const tw = node.widgets?.find(w => w.name === "toggle");
        if (tw) { tw.value = clamp(tw.value, 0, 1); }
        else { cxLog("warn", "cxToggle reset: 'toggle' widget not found"); }
        node.setDirtyCanvas(true, true);
      }
    });
    return items;
  }
});
