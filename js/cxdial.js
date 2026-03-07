// cxdial.js — CxDialWidget for cxDialInt and cxDialFloat nodes
// 270-degree arc dial with needle indicator and value text

import { app } from "../../scripts/app.js";
import { clamp, MARGIN, COLORS, cxLog } from "./cx_utils.js";
import { CxNumericWidget } from "./cx_base_widget.js";

class CxDialWidget extends CxNumericWidget {
  static MIN_HEIGHT = 70;
  static TEXT_SPACE = 20;  // Space below dial for value text
  static TOP_PAD = 4;
  static START_ANGLE = 0.75 * Math.PI;   // 135 degrees (bottom-left)
  static SWEEP = 1.5 * Math.PI;          // 270 degrees
  static END_ANGLE = CxDialWidget.START_ANGLE + CxDialWidget.SWEEP;

  constructor(name, defaultValue, isInteger) {
    super(name, defaultValue, isInteger);
  }

  computeSize(width) {
    const radius = this._calcRadius(width);
    const h = CxDialWidget.TOP_PAD + radius * 2 + CxDialWidget.TEXT_SPACE;
    return [width, Math.max(CxDialWidget.MIN_HEIGHT, h)];
  }

  _calcRadius(width) {
    const availW = width - MARGIN * 2;
    return Math.max(20, availW * 0.3);
  }

