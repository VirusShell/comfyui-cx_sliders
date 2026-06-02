# ComfyUI standards audit

**Date**: 2026-06-02  
**Scope**: Production `*.py`, `js/*.js` (excluding `specs/`)  
**Reference**: Project memory docs, v2/v3 specs, ComfyUI custom-node conventions

---

## Verdict

**Pass with fixes applied** — The pack follows the correct custom-widget architecture (no hidden widgets, no `getExtraMenuOptions`, `getNodeMenuItems`, widget `value` as SSOT). A few real bugs and compatibility gaps were fixed in this pass; remaining items are documented trade-offs.

---

## Checklist (ComfyUI custom node standards)

| Requirement | Status | Notes |
|-------------|--------|-------|
| `WEB_DIRECTORY` points at frontend | Pass | `__init__.py` → `./js` |
| V1 + V3 dual schema | Pass | All five node modules + combined `comfy_entrypoint` |
| `NODE_CLASS_MAPPINGS` / display names | Pass | Merged in `__init__.py` |
| Custom widgets via `addCustomWidget()` | Pass | All numeric nodes |
| Override `_draw` / `_mouse`, not framework methods | Pass | `CxBaseWidget` pattern |
| Widget name matches Python input | Pass | `value`, `toggle`, `seed`, `values` |
| No `widget.value` as array | Pass | Bank uses plain object `{s1..s8}` |
| No hidden `computeSize [0,-4]` | Pass | Removed in v3 bank |
| `getNodeMenuItems` (not deprecated menu API) | Pass | All extensions; returns `[]` when N/A |
| Extension names `cx.sliders.*` | Pass | Five registered names |
| `SEARCH_ALIASES` / `search_aliases` | Pass | All node classes |
| Help docs in `js/docs/<node_id>.md` | Pass | 8 files match node IDs |
| `fingerprint_inputs` / `IS_CHANGED` for seed | Pass | `float("NaN")` on cxSeed |
| `pyproject.toml` + `[tool.comfy]` | Pass | Registry metadata present |
| `serializeValue` / `deserializeValue` (bank) | Pass | JSON round-trip |
| UI-only widget `{serialize: false}` | Pass | `cx_seed_buttons` |
| Chain `onNodeCreated` | Pass | All nodes |
| Chain `onConfigure` | **Fixed** | Slider, dial, toggle, bank now call parent (seed already did) |

---

## Anti-patterns scan (must be zero)

```
getExtraMenuOptions     — none in js/
w.hidden = true         — none
computeSize [0, -4]     — none
getContentStartY        — none
onDrawForeground paint  — none
converted-widget        — none
cleanProperties         — none
```

---

## Issues found and disposition

### Fixed in code (2026-06-02)

| Issue | Severity | Fix |
|-------|----------|-----|
| `cx_base_widget._isLowQuality()` used global `app` without import | Medium | Import `app` from `scripts/app.js` |
| `cxSeed._randomSeed()` biased / wrong for 64-bit range | High | Rejection sampling with `crypto.getRandomValues` |
| `onConfigure` did not chain parent on 4 nodes | Medium | Call `onConfigure?.apply(this, arguments)` first |
| `beforeRegisterNodeDef(..., app)` shadowed module import | Low | Drop unused third parameter |
| Bank float defaults all `0` not `0.0` | Low | Constructor uses `0.0` for float bank |
| Bank `deserializeValue` failed silently | Low | `cxLog("warn", ...)` on parse error |
| Bank v2 migration guard | Low | `Array.isArray(wv)` check |

### Accepted trade-offs (not bugs)

| Topic | Rationale |
|-------|-----------|
| Dial has no Ctrl+drag out-of-range | Slider-only feature from mxToolkit lineage; dial clamps to arc range |
| Toggle V3 input `max=100` vs UI default 0/1 | Allows multi-state toggles via Properties Panel |
| Invalid bank JSON raises `ValueError` in Python | Correct per v3 design — ComfyUI shows error vs silent zeros |
| `openColorPicker` fires on `input` + `change` | Live preview while dragging color picker |
| No automated browser tests | ComfyUI UI requires manual checklist (CI covers Python + grep) |
| Seed button uses `requestAnimationFrame` in `onNodeCreated` | Defers until framework widgets exist; standard pattern for seed + control widget |

### Low priority / future

| Topic | Suggestion |
|-------|------------|
| Dial Ctrl+unlock parity with slider | Optional enhancement if users request extended range on dials |
| Consolidate toggle color menu with `_buildColorMenuItems` | Cosmetic DRY only |
| `example_workflows` preview `.jpg` files | Registry polish |

---

## Python backend review

- **Pass-through only** — No side effects, file I/O, or network calls.
- **Types** — Inputs use `value` / `toggle` / `seed` / `values` (no Python builtin shadowing).
- **Slider bank** — `json.loads` with explicit `ValueError` on malformed JSON (fail-visible).
- **Seed** — Always re-executes via `NaN` fingerprint (intentional for randomize/increment modes).
- **V3 execute** — Named parameters with type hints on all nodes.

---

## JavaScript review

- **Error boundaries** — `draw` / `mouse` wrapped in try/catch on base widget.
- **Hit areas** — Bank uses `_activeDragArea` for drag isolation (correct).
- **Migration** — v1 properties and v2 bank `widgets_values` formats handled in `onConfigure`.
- **Widget order** — `splice(idx, 0, widget)` preserves serialization index when replacing framework widgets.
- **cxSeed** — Does not remove framework `seed` / `control_after_generate` widgets (required).

---

## Pre-ship manual verification

After pulling these fixes, run in ComfyUI:

1. [specs/custom-widget-rewrite/TESTING_CHECKLIST.md](specs/custom-widget-rewrite/TESTING_CHECKLIST.md) sections 0, 7, 8 (bank + seed randomize at large `max`).
2. Load [example_workflows/](example_workflows/) JSON files.
3. Confirm no console `[cx_sliders]` errors with `CX_SLIDERS_DEBUG = true`.

---

## CI alignment

`.github/workflows/ci.yml` enforces Python syntax, version 3.0.0 consistency, and banned-pattern grep — matches this audit’s automated checks.
