# ComfyUI cxSlider

**Version 1.0.0**

Custom slider nodes for ComfyUI that provide visual slider controls for integer and floating-point values.

Based on the slider design from [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov.

## Features

- **V3 Schema Support**: Automatically uses V3 schema when available, with V1 fallback for compatibility
- **Visual Slider Control**: Interactive slider bar is the sole method of value adjustment
- **Compact Design**: Widget is hidden for a cleaner, smaller node appearance
- **Proper Mouse Capture**: Click and drag to adjust values, releases properly on mouse up
- **Double-click Editing**: Built-in value editing dialog
- **Properties Panel Integration**: Edit all parameters through ComfyUI's Properties Panel

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

### cxSlider - Int

Integer slider node for controlling whole number values.

**Inputs:**
- `value_override` (optional) - When connected, overrides the slider value. Useful in subgraphs.

**Properties (via Properties Panel):**
- `current` - Current value (default: 1)
- `min` - Minimum allowed value (default: 0)
- `max` - Maximum allowed value (default: 100)
- `step` - Step increment when snap is enabled (default: 1, minimum: 1)
- `snap` - Enable/disable step snapping (default: true)

**Output:**
- `INT` - Integer type

### cxSlider - Float

Floating-point slider node for controlling decimal values.

**Inputs:**
- `value_override` (optional) - When connected, overrides the slider value. Useful in subgraphs.

**Properties (via Properties Panel):**
- `current` - Current value (default: 1.0)
- `min` - Minimum allowed value (default: 0.0)
- `max` - Maximum allowed value (default: 100.0)
- `step` - Step increment when snap is enabled (default: 0.5)
- `snap` - Enable/disable step snapping (default: true)
- `padding` - Decimal places format (default: "0.000" for 3 decimal places)

**Output:**
- `FLOAT` - Float type

### cxSeed

Seed generation node with configurable after-generation behavior. Uses ComfyUI's built-in seed control mechanism.

**Widgets:**
- `seed` - Current seed value
- `control_after_generate` - ComfyUI's built-in control (randomize, increment, decrement, fixed)

**Properties (via Properties Panel):**
- `min` - Minimum allowed seed value (default: 0)
- `max` - Maximum allowed seed value (default: 18446744073709551615)
- `max_digits` - Maximum number of digits for seed (0 = no limit, 1-19). For example, setting to 8 limits seeds to 0-99999999

**Buttons:**
- `♻️` - Copy the last used seed to the current seed and set mode to "fixed"
- `🎲` - Generate a new random seed and set mode to "randomize"

**Output:**
- `SEED` - Integer type (seed value)

## Usage

### Basic Interaction

- **Click and drag** on the slider bar to adjust the value
- **Double-click** on the slider bar to manually enter a value using ComfyUI's built-in dialog
- Values are automatically clamped to the min/max range

### Keyboard Modifiers

- **Shift + drag** - Inverts the snap behavior (if snap is off, temporarily enables it; if snap is on, temporarily disables it)
- **Ctrl + drag** - Allows setting values outside the defined min/max range

### Using in Subgraphs (Group Nodes)

The slider nodes have an optional `value_override` input that appears as a connection point. This allows you to:
1. Use the slider normally when no input is connected
2. Connect an external value when the node is inside a subgraph/group node
3. Expose the input when converting a workflow to a group node

When `value_override` is connected, it takes priority over the slider's internal value.

### cxSeed Usage

The cxSeed node provides flexible seed management using ComfyUI's built-in control mechanism:

1. **Randomize mode**: A new random seed is generated after each queue execution
2. **Increment mode**: The seed increases by 1 after each execution
3. **Decrement mode**: The seed decreases by 1 after each execution
4. **Fixed mode**: The seed remains unchanged between executions

The "Last Seed" display shows the seed that was used in the most recent generation. Use the "Use Last → Fixed" button to lock in a seed you liked from a random generation.

**max_digits Property:**
Instead of calculating that an 8-digit seed requires max=99999999, you can simply set `max_digits=8`. This is a convenience property that limits the effective maximum based on digit count:
- `max_digits=0` - No digit limit (uses `max` property)
- `max_digits=8` - Seeds limited to 0-99999999
- `max_digits=10` - Seeds limited to 0-9999999999

The effective maximum is the smaller of `max` and `10^max_digits - 1`.

### Properties Panel

All properties can be edited through ComfyUI's Properties Panel:
1. Right-click the node
2. Select "Properties" or use the Properties Panel
3. Edit values directly

### Padding (Float node only)

The `padding` property controls decimal precision display:
- `"0.0"` - 1 decimal place
- `"0.00"` - 2 decimal places
- `"0.000"` - 3 decimal places (default)
- `"0.0000"` - 4 decimal places

Simply add zeros after the decimal point to increase precision.

## Visual Design

- **INT slider** - Blue fill color (#4a90d9)
- **FLOAT slider** - Orange fill color (#d99a4a)
- The slider bar fills the node body for a compact appearance
- The current value is displayed centered on the slider bar
- The internal widget is hidden (used only for backend value storage)

## Schema Support

This extension supports both V1 (legacy) and V3 (modern) ComfyUI schemas:

- **V3 Schema**: Used automatically when `comfy_api.latest` is available
- **V1 Schema**: Fallback for older ComfyUI versions

The extension will automatically detect and use the appropriate schema.

## File Structure

```
comfyui_cxslider/
├── __init__.py            # Package initialization
├── cxsliders.py           # Slider node definitions (V1/V3 hybrid)
├── cxseed.py              # Seed node definition (V1/V3 hybrid)
├── js/
│   ├── cxslider_int.js    # INT slider UI
│   ├── cxslider_float.js  # FLOAT slider UI
│   └── cxseed.js          # Seed node UI
└── README.md              # This file
```

## Compatibility

- ComfyUI v0.3.75+
- Supports both V1 and V3 schema

## Credits

- Slider design and mouse capture implementation inspired by [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit) by Max Smirnov

## Changelog

### 1.0.0
- Initial release
- cxSlider - Int: Integer slider with visual control
- cxSlider - Float: Float slider with decimal precision control
- cxSeed: Seed node with last-seed tracking and quick buttons
- V3 schema support with V1 fallback
- Optional `value_override` input for subgraph compatibility
- Properties Panel integration
- Centered emoji buttons with hover tooltips (cxSeed)
- `max_digits` property for digit-based seed limiting (cxSeed)

## License

MIT License
