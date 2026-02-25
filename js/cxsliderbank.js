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
    // Stub — full rendering implemented in task 1.31
    const count = this._getProp("sliderCount", 3);
    const btnY = y + 2;
    this._drawButtons(ctx, width, btnY, count);
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
