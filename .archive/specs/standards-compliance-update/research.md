---
spec: standards-compliance-update
phase: research
created: 2026-03-06T12:00:00
---

# Research: standards-compliance-update

## Executive Summary

Six standards compliance items need implementation for a v3.0.0 release. Items 1 (context menu migration) and 3 (slider bank restructure) carry the most risk due to runtime behavior changes. Items 2, 5, 6, 8 are low-risk additive changes. The spec document contains one factual error: help pages belong in `js/docs/` (inside WEB_DIRECTORY), not `web/docs/`.

## Item 1: Context Menu Migration (`getExtraMenuOptions` -> `getNodeMenuItems`)

### Current Code

All 5 JS files monkey-patch `nodeType.prototype.getExtraMenuOptions` inside `beforeRegisterNodeDef`:

| File | Lines | Node Type Guard | Menu Items |
|------|-------|-----------------|------------|
| `js/cxslider.js` | 188-209 | via `SLIDER_NODES` map + `isInteger` closure | `_buildColorMenu(options, "Slider")`, "Reset to Defaults" |
| `js/cxdial.js` | 235-256 | via `DIAL_NODES` map + `isInteger` closure | `_buildColorMenu(options, "Dial")`, "Reset to Defaults" |
| `js/cxtoggle.js` | 172-210 | single node (`cxToggle`) | 3 inline color pickers (Fill/Border/Text), "Reset to Defaults" |
| `js/cxseed.js` | 233-259 | single node (`cxSeed`) | "Randomize Seed Now", "Reset to Defaults" |
| `js/cxsliderbank.js` | 276-305 | via `BANK_NODES` map + `isInteger` closure | `_buildColorMenu(options, "Slider Bank")`, "Reset to Defaults" |

### Key Differences Between Files

- **cxslider, cxdial, cxsliderbank**: Use `_buildColorMenu()` from `CxNumericWidget` base class (push-based into `options`). Access `isInteger` from closure.
- **cxtoggle**: Builds color pickers inline (does NOT use `_buildColorMenu` -- it extends `CxBaseWidget`, not `CxNumericWidget`). Uses `openColorPicker` directly.
- **cxseed**: No color menu. Has unique "Randomize Seed Now" item that calls `btnWidget._doRandomize(self)`.

### `isInteger` Resolution Strategy

Three files already have module-level maps that solve the closure problem:

| File | Map Constant | Values |
|------|-------------|--------|
| `js/cxslider.js` L105 | `SLIDER_NODES` | `{ "cxSliderInt": true, "cxSliderFloat": false }` |
| `js/cxdial.js` L165 | `DIAL_NODES` | `{ "cxDialInt": true, "cxDialFloat": false }` |
| `js/cxsliderbank.js` L223 | `BANK_NODES` | `{ "cxSliderBankInt": true, "cxSliderBankFloat": false }` |

In `getNodeMenuItems(node)`, use `node.comfyClass` to look up `isInteger` from these maps.

### `_buildColorMenu` in `cx_base_widget.js`

Current signature (L244): `_buildColorMenu(options, labelPrefix = "Slider")` -- pushes items into `options` array.

Migration options:
- **Option A (rename only)**: Rename to `_buildColorMenuItems`, keep push-based. Callers create local array, pass it in, then return it. Minimal change.
- **Option B (return-based)**: Change to return an array. Cleaner API but more changes.

**Recommendation**: Option A -- rename and keep push-based. The method is only called from 3 files and the push pattern works fine since callers own the array.

### cxToggle Special Case

`cxtoggle.js` doesn't use `_buildColorMenu` -- it builds color picker items inline (L173-209). Two options:
1. Refactor to use `_buildColorMenuItems` (requires adding the method to `CxBaseWidget` or importing `openColorPicker`)
2. Keep inline but migrate to `getNodeMenuItems`

**Recommendation**: Option 2 initially. Refactoring toggle to share color menu logic is a separate improvement.

### Risk: Medium

