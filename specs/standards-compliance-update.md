# Standards Compliance Update — v3.0.0 (completed)

**Date**: 2026-03-04 (implemented through 2026-03-07)
**Scope**: Audit against official ComfyUI custom node development standards
**Source**: Official docs corpus at `D:\ai\tmp\comfyui-custom-nodes-research\` (11 docs, verified 2026-02-26)
**Affects**: 5 JS files, 5 Python files, `pyproject.toml`, new directories

---

## Summary

8 gaps identified between current codebase and official ComfyUI development standards. Items 1–4 are code/config fixes; items 5–8 are new additions.

| # | Item | Severity | Effort | Files Changed |
|---|------|----------|--------|---------------|
| 1 | Migrate `getExtraMenuOptions` → `getNodeMenuItems` | High | Medium | 5 JS + `cx_base_widget.js` |
| 2 | Standardize JS extension names | High | Low | 5 JS |
| 3 | Eliminate slider bank hidden widget anti-pattern | Medium | High | `cxsliderbank.py` + `cxsliderbank.js` |
| 4 | Fix `pyproject.toml` for registry publishing | Medium | Low | `pyproject.toml` |
| 5 | Add `SEARCH_ALIASES` to all nodes | Low | Low | 5 Python |
| 6 | Add node help pages | Low | Medium | New `web/docs/` directory |
| 7 | Add example workflows | Low | Medium | New `example_workflows/` directory |
| 8 | Add `pyproject.toml` classifiers | Low | Low | `pyproject.toml` |

---

## Item 1: Migrate `getExtraMenuOptions` → `getNodeMenuItems`

### Problem

All 5 JS extension files monkey-patch `nodeType.prototype.getExtraMenuOptions` inside `beforeRegisterNodeDef`. This is deprecated per `11-i18n-and-context-menu-migration.md`. The modern API is `getNodeMenuItems(node)` declared as a top-level extension hook.

### Current Pattern (deprecated)

```javascript
// Inside beforeRegisterNodeDef:
nodeType.prototype.getExtraMenuOptions = function(canvas, options) {
  const w = this.widgets?.find(w => w.name === "value");
  w._buildColorMenu(options, "Slider");
  options.push({ content: "↺ Reset to Defaults", callback: () => { ... } });
};
```

Issues:
- Monkey-patches the node prototype (fragile, overrides other extensions)
- Uses `this` context instead of explicit parameter
- Menu items pushed into mutable array (old LiteGraph API)

### Target Pattern (modern)

```javascript
app.registerExtension({
  name: "cx.sliders.slider",

  // ... beforeRegisterNodeDef still handles widget creation ...

  getNodeMenuItems(node) {
    if (!SLIDER_NODES[node.comfyClass]) return [];

    const w = node.widgets?.find(w => w.name === "value");
    if (!w) return [];

    const items = [];
    w._buildColorMenuItems(items, "Slider");
    items.push({
      content: "↺ Reset to Defaults",
      callback: () => {
        Object.assign(node.properties, { /* defaults */ });
        w.value = isInteger ? 1 : 1.0;
        node.setDirtyCanvas(true, true);
      }
    });
    return items;
  },
});
```

Key differences:
- `getNodeMenuItems(node)` is a top-level extension hook, not a prototype method
- `node` is passed explicitly (no `this` binding)
- Returns an array instead of mutating `options`
- Framework collects items from all extensions and merges them

### Files Affected

| File | Current | Change |
|------|---------|--------|
| `js/cxslider.js` | `nodeType.prototype.getExtraMenuOptions` (lines 188–209) | Move to `getNodeMenuItems(node)` on extension |
| `js/cxdial.js` | `nodeType.prototype.getExtraMenuOptions` (lines 235–256) | Move to `getNodeMenuItems(node)` on extension |
| `js/cxtoggle.js` | `nodeType.prototype.getExtraMenuOptions` (lines 172–207) | Move to `getNodeMenuItems(node)` on extension |
| `js/cxseed.js` | `nodeType.prototype.getExtraMenuOptions` (lines 233–259) | Move to `getNodeMenuItems(node)` on extension |
| `js/cxsliderbank.js` | `nodeType.prototype.getExtraMenuOptions` (lines 276–305) | Move to `getNodeMenuItems(node)` on extension |
| `js/cx_base_widget.js` | `_buildColorMenu(options, label)` mutates array | Rename to `_buildColorMenuItems(items, label)` and return array (or keep mutating — either works since caller now owns the array) |

### Migration Steps

1. For each JS file, remove the `nodeType.prototype.getExtraMenuOptions = ...` block from inside `beforeRegisterNodeDef`
2. Add `getNodeMenuItems(node)` as a top-level property on the `app.registerExtension({...})` object
3. Inside the hook, use `node.comfyClass` to identify which node type was right-clicked
4. Build and return the menu items array (same item format: `{ content, callback, submenu }`)
5. Replace `this` references with `node` parameter
6. The `isInteger` flag (captured in `beforeRegisterNodeDef` closure) needs to be accessible — either:
   - Look it up from the node class map constant (`SLIDER_NODES`, `DIAL_NODES`, etc.)
   - Or store it on `node.properties` during `onNodeCreated`

### Handling `isInteger` Outside the Closure

Current code captures `isInteger` in the `beforeRegisterNodeDef` closure. In `getNodeMenuItems`, we don't have that closure. Solution:

```javascript
const SLIDER_NODES = { cxSliderInt: true, cxSliderFloat: false };

