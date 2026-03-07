# Tasks: Standards Compliance Update v3.0.0

## Phase 1: Implementation

Focus: File-by-file changes following dependency order (Items 2, 8, 5, 1, 3, 6, version bump). Since no test framework exists, quality checkpoints use syntax validation.

### Item 2: Extension Name Standardization

- [x] 1.1 [P] Rename extension name in cxslider.js
  - **Do**:
    1. In `js/cxslider.js` L108, change `name: "cxSlider"` to `name: "cx.sliders.slider"`
  - **Files**: `js/cxslider.js`
  - **Done when**: Extension name string is `"cx.sliders.slider"`
  - **Verify**: `grep -q '"cx.sliders.slider"' "D:/ai/comfyui-cx_sliders/js/cxslider.js" && echo PASS`
  - **Commit**: `feat(slider): rename extension to cx.sliders.slider`
  - _Requirements: FR-7, AC-2.1_
  - _Design: Item 2_

- [x] 1.2 [P] Rename extension name in cxdial.js
  - **Do**:
    1. In `js/cxdial.js` L168, change `name: "cxDial"` to `name: "cx.sliders.dial"`
  - **Files**: `js/cxdial.js`
  - **Done when**: Extension name string is `"cx.sliders.dial"`
  - **Verify**: `grep -q '"cx.sliders.dial"' "D:/ai/comfyui-cx_sliders/js/cxdial.js" && echo PASS`
  - **Commit**: `feat(dial): rename extension to cx.sliders.dial`
  - _Requirements: FR-7, AC-2.2_
  - _Design: Item 2_

- [x] 1.3 [P] Rename extension name in cxtoggle.js
  - **Do**:
    1. In `js/cxtoggle.js` L127, change `name: "cx.toggle"` to `name: "cx.sliders.toggle"`
  - **Files**: `js/cxtoggle.js`
  - **Done when**: Extension name string is `"cx.sliders.toggle"`
  - **Verify**: `grep -q '"cx.sliders.toggle"' "D:/ai/comfyui-cx_sliders/js/cxtoggle.js" && echo PASS`
  - **Commit**: `feat(toggle): rename extension to cx.sliders.toggle`
  - _Requirements: FR-7, AC-2.3_
  - _Design: Item 2_

- [x] 1.4 [P] Rename extension name in cxseed.js
  - **Do**:
    1. In `js/cxseed.js` L164, change `name: "cxSeed"` to `name: "cx.sliders.seed"`
  - **Files**: `js/cxseed.js`
  - **Done when**: Extension name string is `"cx.sliders.seed"`
  - **Verify**: `grep -q '"cx.sliders.seed"' "D:/ai/comfyui-cx_sliders/js/cxseed.js" && echo PASS`
  - **Commit**: `feat(seed): rename extension to cx.sliders.seed`
  - _Requirements: FR-7, AC-2.4_
  - _Design: Item 2_

- [x] 1.5 [P] Rename extension name in cxsliderbank.js
  - **Do**:
    1. In `js/cxsliderbank.js` L226, change `name: "cxSliderBank"` to `name: "cx.sliders.sliderbank"`
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: Extension name string is `"cx.sliders.sliderbank"`
  - **Verify**: `grep -q '"cx.sliders.sliderbank"' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): rename extension to cx.sliders.sliderbank`
  - _Requirements: FR-7, AC-2.5_
  - _Design: Item 2_

- [ ] 1.6 [VERIFY] Quality checkpoint: JS syntax after extension renames
  - **Do**: Syntax-check all 5 renamed JS files
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in js/cxslider.js js/cxdial.js js/cxtoggle.js js/cxseed.js js/cxsliderbank.js; do node --input-type=module --check < "$f" || exit 1; done && echo PASS`
  - **Done when**: All 5 JS files pass syntax check
  - **Commit**: `chore(ext-names): pass quality checkpoint` (only if fixes needed)

### Item 8: Registry Metadata

- [x] 1.7 Add classifiers to pyproject.toml
  - **Do**:
    1. In `pyproject.toml`, add `classifiers = ["Operating System :: OS Independent"]` under `[project]` section, after the `requires-python` line (after L6)
    2. Do NOT modify `[project.urls]` section
  - **Files**: `pyproject.toml`
  - **Done when**: `classifiers` field present with correct value
  - **Verify**: `grep -q 'Operating System :: OS Independent' "D:/ai/comfyui-cx_sliders/pyproject.toml" && echo PASS`
  - **Commit**: `feat(registry): add OS Independent classifier to pyproject.toml`
  - _Requirements: FR-17, AC-6.1, AC-6.2_
  - _Design: Item 8_

### Item 5: Search Aliases

- [x] 1.8 [P] Add SEARCH_ALIASES to cxsliders.py (V1 + V3)
  - **Do**:
    1. Add `SEARCH_ALIASES = ["slider", "range", "integer slider", "cx slider"]` to V1 `cxSliderInt` class (after CATEGORY L128)
    2. Add `SEARCH_ALIASES = ["slider", "range", "float slider", "cx slider"]` to V1 `cxSliderFloat` class (after CATEGORY L158)
    3. Add `search_aliases=["slider", "range", "integer slider", "cx slider"]` to V3 `cxSliderInt.define_schema()` return
    4. Add `search_aliases=["slider", "range", "float slider", "cx slider"]` to V3 `cxSliderFloat.define_schema()` return
  - **Files**: `cxsliders.py`
  - **Done when**: All 4 alias declarations present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -c "SEARCH_ALIASES\|search_aliases" cxsliders.py | grep -q "4" && python -c "import ast; ast.parse(open('cxsliders.py').read())" && echo PASS`
  - **Commit**: `feat(slider): add search aliases to cxSliderInt and cxSliderFloat`
  - _Requirements: FR-14, FR-15, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Item 5_