- `getNodeMenuItems` confirmed present in frontend v1.38.13 (found in 10 files in web_custom_versions)
- The hook returns items from ALL extensions, so items will merge with any framework default items
- Must verify: does `null` (separator) still work in the returned array?
- Must verify: does the old `getExtraMenuOptions` still fire if present? (could cause duplicate items during transition)

---

## Item 2: Extension Name Standardization

### Current Names

| File | Line | Current Name |
|------|------|-------------|
| `js/cxslider.js` | L108 | `"cxSlider"` |
| `js/cxdial.js` | L168 | `"cxDial"` |
| `js/cxtoggle.js` | L127 | `"cx.toggle"` |
| `js/cxseed.js` | L164 | `"cxSeed"` |
| `js/cxsliderbank.js` | L226 | `"cxSliderBank"` |

### Target Names

Per `06-javascript-extensions.md`, use dotted reverse-domain notation:

| File | New Name |
|------|----------|
| `js/cxslider.js` | `"cx.sliders.slider"` |
| `js/cxdial.js` | `"cx.sliders.dial"` |
| `js/cxtoggle.js` | `"cx.sliders.toggle"` |
| `js/cxseed.js` | `"cx.sliders.seed"` |
| `js/cxsliderbank.js` | `"cx.sliders.sliderbank"` |

### Risk: Low

Extension names are for deduplication in the extension registry, not workflow serialization. Changing them has no effect on saved workflows.

---

## Item 3: Slider Bank Hidden Widget Elimination (Option A)

### Current Architecture

**Python** (`cxsliderbank.py`):
- V1: 8 inputs `slider_1` through `slider_8`, each `("INT"|"FLOAT", {...})`
- V3: 8 `io.Int.Input` / `io.Float.Input` with same names
- 8 outputs `OUT_1` through `OUT_8`
- `execute(**kwargs)` extracts values by name

**JavaScript** (`cxsliderbank.js`):
- L236-242: Hides all 8 framework-created widgets: `w.hidden = true; w.computeSize = () => [0, -4];`
- Custom `CxSliderBankWidget` has `serialize: false` (L17)
- Mini-sliders read/write hidden widget values: `node.widgets?.find(w => w.name === 'slider_${index + 1}')`
- `_updateMiniSlider` (L105-112): Sets `hiddenWidget.value` on drag
- `_onDblClick` (L115-140): Reads `hiddenWidget.value` for prompt dialog

### Proposed Architecture (Option A: Single JSON Input)

**Python changes**:
- Replace 8 `slider_N` inputs with single `io.String.Input("values", default='{"s1":0,...,"s8":0}')`
- Keep `slider_count` input (already exists as property, NOT a backend input -- need to ADD it)
- `execute(values: str, slider_count: int)` parses JSON, returns 8 outputs

Wait -- `slider_count` is NOT currently a backend input. It's only in `node.properties`. The backend always receives and returns all 8 values. This design should be preserved: the backend should always return 8 values, and the JS controls which outputs are visible.

**Corrected Python design**:
```python
inputs=[
    io.String.Input("values", default='{"s1":0,"s2":0,...,"s8":0}', multiline=False),
]
# NO slider_count input -- it's JS-only (controls output visibility)
```

**JavaScript changes**:
1. Remove the 8-widget hiding loop (L236-242)
2. Remove the framework's auto-created `values` widget, replace with custom `CxSliderBankWidget`
3. Custom widget `value` is an object: `{ s1: 0, s2: 0, ..., s8: 0 }`
4. `serializeValue()` returns `JSON.stringify(this.value)`
5. Mini-sliders read/write `this.value[`s${index+1}`]` directly (no hidden widgets)
6. `onConfigure` migration: detect old `widgets_values` format (8 separate numbers) and convert

### Widget Value Constraint

Per `widget-serialization-finding.md`: **Widget value must NOT be an array.** Objects ARE fine. `value = { s1: 0, s2: 0, ... }` is valid.

### Serialization Flow

1. Custom widget `serializeValue()` returns `JSON.stringify(this.value)` -- a string
2. Framework stores this string in `widgets_values[0]`
3. Python backend receives `values` parameter as a string
4. `json.loads(values)` unpacks to dict
5. Each `s1..s8` value extracted and returned as separate outputs

