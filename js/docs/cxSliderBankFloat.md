# cxSliderBank - Float

A bank of 1-8 floating-point sliders in a single compact node, with add/remove buttons to control the number of active sliders.

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| values | STRING | `{"s1":0.0,"s2":0.0,...,"s8":0.0}` | JSON object containing slider values (keys: s1-s8) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| out_1 through out_8 | FLOAT | Individual float outputs for each active slider |

Note: The backend always returns 8 outputs. Only the first N outputs (matching `sliderCount`) are shown in the UI.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| sliderCount | int | 3 | Number of visible sliders (1-8) |
| min | float | 0.0 | Minimum value for all sliders |
| max | float | 100.0 | Maximum value for all sliders |
| step | float | 0.5 | Value increment per step |
| snap | bool | true | Snap to step increments |
| padding | string | "0.000" | Number format padding |
| labels | string | "Slider 1,...,Slider 8" | Comma-separated labels for each slider row |
| fillColor | string | #d99a4a | Slider fill bar color |
| borderColor | string | (default) | Slider border color |
| textColor | string | "auto" | Value text color ("auto" adapts to fill brightness) |

## Interaction

- **[+] button** — Add a slider row (up to 8)
- **[-] button** — Remove the last slider row (minimum 1)
- **Drag row** — Slide individual row to set its value
- **Shift+Drag** — Snap toggle (inverts the snap property for that drag)
- **Double-click row** — Open text prompt to type an exact value for that slider

## Right-Click Menu

- **Fill Color** — Pick a custom fill color for all slider bars
- **Border Color** — Pick a custom border color
- **Text Color** — Pick a custom text color
- **Reset to Defaults** — Restore all properties, colors, and values to defaults