- [x] 1.9 [P] Add SEARCH_ALIASES to cxdial.py (V1 + V3)
  - **Do**:
    1. Add `SEARCH_ALIASES = ["dial", "knob", "rotary", "integer dial", "cx dial"]` to V1 `cxDialInt` class (after CATEGORY L127)
    2. Add `SEARCH_ALIASES = ["dial", "knob", "rotary", "float dial", "cx dial"]` to V1 `cxDialFloat` class (after CATEGORY L157)
    3. Add `search_aliases=["dial", "knob", "rotary", "integer dial", "cx dial"]` to V3 `cxDialInt.define_schema()`
    4. Add `search_aliases=["dial", "knob", "rotary", "float dial", "cx dial"]` to V3 `cxDialFloat.define_schema()`
  - **Files**: `cxdial.py`
  - **Done when**: All 4 alias declarations present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -c "SEARCH_ALIASES\|search_aliases" cxdial.py | grep -q "4" && python -c "import ast; ast.parse(open('cxdial.py').read())" && echo PASS`
  - **Commit**: `feat(dial): add search aliases to cxDialInt and cxDialFloat`
  - _Requirements: FR-14, FR-15, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Item 5_

- [x] 1.10 [P] Add SEARCH_ALIASES to cxtoggle.py (V1 + V3)
  - **Do**:
    1. Add `SEARCH_ALIASES = ["toggle", "switch", "button", "on off", "cx toggle"]` to V1 `cxToggle` class (after CATEGORY L93)
    2. Add `search_aliases=["toggle", "switch", "button", "on off", "cx toggle"]` to V3 `cxToggle.define_schema()`
  - **Files**: `cxtoggle.py`
  - **Done when**: Both alias declarations present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -c "SEARCH_ALIASES\|search_aliases" cxtoggle.py | grep -q "2" && python -c "import ast; ast.parse(open('cxtoggle.py').read())" && echo PASS`
  - **Commit**: `feat(toggle): add search aliases to cxToggle`
  - _Requirements: FR-14, FR-15, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Item 5_

- [x] 1.11 [P] Add SEARCH_ALIASES to cxseed.py (V1 + V3)
  - **Do**:
    1. Add `SEARCH_ALIASES = ["seed", "random seed", "cx seed"]` to V1 `cxSeed` class (after CATEGORY L97)
    2. Add `search_aliases=["seed", "random seed", "cx seed"]` to V3 `cxSeed.define_schema()`
  - **Files**: `cxseed.py`
  - **Done when**: Both alias declarations present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -c "SEARCH_ALIASES\|search_aliases" cxseed.py | grep -q "2" && python -c "import ast; ast.parse(open('cxseed.py').read())" && echo PASS`
  - **Commit**: `feat(seed): add search aliases to cxSeed`
  - _Requirements: FR-14, FR-15, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Item 5_

- [x] 1.12 Add SEARCH_ALIASES to cxsliderbank.py (V1 + V3)
  - **Do**:
    1. Add `SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]` to V1 `cxSliderBankInt` class (after CATEGORY L147)
    2. Add `SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]` to V1 `cxSliderBankFloat` class (after CATEGORY L177)
    3. Add `search_aliases=["slider bank", "multi slider", "cx bank"]` to V3 `cxSliderBankInt.define_schema()`
    4. Add `search_aliases=["slider bank", "multi slider", "cx bank"]` to V3 `cxSliderBankFloat.define_schema()`
  - **Files**: `cxsliderbank.py`
  - **Done when**: All 4 alias declarations present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -c "SEARCH_ALIASES\|search_aliases" cxsliderbank.py | grep -q "4" && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && echo PASS`
  - **Commit**: `feat(sliderbank): add search aliases to cxSliderBankInt and cxSliderBankFloat`
  - _Requirements: FR-14, FR-15, AC-4.1, AC-4.2, AC-4.3_
  - _Design: Item 5_

- [ ] 1.13 [VERIFY] Quality checkpoint: Python syntax after search aliases
  - **Do**: Syntax-check all 5 Python files that were modified
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in cxsliders.py cxdial.py cxtoggle.py cxseed.py cxsliderbank.py; do python -c "import ast; ast.parse(open('$f').read())" || exit 1; done && echo PASS`
  - **Done when**: All 5 Python files pass AST parse
  - **Commit**: `chore(aliases): pass quality checkpoint` (only if fixes needed)

### Item 1: Context Menu Migration

- [x] 1.14 Rename _buildColorMenu to _buildColorMenuItems in cx_base_widget.js
  - **Do**:
    1. In `js/cx_base_widget.js` L244, rename method `_buildColorMenu` to `_buildColorMenuItems`
    2. Keep signature and body identical (push-based, `options` + `labelPrefix` params)
  - **Files**: `js/cx_base_widget.js`
  - **Done when**: Method named `_buildColorMenuItems`, no `_buildColorMenu` references remain in file
  - **Verify**: `grep -q '_buildColorMenuItems' "D:/ai/comfyui-cx_sliders/js/cx_base_widget.js" && ! grep -q '_buildColorMenu[^I]' "D:/ai/comfyui-cx_sliders/js/cx_base_widget.js" && echo PASS`
  - **Commit**: `refactor(base-widget): rename _buildColorMenu to _buildColorMenuItems`
  - _Requirements: FR-4, AC-1.5_
  - _Design: Item 1 - _buildColorMenu rename_

- [ ] 1.15 [VERIFY] Quality checkpoint: cx_base_widget.js syntax
  - **Do**: Syntax-check base widget after rename
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cx_base_widget.js" && echo PASS`
  - **Done when**: JS syntax valid
  - **Commit**: `chore(base-widget): pass quality checkpoint` (only if fixes needed)

