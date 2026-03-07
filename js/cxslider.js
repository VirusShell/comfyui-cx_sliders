// cxslider.js — CxSliderWidget for cxSliderInt and cxSliderFloat nodes
// Horizontal bar slider with drag interaction, Ctrl/Shift modifiers, and v1.x migration

import { app } from "../../scripts/app.js";
import { clamp, MARGIN, COLORS, cxLog } from "./cx_utils.js";
import { CxNumericWidget } from "./cx_base_widget.js";

class CxSliderWidget extends CxNumericWidget {
  static HEIGHT = 28;

  constructor(name, defaultValue, isInteger) {
    super(name, defaultValue, isInteger);
    this._unlock = false;
  }

  computeSize(width) {
    return [width, CxSliderWidget.HEIGHT];
  }

  _draw(ctx, node, width, y, height) {
    const m = MARGIN;
    const barW = width - m * 2;
    const barH = height;
    const ratio = this._ratioFromValue(this.value);

    this._drawBackground(ctx, m, y, barW, barH, COLORS.widget.background);
    const fillW = barW * ratio;
    if (fillW > 0) {
      this._drawBackground(ctx, m, y, fillW, barH, this._fillColor);
    }
    this._drawBorder(ctx, m, y, barW, barH, this._borderColor);

    if (!this._isLowQuality()) {
      ctx.fillStyle = this._resolveTextColor();
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this._formatValue(this.value), width / 2, y + barH / 2);
    }

    this._hitAreas.slider = {
      bounds: [m, barW],
      onDown: (event, pos, node) => {
        this._unlock = false;
        this._updateFromPos(pos[0], width, event);
        return true;
      },
      onMove: (event, pos, node) => {
        this._updateFromPos(pos[0], width, event);
      },
      onUp: () => { this._unlock = false; }
    };
  }

  _onDblClick(event, pos, node) {
    this._promptEntry(app.canvas, event, "Value", this._formatValue(this.value));
    return true;
  }

  _updateFromPos(posX, width, event) {
    const m = MARGIN;
    const barW = width - m * 2;
    let ratio = (posX - m) / barW;
    if (event.ctrlKey) this._unlock = true;
    ratio = this._applySnap(ratio, event.shiftKey);
    if (!this._unlock) ratio = clamp(ratio, 0, 1);
    this.value = this._valueFromRatio(ratio);
    this._node?.setDirtyCanvas(true, true);
  }
}

// --- Migration ---

function migrateSliderProps(node, info, isInteger) {
  const p = info.properties || {};
  const wasOldFormat = p.sliderProps !== undefined || p.current !== undefined;
  if (!wasOldFormat) return;
  cxLog("debug", "Migrating v1.x slider properties");
  const oldCurrent = p.current ?? (isInteger ? 1 : 1.0);
  const oldMin = p.min ?? (isInteger ? 0 : 0.0);
  const oldMax = p.max ?? (isInteger ? 100 : 100.0);
  node.properties.min = oldMin;
  node.properties.max = oldMax;
  node.properties.step = p.step ?? (isInteger ? 1 : 0.5);
  node.properties.snap = p.snap ?? true;
  node.properties.padding = p.padding ?? (isInteger ? "0" : "0.000");
  node.properties.fillColor = COLORS.slider.fill;
  node.properties.borderColor = COLORS.widget.border;
  node.properties.textColor = "auto";
  // Widget was renamed from "int"/"float" to "value" in v2.1.0
  const w = node.widgets?.find(w => w.name === "value");
  if (w) {
    w.value = clamp(oldCurrent, oldMin, oldMax);
  } else {
    cxLog("warn", "cxSlider migration: 'value' widget not found");
  }
  delete node.properties.current;
  delete node.properties.sliderProps;
  delete node.properties.ver;
  delete node.properties.aux_id;
}

// --- Registration ---

const SLIDER_NODES = { "cxSliderInt": true, "cxSliderFloat": false };

