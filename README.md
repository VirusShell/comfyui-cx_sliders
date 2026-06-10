# ComfyUI cxSliders

**Version 3.0.0**

Custom slider, toggle, seed, and slider bank nodes for ComfyUI with visual controls. (Dial nodes are temporarily disabled — see below.)

Based on the slider design from [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov.

## Features

- **V3 Schema Support**: Automatically uses V3 schema when available, with V1 fallback for compatibility
- **Custom Widget Architecture**: All nodes use proper custom widgets with `draw()`/`mouse()`/`computeSize()` — framework-managed layout, no manual Y calculations
- **Visual Controls**: Interactive sliders, toggles, and seed buttons
- **Double-click Editing**: Built-in value editing dialog on all numeric nodes
- **Properties Panel Integration**: Edit all parameters through ComfyUI's Properties Panel
- **Customizable Colors**: Right-click color pickers for fill, border, and text colors
- **Low-quality Rendering**: Skips fine detail when zoomed out for performance
- **v1.x Migration**: Automatically migrates old-format workflows

## Installation

1. Navigate to your ComfyUI custom nodes directory:
   ```
   cd ComfyUI/custom_nodes/
   ```

2. Clone or copy this repository:
   ```
   git clone https://github.com/VirusShell/comfyui-cx_sliders.git comfyui_cxslider
   ```

   Or install via [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager) once listed (search **cx Sliders**).

3. Restart ComfyUI

## Nodes

### cxSlider - Int / Float

Slider nodes for controlling integer or floating-point values.

**Properties (via Properties Panel):**
- `min` - Minimum allowed value
- `max` - Maximum allowed value
- `step` - Step increment when snap is enabled
- `snap` - Enable/disable step snapping (default: true)
- `padding` - Decimal places format (Float only, default: "0.000")
- `fillColor` / `borderColor` / `textColor` - Visual customization

**Output:**
- `INT` or `FLOAT`

### cxDial - Int / Float *(temporarily disabled)*

> **Note:** The dial nodes are currently disabled and will not appear in ComfyUI. The code is retained; their future (improve interaction or remove) is undecided. Re-enable by uncommenting the dial entries in `__init__.py`.

Rotary dial nodes for controlling integer or floating-point values.

**Properties (via Properties Panel):**
- `min` - Minimum allowed value
- `max` - Maximum allowed value
- `step` - Step increment when snap is enabled
- `snap` - Enable/disable step snapping (default: true)
- `padding` - Decimal places format (Float only)
- `fillColor` / `borderColor` / `textColor` - Visual customization

**Output:**
- `INT` or `FLOAT`

### cxToggle

Binary toggle node (0/1).

**Properties (via Properties Panel):**
- `min` / `max` - Value bounds (default: 0/1)
- `fillColor` / `borderColor` / `textColor` - Visual customization

**Output:**
- `INT`

### cxSeed

Seed generation node with configurable after-generation behavior.

**Widgets:**
- `seed` - Current seed value
- `control_after_generate` - ComfyUI's built-in control (randomize, increment, decrement, fixed)

**Properties (via Properties Panel):**
- `min` - Minimum allowed seed value (default: 0)
- `max` - Maximum allowed seed value (default: 18446744073709551615)
- `max_digits` - Maximum number of digits for seed (0 = no limit, 1-19)

**Buttons:**
- Recall - Copy the last used seed and set mode to "fixed"
- Random - Generate a new random seed and set mode to "randomize"

**Output:**
- `SEED` - Integer type

### cxSliderBank - Int / Float

Multi-slider bank with configurable number of visible rows (1-8).

**Input (backend):**
- `values` - JSON string `{"s1":…,"s2":…,…,"s8":…}` (serialized automatically from the custom UI)

**Properties (via Properties Panel):**
- `sliderCount` - Number of visible slider rows and outputs (1-8)
- `min` / `max` - Value bounds for all sliders
- `step` - Step increment
- `snap` - Enable/disable step snapping
- `labels` - Comma-separated row labels
- `fillColor` / `borderColor` / `textColor` - Visual customization

**Outputs:**
- `OUT_1` through `OUT_8` - One value per row (unused rows still return 0 from Python)

Old workflows with eight separate `slider_N` inputs are migrated on load (see CHANGELOG 3.0.0).

## Usage

### Basic Interaction

- **Click and drag** on sliders to adjust values
- **Double-click** to manually enter a value via dialog
- Values are automatically clamped to the min/max range

### Keyboard Modifiers

- **Shift + drag** - Inverts the snap behavior (if snap is off, temporarily enables it; if on, temporarily disables it)
- **Ctrl + drag** - Allows setting values outside the defined min/max range

### Color Customization

Right-click any node to access color pickers for fill, border, and text colors. Set text color to "auto" for automatic contrast.

### cxSeed Usage

1. **Randomize mode**: A new random seed is generated after each queue execution
2. **Increment mode**: The seed increases by 1 after each execution
3. **Decrement mode**: The seed decreases by 1 after each execution
4. **Fixed mode**: The seed remains unchanged between executions

**max_digits Property:**
- `max_digits=0` - No digit limit (uses `max` property)
- `max_digits=8` - Seeds limited to 0-99999999
- `max_digits=10` - Seeds limited to 0-9999999999

### Properties Panel

All properties can be edited through ComfyUI's Properties Panel:
1. Right-click the node
2. Select "Properties" or use the Properties Panel
3. Edit values directly

## File Structure

Runtime package files are at the repo root (ComfyUI loads this folder as a custom node). Contributor docs, specs, and CI are also at root but are not executed by ComfyUI. See [CODEBASE.MD](CODEBASE.MD) for the full map.

```
comfyui_cxslider/
├── __init__.py            # Package initialization (reads version from pyproject.toml)
├── pyproject.toml         # Canonical version source, ComfyUI registry metadata
├── cxsliders.py           # Slider node definitions (V1/V3 dual schema)
├── cxdial.py              # Dial node definitions (V1/V3 dual schema)
├── cxtoggle.py            # Toggle node definition (V1/V3 dual schema)
├── cxseed.py              # Seed node definition (V1/V3 dual schema)
├── cxsliderbank.py        # Slider bank node definitions (V1/V3 dual schema)
├── js/
│   ├── cx_utils.js        # Shared utilities and constants
│   ├── cx_base_widget.js  # Base widget classes (CxBaseWidget, CxNumericWidget)
│   ├── cxslider.js        # Slider UI (Int + Float)
│   ├── cxdial.js          # Dial UI (Int + Float)
│   ├── cxtoggle.js        # Toggle UI
│   ├── cxseed.js          # Seed node UI
│   ├── cxsliderbank.js    # Slider bank UI (Int + Float)
│   └── docs/              # Per-node help (ComfyUI tooltip)
├── example_workflows/     # Sample graphs for the template browser
├── CHANGELOG.md           # Version history (Keep a Changelog format)
├── CODEBASE.MD            # Contributor architecture map
├── CONTRIBUTING.md        # How to contribute and test
├── LICENSE                # MIT License
└── README.md              # This file
```

## Example workflows

Load from ComfyUI's workflow/template UI (if enabled) or **Load** these files:

- [example_workflows/cx_sliders_demo.json](example_workflows/cx_sliders_demo.json) — slider, toggle, and seed
- [example_workflows/cx_slider_bank_demo.json](example_workflows/cx_slider_bank_demo.json) — three-row integer bank

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, CI checks, and the manual testing checklist.

## Compatibility

- ComfyUI v0.3.75+
- Supports both V1 and V3 schema

## Credits

- Slider design and mouse capture implementation inspired by [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

## License

MIT License