- [x] 1.16 Migrate cxslider.js: remove getExtraMenuOptions, add getNodeMenuItems
  - **Do**:
    1. Remove entire `nodeType.prototype.getExtraMenuOptions = function(canvas, options) { ... };` block (L188-209) from inside `beforeRegisterNodeDef`
    2. Add `getNodeMenuItems(node)` as top-level property on the extension object (same level as `name`, `beforeRegisterNodeDef`)
    3. Guard: `const isInteger = SLIDER_NODES[node.comfyClass]; if (isInteger === undefined) return;`
    4. Find widget: `const w = node.widgets?.find(w => w.name === "value"); if (!w) return;`
    5. Build items array: `const items = []; w._buildColorMenuItems(items, "Slider");`
    6. Add reset item with same defaults as current getExtraMenuOptions callback
    7. Return `items`
  - **Files**: `js/cxslider.js`
  - **Done when**: No `getExtraMenuOptions` in file; `getNodeMenuItems` present as extension property
  - **Verify**: `! grep -q 'getExtraMenuOptions' "D:/ai/comfyui-cx_sliders/js/cxslider.js" && grep -q 'getNodeMenuItems' "D:/ai/comfyui-cx_sliders/js/cxslider.js" && echo PASS`
  - **Commit**: `feat(slider): migrate context menu to getNodeMenuItems`
  - _Requirements: FR-1, FR-2, FR-3, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.8_
  - _Design: Item 1 - getNodeMenuItems pattern_

- [x] 1.17 Migrate cxdial.js: remove getExtraMenuOptions, add getNodeMenuItems
  - **Do**:
    1. Remove entire `nodeType.prototype.getExtraMenuOptions = function(canvas, options) { ... };` block (L235-256) from inside `beforeRegisterNodeDef`
    2. Add `getNodeMenuItems(node)` as top-level extension property
    3. Guard: `const isInteger = DIAL_NODES[node.comfyClass]; if (isInteger === undefined) return;`
    4. Find widget: `const w = node.widgets?.find(w => w.name === "value"); if (!w) return;`
    5. Build items: `const items = []; w._buildColorMenuItems(items, "Dial");`
    6. Add reset item with dial-specific defaults
    7. Return `items`
  - **Files**: `js/cxdial.js`
  - **Done when**: No `getExtraMenuOptions` in file; `getNodeMenuItems` present
  - **Verify**: `! grep -q 'getExtraMenuOptions' "D:/ai/comfyui-cx_sliders/js/cxdial.js" && grep -q 'getNodeMenuItems' "D:/ai/comfyui-cx_sliders/js/cxdial.js" && echo PASS`
  - **Commit**: `feat(dial): migrate context menu to getNodeMenuItems`
  - _Requirements: FR-1, FR-2, FR-3, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.8_
  - _Design: Item 1 - getNodeMenuItems pattern_

- [ ] 1.18 [VERIFY] Quality checkpoint: cxslider.js + cxdial.js syntax
  - **Do**: Syntax-check both migrated files
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxslider.js" && node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxdial.js" && echo PASS`
  - **Done when**: Both JS files pass syntax check
  - **Commit**: `chore(menu-migration): pass quality checkpoint` (only if fixes needed)

- [x] 1.19 Migrate cxtoggle.js: remove getExtraMenuOptions, add getNodeMenuItems
  - **Do**:
    1. Remove entire `nodeType.prototype.getExtraMenuOptions = function(canvas, options) { ... };` block (L172-210) from inside `beforeRegisterNodeDef`
    2. Add `getNodeMenuItems(node)` as top-level extension property
    3. Guard: `if (node.comfyClass !== "cxToggle") return;`
    4. Build inline color picker items (Fill/Border/Text) using `openColorPicker` -- same logic as current block but in return-array form
    5. Add reset item with toggle-specific defaults
    6. Return array with `null` separator before color items
  - **Files**: `js/cxtoggle.js`
  - **Done when**: No `getExtraMenuOptions` in file; `getNodeMenuItems` present with inline color pickers
  - **Verify**: `! grep -q 'getExtraMenuOptions' "D:/ai/comfyui-cx_sliders/js/cxtoggle.js" && grep -q 'getNodeMenuItems' "D:/ai/comfyui-cx_sliders/js/cxtoggle.js" && echo PASS`
  - **Commit**: `feat(toggle): migrate context menu to getNodeMenuItems`
  - _Requirements: FR-1, FR-2, FR-5, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.6_
  - _Design: Item 1 - cxToggle pattern_

- [x] 1.20 Migrate cxseed.js: remove getExtraMenuOptions, add getNodeMenuItems
  - **Do**:
    1. Remove entire `nodeType.prototype.getExtraMenuOptions = function(canvas, options) { ... };` block (L233-259) from inside `beforeRegisterNodeDef`
    2. Add `getNodeMenuItems(node)` as top-level extension property
    3. Guard: `if (node.comfyClass !== "cxSeed") return;`
    4. Find button widget: `const btnWidget = node.widgets?.find(w => w.name === "cx_seed_buttons");`
    5. Return array with "Randomize Seed Now" and "Reset to Defaults" items (with `null` separator)
  - **Files**: `js/cxseed.js`
  - **Done when**: No `getExtraMenuOptions` in file; `getNodeMenuItems` present with seed-specific items
  - **Verify**: `! grep -q 'getExtraMenuOptions' "D:/ai/comfyui-cx_sliders/js/cxseed.js" && grep -q 'getNodeMenuItems' "D:/ai/comfyui-cx_sliders/js/cxseed.js" && echo PASS`
  - **Commit**: `feat(seed): migrate context menu to getNodeMenuItems`
  - _Requirements: FR-1, FR-2, FR-6, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.6_
  - _Design: Item 1 - cxSeed pattern_

- [ ] 1.21 [VERIFY] Quality checkpoint: cxtoggle.js + cxseed.js syntax
  - **Do**: Syntax-check both migrated files
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxtoggle.js" && node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxseed.js" && echo PASS`
  - **Done when**: Both JS files pass syntax check
  - **Commit**: `chore(menu-migration): pass quality checkpoint` (only if fixes needed)

