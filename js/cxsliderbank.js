// cxsliderbank.js — CxSliderBankWidget: compound slider bank with add/remove buttons
// Tasks 1.30-1.36 build this file incrementally. This is task 1.30: class skeleton + buttons.

import { app } from "../../scripts/app.js";
import { COLORS, MARGIN, clamp, cxLog } from "./cx_utils.js";
import { CxNumericWidget } from "./cx_base_widget.js";

export class CxSliderBankWidget extends CxNumericWidget {
  static BTN_ROW_H = 24;
  static BTN_GAP = 6;
  static MINI_H = 20;
  static MINI_GAP = 2;
  static LABEL_W = 50;
  static SIDE_PAD = 6;

  constructor(name, isInteger) {
    const defaultObj = {};
    for (let i = 1; i <= 8; i++) defaultObj[`s${i}`] = 0;
    super(name, defaultObj, isInteger);
  }

  serializeValue(node, index) {
    return JSON.stringify(this.value);
  }

  deserializeValue(value) {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          this.value = parsed;
          return;
        }
      } catch { /* fall through */ }
    }
    // Fallback: keep current value (default zeros)
  }

  computeSize(width) {
    const count = this._getProp("sliderCount", 3);
    const h = CxSliderBankWidget.BTN_ROW_H + CxSliderBankWidget.BTN_GAP
            + count * CxSliderBankWidget.MINI_H
            + Math.max(0, count - 1) * CxSliderBankWidget.MINI_GAP
            + 6;
    return [width, h];
  }

  _draw(ctx, node, width, y, height) {
    const count = this._getProp("sliderCount", 3);
    const labels = this._getLabels();

    // --- Button row ---
    const btnY = y + 2;
    this._drawButtons(ctx, width, btnY, count);

    // --- Mini-sliders ---
    const miniStartY = btnY + CxSliderBankWidget.BTN_ROW_H + CxSliderBankWidget.BTN_GAP;
    for (let i = 0; i < count; i++) {
      const rowY = miniStartY + i * (CxSliderBankWidget.MINI_H + CxSliderBankWidget.MINI_GAP);
      this._drawMiniSlider(ctx, node, i, width, rowY, labels[i] || `Slider ${i+1}`);
    }
  }

  _drawMiniSlider(ctx, node, index, width, y, label) {
    const lw = CxSliderBankWidget.LABEL_W;
    const sp = CxSliderBankWidget.SIDE_PAD;
    const barX = sp + lw + 4;
    const barW = width - sp * 2 - lw - 4;
    const h = CxSliderBankWidget.MINI_H;

    const val = this.value[`s${index + 1}`] ?? 0;
    const ratio = this._ratioFromValue(val);

    // Label (truncated)
    if (!this._isLowQuality()) {
      ctx.fillStyle = COLORS.widget.textSecondary;
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      let truncLabel = label;
      const maxW = lw - 2;
      if (ctx.measureText(truncLabel).width > maxW) {
        while (truncLabel.length > 2 && ctx.measureText(truncLabel + "..").width > maxW) {
          truncLabel = truncLabel.slice(0, -1);
        }
        truncLabel += "..";
      }
      ctx.fillText(truncLabel, sp + lw, y + h/2);
    }

    // Bar
    this._drawBackground(ctx, barX, y, barW, h, COLORS.widget.background, 3);
    if (ratio > 0) {
      this._drawBackground(ctx, barX, y, barW * ratio, h, this._fillColor, 3);
    }
    this._drawBorder(ctx, barX, y, barW, h, this._borderColor, 3);

    // Value text
    if (!this._isLowQuality()) {
      ctx.fillStyle = this._resolveTextColor();
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(this._formatValue(val), barX + barW/2, y + h/2);
    }

    // Hit area per mini-slider row.
    // _activeDragArea in CxBaseWidget ensures only the initiating slider
    // receives onMove/onUp events -- no index guard needed.
    this._hitAreas[`row_${index}`] = {
      bounds: [barX, y, barW, h],
      onDown: (event, pos, node) => {
        this._updateMiniSlider(node, index, pos[0], barX, barW, event);
        return true;
      },
      onMove: (event, pos, node) => {
        this._updateMiniSlider(node, index, pos[0], barX, barW, event);
      },
      onUp: () => { /* drag complete, no cleanup needed */ }
    };
  }

  _updateMiniSlider(node, index, posX, barX, barW, event) {
    let ratio = clamp((posX - barX) / barW, 0, 1);
    ratio = this._applySnap(ratio, event.shiftKey);
    const value = this._roundValue(clamp(this._valueFromRatio(ratio), this._min, this._max));
    this.value[`s${index + 1}`] = value;
    node.setDirtyCanvas(true, true);
  }

  _onDblClick(event, pos, node) {
    const count = this._getProp("sliderCount", 3);
    for (let i = 0; i < count; i++) {
      const area = this._hitAreas[`row_${i}`];
      if (area && this._inBounds(pos, area.bounds)) {
        const labels = this._getLabels();
        const label = labels[i] || `Slider ${i + 1}`;
        const currentVal = this.value[`s${i + 1}`] ?? 0;
        try {
          app.canvas.prompt(label, String(currentVal), (v) => {
            const num = Number(v);
            if (!isNaN(num)) {
              this.value[`s${i + 1}`] = clamp(num, this._min, this._max);
              node.setDirtyCanvas(true, true);
            }
          }, event);
        } catch (err) {
          cxLog("warn", "cxSliderBank: canvas.prompt() unavailable:", err);
          return false;
        }
        return true;
      }
    }
    return false;
  }

  _getLabels() {
    const labelStr = this._getProp("labels",
      "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8");
    let labels = labelStr.split(",").map(s => s.trim());
    while (labels.length < 8) labels.push(`Slider ${labels.length + 1}`);
    return labels;
  }

  _drawButtons(ctx, width, y, count) {
    const btnW = 28, gap = 6;
    const totalW = btnW * 2 + gap;
    const startX = (width - totalW) / 2;

    // [+] button
    const canAdd = count < 8;
    this._drawBackground(ctx, startX, y, btnW, CxSliderBankWidget.BTN_ROW_H,
      canAdd ? COLORS.bank.addBtn : COLORS.widget.background, 3);
    this._drawBorder(ctx, startX, y, btnW, CxSliderBankWidget.BTN_ROW_H,
      canAdd ? COLORS.bank.addBtnBorder : COLORS.widget.borderDim, 3);
    if (!this._isLowQuality()) {
      ctx.fillStyle = canAdd ? "#fff" : "#666";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("+", startX + btnW / 2, y + CxSliderBankWidget.BTN_ROW_H / 2);
    }

    // [-] button
    const remX = startX + btnW + gap;
    const canRemove = count > 1;
    this._drawBackground(ctx, remX, y, btnW, CxSliderBankWidget.BTN_ROW_H,
      canRemove ? COLORS.bank.removeBtn : COLORS.widget.background, 3);
    this._drawBorder(ctx, remX, y, btnW, CxSliderBankWidget.BTN_ROW_H,
      canRemove ? COLORS.bank.removeBtnBorder : COLORS.widget.borderDim, 3);
    if (!this._isLowQuality()) {
      ctx.fillStyle = canRemove ? "#fff" : "#666";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("\u2212", remX + btnW / 2, y + CxSliderBankWidget.BTN_ROW_H / 2);
    }

    // Hit areas for buttons
    this._hitAreas.addBtn = {
      bounds: [startX, y, btnW, CxSliderBankWidget.BTN_ROW_H],
      onDown: (event, pos, node) => {
        if (count >= 8) return false;
        node.properties.sliderCount = count + 1;
        this._reconcileOutputs(node);
        node.setSize(node.computeSize());
        node.setDirtyCanvas(true, true);
        cxLog("debug", `cxSliderBank: added slider, count now ${count + 1}`);
        return true;
      }
    };
    this._hitAreas.removeBtn = {
      bounds: [remX, y, btnW, CxSliderBankWidget.BTN_ROW_H],
      onDown: (event, pos, node) => {
        if (count <= 1) return false;
        node.properties.sliderCount = count - 1;
        this._reconcileOutputs(node);
        node.setSize(node.computeSize());
        node.setDirtyCanvas(true, true);
        cxLog("debug", `cxSliderBank: removed slider, count now ${count - 1}`);
        return true;
      }
    };
  }

  _reconcileOutputs(node) {
    const target = node.properties.sliderCount;
    if (!node.outputs) return;
    const typeName = this._isInteger ? "INT" : "FLOAT";
    while (node.outputs.length > target) node.removeOutput(node.outputs.length - 1);
    while (node.outputs.length < target) {
      node.addOutput(`OUT_${node.outputs.length + 1}`, typeName);
      node.outputs[node.outputs.length - 1].label = node.outputs[node.outputs.length - 1].name.toLowerCase();
    }
  }
}

