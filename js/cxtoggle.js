// cxtoggle.js — cxToggle custom widget using CxBaseWidget
// Button-style toggle with configurable states and custom labels

import { app } from "../../scripts/app.js";
import { clamp, MARGIN, COLORS } from "./cx_utils.js";
import { CxBaseWidget } from "./cx_base_widget.js";

export class CxToggleWidget extends CxBaseWidget {
  static HEIGHT = 28;

  constructor(name, defaultValue) {
    super(name, defaultValue);
  }

  computeSize(width) {
    return [width, CxToggleWidget.HEIGHT];
  }

  _draw(ctx, node, width, y, height) {
    const m = MARGIN;
    const barW = width - m * 2;
    const min = this._getProp("min", 0);
    const max = this._getProp("max", 1);
    const isActive = this.value > min;
    const fillColor = this._getProp("fillColor", COLORS.toggle.fill);
    const borderColor = this._getProp("borderColor", COLORS.widget.border);

    // Button background
    this._drawBackground(ctx, m, y, barW, height, isActive ? fillColor : COLORS.widget.background);
    this._drawBorder(ctx, m, y, barW, height, borderColor);

    // Label text
    if (!this._isLowQuality()) {
      const textColor = this._resolveTextColor(fillColor);
      ctx.fillStyle = textColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this._getCurrentLabel(), width / 2, y + height / 2);
    }

    // Hit area: full widget
    this._hitAreas.button = {
      bounds: [m, barW],
      onDown: (event, pos, node) => {
        let next = this.value + 1;
        if (next > max) next = min;
        this.value = next;
        node.setDirtyCanvas(true, true);
        return true;
      }
    };
  }

  _getLabels() {
    const min = this._getProp("min", 0);
    const max = this._getProp("max", 1);
    const labelStr = this._getProp("labels", "Off,On");
    const stateCount = max - min + 1;
    let labels = labelStr.split(",").map(s => s.trim());
    while (labels.length < stateCount) labels.push(String(min + labels.length));
    if (labels.length > stateCount) labels.length = stateCount;
    return labels;
  }

  _getCurrentLabel() {
    const labels = this._getLabels();
    const min = this._getProp("min", 0);
    const idx = clamp(this.value - min, 0, labels.length - 1);
    return labels[idx] || String(this.value);
  }
}

app.registerExtension({
  name: "cx.toggle",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "cxToggle") return;

    // Task 1.7 will add onNodeCreated with splice-then-insert
    // Task 1.8 will add onDblClick, getExtraMenuOptions, onPropertyChanged
    // Task 1.9 will add onConfigure with migration
  }
});