- [x] 1.22 Migrate cxsliderbank.js menu: remove getExtraMenuOptions, add getNodeMenuItems
  - **Do**:
    1. Remove entire `nodeType.prototype.getExtraMenuOptions = function(canvas, options) { ... };` block (L276-305) from inside `beforeRegisterNodeDef`
    2. Add `getNodeMenuItems(node)` as top-level extension property
    3. Guard: `const isInteger = BANK_NODES[node.comfyClass]; if (isInteger === undefined) return;`
    4. Find widget: `const bankWidget = node.widgets?.find(w => w.name === "cx_bank_ui"); if (!bankWidget) return;`
    5. Build items: `const items = []; bankWidget._buildColorMenuItems(items, "Slider Bank");`
    6. Add reset item -- for now keep referencing hidden widgets (`slider_${i}`) since Item 3 hasn't been applied yet
    7. Return `items`
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: No `getExtraMenuOptions` in file; `getNodeMenuItems` present
  - **Verify**: `! grep -q 'getExtraMenuOptions' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && grep -q 'getNodeMenuItems' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): migrate context menu to getNodeMenuItems`
  - _Requirements: FR-1, FR-2, FR-3, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.8_
  - _Design: Item 1 - getNodeMenuItems pattern_

- [ ] 1.23 [VERIFY] Quality checkpoint: all JS files syntax after full menu migration
  - **Do**: Syntax-check all 7 JS files
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in js/cx_base_widget.js js/cx_utils.js js/cxslider.js js/cxdial.js js/cxtoggle.js js/cxseed.js js/cxsliderbank.js; do node --input-type=module --check < "$f" || exit 1; done && echo PASS`
  - **Done when**: All 7 JS files pass syntax check
  - **Commit**: `chore(menu-migration): pass full JS quality checkpoint` (only if fixes needed)

### Item 3: Slider Bank Restructure (BREAKING)

#### Python Backend

- [x] 1.24 Replace 8 slider inputs with single JSON input in cxSliderBankInt V1
  - **Do**:
    1. Replace the `INPUT_TYPES` loop (L134-142) that creates `slider_1` through `slider_8` with a single `"values"` STRING input with default `'{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0,"s6":0,"s7":0,"s8":0}'`
    2. Replace `execute` method (L149-153): accept `*, values: str`, parse JSON with `json.loads`, extract `s1..s8`, return 8 `int(round())` values
    3. Add error handling: wrap `json.loads` in try/except, raise `ValueError` on malformed JSON
  - **Files**: `cxsliderbank.py`
  - **Done when**: V1 `cxSliderBankInt` has single `values` STRING input, no `slider_N` inputs
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -q '"values"' cxsliderbank.py && ! grep 'slider_1.*INT' cxsliderbank.py | grep -qv '#' && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && echo PASS`
  - **Commit**: `feat(sliderbank)!: replace 8 int inputs with single JSON values input (V1)`
  - _Requirements: FR-8, FR-10, AC-3.1, AC-3.2, AC-3.3, AC-3.13_
  - _Design: Item 3 - V1 Python schema_

- [ ] 1.25 Replace 8 slider inputs with single JSON input in cxSliderBankFloat V1
  - **Do**:
    1. Replace the `INPUT_TYPES` loop (L163-172) that creates `slider_1` through `slider_8` FLOAT inputs with single `"values"` STRING input (same default JSON as Int but with 0.0 values)
    2. Replace `execute` method (L179-183): accept `*, values: str`, parse JSON, extract `s1..s8`, return 8 `float()` values
    3. Add error handling: raise `ValueError` on malformed JSON
  - **Files**: `cxsliderbank.py`
  - **Done when**: V1 `cxSliderBankFloat` has single `values` STRING input
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && echo PASS`
  - **Commit**: `feat(sliderbank)!: replace 8 float inputs with single JSON values input (V1)`
  - _Requirements: FR-8, FR-10, AC-3.1, AC-3.2, AC-3.3, AC-3.13_
  - _Design: Item 3 - V1 Python schema_

- [ ] 1.26 Replace 8 V3 slider inputs with single JSON input in cxSliderBankInt V3
  - **Do**:
    1. Replace the 8 `io.Int.Input("slider_N", ...)` lines (L30-37) with single `io.String.Input("values", default='{"s1":0,...,"s8":0}', multiline=False)`
    2. Add `search_aliases` if not already present (should be from task 1.12)
    3. Replace `execute` classmethod: accept `*, values: str`, parse JSON, return `io.NodeOutput(*)` with 8 int values
    4. Add error handling: raise `ValueError` on malformed JSON
  - **Files**: `cxsliderbank.py`
  - **Done when**: V3 `cxSliderBankInt` has single String input, `execute` parses JSON
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && echo PASS`
  - **Commit**: `feat(sliderbank)!: replace 8 int inputs with single JSON values input (V3)`
  - _Requirements: FR-9, FR-10, AC-3.1, AC-3.2, AC-3.3, AC-3.13_
  - _Design: Item 3 - V3 Python schema_

- [ ] 1.27 Replace 8 V3 slider inputs with single JSON input in cxSliderBankFloat V3
  - **Do**:
    1. Replace the 8 `io.Float.Input("slider_N", ...)` lines (L73-80) with single `io.String.Input("values", default='{"s1":0.0,...,"s8":0.0}', multiline=False)`
    2. Replace `execute` classmethod: accept `*, values: str`, parse JSON, return `io.NodeOutput(*)` with 8 float values
    3. Add error handling: raise `ValueError` on malformed JSON
  - **Files**: `cxsliderbank.py`
  - **Done when**: V3 `cxSliderBankFloat` has single String input
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && echo PASS`
  - **Commit**: `feat(sliderbank)!: replace 8 float inputs with single JSON values input (V3)`
  - _Requirements: FR-9, FR-10, AC-3.1, AC-3.2, AC-3.3, AC-3.13_
  - _Design: Item 3 - V3 Python schema_

- [ ] 1.28 [VERIFY] Quality checkpoint: cxsliderbank.py full syntax + no slider_N inputs
  - **Do**: Verify Python syntax and that no old `slider_N` input patterns remain
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && python -c "import ast; ast.parse(open('cxsliderbank.py').read())" && ! grep -q 'slider_1\|slider_2\|slider_3' cxsliderbank.py && echo PASS`
  - **Done when**: Python parses, no `slider_N` references remain
  - **Commit**: `chore(sliderbank): pass quality checkpoint` (only if fixes needed)