### `onConfigure` Migration (Old -> New)

Old format: `widgets_values = [v1, v2, v3, v4, v5, v6, v7, v8]` (8 numbers)
New format: `widgets_values = ['{"s1":0,"s2":0,...}']` (1 JSON string)

Detection: If `widgets_values` is an array of 8 numbers (not a string), it's old format.

```javascript
onConfigure(info) {
    const wv = info.widgets_values;
    if (wv && wv.length === 8 && typeof wv[0] === 'number') {
        // Old format: 8 separate numbers
        const migrated = {};
        for (let i = 0; i < 8; i++) migrated[`s${i+1}`] = wv[i];
        const bankWidget = this.widgets?.find(w => w.name === "values");
        if (bankWidget) bankWidget.value = migrated;
    }
}
```

### V1 Python Schema Change

```python
class cxSliderBankInt:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "values": ("STRING", {
                    "default": '{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0,"s6":0,"s7":0,"s8":0}',
                }),
            },
        }
    # Outputs unchanged: 8 INTs
    RETURN_TYPES = ("INT",) * 8
    RETURN_NAMES = tuple(f"OUT_{i}" for i in range(1, 9))
    FUNCTION = "execute"
    CATEGORY = "utils/cxSliders"

    def execute(self, values: str):
        import json
        data = json.loads(values)
        results = []
        for i in range(1, 9):
            results.append(int(round(data.get(f"s{i}", 0))))
        return tuple(results)
```

### Risk: High

- **Breaking change**: Old workflows have 8 widget values, new has 1 JSON string
- `onConfigure` migration mitigates but is fragile (relies on type-checking `widgets_values`)
- Needs thorough testing: save/load cycle, copy/paste nodes, workflow import
- If migration fails silently, all slider values reset to 0

### Dependency

Must be done last among code changes. The `serializeValue()` -> JSON pattern is well-established (rgthree uses it) but untested in this codebase.

---

## Item 5: SEARCH_ALIASES

### V1 Implementation

Confirmed in `server.py` L689: `info['search_aliases'] = getattr(obj_class, 'SEARCH_ALIASES', [])`.

Add class attribute to each V1 class:

| File | V1 Class(es) | Attribute to Add |
|------|-------------|-----------------|
| `cxsliders.py` | `cxSliderInt` (L104) | `SEARCH_ALIASES = ["slider", "range", "integer slider", "cx slider"]` |
| `cxsliders.py` | `cxSliderFloat` (L133) | `SEARCH_ALIASES = ["slider", "range", "float slider", "cx slider"]` |
| `cxdial.py` | `cxDialInt` (L103) | `SEARCH_ALIASES = ["dial", "knob", "rotary", "integer dial", "cx dial"]` |
| `cxdial.py` | `cxDialFloat` (L132) | `SEARCH_ALIASES = ["dial", "knob", "rotary", "float dial", "cx dial"]` |
| `cxtoggle.py` | `cxToggle` (L69) | `SEARCH_ALIASES = ["toggle", "switch", "button", "on off", "cx toggle"]` |
| `cxseed.py` | `cxSeed` (L75) | `SEARCH_ALIASES = ["seed", "random seed", "cx seed"]` |
| `cxsliderbank.py` | `cxSliderBankInt` (L127) | `SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]` |
| `cxsliderbank.py` | `cxSliderBankFloat` (L156) | `SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]` |

### V3 Implementation

Confirmed in `comfy_api/latest/_io.py` L1393:
```python
search_aliases: list[str] = field(default_factory=list)
"""Alternative names for search. Useful for synonyms, abbreviations, or old names after renaming."""
```

Add `search_aliases=[...]` parameter to each V3 `define_schema()` call. Same aliases as V1.

### Risk: Low

Purely additive. No behavior change.

---

## Item 6: Node Help Pages

### CRITICAL FINDING: Directory Location

The original spec says `web/docs/`. This is WRONG for this project.