  _draw(ctx, node, width, y, height) {
    const geo = this._getGeometry(width, y, height);
    const ratio = this._ratioFromValue(this.value);

    // Layer 1: Background arc (dark)
    ctx.strokeStyle = COLORS.widget.background;
    ctx.lineWidth = geo.arcWidth;
    ctx.beginPath();
    ctx.arc(geo.cx, geo.cy, geo.radius, CxDialWidget.START_ANGLE, CxDialWidget.END_ANGLE);
    ctx.stroke();

    // Layer 2: Fill arc (colored)
    if (ratio > 0) {
      const fillAngle = CxDialWidget.START_ANGLE + CxDialWidget.SWEEP * ratio;
      ctx.strokeStyle = this._fillColor;
      ctx.lineWidth = geo.arcWidth;
      ctx.beginPath();
      ctx.arc(geo.cx, geo.cy, geo.radius, CxDialWidget.START_ANGLE, fillAngle);
      ctx.stroke();
    }

    // Layer 3: Needle indicator (skip at low quality)
    if (!this._isLowQuality()) {
      const needleAngle = CxDialWidget.START_ANGLE + CxDialWidget.SWEEP * ratio;
      const nx = geo.cx + geo.radius * Math.cos(needleAngle);
      const ny = geo.cy + geo.radius * Math.sin(needleAngle);
      ctx.strokeStyle = this._resolveTextColor();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(geo.cx, geo.cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Layer 4: Center dot
      ctx.fillStyle = this._borderColor;
      ctx.beginPath();
      ctx.arc(geo.cx, geo.cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Layer 5: Value text below dial
      ctx.fillStyle = this._resolveTextColor();
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(this._formatValue(this.value), geo.cx, geo.cy + geo.radius + 6);
    }

    // Update hit area -- circular with 30% expansion
    const hitRadius = geo.radius * 1.3;
    this._hitAreas.dial = {
      bounds: [geo.cx - hitRadius, y, hitRadius * 2, height],
      onDown: (event, pos, node) => {
        this._updateFromAngle(pos, geo, event);
        return true;
      },
      onMove: (event, pos, node) => {
        this._updateFromAngle(pos, geo, event);
      }
    };
  }

  _getGeometry(width, y, height) {
    const cx = width / 2;
    const radius = this._calcRadius(width);
    const cy = y + CxDialWidget.TOP_PAD + radius;
    const arcWidth = Math.max(4, radius * 0.2);
    return { cx, cy, radius, arcWidth };
  }

  _onDblClick(event, pos, node) {
    this._promptEntry(app.canvas, event, "Value", this._formatValue(this.value));
    return true;
  }

  _updateFromAngle(pos, geo, event) {
    const dx = pos[0] - geo.cx;
    const dy = pos[1] - geo.cy;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;

    // Dead zone: 90 degrees at bottom (centered on 270 deg = 1.5*PI)
    const deadStart = CxDialWidget.END_ANGLE % (Math.PI * 2);
    const deadEnd = CxDialWidget.START_ANGLE;
    // If in dead zone, snap to nearest endpoint
    if (angle > deadStart || angle < deadEnd) {
      const distToStart = Math.abs(angle - CxDialWidget.START_ANGLE);
      const distToEnd = Math.abs(angle - CxDialWidget.END_ANGLE);
      angle = distToStart < distToEnd ? CxDialWidget.START_ANGLE : CxDialWidget.END_ANGLE;
    }

    let ratio = (angle - CxDialWidget.START_ANGLE) / CxDialWidget.SWEEP;
    ratio = clamp(ratio, 0, 1);
    ratio = this._applySnap(ratio, event.shiftKey);

    this.value = this._valueFromRatio(ratio);
    this._node?.setDirtyCanvas(true, true);
  }
}

export { CxDialWidget };

// --- Migration ---

function migrateDialProps(node, info, isInteger) {
  const p = info.properties || {};
  const wasOldFormat = p.sliderProps !== undefined || p.current !== undefined;
  if (!wasOldFormat) return;
  cxLog("debug", "Migrating v1.x dial properties");
  const oldCurrent = p.current ?? (isInteger ? 1 : 1.0);
  const oldMin = p.min ?? (isInteger ? 0 : 0.0);
  const oldMax = p.max ?? (isInteger ? 100 : 100.0);
  node.properties.min = oldMin;
  node.properties.max = oldMax;
  node.properties.step = p.step ?? (isInteger ? 1 : 0.5);
  node.properties.snap = p.snap ?? true;
  node.properties.padding = p.padding ?? (isInteger ? "0" : "0.000");
  node.properties.fillColor = COLORS.dial.fill;
  node.properties.borderColor = COLORS.widget.border;
  node.properties.textColor = "auto";
  // Widget was renamed from "int"/"float" to "value" in v2.1.0
  const w = node.widgets?.find(w => w.name === "value");
  if (w) {
    w.value = clamp(oldCurrent, oldMin, oldMax);
  } else {
    cxLog("warn", "cxDial migration: 'value' widget not found");
  }
  delete node.properties.current;
  delete node.properties.sliderProps;
  delete node.properties.ver;
  delete node.properties.aux_id;
}

// --- Registration ---

const DIAL_NODES = { "cxDialInt": true, "cxDialFloat": false };

app.registerExtension({
  name: "cx.sliders.dial",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    const isInteger = DIAL_NODES[nodeData.name];
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
          fillColor: COLORS.dial.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });
        const widget = new CxDialWidget("value", defaultVal, isInteger);
        if (idx >= 0) {
          this.widgets.splice(idx, 0, widget);
        } else {
          this.addCustomWidget(widget);
        }
        this.setSize(this.computeSize());
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
        cxLog("debug", "cxDial value widget created");
      } catch (err) {
        cxLog("error", "cxDial onNodeCreated:", err);
      }
    };

    nodeType.prototype.onConfigure = function(info) {
      try {
        migrateDialProps(this, info, isInteger);
        const w = this.widgets?.find(w => w.name === "value");
        if (!w) { cxLog("warn", "cxDial onConfigure: 'value' widget not found"); return; }
        if (info.widgets_values) {
          const restored = Number(w.value);
          if (!isFinite(restored)) {
            cxLog("warn", `cxDial onConfigure: invalid value "${w.value}", defaulting`);
            w.value = isInteger ? 1 : 1.0;
          } else {
            w.value = clamp(restored, this.properties.min, this.properties.max);
          }
        }
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
      } catch (err) {
        cxLog("error", "cxDial onConfigure:", err);
      }
    };

    nodeType.prototype.onPropertyChanged = function(name, value) {
      const w = this.widgets?.find(w => w.name === "value");
      if (!w) { cxLog("warn", "cxDial onPropertyChanged: 'value' widget not found"); return; }
      if (name === "min" || name === "max") {
        w.value = clamp(w.value, this.properties.min, this.properties.max);
      }
      this.setDirtyCanvas(true, true);
    };

    nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
      const w = this.widgets?.find(w => w.name === "value");
      if (!w) { cxLog("warn", "cxDial getExtraMenuOptions: 'value' widget not found"); return; }
      w._buildColorMenu(options, "Dial");
      options.push({
        content: "↺ Reset to Defaults",
        callback: () => {
          Object.assign(this.properties, {
            min: isInteger ? 0 : 0.0,
            max: isInteger ? 100 : 100.0,
            step: isInteger ? 1 : 0.5,
            snap: true,
            padding: isInteger ? "0" : "0.000",
            fillColor: COLORS.dial.fill,
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
