# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2026-03-07

### Breaking

- **Slider bank schema**: Replaced 8 separate `slider_1` through `slider_8` inputs with single `values` STRING input containing a JSON object (`{"s1":N,...,"s8":N}`). Old workflows are migrated automatically with best-effort value preservation.

### Changed

- Migrated all context menus from deprecated `getExtraMenuOptions` to modern `getNodeMenuItems` API
- Standardized all JS extension names to `cx.sliders.*` format (e.g., `cx.sliders.slider`, `cx.sliders.dial`)
- Renamed `_buildColorMenu` to `_buildColorMenuItems` in `cx_base_widget.js`
- Slider bank widget uses `serializeValue()`/`deserializeValue()` for JSON round-trip

### Added

- `SEARCH_ALIASES` (V1) and `search_aliases` (V3) on all node classes for search discoverability
- Per-node help pages in `js/docs/` (8 markdown files) for ComfyUI's built-in help tooltip
- `classifiers` field in `pyproject.toml` for registry compliance

## [2.1.0] - 2026-03-04

### Changed
- Renamed `int`/`float` input names to `value` in cxSlider and cxDial nodes (follows ComfyUI naming conventions, avoids Python builtin shadowing)
- All `execute` methods now use named parameters with type hints per V3 documentation standard
- V3 schema: renamed `IS_CHANGED` to `fingerprint_inputs` in cxSeed (correct V3 API name)

### Added
- `pyproject.toml` as canonical version source (ComfyUI registry standard)
- `LICENSE` file (MIT)
- `CHANGELOG.md` following Keep a Changelog format
- `__init__.py` reads version from `pyproject.toml` at import time

## [2.0.0] - 2026-02-27

### Added
- **Custom widget architecture**: All nodes use proper custom widgets with `draw()`/`mouse()`/`computeSize()` — framework-managed layout, no manual Y calculations
- **Shared base classes**: `CxBaseWidget` and `CxNumericWidget` in `js/cx_base_widget.js`
- **Shared utilities**: `js/cx_utils.js` with common functions, constants, and color helpers
- **New nodes**: cxDial (Int/Float), cxToggle, cxSliderBank (Int/Float)
- **Double-click editing**: Built-in value editing dialog on all numeric nodes using framework `CanvasPointer` API
- **Properties Panel integration**: Edit all parameters through ComfyUI's Properties Panel
- **Customizable colors**: Right-click color pickers for fill, border, and text colors
- **Low-quality rendering**: Skips fine detail when zoomed out for performance
- **v1.x migration**: Automatically migrates old-format workflows
- **Error resilience**: Defensive null checks, NaN guards, structured logging via `cxLog()`
- **V3 schema support**: All Python nodes support both V1 (legacy) and V3 (modern) ComfyUI schemas

### Changed
- **Merged int/float files**: Each node type is a single JS file with `isInteger` flag (was separate int/float files, 10 files reduced to 7)
- **Single source of truth**: Widget `value` is the canonical state — no more three-way sync between sliderProps/properties/widget.value
- **Widget serialization**: Custom widget values serialize automatically to Python backend — no hidden backend widgets needed

### Removed
- cxRangeSlider (Int/Float) — deprecated
- `value_override` input on slider nodes — use ComfyUI's built-in widget-to-input conversion instead
- `getContentStartY()` manual slot calculation — framework manages positioning
- `cleanProperties()` hack — no longer needed without three-way sync
- Hidden widget suppression pattern (`widget.hidden = true`, `computeSize = () => [0, -4]`)

## [1.0.0] - 2025-12-07

### Added
- Initial release
- cxSlider - Int: Integer slider with visual control
- cxSlider - Float: Float slider with decimal precision control
- cxSeed: Seed node with last-seed tracking and quick recall/randomize buttons
