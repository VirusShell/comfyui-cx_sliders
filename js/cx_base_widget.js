// cx_base_widget.js — Base custom widget class for cx_sliders package
// Framework contract: draw(), mouse(), computeSize(), serializeValue()
// Subclasses override _draw() and _mouse(), NOT the framework methods.

import { cxLog, getContrastColor, MARGIN, COLORS } from "./cx_utils.js";

export class CxBaseWidget {
  // --- Framework contract ---
  type = "custom";
  name;
  value;
  options = {};
  y = 0;
  last_y = 0;

  // --- Internal state ---
  _node = null;           // Back-reference to owning node
  _hitAreas = {};         // { name: { bounds: [x,w] or [x,y,w,h], onDown, onUp, onMove, onClick } }
  _isDragging = false;
  _dragStartPos = null;
  _activeDragArea = null; // Name of hit area that initiated current drag
  _lastHeight = 20;       // Cached from last draw() call (LiteGraph.NODE_WIDGET_HEIGHT default)

  constructor(name, defaultValue, options = {}) {
    this.name = name;
    this.value = defaultValue;
    this.options = options;
  }

  // --- Framework methods ---

  draw(ctx, node, width, y, height) {
    this._node = node;
    this._lastHeight = height;
    try {
      this._draw(ctx, node, width, y, height);
    } catch (err) {
      cxLog("error", `${this.name} draw error:`, err);
      // Fallback: dark red box so widget still occupies space
      ctx.fillStyle = "#3a2020";
      ctx.beginPath();
      ctx.roundRect(MARGIN, y, width - MARGIN * 2, height, 4);
      ctx.fill();
    }
  }

  mouse(event, pos, node) {
    this._node = node;
    try {
      return this._dispatchMouse(event, pos, node);
    } catch (err) {
      cxLog("error", `${this.name} mouse error:`, err);
      return false;
    }
  }

  computeSize(width) {
    return [width, 20];
  }

  serializeValue(node, index) {
    return this.value;
  }

  // --- Subclass hooks (override these, not the framework methods) ---
  _draw(ctx, node, width, y, height) {}
  _mouse(event, pos, node) { return false; }

  // --- Property accessors ---

  _getProp(key, fallback) {
    return this._node?.properties?.[key] ?? fallback;
  }

  _resolveTextColor(fillColorOverride) {
    const tc = this._getProp("textColor", "auto");
    const fill = fillColorOverride || this._getProp("fillColor", COLORS.slider.fill);
    return (tc === "auto") ? getContrastColor(fill) : tc;
  }

  // --- Helpers ---

  _isLowQuality() {
    try {
      const scale = app?.canvas?.ds?.scale || 1;
      return scale <= 0.5;
    } catch { return false; }
  }

  _drawBackground(ctx, x, y, w, h, fillColor, radius = 4) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  _drawBorder(ctx, x, y, w, h, strokeColor, radius = 4) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.stroke();
  }

  // --- Hit area dispatch (stub for task 1.4) ---
  // _dispatchMouse, _inBounds will be fully implemented in task 1.4
  // For now, _dispatchMouse just calls _mouse:
  _dispatchMouse(event, pos, node) {
    return this._mouse(event, pos, node);
  }

  _inBounds(pos, bounds) {
    return false;
  }
}
