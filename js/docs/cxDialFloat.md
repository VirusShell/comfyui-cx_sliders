# cxDial - Float

A circular 270-degree arc knob for controlling floating-point values with a rotary interface.

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | FLOAT | 1.0 | Float value controlled by the dial |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| FLOAT | FLOAT | The current dial value |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| min | float | 0.0 | Minimum dial value |
| max | float | 1.0 | Maximum dial value |
| step | float | 0.01 | Value increment per step |
| snap | bool | true | Snap to step increments |
| padding | string | "0.000" | Number format padding |
| fillColor | string | #d99a4a | Dial arc fill color |
| borderColor | string | (default) | Dial border color |
| textColor | string | "auto" | Value text color ("auto" adapts to fill brightness) |

## Interaction

- **Drag** — Rotate the knob to set value within min/max range
- **Shift+Drag** — Snap to step increments (when snap is off) or free drag (when snap is on)
- **Double-click** — Open text prompt to type an exact value
- **Ctrl+Drag** — Fine adjustment (smaller increments)

## Right-Click Menu

- **Fill Color** — Pick a custom fill color for the dial arc
- **Border Color** — Pick a custom border color
- **Text Color** — Pick a custom text color
- **Reset to Defaults** — Restore all properties and colors to defaults
