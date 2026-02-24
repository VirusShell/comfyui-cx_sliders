// cxdial.js — CxDialWidget for cxDialInt and cxDialFloat nodes
// 270-degree arc dial with needle indicator and value text

import { clamp, MARGIN, COLORS } from "./cx_utils.js";
import { CxNumericWidget } from "./cx_base_widget.js";

class CxDialWidget extends CxNumericWidget {
  static MIN_HEIGHT = 70;
  static START_ANGLE = 0.75 * Math.PI;   // 135 degrees (bottom-left)
  static SWEEP = 1.5 * Math.PI;          // 270 degrees
  static END_ANGLE = CxDialWidget.START_ANGLE + CxDialWidget.SWEEP;

  computeSize(width) {
    return [width, CxDialWidget.MIN_HEIGHT];
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
    const maxR = Math.min(width / 2 - MARGIN, (height - 20) / 2);
    const radius = Math.max(12, maxR - 4);
    const cy = y + radius + 4;
    const arcWidth = Math.max(4, radius * 0.2);
    return { cx, cy, radius, arcWidth };
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