#### JavaScript Frontend

- [ ] 1.29 Update CxSliderBankWidget constructor: name, value, serialize
  - **Do**:
    1. Change constructor (L16-18): widget name parameter from hardcoded to accept `name` but callers will pass `"values"`
    2. Change default value from `0` to an object: `const defaultObj = {}; for (let i = 1; i <= 8; i++) defaultObj[\`s${i}\`] = 0;`
    3. Change `serialize: false` to `serialize: true` (or remove the option since true is default)
    4. Pass `defaultObj` to `super()` instead of `0`
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: Constructor creates object default value, serialize enabled
  - **Verify**: `grep -q 'serialize.*true\|{ serialize: true }' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" || ! grep -q 'serialize.*false' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): update widget constructor for JSON value pattern`
  - _Requirements: FR-11, AC-3.5_
  - _Design: Item 3 - Constructor change_

- [ ] 1.30 Add serializeValue and deserializeValue methods
  - **Do**:
    1. Add `serializeValue(node, index)` method that returns `JSON.stringify(this.value)`
    2. Add `deserializeValue(value)` method: if `typeof value === 'string'`, try `JSON.parse`, if result is non-array object set `this.value = parsed`; otherwise keep current value (default zeros)
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: Both methods present on CxSliderBankWidget class
  - **Verify**: `grep -q 'serializeValue' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && grep -q 'deserializeValue' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): add serializeValue/deserializeValue for JSON`
  - _Requirements: FR-12, AC-3.6_
  - _Design: Item 3 - Serialization_

- [ ] 1.31 Update mini-slider read/write to use this.value object
  - **Do**:
    1. In `_draw` method around L53-54: replace `const hiddenWidget = node.widgets?.find(w => w.name === \`slider_${index + 1}\`); const val = hiddenWidget?.value ?? 0;` with `const val = this.value[\`s${index + 1}\`] ?? 0;`
    2. In `_updateMiniSlider` L105-112: replace hidden widget lookup and assignment with `this.value[\`s${index + 1}\`] = value;`
    3. In `_onDblClick` L115-140: replace hidden widget lookup with `const currentVal = this.value[\`s${i + 1}\`] ?? 0;` and assignment with `this.value[\`s${i + 1}\`] = clamp(num, this._min, this._max);`
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: No `hiddenWidget` references remain; all read/write uses `this.value[...]`
  - **Verify**: `! grep -q 'hiddenWidget' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): mini-sliders read/write this.value directly`
  - _Requirements: FR-11, AC-3.7_
  - _Design: Item 3 - Mini-slider read/write_

- [ ] 1.32 [VERIFY] Quality checkpoint: cxsliderbank.js syntax mid-restructure
  - **Do**: Syntax-check after core widget changes
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Done when**: JS syntax valid
  - **Commit**: `chore(sliderbank): pass quality checkpoint` (only if fixes needed)

- [ ] 1.33 Update onNodeCreated: remove hidden widget loop, use "values" widget name
  - **Do**:
    1. Remove the hidden widget loop (L236-243): `for (let i = 1; i <= 8; i++) { ... w.hidden = true; w.computeSize = () => [0, -4]; ... }`
    2. Replace with: find and remove framework-created `"values"` widget (STRING type), then splice custom `CxSliderBankWidget("values", isInteger)` at same index
    3. Keep property defaults assignment unchanged
    4. Keep `_reconcileOutputs`, `setSize`, output label lowercasing
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: No `w.hidden = true` or `computeSize = () => [0, -4]` in file; widget created with name `"values"`
  - **Verify**: `! grep -q 'w.hidden' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && ! grep -q 'computeSize.*\[0.*-4\]' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && grep -q '"values"' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank)!: remove hidden widget loop, use single values widget`
  - _Requirements: FR-11, AC-3.4, AC-3.5_
  - _Design: Item 3 - onNodeCreated change_

- [ ] 1.34 Update onConfigure: add v2.x migration for 8-number widgets_values
  - **Do**:
    1. Keep existing v1.x property-based migration (`info.properties?.value_1`)
    2. Add v2.x migration block: if `wv && wv.length >= 2 && typeof wv[0] === 'number'`, build migrated object from array values, set `bankWidget.value = migrated`
    3. Update widget lookup from `w.name === "cx_bank_ui"` to `w.name === "values"` throughout onConfigure
    4. Update hidden widget references in v1.x migration (`slider_${i}`) to set `bankWidget.value[\`s${i}\`]` instead
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: onConfigure handles both v1.x property migration and v2.x 8-number migration; references `"values"` widget
  - **Verify**: `grep -q 'typeof wv\[0\].*number' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && grep -q 'migrated v2.x' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): add v2.x migration in onConfigure`
  - _Requirements: FR-13, AC-3.10, AC-3.12_
  - _Design: Item 3 - onConfigure migration_