getNodeMenuItems(node) {
  const isInteger = SLIDER_NODES[node.comfyClass];
  if (isInteger === undefined) return [];
  // ... build menu items using isInteger ...
}
```

This pattern is already used by `cxslider.js`, `cxdial.js`, and `cxsliderbank.js` — they all define a `*_NODES` map at the top of the file.

### `_buildColorMenu` Signature Change

The base widget method `_buildColorMenu(options, label)` pushes items into the `options` array. Since the new pattern returns an array, the simplest migration is:

```javascript
// cx_base_widget.js — keep push-based, callers pass their local array
_buildColorMenuItems(items, labelPrefix = "Widget") {
  items.push(null); // separator
  items.push({
    content: `🎨 ${labelPrefix} Fill Color`,
    callback: () => openColorPicker(this._fillColor, (c) => {
      this._node.properties.fillColor = c;
      this._node.setDirtyCanvas(true, true);
    })
  });
  // ... border, text color same pattern ...
}
```

No functional change — just rename for clarity. Callers pass their own `items` array which they then return.

---

## Item 2: Standardize JS Extension Names

### Problem

Extension names are inconsistent and don't follow reverse-domain notation:

| File | Current Name | Standard Violation |
|------|-------------|-------------------|
| `cxslider.js` | `"cxSlider"` | No dots, not unique enough |
| `cxdial.js` | `"cxDial"` | No dots, not unique enough |
| `cxtoggle.js` | `"cx.toggle"` | Has dots but inconsistent with siblings |
| `cxseed.js` | `"cxSeed"` | No dots, not unique enough |
| `cxsliderbank.js` | `"cxSliderBank"` | No dots, not unique enough |

Per `06-javascript-extensions.md`: extension names must be globally unique and should use reverse-domain notation.

### Target Names

| File | New Name |
|------|----------|
| `cxslider.js` | `"cx.sliders.slider"` |
| `cxdial.js` | `"cx.sliders.dial"` |
| `cxtoggle.js` | `"cx.sliders.toggle"` |
| `cxseed.js` | `"cx.sliders.seed"` |
| `cxsliderbank.js` | `"cx.sliders.sliderbank"` |

Convention: `cx.sliders.<node-type>` — matches the package name `comfyui-cx-sliders` and the category `utils/cxSliders`.

### Risk

Extension names are stored in ComfyUI's extension registry. Changing them should be safe — names are used for deduplication, not workflow serialization. No workflow breakage expected.

---

## Item 3: Eliminate Slider Bank Hidden Widget Anti-Pattern

### Problem

`cxsliderbank.js` (lines 236–242) hides 8 framework-created widgets:

```javascript
w.hidden = true;
w.computeSize = () => [0, -4];
```

This is listed in CLAUDE.md's anti-pattern table. It removes widgets from the visual layout but keeps them in `node.widgets`, which can break serialization order if the framework changes how hidden widgets are handled.

### Why It Exists

The Python backend declares 8 separate inputs (`slider_1` through `slider_8`), each of which the framework auto-creates a widget for. The JS replaces them with a single custom UI widget. The hidden widgets must still exist so `widgets_values` serialization sends all 8 values to Python.

### Recommended Approach: Single STRING Input with JSON Value

Restructure the Python backend to accept a single JSON string containing all slider values, then unpack it server-side.

#### Python Backend Changes (`cxsliderbank.py`)

**V3 schema** — replace 8 inputs with 1:

```python
@classmethod
def define_schema(cls) -> io.Schema:
    return io.Schema(
        node_id="cxSliderBankInt",
        display_name="cxSliderBank - Int",
        category="utils/cxSliders",
        inputs=[
            io.String.Input(
                "values",
                default='{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0,"s6":0,"s7":0,"s8":0}',
                multiline=False,
            ),
            io.Int.Input("slider_count", default=3, min=1, max=8, step=1),
        ],
        outputs=[
            io.Int.Output(display_name=f"OUT_{i}") for i in range(1, 9)
        ],
    )

