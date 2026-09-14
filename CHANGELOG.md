# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-14

### Removed
- **cxDial** (`cxDialInt` / `cxDialFloat`): removed Python nodes, JS widget, help pages, and all registration stubs. Dial was previously disabled-in-place; it is now gone entirely.

### Added
- **Dual-color slider text** (adopted from PoC): when `textColor` is `auto`, value text on cxSlider and cxSliderBank mini-sliders is drawn with separate contrast colors over the filled vs unfilled bar regions so labels stay readable at any fill ratio.

### Changed
- Packaging hygiene: `.comfyignore` for Registry archives; `requires-python >= 3.10`; explicit empty `dependencies`; longer Registry description calling out min/max customization.

## [1.0.0] - 2026-06-10

First public release — published to GitHub and the ComfyUI Registry.

> **Numbering note:** internal pre-public development used the version numbers `1.0.0` → `3.0.0` (see *Pre-public development history* below). None of those were ever published, and SemVer was not consistently applied. Public release numbering starts fresh at `1.0.0`; this is the first version with SemVer guarantees.

### Included

- **Nodes**: cxSlider (Int/Float), cxToggle, cxSeed, cxSliderBank (Int/Float), under category `utils/cxSliders`. (cxDial Int/Float were later removed entirely; see [1.1.0].)
- **Custom-widget architecture**: framework-correct widgets (`draw()`/`mouse()`/`computeSize()`), V1/V3 dual schema, automatic value serialization — no hidden backend widgets.
- **Interaction**: click-drag, double-click value entry (framework `CanvasPointer` API), Shift/Ctrl modifiers, Properties Panel editing, right-click color pickers.
- **Slider bank**: 1–8 rows driven by a single JSON `values` input; per-row outputs `OUT_1`–`OUT_8`.
- **Seed**: recall/randomize with `control_after_generate`; `NaN` fingerprint forces correct re-execution.
- Automatic migration of older-format workflows on load.

### Changed

- Temporarily disabled the `cxDialInt` / `cxDialFloat` nodes pending design decision (superseded: nodes removed entirely — see [1.1.0]).

### Fixed

- Slider bank: typing a value via double-click now rounds to the configured integer/decimal precision, matching drag behavior (previously stored the raw entered float).
- Dial: clicking/dragging the dial now registers. Its hit area was keyed off the framework's `NODE_WIDGET_HEIGHT` (~20px) while the dial is drawn ~radius px lower, so the clickable region missed the visible dial entirely. *(Historical; dials later removed — see [1.1.0].)*
- Dial: capped the radius (`MAX_RADIUS = 50`) so widening the node no longer inflates the dial and value text past the node's bounds.

---

## Pre-public development history

> The versions below used internal numbering and were **never published** to GitHub or the ComfyUI Registry. SemVer was not followed consistently. Retained for provenance only — see the 1.0.0 numbering note above.

### [3.0.0] - 2026-03-07

#### Breaking

- **Slider bank schema**: Replaced 8 separate `slider_1` through `slider_8` inputs with single `values` STRING input containing a JSON object (`{"s1":N,...,"s8":N}`). Old workflows are migrated automatically with best-effort value preservation.

#### Changed

- Migrated all context menus from deprecated `getExtraMenuOptions` to modern `getNodeMenuItems` API
- Standardized all JS extension names to `cx.sliders.*` format (e.g., `cx.sliders.slider`, `cx.sliders.dial`)
- Renamed `_buildColorMenu` to `_buildColorMenuItems` in `cx_base_widget.js`
- Slider bank widget uses `serializeValue()`/`deserializeValue()` for JSON round-trip

#### Added

- `SEARCH_ALIASES` (V1) and `search_aliases` (V3) on all node classes for search discoverability
- Per-node help pages in `js/docs/` (8 markdown files) for ComfyUI's built-in help tooltip
- `classifiers` field in `pyproject.toml` for registry compliance

### [2.1.0] - 2026-03-04

#### Changed
- Renamed `int`/`float` input names to `value` in cxSlider and cxDial nodes (follows ComfyUI naming conventions, avoids Python builtin shadowing)
- All `execute` methods now use named parameters with type hints per V3 documentation standard
- V3 schema: renamed `IS_CHANGED` to `fingerprint_inputs` in cxSeed (correct V3 API name)

#### Added
- `pyproject.toml` as canonical version source (ComfyUI registry standard)
- `LICENSE` file (MIT)
- `CHANGELOG.md` following Keep a Changelog format
- `__init__.py` reads version from `pyproject.toml` at import time

### [2.0.0] - 2026-02-27

#### Added
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

#### Changed
- **Merged int/float files**: Each node type is a single JS file with `isInteger` flag (was separate int/float files, 10 files reduced to 7)
- **Single source of truth**: Widget `value` is the canonical state — no more three-way sync between sliderProps/properties/widget.value
- **Widget serialization**: Custom widget values serialize automatically to Python backend — no hidden backend widgets needed

#### Removed
- cxRangeSlider (Int/Float) — deprecated
- `value_override` input on slider nodes — use ComfyUI's built-in widget-to-input conversion instead
- `getContentStartY()` manual slot calculation — framework manages positioning
- `cleanProperties()` hack — no longer needed without three-way sync
- Hidden widget suppression pattern (`widget.hidden = true`, `computeSize = () => [0, -4]`)

### [1.0.0] - 2025-12-07

> Internal first cut — note this reused the `1.0.0` number; the public release above is the canonical 1.0.0.

#### Added
- Initial (internal) release
- cxSlider - Int: Integer slider with visual control
- cxSlider - Float: Float slider with decimal precision control
- cxSeed: Seed node with last-seed tracking and quick recall/randomize buttons
