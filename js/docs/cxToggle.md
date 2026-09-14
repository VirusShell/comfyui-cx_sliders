# cxToggle

A discrete state button that cycles through configurable states with custom labels.

## Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| toggle | INT | 0 | Current toggle state (0-based index) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| INT | INT | The current toggle state value |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| min | int | 0 | Minimum state value |
| max | int | 1 | Maximum state value (number of states minus 1) |
| labels | string | "OFF,ON" | Comma-separated labels for each state |
| fillColor | string | #5aaa5a | Button fill color |
| borderColor | string | (default) | Button border color |
| textColor | string | "auto" | Label text color ("auto" adapts to fill brightness) |

## Interaction

- **Click** — Cycle to the next state (wraps from max back to min)
- **Double-click** — Open text prompt to type an exact state value

## Right-Click Menu

- **Fill Color** — Pick a custom fill color
- **Border Color** — Pick a custom border color
- **Text Color** — Pick a custom text color
- **Reset to Defaults** — Restore all properties and colors to defaults