- [ ] 1.35 Update onPropertyChanged: use this.value instead of hidden widgets
  - **Do**:
    1. In `onPropertyChanged` handler (L336+): replace hidden widget lookups (`this.widgets?.find(w => w.name === \`slider_${i}\`)`) with `bankWidget.value[\`s${i}\`]` access
    2. Update widget lookup from `"cx_bank_ui"` to `"values"`
    3. Clamp values directly in `bankWidget.value` object
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: onPropertyChanged uses `bankWidget.value[...]` not hidden widget lookups
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): update onPropertyChanged for new value pattern`
  - _Requirements: FR-11, AC-3.7_
  - _Design: Item 3 - onPropertyChanged_

- [ ] 1.36 Update getNodeMenuItems reset callback for new value pattern
  - **Do**:
    1. In the `getNodeMenuItems` reset callback (added in task 1.22): replace hidden widget reset loop (`slider_${i}`) with `bankWidget.value[\`s${i}\`] = isInteger ? 0 : 0.0` loop
    2. Update widget lookup from `"cx_bank_ui"` to `"values"`
  - **Files**: `js/cxsliderbank.js`
  - **Done when**: Reset callback uses `bankWidget.value[...]`, no `slider_${i}` widget lookups remain in file
  - **Verify**: `! grep -q "slider_\${" "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && ! grep -q 'cx_bank_ui' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Commit**: `feat(sliderbank): update reset callback for new value pattern`
  - _Requirements: FR-11, AC-3.7_
  - _Design: Item 3 - Reset callback_

- [ ] 1.37 [VERIFY] Quality checkpoint: full cxsliderbank.js syntax + anti-pattern check
  - **Do**: Syntax-check and verify no anti-patterns remain
  - **Verify**: `node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && ! grep -q 'w\.hidden' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && ! grep -q 'hiddenWidget' "D:/ai/comfyui-cx_sliders/js/cxsliderbank.js" && echo PASS`
  - **Done when**: JS syntax valid, no hidden widget references
  - **Commit**: `chore(sliderbank): pass quality checkpoint` (only if fixes needed)

### Item 6: Help Pages

- [ ] 1.38 Create js/docs/ directory and cxSliderInt.md help page
  - **Do**:
    1. Create `js/docs/` directory
    2. Create `js/docs/cxSliderInt.md` with: description, inputs table (value: INT, default 1), outputs table (INT), properties table (min, max, step, snap, padding, fillColor, borderColor, textColor), interaction patterns (drag, double-click, shift+drag, ctrl+drag), right-click menu (color pickers, reset)
  - **Files**: `js/docs/cxSliderInt.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxSliderInt.md" && grep -q 'Inputs' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderInt.md" && grep -q 'Interaction' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderInt.md" && echo PASS`
  - **Commit**: `docs(slider): add cxSliderInt help page`
  - _Requirements: FR-16, AC-5.1, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.39 [P] Create cxSliderFloat.md help page
  - **Do**:
    1. Create `js/docs/cxSliderFloat.md` -- same structure as Int but with FLOAT type, default 1.0, float-specific step/padding defaults
  - **Files**: `js/docs/cxSliderFloat.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxSliderFloat.md" && grep -q 'FLOAT' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderFloat.md" && echo PASS`
  - **Commit**: `docs(slider): add cxSliderFloat help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.40 [P] Create cxDialInt.md help page
  - **Do**:
    1. Create `js/docs/cxDialInt.md` with: description (circular arc knob), inputs (value: INT), outputs (INT), properties, interaction (drag for angle, double-click to type, shift+drag snap), right-click menu
  - **Files**: `js/docs/cxDialInt.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxDialInt.md" && grep -q 'dial\|knob\|Dial' "D:/ai/comfyui-cx_sliders/js/docs/cxDialInt.md" && echo PASS`
  - **Commit**: `docs(dial): add cxDialInt help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.41 [P] Create cxDialFloat.md help page
  - **Do**:
    1. Create `js/docs/cxDialFloat.md` -- same structure as Int dial but FLOAT type, default 1.0
  - **Files**: `js/docs/cxDialFloat.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxDialFloat.md" && grep -q 'FLOAT' "D:/ai/comfyui-cx_sliders/js/docs/cxDialFloat.md" && echo PASS`
  - **Commit**: `docs(dial): add cxDialFloat help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.42 [P] Create cxToggle.md help page
  - **Do**:
    1. Create `js/docs/cxToggle.md` with: description (discrete state button), inputs (toggle: INT, default 0), outputs (INT), properties (min, max, labels, fillColor, borderColor, textColor), interaction (click to cycle, double-click to type), right-click menu (color pickers, reset)
  - **Files**: `js/docs/cxToggle.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxToggle.md" && grep -q 'toggle\|Toggle' "D:/ai/comfyui-cx_sliders/js/docs/cxToggle.md" && echo PASS`
  - **Commit**: `docs(toggle): add cxToggle help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.43 [P] Create cxSeed.md help page
  - **Do**:
    1. Create `js/docs/cxSeed.md` with: description (seed with recall/randomize buttons), inputs (seed: INT with control_after_generate), outputs (SEED), properties (min, max, max_digits), interaction (emoji buttons), right-click menu (Randomize Seed Now, Reset)
  - **Files**: `js/docs/cxSeed.md`
  - **Done when**: File exists with all required sections
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxSeed.md" && grep -q 'seed\|Seed' "D:/ai/comfyui-cx_sliders/js/docs/cxSeed.md" && echo PASS`
  - **Commit**: `docs(seed): add cxSeed help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3_
  - _Design: Item 6_

- [ ] 1.44 [VERIFY] Quality checkpoint: 6 help pages exist with required sections
  - **Do**: Verify all 6 non-bank help files exist and have required sections
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in cxSliderInt cxSliderFloat cxDialInt cxDialFloat cxToggle cxSeed; do test -f "js/docs/${f}.md" || exit 1; grep -q 'Inputs' "js/docs/${f}.md" || exit 1; grep -q 'Outputs' "js/docs/${f}.md" || exit 1; grep -q 'Properties' "js/docs/${f}.md" || exit 1; done && echo PASS`
  - **Done when**: All 6 files exist with Inputs/Outputs/Properties sections
  - **Commit**: `chore(docs): pass quality checkpoint` (only if fixes needed)

- [ ] 1.45 [P] Create cxSliderBankInt.md help page (post-Item 3 schema)
  - **Do**:
    1. Create `js/docs/cxSliderBankInt.md` with: description (bank of integer sliders), inputs table showing single `values` STRING input (JSON object `{s1:N,...,s8:N}`), 8 INT outputs, properties (sliderCount, min, max, step, snap, padding, labels, fillColor, borderColor, textColor), interaction (drag row, double-click row to type, +/- buttons), right-click menu
  - **Files**: `js/docs/cxSliderBankInt.md`
  - **Done when**: File exists reflecting post-restructure single JSON input schema
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxSliderBankInt.md" && grep -q 'values' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderBankInt.md" && grep -q 'JSON' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderBankInt.md" && echo PASS`
  - **Commit**: `docs(sliderbank): add cxSliderBankInt help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3, AC-5.4_
  - _Design: Item 6_

- [ ] 1.46 [P] Create cxSliderBankFloat.md help page (post-Item 3 schema)
  - **Do**:
    1. Create `js/docs/cxSliderBankFloat.md` -- same structure as Int bank but FLOAT type
  - **Files**: `js/docs/cxSliderBankFloat.md`
  - **Done when**: File exists reflecting post-restructure schema
  - **Verify**: `test -f "D:/ai/comfyui-cx_sliders/js/docs/cxSliderBankFloat.md" && grep -q 'FLOAT' "D:/ai/comfyui-cx_sliders/js/docs/cxSliderBankFloat.md" && echo PASS`
  - **Commit**: `docs(sliderbank): add cxSliderBankFloat help page`
  - _Requirements: FR-16, AC-5.2, AC-5.3, AC-5.4_
  - _Design: Item 6_

### Item 7: Version Bump

- [ ] 1.47 Bump version to 3.0.0 in pyproject.toml
  - **Do**:
    1. Change `version = "2.1.0"` to `version = "3.0.0"` on L3
  - **Files**: `pyproject.toml`
  - **Done when**: Version is 3.0.0
  - **Verify**: `grep -q 'version = "3.0.0"' "D:/ai/comfyui-cx_sliders/pyproject.toml" && echo PASS`
  - **Commit**: `chore(version): bump pyproject.toml to 3.0.0`
  - _Requirements: FR-18, AC-7.1_
  - _Design: Item 7_

- [ ] 1.48 Bump CX_VERSION to 3.0.0 in cx_utils.js
  - **Do**:
    1. Change `CX_VERSION = "2.1.0"` to `CX_VERSION = "3.0.0"` on L7
  - **Files**: `js/cx_utils.js`
  - **Done when**: CX_VERSION is "3.0.0"
  - **Verify**: `grep -q 'CX_VERSION = "3.0.0"' "D:/ai/comfyui-cx_sliders/js/cx_utils.js" && echo PASS`
  - **Commit**: `chore(version): bump CX_VERSION to 3.0.0`
  - _Requirements: FR-18, AC-7.2_
  - _Design: Item 7_

- [ ] 1.49 Update README.md version header to 3.0.0
  - **Do**:
    1. Change `**Version 2.1.0**` to `**Version 3.0.0**` on L3
  - **Files**: `README.md`
  - **Done when**: Version header shows 3.0.0
  - **Verify**: `grep -q 'Version 3.0.0' "D:/ai/comfyui-cx_sliders/README.md" && echo PASS`
  - **Commit**: `chore(version): bump README to 3.0.0`
  - _Requirements: FR-18, AC-7.4_
  - _Design: Item 7_

- [ ] 1.50 Add CHANGELOG.md v3.0.0 section
  - **Do**:
    1. Add `## [3.0.0] - 2026-03-06` section after `## [Unreleased]`
    2. Include subsections: `### Changed` (extension names, context menu API, slider bank schema), `### Added` (search aliases, help pages, OS classifier), `### Breaking` (slider bank: 8 separate inputs replaced with single JSON `values` input)
  - **Files**: `CHANGELOG.md`
  - **Done when**: v3.0.0 section present with breaking change documented
  - **Verify**: `grep -q '\[3.0.0\]' "D:/ai/comfyui-cx_sliders/CHANGELOG.md" && grep -q 'Breaking\|BREAKING' "D:/ai/comfyui-cx_sliders/CHANGELOG.md" && echo PASS`
  - **Commit**: `chore(version): add CHANGELOG v3.0.0 section`
  - _Requirements: FR-18, AC-7.3, AC-7.5_
  - _Design: Item 7_

- [ ] 1.51 [VERIFY] Quality checkpoint: version consistency across all 4 locations
  - **Do**: Verify 3.0.0 appears in all 4 locations
  - **Verify**: `grep -q 'version = "3.0.0"' "D:/ai/comfyui-cx_sliders/pyproject.toml" && grep -q 'CX_VERSION = "3.0.0"' "D:/ai/comfyui-cx_sliders/js/cx_utils.js" && grep -q 'Version 3.0.0' "D:/ai/comfyui-cx_sliders/README.md" && grep -q '\[3.0.0\]' "D:/ai/comfyui-cx_sliders/CHANGELOG.md" && echo PASS`
  - **Done when**: All 4 locations show 3.0.0
  - **Commit**: `chore(version): pass version consistency checkpoint` (only if fixes needed)

## Phase 2: Additional Testing

Skipped -- no test framework available. All validation is via syntax checks and grep-based verification.

## Phase 3: Quality Gates

- [ ] V4 [VERIFY] Full syntax validation: all JS + Python files
  - **Do**: Syntax-check all 7 JS files and all 6 Python files
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in js/cx_base_widget.js js/cx_utils.js js/cxslider.js js/cxdial.js js/cxtoggle.js js/cxseed.js js/cxsliderbank.js; do node --input-type=module --check < "$f" || exit 1; done && for f in __init__.py cxsliders.py cxdial.py cxtoggle.py cxseed.py cxsliderbank.py; do python -c "import ast; ast.parse(open('$f').read())" || exit 1; done && echo PASS`
  - **Done when**: All 13 source files pass syntax validation
  - **Commit**: `chore(quality): pass full syntax validation` (only if fixes needed)

- [ ] VE1 [VERIFY] E2E verification: anti-pattern elimination
  - **Do**: Grep-verify all anti-patterns removed and all new patterns present
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && ! grep -rq 'getExtraMenuOptions' js/ && ! grep -q 'w\.hidden.*true' js/cxsliderbank.js && ! grep -q 'computeSize.*\[0.*-4\]' js/cxsliderbank.js && ! grep -q 'hiddenWidget' js/cxsliderbank.js && echo VE1_PASS`
  - **Done when**: Zero anti-pattern matches across all JS files
  - **Commit**: None

- [ ] VE2 [VERIFY] E2E verification: all new features present
  - **Do**: Verify all required new patterns exist
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && grep -q 'cx.sliders.slider' js/cxslider.js && grep -q 'cx.sliders.dial' js/cxdial.js && grep -q 'cx.sliders.toggle' js/cxtoggle.js && grep -q 'cx.sliders.seed' js/cxseed.js && grep -q 'cx.sliders.sliderbank' js/cxsliderbank.js && grep -q 'getNodeMenuItems' js/cxslider.js && grep -q 'getNodeMenuItems' js/cxdial.js && grep -q 'getNodeMenuItems' js/cxtoggle.js && grep -q 'getNodeMenuItems' js/cxseed.js && grep -q 'getNodeMenuItems' js/cxsliderbank.js && grep -q 'SEARCH_ALIASES' cxsliders.py && grep -q 'SEARCH_ALIASES' cxdial.py && grep -q 'SEARCH_ALIASES' cxtoggle.py && grep -q 'SEARCH_ALIASES' cxseed.py && grep -q 'SEARCH_ALIASES' cxsliderbank.py && grep -q 'serializeValue' js/cxsliderbank.js && grep -q 'deserializeValue' js/cxsliderbank.js && ls js/docs/cxSliderInt.md js/docs/cxSliderFloat.md js/docs/cxDialInt.md js/docs/cxDialFloat.md js/docs/cxToggle.md js/docs/cxSeed.md js/docs/cxSliderBankInt.md js/docs/cxSliderBankFloat.md > /dev/null 2>&1 && echo VE2_PASS`
  - **Done when**: All new extension names, menu hooks, aliases, serialization methods, and help pages verified
  - **Commit**: None

- [ ] V6 [VERIFY] AC checklist
  - **Do**: Programmatically verify each acceptance criterion
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && echo "AC-1.1:" && ! grep -rq 'getExtraMenuOptions' js/ && echo OK && echo "AC-1.5:" && grep -q '_buildColorMenuItems' js/cx_base_widget.js && ! grep -q '_buildColorMenu[^I]' js/cx_base_widget.js && echo OK && echo "AC-2.1-2.5:" && grep -q 'cx.sliders.slider' js/cxslider.js && grep -q 'cx.sliders.dial' js/cxdial.js && grep -q 'cx.sliders.toggle' js/cxtoggle.js && grep -q 'cx.sliders.seed' js/cxseed.js && grep -q 'cx.sliders.sliderbank' js/cxsliderbank.js && echo OK && echo "AC-3.3:" && ! grep -q 'slider_1\|slider_2' cxsliderbank.py && echo OK && echo "AC-3.4:" && ! grep -q 'w\.hidden' js/cxsliderbank.js && echo OK && echo "AC-6.1:" && grep -q 'Operating System :: OS Independent' pyproject.toml && echo OK && echo "AC-7.1-7.4:" && grep -q 'version = "3.0.0"' pyproject.toml && grep -q 'CX_VERSION = "3.0.0"' js/cx_utils.js && grep -q '\[3.0.0\]' CHANGELOG.md && grep -q 'Version 3.0.0' README.md && echo OK && echo "ALL AC PASS"`
  - **Done when**: All acceptance criteria confirmed via grep
  - **Commit**: None

## Phase 4: PR Lifecycle

- [ ] 4.1 Local quality check
  - **Do**: Run ALL quality checks locally
  - **Verify**: `cd "D:/ai/comfyui-cx_sliders" && for f in js/cx_base_widget.js js/cx_utils.js js/cxslider.js js/cxdial.js js/cxtoggle.js js/cxseed.js js/cxsliderbank.js; do node --input-type=module --check < "$f" || exit 1; done && for f in __init__.py cxsliders.py cxdial.py cxtoggle.py cxseed.py cxsliderbank.py; do python -c "import ast; ast.parse(open('$f').read())" || exit 1; done && echo PASS`
  - **Done when**: All syntax checks pass
  - **Commit**: `fix(quality): address syntax issues` (only if fixes needed)

- [ ] 4.2 Create PR and verify CI
  - **Do**:
    1. Verify current branch is feature branch: `git branch --show-current`
    2. Push branch: `git push -u origin fix/node-rendering-slot-overlap` (or current branch)
    3. Create PR: `gh pr create --title "feat: standards compliance update v3.0.0" --body "..."`
    4. Monitor CI: `gh pr checks --watch`
  - **Verify**: `gh pr checks` shows all green (or no CI configured)
  - **Done when**: PR created and CI passes (or no CI exists)
  - **Commit**: None

## Notes

- **Implementation order**: Items 2 (ext names) -> 8 (classifiers) -> 5 (aliases) -> 1 (menu migration) -> 3 (slider bank breaking) -> 6 (help pages) -> 7 (version bump)
- **No test framework**: All verification is syntax-only (JS `node --check`, Python `ast.parse`) plus grep-based pattern matching
- **Item 3 is BREAKING**: Slider bank input schema changes from 8 separate `slider_N` inputs to single `values` JSON string
- **Item 1 dependency on Item 3**: The sliderbank menu migration (task 1.22) initially references old `cx_bank_ui` widget name; tasks 1.36 updates it to `"values"` after Item 3 restructure
- **Help pages depend on Item 3**: SliderBank help content (tasks 1.45-1.46) reflects post-restructure schema
- **cxToggle special case**: Does NOT use `_buildColorMenuItems` -- builds color picker items inline in `getNodeMenuItems`
- **No VE3 needed**: No infrastructure to clean up (no dev server, no temp processes)
