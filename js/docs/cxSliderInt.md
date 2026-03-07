# cxSlider - Int

A horizontal slider widget for controlling integer values with visual feedback.

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | INT | 1 | Integer value controlled by the slider |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| INT | INT | The current slider value |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| min | int | 0 | Minimum slider value |
| max | int | 100 | Maximum slider value |
| step | int | 1 | Value increment per step |
| snap | bool | true | Snap to step increments |
| padding | string | "0" | Number format padding (e.g., "000" for zero-padded) |
| fillColor | string | #4a90d9 | Slider fill bar color |
| borderColor | string | (default) | Slider border color |
| textColor | string | "auto" | Value text color ("auto" adapts to fill brightness) |

## Interaction

- **Drag** — Slide to set value within min/max range
- **Shift+Drag** — Snap to step increments (when snap is off) or free drag (when snap is on)
- **Double-click** — Open text prompt to type an exact value
- **Ctrl+Drag** — Fine adjustment (smaller increments)

## Right-Click Menu

- **Fill Color** — Pick a custom fill color for the slider bar
- **Border Color** — Pick a custom border color
- **Text Color** — Pick a custom text color
- **Reset to Defaults** — Restore all properties and colors to defaults