Per official docs (https://docs.comfy.org/custom-nodes/help_page): "Create a `docs` folder **inside your `WEB_DIRECTORY`**."

This project's `WEB_DIRECTORY = "./js"` (set in `__init__.py` L104). Therefore:

**Correct path: `js/docs/`** (not `web/docs/`)

File names must match `NODE_CLASS_MAPPINGS` keys exactly (case-sensitive):
```
js/docs/
  cxSliderInt.md
  cxSliderFloat.md
  cxDialInt.md
  cxDialFloat.md
  cxToggle.md
  cxSeed.md
  cxSliderBankInt.md
  cxSliderBankFloat.md
```

### Node Input/Output/Property Summary (for help content)

| Node | Inputs | Outputs | Properties |
|------|--------|---------|------------|
| cxSliderInt | `value: INT` (default 1) | `INT` | min, max, step, snap, padding, fillColor, borderColor, textColor |
| cxSliderFloat | `value: FLOAT` (default 1.0) | `FLOAT` | same as above |
| cxDialInt | `value: INT` (default 1) | `INT` | same as slider |
| cxDialFloat | `value: FLOAT` (default 1.0) | `FLOAT` | same as slider |
| cxToggle | `toggle: INT` (default 0) | `INT` | min, max, labels, fillColor, borderColor, textColor |
| cxSeed | `seed: INT` (default 0, control_after_generate) | `SEED` | min, max, max_digits |
| cxSliderBankInt | 8x `slider_N: INT` (or single `values: STRING` post-Item-3) | 8x `OUT_N: INT` | sliderCount, min, max, step, snap, padding, labels, fillColor, borderColor, textColor |
| cxSliderBankFloat | 8x `slider_N: FLOAT` (or single `values: STRING` post-Item-3) | 8x `OUT_N: FLOAT` | same as above |

### Interaction Patterns (for help content)

| Node Type | Click+Drag | Double-Click | Shift+Drag | Ctrl+Drag | Right-Click |
|-----------|-----------|-------------|------------|-----------|-------------|
| Slider | Adjust value | Type value | Toggle snap | Unlock range | Color/Reset |
| Dial | Adjust angle | Type value | Toggle snap | N/A | Color/Reset |
| Toggle | Cycle state | Type value | N/A | N/A | Color/Reset |
| Seed | N/A | N/A | N/A | N/A | Randomize/Reset |
| SliderBank | Adjust row | Type row value | Toggle snap | N/A | Color/Reset |

### Supported Markdown Features

Standard markdown, images (`![](url)`), HTML `<video>` elements. No special extensions.

### Risk: Low

Purely additive. If docs directory doesn't exist or files are malformed, ComfyUI falls back to auto-generated help.

---

## Item 8: pyproject.toml Classifiers

### Current State

`pyproject.toml` has no `classifiers` field.

### Change

Add to `[project]` section:
```toml
classifiers = [
    "Operating System :: OS Independent",
]
```

### Risk: Low

No behavior change. Metadata only.

---

## Dependencies Between Items

```
Item 2 (ext names)  ──┐
Item 5 (aliases)    ──┤
Item 8 (classifiers)──┼── Independent, can be done in any order
Item 6 (help pages) ──┤
                      │
Item 1 (menu migr.) ──┤── Independent but larger scope
                      │
Item 3 (bank restr.)──┘── Must be LAST (breaking change, affects Item 6 content)
```

Item 3 affects Item 6: if slider bank inputs change from 8 separate to 1 JSON, the help page content must reflect the new schema.

---

## Version Bump Propagation

v3.0.0 must be updated in these locations:

| Location | Current | Change To |
|----------|---------|-----------|
| `pyproject.toml` L2 | `version = "2.1.0"` | `version = "3.0.0"` |
| `js/cx_utils.js` L7 | `CX_VERSION = "2.1.0"` | `CX_VERSION = "3.0.0"` |
| `CHANGELOG.md` | `## [Unreleased]` | Add `## [3.0.0] - YYYY-MM-DD` section |
| `README.md` L3 | `**Version 2.1.0**` | `**Version 3.0.0**` |

---

## Feasibility Assessment

| Item | Viability | Effort | Risk | Notes |
|------|-----------|--------|------|-------|
| 1 - Context menu | High | Medium | Medium | API confirmed available; 5 files to change; cxtoggle has unique inline pattern |
| 2 - Extension names | High | Low | Low | String replacement only |
| 3 - Slider bank | High | High | High | Breaking change, needs migration, untested serialization pattern |
| 5 - Search aliases | High | Low | Low | Additive attribute on 10 classes |
| 6 - Help pages | High | Medium | Low | 8 markdown files, purely additive |
| 8 - Classifiers | High | Low | Low | One line in pyproject.toml |

---

## Related Specs

| Spec | Relevance | mayNeedUpdate |
|------|-----------|---------------|
| `custom-widget-rewrite` | High - predecessor spec, established the architecture being modified | No - all tasks complete, spec is historical |

---

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| JS Syntax | `node --input-type=module --check < file.js` | custom-widget-rewrite learnings |
| Python Syntax | `python -c "import ast; ast.parse(open('file.py').read())"` | custom-widget-rewrite learnings |
| Lint | Not found | No linter configured |
| TypeCheck | Not found | No type checker configured |
| Unit Test | Not found | No test framework |
| Build | Not found | No build step |

**Local validation**: JS syntax check all 7 files + Python AST parse all 6 .py files

---

## Verification Tooling

No automated E2E tooling detected. Manual testing only.

**Project Type**: ComfyUI custom node (plugin)
**Verification Strategy**: Restart ComfyUI, manually test each node type per `specs/custom-widget-rewrite/TESTING_CHECKLIST.md`

---

## Open Questions

1. **Item 3 migration robustness**: What happens if a user has a workflow with slider bank AND the node pack updates? Does ComfyUI show an error dialog, or silently fail? Need to test migration path.
2. **Item 1 backward compat**: If both `getExtraMenuOptions` AND `getNodeMenuItems` are defined, do both fire? The migration should remove the old one, but if another extension patches `getExtraMenuOptions` on our nodes, items would duplicate.
3. **Item 6 docs directory**: Should it be `js/docs/` or should `WEB_DIRECTORY` be changed to `"./web"` with JS files moved to `web/js/`? The former is simpler; the latter follows the more common convention but requires updating `__init__.py` and ensuring ComfyUI picks up the new path.

---

## Recommendations for Requirements

1. **Do Item 3 last** -- it's the only breaking change and the riskiest
2. **Docs directory should be `js/docs/`** -- do not change WEB_DIRECTORY; it works and is simpler
3. **Version bump to 3.0.0** is correct because Item 3 (slider bank) changes the input schema (breaking change per SemVer)
4. **cxToggle color menu**: Keep inline in getNodeMenuItems for now; refactoring to share _buildColorMenu is a separate concern
5. **Item 1 _buildColorMenu**: Rename to `_buildColorMenuItems`, keep push-based API. Minimal churn.
6. **Test migration carefully**: Create a test workflow with slider bank before Item 3, save it, then load after changes

---

## Sources

- `D:\ai\comfyui-cx_sliders\specs\standards-compliance-update.md` -- original spec document
- `D:\ai\tmp\comfyui-custom-nodes-research\11-i18n-and-context-menu-migration.md` -- context menu migration guide
- `D:\ai\tmp\comfyui-custom-nodes-research\08-node-docs-templates-subgraphs.md` -- help pages spec
- (archived) serialization constraints notes were machine-local; see CODEBASE / STANDARDS_AUDIT
- `D:\ComfyUI\ComfyUI_windows_portable\ComfyUI\comfy_api\latest\_io.py` L1393 -- V3 search_aliases
- `D:\ComfyUI\ComfyUI_windows_portable\ComfyUI\server.py` L689 -- V1 SEARCH_ALIASES
- `D:\ComfyUI\ComfyUI_windows_portable\ComfyUI\nodes.py` L73 -- SEARCH_ALIASES example usage
- https://docs.comfy.org/custom-nodes/help_page -- official help page docs (docs folder inside WEB_DIRECTORY)
- Frontend v1.38.13 files -- `getNodeMenuItems` confirmed present
