# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComfyUI custom node package (`comfyui-cx_sliders`) providing visual slider controls, dials, toggles, slider banks, and a seed node. Part of the "cx" family of custom nodes.

## Versioning

- **Single source of truth**: `pyproject.toml` → `[project] version`
- `__init__.py` reads version from `pyproject.toml` at import time
- `js/cx_utils.js` has `CX_VERSION` — must be manually synced (no build step; comment in file notes this)
- `README.md` references the version in its header
- `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/) format
- Current version: **3.0.0** (v2.0.0 architecture rewrite; v2.1.0 input rename; v3.0.0 slider-bank JSON + menu migration)
- Archives: `comfyui_cxslider-X.Y.Z.zip` in `archives/` (gitignored; see CONTRIBUTING.md)
- Repo map: [CODEBASE.MD](CODEBASE.MD); tracked gaps: [PROJECT_ISSUES.md](PROJECT_ISSUES.md)

## Repository Layout

The repo root **is** the ComfyUI package (loaded as a custom node directly):

### Python Backend (minimal — declares types, passes values through)
- `__init__.py` — Package entry point. Merges node mappings from all modules, creates combined V3 `ComfyExtension`.
- `cxsliders.py` — `cxSliderInt` and `cxSliderFloat` node definitions (V1/V3 dual schema).
- `cxseed.py` — `cxSeed` node definition.
- `cxtoggle.py` — `cxToggle` node definition.
- `cxdial.py` — `cxDialInt` and `cxDialFloat` node definitions.
- `cxsliderbank.py` — `cxSliderBankInt` and `cxSliderBankFloat` node definitions.

### JavaScript Frontend (where the real logic lives)
- `js/cx_utils.js` — Shared utilities, constants, color helpers. No anti-pattern functions.
- `js/cx_base_widget.js` — `CxBaseWidget` base class implementing the framework widget contract (`draw`/`mouse`/`computeSize`/`serializeValue`/`onPointerDown`).
- `js/cxslider.js` — `CxSliderWidget` (horizontal slider, both int/float via `isInteger` flag).
- `js/cxdial.js` — `CxDialWidget` (circular arc knob, both int/float).
- `js/cxtoggle.js` — `CxToggleWidget` (discrete state button with labels).
- `js/cxseed.js` — `CxSeedWidget` (emoji buttons for seed recall/randomize).
- `js/cxsliderbank.js` — `CxSliderBankWidget` (dynamic 1-8 slider rows with +/- buttons).

### Other
- `js/docs/` — Per-node help markdown (ComfyUI help tooltip).
- `example_workflows/` — Sample workflow JSON for template browser.
- `archives/` — Versioned zip snapshots for distribution (gitignored).
- `specs/` — Spec-driven development artifacts (v2 rewrite, v3 standards pass).

## Research & Reference Documents — READ THESE FIRST

**Before searching through the ComfyUI installation or running web searches**, consult the verified research files in the auto-memory directory. These contain extensive, source-verified documentation gathered during the v2.0.0 rewrite:

| File | Contents | Verified |
|------|----------|----------|
| `comfyui-docs-reference.md` | Rendering pipeline, layout constants, widget system API, correct custom widget patterns, backend V1/V3 API, frontend API, anti-patterns | 2026-02-21 |
| `rgthree-widget-pattern-verified.md` | Exact method signatures for `draw()`/`mouse()`/`computeSize()`, coordinate systems, hit area patterns, value serialization, drawing utilities — all from rgthree-comfy source | 2026-02-21 |
| `codebase-audit.md` | Full audit of all pre-rewrite JS files: per-node specifics, interactions to preserve, features to preserve, anti-patterns identified, refactor opportunities | 2026-02-21 |
| `widget-serialization-finding.md` | Proof that custom widget values ARE serialized to Python backend automatically — no hidden widgets needed | 2026-02-21 |
| `widget-dblclick-research.md` | LiteGraph click dispatch pipeline, `CanvasPointer` API, `onPointerDown` vs `mouse()`, framework double-click detection, survey of patterns across custom node packs | 2026-02-26 |

**Location**: `C:\Users\Vir\.claude\projects\D--ai-comfyui-cx-sliders\memory\`

### Official ComfyUI Documentation Research

A comprehensive research corpus covering the **full official docs** (11 documents + tracking ledger) is available at `D:\ai\tmp\comfyui-custom-nodes-research\`. Consult these for topics NOT covered by the memory files above:

| Doc | Topics Not in Memory Files |
|-----|---------------------------|
| `05-backend-advanced.md` | Lazy eval, node expansion, ExecutionBlocker, data lists, INPUT_IS_LIST/OUTPUT_IS_LIST, wildcard inputs, node replacement/migration |
| `06-javascript-extensions.md` | JS UI APIs: settings, sidebar tabs, bottom panels, topbar menus, toast, dialog, commands, keybindings |
| `07-v3-migration.md` | Full V3 schema reference: define_schema, io types, hidden inputs via `cls.hidden`, async execute, Autogrow, DynamicCombo, MatchType |
| `09-registry-publishing.md` | pyproject.toml spec, ComfyUI registry, CI/CD publishing, security standards |
| `10-snippets-examples.md` | Context menus (`getCanvasMenuItems`, `getNodeMenuItems`), execution events, image/mask tensor operations |
| `11-i18n-and-context-menu-migration.md` | Internationalization, deprecated context menu patterns |

**Tracking ledger**: `LEDGER.md` — master index with coverage checklist and confidence ratings. **Verified 2026-02-26**.

### Local ComfyUI Reference Paths

If you must search ComfyUI source directly:
- **ComfyUI install**: `D:\ComfyUI\ComfyUI_windows_portable\ComfyUI\`
- **Frontend bundle**: `web_custom_versions/Comfy-Org_ComfyUI_frontend/1.38.13/` (minified, but has source maps)
- **rgthree-comfy** (best readable reference): `custom_nodes/rgthree-comfy/src_web/comfyui/`
- **Source map LiteGraph files**: `src/lib/litegraph/src/` (in source map)

## Deployment & Testing

No automated tests. Manual testing workflow:

1. Symlink or copy this repo into `ComfyUI/custom_nodes/` (e.g., as `comfyui_cxslider`)
2. Restart ComfyUI
3. Add nodes from the `utils/cxSliders` category
4. Testing checklist: `specs/custom-widget-rewrite/TESTING_CHECKLIST.md`
5. CI: `.github/workflows/ci.yml` (Python syntax + banned-pattern grep)

## Architecture

### v3.0.0 notes (slider bank + menus)

- **Slider bank**: Single Python input `values` (JSON string). Widget `value` is object `{s1..s8}`. Outputs `OUT_1`..`OUT_8`. No hidden `slider_N` widgets.
- **Context menus**: Use extension-level `getNodeMenuItems(node)` — not `getExtraMenuOptions` prototype patches.
- **Extension names**: `cx.sliders.slider`, `cx.sliders.dial`, `cx.sliders.toggle`, `cx.sliders.seed`, `cx.sliders.sliderbank`.

### v2.0.0 Custom Widget Pattern (correct)

All JS nodes use **framework-correct custom widgets** added via `node.addCustomWidget()`. The framework manages layout, positioning, mouse dispatch, and serialization automatically.

**Class hierarchy**:
```
CxBaseWidget (cx_base_widget.js)
  ├── CxSliderWidget (cxslider.js)      — horizontal bar, int/float
  ├── CxDialWidget (cxdial.js)          — circular arc knob, int/float
  ├── CxToggleWidget (cxtoggle.js)      — discrete state button
  ├── CxSeedWidget (cxseed.js)          — emoji buttons
  └── CxSliderBankWidget (cxsliderbank.js) — multi-row sliders
