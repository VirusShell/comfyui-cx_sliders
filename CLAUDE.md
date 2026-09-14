# CLAUDE.md

Guidance for Claude Code working in this repo.

**The canonical repository map and architecture reference is [CODEBASE.MD](CODEBASE.MD)** — read it for the file layout, the 8-node table, the widget class hierarchy, dual-schema (V1/V3) details, the draw/event order, and the "add a node" checklist. This file holds only what's *agent-specific*: where the verified research lives, local ComfyUI source paths, and the non-obvious rules that aren't visible in the code.

Release status & open items: [RELEASE_READINESS.md](RELEASE_READINESS.md) (assessment) and [WORKLIST.md](WORKLIST.md) (ordered action queue).

## Project overview

ComfyUI custom-node pack (`comfyui-cx_sliders`, **v1.0.0** — first public release), under category `utils/cxSliders`: canvas-drawn sliders, toggles, a seed helper, and multi-row slider banks. The repo root **is** the installable package. Logic lives in JavaScript (`js/`); Python declares types and passes values through. Slider interaction lineage: [ComfyUI-mxToolkit](https://github.com/Smirnov75/ComfyUI-mxToolkit).

## Research & reference — READ THESE FIRST

Before searching the ComfyUI install or running web searches, consult the verified research in the memory directory:
`C:\Users\Vir\.claude\projects\D--ai-comfyui-cx-sliders\memory\`

| File | Contents | Verified |
|------|----------|----------|
| `comfyui-docs-reference.md` | Rendering pipeline, layout constants, widget API, correct custom-widget patterns, V1/V3 backend, anti-patterns | 2026-02-21 |
| `rgthree-widget-pattern-verified.md` | Exact `draw()`/`mouse()`/`computeSize()` signatures, coordinate systems, hit areas, serialization — from rgthree source | 2026-02-21 |
| `codebase-audit.md` | Pre-rewrite per-file audit: node specifics, features to preserve, anti-patterns | 2026-02-21 |
| `widget-serialization-finding.md` | Custom widget values ARE auto-serialized to Python — no hidden widgets needed | 2026-02-21 |
| `widget-dblclick-research.md` | LiteGraph click dispatch, `CanvasPointer` API, `onPointerDown` vs `mouse()` | 2026-02-26 |

Full official-docs corpus (11 docs + `LEDGER.md`) at `D:\ai\tmp\comfyui-custom-nodes-research\` — for topics **not** in the memory files: V3 schema reference (`07-v3-migration.md`), JS UI APIs (`06-javascript-extensions.md`), registry publishing (`09-registry-publishing.md`), context menus (`10-snippets-examples.md`), i18n (`11-i18n-and-context-menu-migration.md`), advanced backend (`05-backend-advanced.md`). **Verified 2026-02-26.**

## Local ComfyUI source paths (for source diving)

- ComfyUI install: `D:\ComfyUI\ComfyUI_windows_portable\ComfyUI\`
- Frontend bundle (minified, has source maps): `web_custom_versions/Comfy-Org_ComfyUI_frontend/1.38.13/`
- rgthree-comfy (best readable widget reference): `custom_nodes/rgthree-comfy/src_web/comfyui/`
- LiteGraph TypeScript (in source map): `src/lib/litegraph/src/`

## Critical rules & gotchas

Non-obvious facts that cost time to rediscover. Full architecture rationale (draw order, why each anti-pattern breaks, class hierarchy) is in [CODEBASE.MD](CODEBASE.MD#architecture).

- **Override `_draw()` / `_mouse()`, never the framework `draw()` / `mouse()`** — `CxBaseWidget` wraps those with error boundaries and delegates. Numeric widgets extend `CxNumericWidget`; toggle and seed extend `CxBaseWidget` directly.
- **`widget.value` is the single source of truth** — serialized automatically to `widgets_values` and sent to Python. It must **NOT** be an array; arrays signal a node link in LiteGraph. (The slider bank stores an object `{s1..s8}` and round-trips it via `serializeValue`/`deserializeValue`.)
- **`IS_CHANGED` returning `True` means UNCHANGED** (counterintuitive). Return `float("NaN")` to force re-execution. V3 renames it `fingerprint_inputs()`.
- **Do not reintroduce v1 anti-patterns** (CI greps for them): hidden widgets + `computeSize () => [0,-4]`, `widget.type = "converted-widget"`, `getContentStartY()` slot math, drawing in `onDrawForeground`, three-way state sync, `getExtraMenuOptions` prototype patching.
- **Context menus**: extension-level `getNodeMenuItems(node)` that returns `[]` for non-matching nodes — not `getExtraMenuOptions`.
- **Chain framework handlers**: `onNodeCreated` / `onConfigure` overrides must call the prior handler (`?.apply(this, arguments)`).
- **Layout constants**: `NODE_SLOT_HEIGHT=20`, `NODE_TITLE_HEIGHT=30`, `NODE_WIDGET_HEIGHT=20`; standard widget margin 15px per side.
- **JS hook order**: `init → addCustomNodeDefs → getCustomWidgets → beforeRegisterNodeDef → registerCustomNodes → setup → beforeConfigureGraph → loadedGraphNode → afterConfigureGraph`.

## Build / test / version

- **No automated UI tests** — the ComfyUI canvas needs manual verification. CI (`.github/workflows/ci.yml`) runs Python + JS syntax checks, version consistency, and banned-pattern grep. Manual checklist: `specs/custom-widget-rewrite/TESTING_CHECKLIST.md`.
- **Manual test loop**: symlink/copy the repo into `ComfyUI/custom_nodes/` (e.g. `comfyui_cxslider`), restart ComfyUI, add nodes from `utils/cxSliders`. Debug logs: set `window.CX_SLIDERS_DEBUG = true` in the browser console (`[cx_sliders]` prefix).
- **Version SSOT** is `pyproject.toml [project] version`. On every bump, manually sync `js/cx_utils.js CX_VERSION`, the `README.md` header, and `CHANGELOG.md` (`__init__.py` reads pyproject at import; CI enforces all four). Follow SemVer + Keep a Changelog.

## See also

[CODEBASE.MD](CODEBASE.MD) — canonical map & architecture · [README.md](README.md) — end users · [CONTRIBUTING.md](CONTRIBUTING.md) · [RELEASE_READINESS.md](RELEASE_READINESS.md) / [WORKLIST.md](WORKLIST.md) — release tracking