app.registerExtension({
  name: "cx.sliders.slider",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    const isInteger = SLIDER_NODES[nodeData.name];
    if (isInteger === undefined) return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function() {
      onNodeCreated?.apply(this, arguments);
      try {
        const idx = this.widgets?.findIndex(w => w.name === "value") ?? -1;
        if (idx >= 0) this.widgets.splice(idx, 1);
        this.properties = this.properties || {};
        const defaultVal = isInteger ? 1 : 1.0;
        Object.assign(this.properties, {
          min: isInteger ? 0 : 0.0,
          max: isInteger ? 100 : 100.0,
          step: isInteger ? 1 : 0.5,
          snap: true,
          padding: isInteger ? "0" : "0.000",
          fillColor: COLORS.slider.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });
        const widget = new CxSliderWidget("value", defaultVal, isInteger);
        if (idx >= 0) {
          this.widgets.splice(idx, 0, widget);
        } else {
          this.addCustomWidget(widget);
        }
        this.setSize(this.computeSize());
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
        cxLog("debug", `cxSlider value widget created`);
      } catch (err) {
        cxLog("error", "cxSlider onNodeCreated:", err);
      }
    };

    nodeType.prototype.onConfigure = function(info) {
      try {
        migrateSliderProps(this, info, isInteger);
        const w = this.widgets?.find(w => w.name === "value");
        if (!w) { cxLog("warn", "cxSlider onConfigure: 'value' widget not found"); return; }
        if (info.widgets_values) {
          const restored = Number(w.value);
          if (!isFinite(restored)) {
            cxLog("warn", `cxSlider onConfigure: invalid value "${w.value}", defaulting`);
            w.value = isInteger ? 1 : 1.0;
          } else {
            w.value = clamp(restored, this.properties.min, this.properties.max);
          }
        }
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
      } catch (err) {
        cxLog("error", "cxSlider onConfigure:", err);
      }
    };

    nodeType.prototype.onPropertyChanged = function(name, value) {
      const w = this.widgets?.find(w => w.name === "value");
      if (!w) { cxLog("warn", "cxSlider onPropertyChanged: 'value' widget not found"); return; }
      if (name === "min" || name === "max" || name === "step") {
        const num = Number(value);
        if (!isFinite(num)) {
          cxLog("warn", `cxSlider onPropertyChanged: invalid ${name} "${value}", reverting`);
          const defaults = { min: isInteger ? 0 : 0.0, max: isInteger ? 100 : 100.0, step: isInteger ? 1 : 0.5 };
          this.properties[name] = defaults[name];
        } else if (isInteger && (name === "min" || name === "max")) {
          this.properties[name] = Math.round(num);
        }
      }
      if (name === "padding" && typeof value !== "string") {
        cxLog("warn", `cxSlider onPropertyChanged: padding must be string, got ${typeof value}`);
        this.properties.padding = String(value ?? (isInteger ? "0" : "0.000"));
      }
      const cVal = Number(w.value);
      w.value = isFinite(cVal) ? clamp(cVal, this.properties.min, this.properties.max) : (isInteger ? 1 : 1.0);
      this.setDirtyCanvas(true, true);
    };

    nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
      const w = this.widgets?.find(w => w.name === "value");
      if (!w) { cxLog("warn", "cxSlider getExtraMenuOptions: 'value' widget not found"); return; }
      w._buildColorMenu(options, "Slider");
      options.push({
        content: "↺ Reset to Defaults",
        callback: () => {
          Object.assign(this.properties, {
            min: isInteger ? 0 : 0.0,
            max: isInteger ? 100 : 100.0,
            step: isInteger ? 1 : 0.5,
            snap: true,
            padding: isInteger ? "0" : "0.000",
            fillColor: COLORS.slider.fill,
            borderColor: COLORS.widget.border,
            textColor: "auto",
          });
          w.value = isInteger ? 1 : 1.0;
          this.setDirtyCanvas(true, true);
        }
      });
    };
  }
});