// --- Registration ---

const BANK_NODES = { "cxSliderBankInt": true, "cxSliderBankFloat": false };

app.registerExtension({
  name: "cx.sliders.sliderbank",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    const isInteger = BANK_NODES[nodeData.name];
    if (isInteger === undefined) return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function() {
      onNodeCreated?.apply(this, arguments);
      try {
        // Remove the framework-created "values" STRING widget, replace with custom bank widget
        const fwIdx = this.widgets?.findIndex(w => w.name === "values");
        if (fwIdx !== undefined && fwIdx >= 0) {
          this.widgets.splice(fwIdx, 1);
        }

        // Set default properties
        this.properties = this.properties || {};
        Object.assign(this.properties, {
          sliderCount: 3,
          min: isInteger ? 0 : 0.0,
          max: isInteger ? 100 : 100.0,
          step: isInteger ? 1 : 0.5,
          snap: true,
          padding: isInteger ? "0" : "0.000",
          labels: "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8",
          fillColor: COLORS.slider.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });

        // Add custom bank widget with name "values" to match backend input
        const bankWidget = new CxSliderBankWidget("values", isInteger);
        this.addCustomWidget(bankWidget);

        // Set initial outputs to match sliderCount
        bankWidget._reconcileOutputs(this);

        this.setSize(this.computeSize());
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
        cxLog("debug", `cxSliderBank ${isInteger ? "Int" : "Float"} widget created`);
      } catch (err) {
        cxLog("error", "cxSliderBank onNodeCreated:", err);
      }
    };

    // onConfigure -- v1.x migration, v2.x migration + reconcile
    nodeType.prototype.onConfigure = function(info) {
      try {
        const bankWidget = this.widgets?.find(w => w.name === "values");
        // v1.x migration: detect old format via properties.value_1
        if (info.properties?.value_1 !== undefined) {
          const count = info.properties.sliderCount ?? info.properties.slider_count ?? 3;
          this.properties.sliderCount = count;
          for (let i = 1; i <= 8; i++) {
            const oldVal = info.properties[`value_${i}`];
            if (oldVal !== undefined && bankWidget) {
              bankWidget.value[`s${i}`] = oldVal;
            }
            delete this.properties[`value_${i}`];
          }
          delete this.properties.slider_count;
          delete this.properties.ver;
          cxLog("debug", "cxSliderBank: migrated v1.x properties");
        }
        // v2.x migration: detect old 8-number widgets_values format
        const wv = info.widgets_values;
        if (wv && wv.length >= 2 && typeof wv[0] === 'number' && bankWidget) {
          const migrated = {};
          for (let i = 0; i < 8; i++) {
            migrated[`s${i + 1}`] = (i < wv.length) ? wv[i] : 0;
          }
          bankWidget.value = migrated;
          cxLog("debug", "cxSliderBank: migrated v2.x widgets_values");
        }
        // Reconcile outputs and labels
        if (bankWidget) bankWidget._reconcileOutputs(this);
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
      } catch (err) {
        cxLog("error", "cxSliderBank onConfigure:", err);
      }
    };

    // onPropertyChanged -- reconcile on sliderCount change, clamp on min/max change
    nodeType.prototype.onPropertyChanged = function(name, value) {
      if (name === "sliderCount") {
        const bankWidget = this.widgets?.find(w => w.name === "values");
        if (bankWidget) {
          bankWidget._reconcileOutputs(this);
          this.setSize(this.computeSize());
        }
      }
      if (name === "min" || name === "max") {
        const bankWidget = this.widgets?.find(w => w.name === "values");
        if (bankWidget) {
          for (let i = 1; i <= 8; i++) {
            const cur = bankWidget.value[`s${i}`];
            if (cur !== undefined) {
              bankWidget.value[`s${i}`] = clamp(cur, this.properties.min ?? 0, this.properties.max ?? 100);
            }
          }
        }
      }
      this.setDirtyCanvas(true, true);
    };
  },
  getNodeMenuItems(node) {
    const isInteger = BANK_NODES[node.comfyClass];
    if (isInteger === undefined) return;
    const bankWidget = node.widgets?.find(w => w.name === "values");
    if (!bankWidget) return;
    const items = [];
    bankWidget._buildColorMenuItems(items, "Slider Bank");
    items.push({
      content: "\u21ba Reset to Defaults",
      callback: () => {
        Object.assign(node.properties, {
          sliderCount: 3,
          min: isInteger ? 0 : 0.0,
          max: isInteger ? 100 : 100.0,
          step: isInteger ? 1 : 0.5,
          snap: true,
          padding: isInteger ? "0" : "0.000",
          labels: "Slider 1,Slider 2,Slider 3,Slider 4,Slider 5,Slider 6,Slider 7,Slider 8",
          fillColor: COLORS.slider.fill,
          borderColor: COLORS.widget.border,
          textColor: "auto",
        });
        for (let i = 1; i <= 8; i++) {
          bankWidget.value[`s${i}`] = isInteger ? 0 : 0.0;
        }
        bankWidget._reconcileOutputs(node);
        node.setSize(node.computeSize());
        node.setDirtyCanvas(true, true);
      }
    });
    return items;
  }
});
