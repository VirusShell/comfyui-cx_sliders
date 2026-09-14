# CLAUDE.md

Guidance for agents working in this repo.

**Canonical map & architecture:** [CODEBASE.MD](CODEBASE.MD) - file layout, 6-node table, widget hierarchy, V1/V3 dual schema, draw/event order, "add a node" checklist. Keep this file short: agent rules and non-obvious gotchas only.

User-facing install/usage: [README.md](README.md). Action queue: [WORKLIST.md](WORKLIST.md).

## Project snapshot

- Pack: `comfyui-cx_sliders` / registry name `comfyui-cx-sliders`, **v1.1.0**, category `utils/cxSliders`
- **6 nodes** (cxDial removed): `cxSliderInt`, `cxSliderFloat`, `cxToggle`, `cxSeed`, `cxSliderBankInt`, `cxSliderBankFloat`
- Repo root **is** the installable package (`WEB_DIRECTORY = "./js"`). Logic is JS; Python declares types and pass-through execute
- Dual-color value text is on main: when `textColor` is `auto`, slider/bank value text contrasts fill vs background across the fill boundary
- Lineage: [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit)

## Remotes

- `origin` - Gitea (`am_Vir/comfyui-cx_sliders`)
- `github` - GitHub (`VirusShell/comfyui-cx_sliders`)

Prefer PRs to both; no force-push to `main`. Docs-only changes do not bump version.

## Critical rules

Full rationale lives in [CODEBASE.MD](CODEBASE.MD#architecture). These cost time to rediscover:

- **Override `_draw()` / `_mouse()`, never framework `draw()` / `mouse()`** - `CxBaseWidget` wraps those. Numeric widgets extend `CxNumericWidget`; toggle and seed extend `CxBaseWidget` directly.
- **`widget.value` is the single source of truth** - auto-serialized to Python. Must **not** be an array (LiteGraph treats arrays as links). Slider banks use an object `{s1..s8}` via `serializeValue` / `deserializeValue`.
- **`IS_CHANGED` returning `True` means UNCHANGED.** Return `float("NaN")` to force re-execution. V3: `fingerprint_inputs()`.
- **Do not reintroduce v1 anti-patterns** (CI greps): hidden widgets + `computeSize () => [0,-4]`, `widget.type = "converted-widget"`, `getContentStartY()` slot math, drawing in `onDrawForeground`, three-way state sync, `getExtraMenuOptions` prototype patching.
- **Context menus:** extension-level `getNodeMenuItems(node)` returning `[]` for non-matching nodes - not `getExtraMenuOptions`.
- **Chain framework handlers:** `onNodeCreated` / `onConfigure` overrides must call the prior handler (`?.apply(this, arguments)`).
- **Prefer official extension hooks** over prototype hijacks; keep dual V1 + V3 registration working (`NODE_CLASS_MAPPINGS` + `comfy_entrypoint`).

## Build / test / version

- **No automated UI tests** - canvas needs manual checks. CI (`.github/workflows/ci.yml`): Python + JS syntax, version consistency, banned-pattern grep. Manual checklist: `specs/custom-widget-rewrite/TESTING_CHECKLIST.md`.
- **Manual loop:** install/symlink repo into `ComfyUI/custom_nodes/` (e.g. `comfyui_cxslider`), restart, add nodes from `utils/cxSliders`. Debug: `window.CX_SLIDERS_DEBUG = true` in the browser console (`[cx_sliders]` prefix).
- **Version SSOT:** `pyproject.toml` `[project].version`. On bump, sync `js/cx_utils.js` `CX_VERSION`, README header, and CHANGELOG (`__init__.py` reads pyproject; CI enforces). SemVer + Keep a Changelog. **No version bump for docs-only.**

## See also

[CODEBASE.MD](CODEBASE.MD) | [README.md](README.md) | [CONTRIBUTING.md](CONTRIBUTING.md) | [WORKLIST.md](WORKLIST.md)