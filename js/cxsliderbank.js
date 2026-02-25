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

  // Stub — implemented in task 1.33
  _reconcileOutputs(node) {}
}
