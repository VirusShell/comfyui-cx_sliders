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

  _doRecall(node) {
    if (this._lastSeed === null) return;
    const seedWidget = node.widgets?.find(w => w.name === "seed");
    if (seedWidget) seedWidget.value = this._lastSeed;
    const controlWidget = _findControlWidget(node);
    if (controlWidget) controlWidget.value = "fixed";
    node.setDirtyCanvas(true, true);
  }

  _doRandomize(node) {
    const seedWidget = node.widgets?.find(w => w.name === "seed");
    if (!seedWidget) return;
    this._lastSeed = seedWidget.value;
    const maxDigits = node.properties?.max_digits ?? 0;
    const min = node.properties?.min ?? 0;
    const max = _getEffectiveMax(node.properties?.max ?? 0xffffffffffffffff, maxDigits);
    seedWidget.value = _randomSeed(min, max);
    const controlWidget = _findControlWidget(node);
    if (controlWidget) controlWidget.value = "randomize";
    node.setDirtyCanvas(true, true);
  }
}

// Module-level helpers
function _findControlWidget(node) {
  const seedWidget = node.widgets?.find(w => w.name === "seed");
  if (seedWidget?.linkedWidgets?.[0]) return seedWidget.linkedWidgets[0];
  const controlValues = ["fixed", "increment", "decrement", "randomize"];
  return node.widgets?.find(w =>
    w.name === "control_after_generate" ||
    (w.type === "combo" && w.options?.values &&
     controlValues.every(v => w.options.values.includes(v)))
  ) || null;
}

function _randomSeed(min, max) {
  const range = BigInt(max) - BigInt(min) + 1n;
  const randomBig = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  return Number(BigInt(min) + (randomBig % range));
}

function _getEffectiveMax(max, maxDigits) {
  if (maxDigits > 0) return Math.min(max, Math.pow(10, maxDigits) - 1);
  return max;
}

// --- Registration ---
app.registerExtension({
  name: "cxSeed",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "cxSeed") return;

    const onNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      onNodeCreated?.apply(this, arguments);

      // DO NOT remove or replace the seed/control widgets.
      // Add UI-only button widget after them.
      const self = this;
      requestAnimationFrame(() => {
        try {
          const btnWidget = new CxSeedButtonWidget();
          self.addCustomWidget(btnWidget);
          self.setSize(self.computeSize());
          self.outputs?.forEach((o) => {
            o.label = o.name.toLowerCase();
          });
          self.setDirtyCanvas(true, true);
          cxLog("debug", "cxSeed button widget created");
        } catch (err) {
          cxLog("error", "cxSeed onNodeCreated:", err);
        }
      });
    };

    // onConfigure — migration from v1.x
    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function (info) {
      onConfigure?.apply(this, arguments);
      // v1.x migration: detect old seedProps in properties
      if (
        info.properties?.seedProps ||
        info.properties?.current !== undefined
      ) {
        const old = info.properties.seedProps || {};
        this.properties.min =
          old.min ?? info.properties.min ?? 0;
        this.properties.max =
          old.max ?? info.properties.max ?? 0xffffffffffffffff;
        this.properties.max_digits =
          old.max_digits ?? info.properties.max_digits ?? 0;
        // Clean up old keys
        delete this.properties.seedProps;
        delete this.properties.current;
        delete this.properties.ver;
        cxLog("debug", "cxSeed: migrated v1.x properties");
      }
      // Ensure output labels are lowercase
      this.outputs?.forEach((o) => {
        o.label = o.name.toLowerCase();
      });
    };

    // getExtraMenuOptions
    nodeType.prototype.getExtraMenuOptions = function (canvas, options) {
      const self = this;
      const btnWidget = this.widgets?.find(
        (w) => w.name === "cx_seed_buttons"
      );

      options.push(null); // separator
      options.push({
        content: "Randomize Seed Now",
        callback: () => {
          if (btnWidget) btnWidget._doRandomize(self);
        },
      });
      options.push({
        content: "Reset to Defaults",
        callback: () => {
          self.properties.min = 0;
          self.properties.max = 0xffffffffffffffff;
          self.properties.max_digits = 0;
          if (btnWidget) {
            btnWidget._lastSeed = null;
            btnWidget._doRandomize(self);
          }
          self.setDirtyCanvas(true, true);
        },
      });
    };

    // onPropertyChanged
    nodeType.prototype.onPropertyChanged = function (name, value) {
      if (name === "min" || name === "max" || name === "max_digits") {
        const seedWidget = this.widgets?.find((w) => w.name === "seed");
        if (seedWidget) {
          const min = this.properties.min ?? 0;
          const max = _getEffectiveMax(
            this.properties.max ?? 0xffffffffffffffff,
            this.properties.max_digits ?? 0
          );
          if (seedWidget.value < min) seedWidget.value = min;
          if (seedWidget.value > max) seedWidget.value = max;
        }
        this.setDirtyCanvas(true, true);
      }
    };
  },
});