```

**How it works**:
1. Python backend declares inputs (e.g., `"value": ("INT", {...})`) — framework auto-creates a standard widget
2. JS `beforeRegisterNodeDef` hook replaces the auto-created widget with a custom `CxBaseWidget` subclass that has the same `name`
3. Custom widget implements `draw()`, `mouse()`, `computeSize()` — framework calls these at the right time with correct coordinates
4. `widget.value` is the single source of truth — serialized automatically to `widgets_values` and sent to Python backend
5. No hidden widgets, no three-way sync, no manual Y calculations

**Key design rules**:
- Subclasses override `_draw()` and `_mouse()`, NOT the framework methods `draw()`/`mouse()`
- `CxBaseWidget.draw()` handles error boundaries, low-quality skip, and delegates to `_draw()`
- `CxBaseWidget.mouse()` handles hit area dispatch and delegates to `_mouse()` for raw events
- `onPointerDown()` uses the `CanvasPointer` API for click/double-click/drag detection (modern framework API, checked before `mouse()`)
- `node.properties` is used for non-value config (colors, labels) — synced via `onPropertyChanged`

### Anti-Patterns — DO NOT Reintroduce

These patterns from v1.x caused slot/widget misalignment and were eliminated in the v2.0.0 rewrite:

| Anti-Pattern | Why It's Wrong |
|---|---|
| `widget.hidden = true` + `computeSize = () => [0, -4]` | Removes widget from layout but keeps it in `node.widgets`, breaking serialization order |
| `widget.type = "converted-widget"` | Creates phantom input slots at wrong positions |
| `getContentStartY()` manual slot calculation | Uses `index * SLOT_HEIGHT` instead of correct `(filteredIndex + 0.7) * SLOT_HEIGHT` |
| Drawing in `onDrawForeground` | Fires BEFORE framework draws slots/widgets — content gets painted over |
| Three-way state sync (props ↔ properties ↔ widget.value) | Error-prone; custom widget `value` should be the single source of truth |
| `cleanProperties()` to remove `aux_id` | Workaround for a problem caused by syncing to `node.properties` unnecessarily |
| `getExtraMenuOptions` prototype patching | Deprecated; use `getNodeMenuItems` on the extension (v3.0.0) |

### Dual Schema Pattern (V1/V3)

Every Python node file uses the same pattern:

```python
try:
    from comfy_api.latest import io, ComfyExtension
    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False

