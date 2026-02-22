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
  _lastHeight = 20;       // NODE_WIDGET_HEIGHT default; updated from draw() via this._lastHeight = height

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

  // --- Hit area dispatch ---

  _dispatchMouse(event, pos, node) {
    const type = event.type;

    if (type === "pointerdown") {
      // Check hit areas
      for (const [name, area] of Object.entries(this._hitAreas)) {
        if (this._inBounds(pos, area.bounds)) {
          if (area.onDown?.(event, pos, node) !== false) {
            this._isDragging = true;
            this._activeDragArea = name;
            this._dragStartPos = [...pos];
            return true;
          }
        }
      }
      return this._mouse(event, pos, node);
    }

    if (type === "pointermove") {
      if (this._isDragging && this._activeDragArea) {
        const area = this._hitAreas[this._activeDragArea];
        area?.onMove?.(event, pos, node);
        return true;
      }
      return this._mouse(event, pos, node);
    }

    if (type === "pointerup") {
      if (this._isDragging && this._activeDragArea) {
        const area = this._hitAreas[this._activeDragArea];
        area?.onUp?.(event, pos, node);
        this._isDragging = false;
        this._activeDragArea = null;
        return true;
      }
      return this._mouse(event, pos, node);
    }

    return false;
  }

  _inBounds(pos, bounds) {
    if (!bounds) return false;
    if (bounds.length === 2) {
      // [x, width] -- Y bounds come from widget row (this.last_y + cached height)
      return pos[0] >= bounds[0] && pos[0] <= bounds[0] + bounds[1]
          && pos[1] >= this.last_y && pos[1] <= this.last_y + this._lastHeight;
    }
    // [x, y, width, height] -- fully specified
    return pos[0] >= bounds[0] && pos[0] <= bounds[0] + bounds[2]
        && pos[1] >= bounds[1] && pos[1] <= bounds[1] + bounds[3];
  }
}