@classmethod
def execute(cls, values: str, slider_count: int) -> io.NodeOutput:
    import json
    data = json.loads(values)
    results = []
    for i in range(1, 9):
        raw = data.get(f"s{i}", 0)
        results.append(int(round(raw)))
    return io.NodeOutput(*results)
```

**V1 schema** — same restructuring for fallback classes.

#### JavaScript Changes (`cxsliderbank.js`)

Replace the 8 hidden widgets with a single custom widget whose `value` is an object:

```javascript
class CxSliderBankWidget extends CxNumericWidget {
  constructor(name, isInteger) {
    const defaultValues = {};
    for (let i = 1; i <= 8; i++) defaultValues[`s${i}`] = isInteger ? 0 : 0.0;
    super(name, defaultValues, isInteger, { serialize: true });
  }

  serializeValue(node, index) {
    // Framework sends this to Python as the "values" input
    return JSON.stringify(this.value);
  }
}
```

In `onNodeCreated`: remove the framework's auto-created `values` and `slider_count` widgets, add the custom bank widget.

#### Workflow Compatibility

This is a **breaking change** to the node's input schema. Old workflows with `slider_1..8` inputs won't load correctly. Options:

1. **Node replacement migration** (V3 API) — register `io.NodeReplace` mapping old input names to new
2. **JS `onConfigure` migration** — detect old `widgets_values` format (8 numbers) and convert to JSON object
3. **Bump to v3.0.0** — major version signals breaking change

Recommended: option 2 (JS migration) + option 3 (major version bump if needed, or minor if migration is seamless).

### Alternative: Keep Hidden Widgets (Documented Exception)

If the breaking change is undesirable, keep the current pattern but document it explicitly:

```javascript
// NOTE: Hidden widget pattern intentionally preserved here.
// SliderBank requires 8 separate backend inputs (slider_1..8), each needing
// its own framework widget for serialization. The custom UI widget draws
// mini-sliders and updates these hidden widgets. This is the only node in
// the pack that uses this pattern — all single-value nodes use the correct
// custom widget approach.
```

Add to CLAUDE.md anti-pattern table: "Exception: cxSliderBank uses hidden widgets for multi-value serialization (documented, no clean alternative without backend restructure)."

### Decision Required

- **Option A**: Full restructure (single JSON input) — cleanest, but breaking change
- **Option B**: Keep hidden widgets with documentation — pragmatic, no breakage

---

## Item 4: Fix `pyproject.toml` for Registry Publishing

### Problem

```toml
[project.urls]
Repository = "http://192.168.1.163:3003/am_Vir/comfyui-cx_sliders"
```

This points to a local Gitea server. The ComfyUI registry requires a publicly accessible URL per `09-registry-publishing.md`.

### Changes

```toml
[project.urls]
Repository = "https://github.com/<user>/comfyui-cx_sliders"
"Bug Tracker" = "https://github.com/<user>/comfyui-cx_sliders/issues"
```

Update with actual public repository URL when available. Also add `"Bug Tracker"` (recommended by registry spec).

---

## Item 5: Add `SEARCH_ALIASES` to All Nodes

### Problem

No nodes define `SEARCH_ALIASES`, reducing discoverability in the ComfyUI add-node menu. Per `03-backend-properties.md`, this is an optional `list[str]` that adds alternative search terms.

### Changes

Add to each **V1 class** (V3 equivalent is not yet documented — may need testing):

| Node | Aliases |
|------|---------|
| `cxSliderInt` | `["slider", "range", "integer slider", "cx slider"]` |
| `cxSliderFloat` | `["slider", "range", "float slider", "cx slider"]` |
| `cxDialInt` | `["dial", "knob", "rotary", "integer dial", "cx dial"]` |
| `cxDialFloat` | `["dial", "knob", "rotary", "float dial", "cx dial"]` |
| `cxToggle` | `["toggle", "switch", "button", "on off", "cx toggle"]` |
| `cxSeed` | `["seed", "random seed", "cx seed"]` |
| `cxSliderBankInt` | `["slider bank", "multi slider", "cx bank"]` |
| `cxSliderBankFloat` | `["slider bank", "multi slider", "cx bank"]` |

### Example

```python
class cxSliderInt_V1:
    CATEGORY = "utils/cxSliders"
    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("INT",)
    FUNCTION = "execute"
    SEARCH_ALIASES = ["slider", "range", "integer slider", "cx slider"]