if V3_AVAILABLE:
    # V3 class (inherits io.ComfyNode, uses define_schema/execute classmethods)
else:
    # V1 class (uses INPUT_TYPES classmethod, RETURN_TYPES/FUNCTION constants)
```

Both paths export `NODE_CLASS_MAPPINGS`, `NODE_DISPLAY_NAME_MAPPINGS`, and `comfy_entrypoint` (None for V1). The `__init__.py` merges mappings from all node modules and creates a combined `ComfyExtension` for V3.

### Key Framework Facts

- **Draw order**: `drawNodeShape()` → `onDrawForeground()` → `arrange()` → `drawSlots()` → `drawNodeWidgets()` (calls `widget.draw()`)
- **Layout constants**: `NODE_SLOT_HEIGHT=20`, `NODE_TITLE_HEIGHT=30`, `NODE_WIDGET_HEIGHT=20`, `NODE_TEXT_SIZE=14`
- **Standard widget margin**: 15px each side
- **Widget event dispatch priority**: (1) `widget.onPointerDown(pointer, node, canvas)` → (2) concrete widget `onClick`/`onDrag` → (3) `widget.mouse(event, pos, node)` (legacy)
- **Widget clicks and node clicks are mutually exclusive**: `getWidgetOnPos()` decides. If a widget is hit, `node.onDblClick` and title rename are NEVER called.
- **`IS_CHANGED` returning `True` means unchanged** (counterintuitive); use `float("NaN")` to force re-execution. V3 renames this to `fingerprint_inputs()`.
- **Widget value must NOT be an array** — arrays signal a node connection/link in LiteGraph.
- **JS hooks order**: `init` → `addCustomNodeDefs` → `getCustomWidgets` → `beforeRegisterNodeDef` → `registerCustomNodes` → `setup` → `beforeConfigureGraph` → `loadedGraphNode` → `afterConfigureGraph`

### Adding a New Node

1. Create `newnode.py` with the V1/V3 dual schema pattern (copy from `cxtoggle.py` as simplest template).
2. Create `js/newnode.js`:
   - Import `CxBaseWidget` from `cx_base_widget.js` and utilities from `cx_utils.js`
   - Create a widget subclass overriding `_draw()`, `_mouse()`, `computeSize()`
   - Register via `app.registerExtension()` with `beforeRegisterNodeDef` hook
   - In the hook: replace auto-created widget with your custom widget via `addCustomWidget()`
3. Import and merge the new module's mappings in `__init__.py`.
4. Add the V3 node class to the `cxSliderExtensionCombined.get_node_list()` return list.

## Node IDs and Categories

All nodes register under category `utils/cxSliders`:

| Node ID | Display Name | Type | Color |
|---------|-------------|------|-------|
| `cxSliderInt` | cxSlider - Int | Horizontal slider | Blue #4a90d9 |
| `cxSliderFloat` | cxSlider - Float | Horizontal slider | Orange #d99a4a |
| `cxDialInt` | cxDial - Int | Circular arc knob | Blue #4a90d9 |
| `cxDialFloat` | cxDial - Float | Circular arc knob | Orange #d99a4a |
| `cxToggle` | cxToggle | Discrete state button | Green #5aaa5a |
| `cxSeed` | cxSeed | Seed with recall/randomize | — |
| `cxSliderBankInt` | cxSliderBank - Int | Multi-row sliders | Blue #4a90d9 |
| `cxSliderBankFloat` | cxSliderBank - Float | Multi-row sliders | Orange #d99a4a |

## Compatibility

- Requires ComfyUI v0.3.75+
- Must work with both V1 (legacy) and V3 (modern) ComfyUI schemas
- JavaScript uses `ctx.roundRect()` (modern Canvas API)
- Frontend tested against ComfyUI frontend v1.38.13
