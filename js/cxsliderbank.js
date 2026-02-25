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
    super(name, 0, isInteger, { serialize: false });
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

    // Get value from hidden widget
    const hiddenWidget = node.widgets?.find(w => w.name === `slider_${index + 1}`);
    const val = hiddenWidget?.value ?? 0;
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
    this._hitAreas[`slider_${index}`] = {
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
    const hiddenWidget = node.widgets?.find(w => w.name === `slider_${index + 1}`);
    if (!hiddenWidget) { cxLog("warn", `cxSliderBank: slider_${index + 1} widget not found`); return; }
    hiddenWidget.value = value;
    node.setDirtyCanvas(true, true);
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
  name: "cxSliderBank",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    const isInteger = BANK_NODES[nodeData.name];
    if (isInteger === undefined) return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function() {
      onNodeCreated?.apply(this, arguments);
      try {
        // Hide all 8 slider_N widgets (keep them for serialization)
        for (let i = 1; i <= 8; i++) {
          const w = this.widgets?.find(w => w.name === `slider_${i}`);
          if (w) {
            w.hidden = true;
            w.computeSize = () => [0, -4];
          }
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

        // Add UI widget
        const bankWidget = new CxSliderBankWidget("cx_bank_ui", isInteger);
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

    // onDblClick -- detect which mini-slider row was clicked, prompt for value
    nodeType.prototype.onDblClick = function(e, pos, canvas) {
      const bankWidget = this.widgets?.find(w => w.name === "cx_bank_ui");
      if (!bankWidget) return false;
      const count = this.properties.sliderCount ?? 3;
      const miniStartY = bankWidget.last_y + 2 + CxSliderBankWidget.BTN_ROW_H + CxSliderBankWidget.BTN_GAP;
      const rowH = CxSliderBankWidget.MINI_H + CxSliderBankWidget.MINI_GAP;
      const clickedRow = Math.floor((pos[1] - miniStartY) / rowH);
      if (clickedRow < 0 || clickedRow >= count) return false;
      const labels = bankWidget._getLabels();
      const label = labels[clickedRow] || `Slider ${clickedRow + 1}`;
      const hiddenWidget = this.widgets?.find(w => w.name === `slider_${clickedRow + 1}`);
      if (!hiddenWidget) return false;
      const node = this;
      try {
        canvas.prompt(label, String(hiddenWidget.value), (v) => {
          const num = Number(v);
          if (!isNaN(num)) {
            hiddenWidget.value = clamp(num, node.properties.min ?? 0, node.properties.max ?? 100);
            node.setDirtyCanvas(true, true);
          }
        }, e);
      } catch (err) {
        cxLog("warn", "cxSliderBank: canvas.prompt() unavailable:", err);
        return false;
      }
      return true;
    };

    // getExtraMenuOptions -- color pickers + reset
    nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
      const bankWidget = this.widgets?.find(w => w.name === "cx_bank_ui");
      if (bankWidget) {
        bankWidget._buildColorMenu(options, "Slider Bank");
        options.push({
          content: "\u21ba Reset to Defaults",
          callback: () => {
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
            for (let i = 1; i <= 8; i++) {
              const hw = this.widgets?.find(w => w.name === `slider_${i}`);
              if (hw) hw.value = isInteger ? 0 : 0.0;
            }
            bankWidget._reconcileOutputs(this);
            this.setSize(this.computeSize());
            this.setDirtyCanvas(true, true);
          }
        });
      }
    };

    // onConfigure -- v1.x migration + reconcile
    nodeType.prototype.onConfigure = function(info) {
      try {
        // v1.x migration: detect old format via properties.value_1
        if (info.properties?.value_1 !== undefined) {
          const count = info.properties.sliderCount ?? info.properties.slider_count ?? 3;
          this.properties.sliderCount = count;
          for (let i = 1; i <= 8; i++) {
            const oldVal = info.properties[`value_${i}`];
            if (oldVal !== undefined) {
              const hw = this.widgets?.find(w => w.name === `slider_${i}`);
              if (hw) hw.value = oldVal;
            }
            delete this.properties[`value_${i}`];
          }
          delete this.properties.slider_count;
          delete this.properties.ver;
          cxLog("debug", "cxSliderBank: migrated v1.x properties");
        }
        // Reconcile outputs and labels
        const bankWidget = this.widgets?.find(w => w.name === "cx_bank_ui");
        if (bankWidget) bankWidget._reconcileOutputs(this);
        this.outputs?.forEach(o => { o.label = o.name.toLowerCase(); });
      } catch (err) {
        cxLog("error", "cxSliderBank onConfigure:", err);
      }
    };

    // onPropertyChanged -- reconcile on sliderCount change, clamp on min/max change
    nodeType.prototype.onPropertyChanged = function(name, value) {
      if (name === "sliderCount") {
        const bankWidget = this.widgets?.find(w => w.name === "cx_bank_ui");
        if (bankWidget) {
          bankWidget._reconcileOutputs(this);
          this.setSize(this.computeSize());
        }
      }
      if (name === "min" || name === "max") {
        for (let i = 1; i <= 8; i++) {
          const hw = this.widgets?.find(w => w.name === `slider_${i}`);
          if (hw) hw.value = clamp(hw.value, this.properties.min ?? 0, this.properties.max ?? 100);
        }
      }
      this.setDirtyCanvas(true, true);
    };
  }
});
