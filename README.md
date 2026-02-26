# ComfyUI cxSliders

**Version 2.0.0**

Custom slider, dial, toggle, seed, and slider bank nodes for ComfyUI with visual controls.

Based on the slider design from [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov.

## Features

- **V3 Schema Support**: Automatically uses V3 schema when available, with V1 fallback for compatibility
- **Custom Widget Architecture**: All nodes use proper custom widgets with `draw()`/`mouse()`/`computeSize()` — framework-managed layout, no manual Y calculations
- **Visual Controls**: Interactive sliders, dials, toggles, and seed buttons
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
   git clone <repository-url> comfyui_cxslider
   ```

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

### cxDial - Int / Float

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

Multi-slider bank with configurable number of rows (1-8).

**Properties (via Properties Panel):**
- `sliderCount` - Number of slider rows (1-8)
- `min` / `max` - Value bounds for all sliders
- `step` - Step increment
- `snap` - Enable/disable step snapping
- `labels` - Comma-separated row labels
- `fillColor` / `borderColor` / `textColor` - Visual customization

**Outputs:**
- `slider_1` through `slider_8` - Individual values per row

## Usage

### Basic Interaction

- **Click and drag** on sliders/dials to adjust values
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

```
comfyui_cxslider/
├── __init__.py            # Package initialization
├── cxsliders.py           # Slider node definitions (V1/V3 hybrid)
├── cxseed.py              # Seed node definition (V1/V3 hybrid)
├── js/
│   ├── cx_utils.js        # Shared utilities and constants
│   ├── cx_base_widget.js  # Base widget classes (CxBaseWidget, CxNumericWidget)
│   ├── cxslider.js        # Slider UI (Int + Float)
│   ├── cxdial.js          # Dial UI (Int + Float)
│   ├── cxtoggle.js        # Toggle UI
│   ├── cxseed.js          # Seed node UI
│   └── cxsliderbank.js    # Slider bank UI (Int + Float)
└── README.md              # This file
```

## Compatibility

- ComfyUI v0.3.75+
- Supports both V1 and V3 schema

## Credits

- Slider design and mouse capture implementation inspired by [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov

## Changelog

### 2.0.0 (Breaking)
- **Architecture rewrite**: All nodes now use custom widgets with `draw()`/`mouse()`/`computeSize()` instead of hidden widgets + `onDrawForeground`
- **Shared base classes**: `CxBaseWidget` and `CxNumericWidget` in `cx_base_widget.js`
- **Shared utilities**: `cx_utils.js` with common functions and color constants
- **Merged int/float files**: Each node type is a single JS file (was separate int/float files)
- **New nodes**: cxDial (Int/Float), cxToggle, cxSliderBank (Int/Float)
- **Removed**: cxRangeSlider (deprecated)
- **Removed**: `value_override` input on slider nodes (use ComfyUI's built-in widget-to-input conversion instead)
- **Color customization**: Right-click color pickers for fill, border, and text
- **v1.x migration**: Automatic migration of old-format workflow files
- **Error resilience**: Defensive null checks, NaN guards, structured logging

### 1.0.0
- Initial release
- cxSlider - Int: Integer slider with visual control
- cxSlider - Float: Float slider with decimal precision control
- cxSeed: Seed node with last-seed tracking and quick buttons

## License

MIT License
