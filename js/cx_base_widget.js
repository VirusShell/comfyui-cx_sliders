// cx_base_widget.js — Base custom widget class for cx_sliders package
// Framework contract: draw(), mouse(), computeSize(), serializeValue()
// Subclasses override _draw() and _mouse(), NOT the framework methods.

import { cxLog, getContrastColor, MARGIN, COLORS, clamp, getDecimalPlaces, formatValue, openColorPicker } from "./cx_utils.js";

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

export class CxNumericWidget extends CxBaseWidget {
  _isInteger = false;

  constructor(name, defaultValue, isInteger, options = {}) {
    super(name, defaultValue, options);
    this._isInteger = isInteger;
  }

  // Property accessors — all read from node.properties via _getProp
  get _min()         { return this._getProp("min", this._isInteger ? 0 : 0.0); }
  get _max()         { return this._getProp("max", this._isInteger ? 100 : 100.0); }
  get _step()        { return this._getProp("step", this._isInteger ? 1 : 0.5); }
  get _snap()        { return this._getProp("snap", true); }
  get _padding()     { return this._getProp("padding", this._isInteger ? "0" : "0.000"); }
  get _fillColor()   { return this._getProp("fillColor", COLORS.slider.fill); }
  get _borderColor() { return this._getProp("borderColor", COLORS.widget.border); }
  get _textColor()   { return this._getProp("textColor", "auto"); }

  // --- Numeric helpers ---

  _getDecimals() {
    return this._isInteger ? 0 : getDecimalPlaces(this._padding);
  }

  _formatValue(v) {
    return formatValue(v, this._getDecimals());
  }

  _roundValue(v) {
    if (this._isInteger) return Math.round(v);
    const d = this._getDecimals();
    const m = Math.pow(10, d);
    return Math.round(v * m) / m;
  }

  _applySnap(ratio, shiftKey) {
    let shouldSnap = this._snap;
    if (shiftKey) shouldSnap = !shouldSnap;
    if (shouldSnap && this._step > 0) {
      const range = this._max - this._min;
      if (range > 0) {
        const stepRatio = this._step / range;
        ratio = Math.round(ratio / stepRatio) * stepRatio;
      }
    }
    return ratio;
  }

  _valueFromRatio(ratio) {
    return this._roundValue(this._min + (this._max - this._min) * ratio);
  }

  _ratioFromValue(v) {
    const range = this._max - this._min;
    return range > 0 ? clamp((v - this._min) / range, 0, 1) : 0;
  }

  _promptEntry(canvas, event, title, currentFormatted) {
    canvas.prompt(title, currentFormatted, (v) => {
      const num = Number(v);
      if (!isNaN(num)) {
        this.value = this._roundValue(clamp(num, this._min, this._max));
        this._node?.setDirtyCanvas(true, true);
      }
    }, event);
  }

  _buildColorMenu(options, labelPrefix = "Slider") {
    options.push(null);
    options.push({
      content: `🎨 ${labelPrefix} Fill Color`,
      callback: () => {
        openColorPicker(this._fillColor, (c) => {
          this._node.properties.fillColor = c;
          this._node.setDirtyCanvas(true, true);
        });
      }
    });
    options.push({
      content: `🎨 ${labelPrefix} Border Color`,
      callback: () => {
        openColorPicker(this._borderColor, (c) => {
          this._node.properties.borderColor = c;
          this._node.setDirtyCanvas(true, true);
        });
      }
    });
    options.push({
      content: `🎨 ${labelPrefix} Text Color`,
      callback: () => {
        openColorPicker(this._resolveTextColor(), (c) => {
          this._node.properties.textColor = c;
          this._node.setDirtyCanvas(true, true);
        });
      }
    });
  }
}
