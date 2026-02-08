# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComfyUI custom node package (`comfyui-cx_sliders`) providing visual slider controls and a seed node. Part of the "cx" family of custom nodes.

## Repository Layout

The repo root **is** the ComfyUI package (loaded as a custom node directly):

- `__init__.py` — Package entry point. Merges node mappings from all modules, creates combined V3 `ComfyExtension`.
- `cxsliders.py` — `cxSliderInt` and `cxSliderFloat` node definitions (V1/V3 dual schema).
- `cxseed.py` — `cxSeed` node definition (V1/V3 dual schema).
- `js/` — Frontend JavaScript extensions (one per node). This is where the real logic lives.
- `archives/` — Versioned zip snapshots for distribution (gitignored).

## Deployment & Testing

No automated tests. Manual testing workflow:

1. Symlink or copy this repo into `ComfyUI/custom_nodes/` (e.g., as `comfyui_cxslider`)
2. Restart ComfyUI
3. Add nodes from the `utils/cxSliders` category

## Architecture

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

### Frontend/Backend Split

- **Python backend** (`*.py`): Minimal — just declares input/output types and passes values through. The backend widget is intentionally hidden; all visual interaction is handled by JavaScript.
- **JavaScript frontend** (`js/*.js`): Where the real logic lives. Each JS file registers a ComfyUI extension via `app.registerExtension()` and uses `beforeRegisterNodeDef` to patch the node prototype with custom drawing, mouse handling, serialization, and property management.

### Key JS Patterns

- **Three-way sync**: `sliderProps`/`seedProps` (internal state) <-> `node.properties` (Properties Panel) <-> `widget.value` (ComfyUI backend). All three must stay in sync.
- **`cleanProperties(node)`**: Removes `aux_id` that LiteGraph injects into `node.properties`. Call this when syncing properties.
- **Mouse capture**: Slider nodes use `captureInput(true/false)` for drag behavior. Ctrl+drag unlocks min/max bounds, Shift+drag inverts snap.
- **`onConfigure`/`onSerialize`**: Custom serialization since state lives in `sliderProps`/`seedProps`, not native widgets.
- **Canvas rendering**: All nodes draw via `onDrawForeground()` using Canvas 2D API. Requires `ctx.roundRect()`.

### Adding a New Node

1. Create `newnode.py` with the V1/V3 dual schema pattern (copy from `cxseed.py` as template).
2. Create `js/newnode.js` with `app.registerExtension()` and `beforeRegisterNodeDef` hook.
3. Import and merge the new module's mappings in `__init__.py`.
4. Add the V3 node class to the `cxSliderExtensionCombined.get_node_list()` return list.

## Node IDs and Categories

All nodes register under category `utils/cxSliders`:
- `cxSliderInt` -> "cxSlider - Int" (blue #4a90d9)
- `cxSliderFloat` -> "cxSlider - Float" (orange #d99a4a)
- `cxSeed` -> "cxSeed"

## Versioning

- `__version__` in `__init__.py` and version header in `README.md`
- Current version: 1.0.0
- Archives: `comfyui_cxslider-X.Y.Z.zip` in `archives/`

## Compatibility

- Requires ComfyUI v0.3.75+
- Must work with both V1 (legacy) and V3 (modern) ComfyUI schemas
- JavaScript uses `ctx.roundRect()` (modern Canvas API)
