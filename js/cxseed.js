// cxseed.js — CxSeedButtonWidget for cxSeed node
// Two centered buttons: Recall (recycle emoji) and Randomize (dice emoji)

import { app } from "../../scripts/app.js";
import { COLORS, MARGIN, cxLog } from "./cx_utils.js";
import { CxBaseWidget } from "./cx_base_widget.js";

export class CxSeedButtonWidget extends CxBaseWidget {
  static HEIGHT = 26;
  static BTN_SIZE = 22;
  static BTN_GAP = 8;

  _lastSeed = null;
  _hoveredButton = null;

  constructor() {
    super("cx_seed_buttons", 0, { serialize: false });
  }

  computeSize(width) {
    return [width, CxSeedButtonWidget.HEIGHT];
  }

  _draw(ctx, node, width, y, height) {
    const btnSize = CxSeedButtonWidget.BTN_SIZE;
    const gap = CxSeedButtonWidget.BTN_GAP;
    const totalW = btnSize * 2 + gap;
    const startX = (width - totalW) / 2;
    const btnY = y + (height - btnSize) / 2;
    const hasLast = this._lastSeed !== null;

    // Recall button
    const recallHover = this._hoveredButton === "recall";
    this._drawBackground(ctx, startX, btnY, btnSize, btnSize,
      recallHover ? COLORS.seed.recallHover : hasLast ? COLORS.seed.recall : COLORS.widget.background, 4);
    this._drawBorder(ctx, startX, btnY, btnSize, btnSize,
      recallHover ? COLORS.seed.recallBorderHover : hasLast ? COLORS.seed.recallBorder : COLORS.widget.borderDim, 4);

    if (!this._isLowQuality()) {
      ctx.fillStyle = hasLast ? "#fff" : "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u267b\ufe0f", startX + btnSize / 2, btnY + btnSize / 2);
    }

    // Randomize button
    const randX = startX + btnSize + gap;
    const randHover = this._hoveredButton === "randomize";
    this._drawBackground(ctx, randX, btnY, btnSize, btnSize,
      randHover ? COLORS.seed.randomizeHover : COLORS.seed.randomize, 4);
    this._drawBorder(ctx, randX, btnY, btnSize, btnSize,
      randHover ? COLORS.seed.randomizeBorderHover : COLORS.seed.randomizeBorder, 4);

    if (!this._isLowQuality()) {
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\ud83c\udfb2", randX + btnSize / 2, btnY + btnSize / 2);
    }

    // Tooltip
    if (!this._isLowQuality() && this._hoveredButton) {
      this._drawTooltip(ctx, this._hoveredButton === "recall"
        ? { x: startX, text: "Recall" }
        : { x: randX, text: "Randomize" },
        btnSize, btnY);
    }

    // Hit areas (registered every draw for responsive positioning)
    this._hitAreas.recall = {
      bounds: [startX, btnY, btnSize, btnSize],
      onDown: (event, pos, node) => { this._doRecall(node); return true; },
    };
    this._hitAreas.randomize = {
      bounds: [randX, btnY, btnSize, btnSize],
      onDown: (event, pos, node) => { this._doRandomize(node); return true; },
    };
  }

  _mouse(event, pos, node) {
    if (event.type === "pointermove") {
      let hovered = null;
      if (this._hitAreas.recall && this._inBounds(pos, this._hitAreas.recall.bounds)) hovered = "recall";
      else if (this._hitAreas.randomize && this._inBounds(pos, this._hitAreas.randomize.bounds)) hovered = "randomize";
      if (hovered !== this._hoveredButton) {
        this._hoveredButton = hovered;
        node.setDirtyCanvas(true, false);
      }
      return false;
    }
    return false;
  }

  _drawTooltip(ctx, config, btnSize, btnY) {
    ctx.font = "11px Arial";
    const tw = ctx.measureText(config.text).width;
    const px = 4, py = 2;
    const tx = config.x + btnSize / 2 - tw / 2 - px;
    const ty = btnY - 18;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw + px * 2, 16, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.text, config.x + btnSize / 2, ty + 8);
  }

  // Stub methods — implemented in task 1.27
  _doRecall(node) {}
  _doRandomize(node) {}
}