```

---

## Item 6: Add Node Help Pages

### Problem

No per-node help documentation exists. ComfyUI auto-discovers markdown files in `web/docs/` and shows them in the node tooltip UI. Per `08-node-docs-templates-subgraphs.md`.

### Directory Structure

```
web/
└── docs/
    ├── cxSliderInt.md
    ├── cxSliderFloat.md
    ├── cxDialInt.md
    ├── cxDialFloat.md
    ├── cxToggle.md
    ├── cxSeed.md
    ├── cxSliderBankInt.md
    └── cxSliderBankFloat.md
```

File names **must match `NODE_CLASS_MAPPINGS` keys** exactly (case-sensitive).

### Content Template

Each help page should cover:

```markdown
# cxSlider - Int

Horizontal slider widget for integer values.

## Inputs

| Name | Type | Description |
|------|------|-------------|
| value | INT | The slider value (default: 1, range: 0–100) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| INT | INT | Pass-through of the slider value |

## Properties (Right-Click Menu)

- **Fill Color** — Slider bar fill color
- **Border Color** — Widget border color
- **Text Color** — Value label color (`auto` = contrast-based)
- **min/max/step** — Value range and increment (edit via Properties panel)
- **snap** — Lock to step increments (toggle with Shift during drag)
- **padding** — Number format padding (e.g., `"000"` for leading zeros)

## Interaction

- **Click + drag** — Adjust value
- **Double-click** — Type a precise value
- **Shift + drag** — Toggle snap behavior

## Reset

Right-click → "↺ Reset to Defaults" restores all properties to factory values.
```

### Notes

- Locale support (`web/docs/cxSliderInt/en.md`, `zh.md`, etc.) can be added later
- Simple English-only `.md` files serve as the fallback for all locales

---

## Item 7: Add Example Workflows

### Problem

No example workflows exist. ComfyUI auto-discovers `.json` files in `example_workflows/` and serves them via the template browser. Per `08-node-docs-templates-subgraphs.md`.

### Directory Structure

```
example_workflows/
├── cx_sliders_basic.json         — One of each node type, wired to a basic pipeline
├── cx_sliders_basic.jpg          — Screenshot thumbnail (optional, matches filename)
├── cx_slider_bank_demo.json      — SliderBank controlling multiple parameters
└── cx_slider_bank_demo.jpg
```

### Valid Directory Names

Any of: `example_workflows`, `workflow`, `workflows`, `example`, `examples`

Recommended: `example_workflows` (most common convention).

### Workflow Creation

Workflows must be exported from ComfyUI as standard `.json` files. Thumbnails are `.jpg` with matching filenames (before extension).

### Minimum Set

1. **Basic showcase** — one cxSlider, one cxDial, one cxToggle, one cxSeed, demonstrating typical connections
2. **Slider bank demo** — cxSliderBank controlling multiple sampler/model parameters

---

## Item 8: Add `pyproject.toml` Classifiers

### Problem

No classifiers defined. Per `09-registry-publishing.md`, classifiers are recommended for registry discoverability.

### Changes

```toml
[project]
name = "comfyui-cx-sliders"
version = "2.1.0"
description = "Visual slider, dial, toggle, seed, and slider bank controls for ComfyUI"
license = {file = "LICENSE"}
requires-python = ">=3.8"
classifiers = [
    "Operating System :: OS Independent",
]
```

Only `Operating System :: OS Independent` applies — this pack has no GPU requirements, no OS-specific code, no special environment needs.

---

## Implementation Order

Recommended sequence (dependencies noted):

1. **Item 2** (extension names) — trivial, no dependencies
2. **Item 8** (classifiers) — trivial, no dependencies
3. **Item 5** (SEARCH_ALIASES) — trivial, no dependencies
4. **Item 4** (repository URL) — blocked on having a public repo
5. **Item 1** (context menu migration) — medium effort, test thoroughly
6. **Item 6** (help pages) — medium effort, independent
7. **Item 7** (example workflows) — requires manual ComfyUI interaction
8. **Item 3** (slider bank) — highest effort, decision needed on approach

Items 1–3 and 5 would constitute a version bump. If item 3 uses the breaking restructure (Option A), bump to **v3.0.0**. If item 3 uses the documented exception (Option B), bump to **v2.2.0**.

---

## References

- `06-javascript-extensions.md` — Extension registration, hooks, naming
- `08-node-docs-templates-subgraphs.md` — Help pages, workflow templates
- `09-registry-publishing.md` — pyproject.toml spec, classifiers, security
- `11-i18n-and-context-menu-migration.md` — Deprecated context menu patterns
- `03-backend-properties.md` — SEARCH_ALIASES, RETURN_NAMES, VALIDATE_INPUTS
- `widget-serialization-finding.md` — Widget value serialization behavior
