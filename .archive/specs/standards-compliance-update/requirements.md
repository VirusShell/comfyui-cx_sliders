# Requirements: Standards Compliance Update v3.0.0

## Goal

Bring the codebase into compliance with official ComfyUI custom node standards by migrating deprecated APIs, eliminating the last hidden-widget anti-pattern, and adding discoverability features. Single v3.0.0 release -- Item 3 forces major bump.

## User Stories

### US-1: Modern Context Menu API
**As a** ComfyUI extension developer
**I want** all context menus to use `getNodeMenuItems` instead of deprecated `getExtraMenuOptions`
**So that** menu items merge correctly with other extensions and survive future deprecation removal

**Acceptance Criteria:**
- [ ] AC-1.1: No JS file contains `getExtraMenuOptions` -- grep returns zero matches
- [ ] AC-1.2: Each of 5 extension objects (`cxslider.js`, `cxdial.js`, `cxtoggle.js`, `cxseed.js`, `cxsliderbank.js`) has a `getNodeMenuItems(node)` method
- [ ] AC-1.3: `getNodeMenuItems` returns an array (not void); uses `node` parameter (not `this`)
- [ ] AC-1.4: `node.comfyClass` guards ensure items only appear for matching node types
- [ ] AC-1.5: `_buildColorMenu` renamed to `_buildColorMenuItems` in `cx_base_widget.js`; all callers updated
- [ ] AC-1.6: Right-click on each node type shows correct menu items (color pickers, reset, seed-specific items)
- [ ] AC-1.7: Menu separators (`null`) render correctly in the returned array
- [ ] AC-1.8: `isInteger` resolved via module-level maps (`SLIDER_NODES`, `DIAL_NODES`, `BANK_NODES`) -- no closure dependency

### US-2: Consistent Extension Naming
**As a** ComfyUI user/developer
**I want** all JS extensions to use dotted `cx.sliders.*` naming convention
**So that** extension names are globally unique and follow framework conventions

**Acceptance Criteria:**
- [ ] AC-2.1: `cxslider.js` extension name is `"cx.sliders.slider"`
- [ ] AC-2.2: `cxdial.js` extension name is `"cx.sliders.dial"`
- [ ] AC-2.3: `cxtoggle.js` extension name is `"cx.sliders.toggle"`
- [ ] AC-2.4: `cxseed.js` extension name is `"cx.sliders.seed"`
- [ ] AC-2.5: `cxsliderbank.js` extension name is `"cx.sliders.sliderbank"`
- [ ] AC-2.6: All nodes load without errors after rename (ComfyUI restart test)

### US-3: Slider Bank Without Hidden Widgets
**As a** ComfyUI user
**I want** the slider bank node to use a clean single-input architecture
**So that** serialization is reliable and the last anti-pattern is eliminated

**Acceptance Criteria:**
- [ ] AC-3.1: `cxsliderbank.py` declares single `values` STRING input (V1 and V3 schemas)
- [ ] AC-3.2: `cxsliderbank.py` `execute()` parses JSON, returns 8 outputs (int or float as appropriate)
- [ ] AC-3.3: No `slider_1` through `slider_8` inputs exist in Python backend
- [ ] AC-3.4: `cxsliderbank.js` has zero instances of `w.hidden = true` or `computeSize = () => [0, -4]`
- [ ] AC-3.5: Custom widget `value` is an object `{ s1: N, s2: N, ..., s8: N }`; NOT an array
- [ ] AC-3.6: `serializeValue()` returns `JSON.stringify(this.value)` -- Python receives a string
- [ ] AC-3.7: Mini-sliders read/write `this.value[`s${i}`]` directly (no hidden widget lookup)
- [ ] AC-3.8: `slider_count` remains JS-only (`node.properties`) -- NOT a backend input
- [ ] AC-3.9: Backend always returns 8 outputs regardless of `slider_count`
- [ ] AC-3.10: `onConfigure` detects old format (8-number `widgets_values`) and migrates to JSON object
- [ ] AC-3.11: New slider bank nodes save and reload correctly (round-trip test)
- [ ] AC-3.12: Old slider bank workflows load with best-effort value migration (silent failure acceptable at edges)
- [ ] AC-3.13: Invalid/malformed JSON in `values` input does not crash Python -- returns 8 zeros with error log

### US-4: Node Search Discoverability
**As a** ComfyUI user
**I want** to find cx nodes by typing common synonyms (e.g., "knob", "switch", "range")
**So that** I can discover nodes without knowing exact names

**Acceptance Criteria:**
- [ ] AC-4.1: All 10 V1 node classes have `SEARCH_ALIASES` class attribute (list of strings)
- [ ] AC-4.2: All V3 `define_schema()` calls include `search_aliases=[...]` parameter
- [ ] AC-4.3: Aliases include at least: common name, "cx" prefixed variant, and 1-2 synonyms

Alias mapping:

| Node | Required Aliases |
|------|-----------------|
| cxSliderInt | slider, range, integer slider, cx slider |
| cxSliderFloat | slider, range, float slider, cx slider |
| cxDialInt | dial, knob, rotary, integer dial, cx dial |
| cxDialFloat | dial, knob, rotary, float dial, cx dial |
| cxToggle | toggle, switch, button, on off, cx toggle |
| cxSeed | seed, random seed, cx seed |
| cxSliderBankInt | slider bank, multi slider, cx bank |
| cxSliderBankFloat | slider bank, multi slider, cx bank |

### US-5: Per-Node Help Documentation
**As a** ComfyUI user
**I want** to see comprehensive help when clicking the help button on any cx node
**So that** I understand inputs, outputs, properties, and interaction patterns without external docs

**Acceptance Criteria:**
- [ ] AC-5.1: `js/docs/` directory exists with 8 markdown files
- [ ] AC-5.2: File names match `NODE_CLASS_MAPPINGS` keys exactly: `cxSliderInt.md`, `cxSliderFloat.md`, `cxDialInt.md`, `cxDialFloat.md`, `cxToggle.md`, `cxSeed.md`, `cxSliderBankInt.md`, `cxSliderBankFloat.md`
- [ ] AC-5.3: Each file contains: description, inputs table, outputs table, properties list, interaction patterns, right-click menu items
- [ ] AC-5.4: SliderBank help pages reflect post-Item-3 schema (single JSON input, not 8 separate inputs)
- [ ] AC-5.5: Help renders in ComfyUI's node help tooltip (manual verification)

### US-6: Registry-Ready Metadata
**As a** package maintainer
**I want** pyproject.toml to include standard classifiers
**So that** the package is registry-compliant when published

**Acceptance Criteria:**
- [ ] AC-6.1: `pyproject.toml` contains `classifiers = ["Operating System :: OS Independent"]`
- [ ] AC-6.2: Repository URL in pyproject.toml is NOT modified

### US-7: Version Bump to v3.0.0
**As a** package maintainer
**I want** version consistently set to 3.0.0 across all locations
**So that** the breaking change (Item 3) is properly signaled via SemVer

**Acceptance Criteria:**
- [ ] AC-7.1: `pyproject.toml` `version = "3.0.0"`
- [ ] AC-7.2: `js/cx_utils.js` `CX_VERSION = "3.0.0"`
- [ ] AC-7.3: `CHANGELOG.md` has `## [3.0.0] - YYYY-MM-DD` section documenting all changes
- [ ] AC-7.4: `README.md` header shows `Version 3.0.0`
- [ ] AC-7.5: CHANGELOG entry lists breaking change (slider bank schema) prominently

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria | Files |
|----|-------------|----------|---------------------|-------|
| FR-1 | Remove all `getExtraMenuOptions` monkey-patches from 5 JS files | High | AC-1.1 | `js/cxslider.js`, `js/cxdial.js`, `js/cxtoggle.js`, `js/cxseed.js`, `js/cxsliderbank.js` |
| FR-2 | Add `getNodeMenuItems(node)` as top-level extension hook in each JS file | High | AC-1.2, AC-1.3 | Same 5 files |
| FR-3 | Guard `getNodeMenuItems` with `node.comfyClass` lookup | High | AC-1.4, AC-1.8 | Same 5 files |
| FR-4 | Rename `_buildColorMenu` to `_buildColorMenuItems` | Medium | AC-1.5 | `js/cx_base_widget.js` + 3 callers |
| FR-5 | cxToggle: keep inline color picker items in `getNodeMenuItems` (no refactor to shared method) | Medium | AC-1.6 | `js/cxtoggle.js` |
| FR-6 | cxSeed: move "Randomize Seed Now" to `getNodeMenuItems` | Medium | AC-1.6 | `js/cxseed.js` |
| FR-7 | Update 5 extension `name` strings to `cx.sliders.*` format | High | AC-2.1 through AC-2.5 | 5 JS files |
| FR-8 | Replace 8 `slider_N` Python inputs with single `values` STRING input (V1 schema) | High | AC-3.1, AC-3.3 | `cxsliderbank.py` |
| FR-9 | Replace 8 V3 inputs with single `values` STRING input (V3 schema) | High | AC-3.1, AC-3.3 | `cxsliderbank.py` |
| FR-10 | `execute()` parses JSON, returns 8 outputs; handles malformed JSON gracefully | High | AC-3.2, AC-3.13 | `cxsliderbank.py` |
| FR-11 | Remove hidden widget loop in JS; custom widget value is object | High | AC-3.4, AC-3.5, AC-3.7 | `js/cxsliderbank.js` |
| FR-12 | `serializeValue()` returns JSON string | High | AC-3.6 | `js/cxsliderbank.js` |
| FR-13 | `onConfigure` migration: detect 8-number array, convert to JSON object | High | AC-3.10, AC-3.12 | `js/cxsliderbank.js` |
| FR-14 | Add `SEARCH_ALIASES` to all 10 V1 classes | Medium | AC-4.1, AC-4.3 | `cxsliders.py`, `cxdial.py`, `cxtoggle.py`, `cxseed.py`, `cxsliderbank.py` |
| FR-15 | Add `search_aliases` to all V3 `define_schema()` calls | Medium | AC-4.2 | Same 5 Python files |
| FR-16 | Create 8 comprehensive help markdown files in `js/docs/` | Medium | AC-5.1 through AC-5.4 | New `js/docs/*.md` |
| FR-17 | Add `classifiers` to pyproject.toml | Low | AC-6.1 | `pyproject.toml` |
| FR-18 | Bump version to 3.0.0 in 4 locations | High | AC-7.1 through AC-7.5 | `pyproject.toml`, `js/cx_utils.js`, `CHANGELOG.md`, `README.md` |

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Backward compatibility for non-breaking items | Items 1, 2, 5, 6, 8 | Zero workflow breakage |
| NFR-2 | Slider bank migration success rate | Old workflows loading | Best-effort; silent failure acceptable (values reset to 0) |
| NFR-3 | No runtime errors on ComfyUI startup | Console errors | Zero errors from cx_sliders on fresh load |
| NFR-4 | JS syntax validity | `node --check` on all 7 JS files | All pass |
| NFR-5 | Python syntax validity | `ast.parse()` on all 6 .py files | All pass |
| NFR-6 | Repository URL unchanged | pyproject.toml `[project.urls]` | No modification to Repository URL |

## Glossary

- **getExtraMenuOptions**: Deprecated LiteGraph method for adding right-click menu items via prototype patching
- **getNodeMenuItems**: Modern ComfyUI extension hook that returns menu items as an array; framework merges from all extensions
- **SEARCH_ALIASES**: V1 class attribute (list of strings) for alternative node search terms in the add-node menu
- **search_aliases**: V3 equivalent, parameter on `define_schema()`
- **WEB_DIRECTORY**: Python `__init__.py` attribute (`"./js"`) telling ComfyUI where to find frontend files; help docs go in `WEB_DIRECTORY/docs/`
- **onConfigure**: LiteGraph callback fired when a node is loaded from a saved workflow; used for migration
- **widgets_values**: Serialized array of widget values stored in workflow JSON
- **serializeValue()**: Custom widget method called by framework during workflow save; return value goes into `widgets_values`
- **comfyClass**: Property on node instance containing the node's registered class ID (e.g., `"cxSliderInt"`)

## Out of Scope

- Item 4 (repository URL change) -- explicitly excluded per user instruction
- Item 7 (example workflows) -- requires manual ComfyUI interaction, separate effort
- Refactoring cxToggle to share `_buildColorMenuItems` with CxNumericWidget -- separate improvement
- Changing `WEB_DIRECTORY` from `"./js"` to `"./web"` -- unnecessary complexity
- Locale/i18n support for help pages -- future addition
- Removing CxBaseWidget base class (pending refactor noted in MEMORY.md) -- separate spec
- Automated testing infrastructure -- no test framework exists

## Dependencies

| Dependency | Affects | Details |
|------------|---------|---------|
| Item 3 must be last code change | Item 6 (help pages) | SliderBank help content depends on post-restructure schema |
| Items 1, 2, 5, 8 are independent | Each other | Can be implemented in any order |
| Frontend v1.38.13+ required | Item 1 | `getNodeMenuItems` hook must exist; confirmed available |
| ComfyUI v0.3.75+ required | Item 5 | `SEARCH_ALIASES` support; confirmed in `server.py` |

## Implementation Order

1. Item 2 -- Extension name standardization (trivial, independent)
2. Item 8 -- pyproject.toml classifiers (trivial, independent)
3. Item 5 -- SEARCH_ALIASES on all nodes (low, independent)
4. Item 1 -- Context menu migration (medium, independent)
5. Item 3 -- Slider bank restructure (high, breaking -- must be last code change)
6. Item 6 -- Help pages (must follow Item 3 for correct SliderBank content)
7. Version bump to 3.0.0 (final step)

## Unresolved Questions

1. **Separator rendering**: Does `null` in the `getNodeMenuItems` return array render as a separator? Research confirms `null` works in `getExtraMenuOptions`; needs manual verification for the new API.
2. **Dual API firing**: If `getExtraMenuOptions` AND `getNodeMenuItems` both exist on a node (e.g., from another extension), do both fire causing duplicate items? Migration removes old hook, but this matters for testing.
3. **onConfigure edge cases**: What if a workflow has a slider bank with fewer than 8 widget values (e.g., from an older version with only 4 sliders)? Migration code should handle arrays of length < 8 by filling missing values with 0.

## Success Criteria

- All 8 node types load, render, and function correctly after changes
- Right-click menus work on all nodes (no duplicate or missing items)
- Slider bank save/load round-trip preserves values
- Old slider bank workflows load with best-effort migration
- `SEARCH_ALIASES` appear in add-node search (verified manually)
- Help pages render in ComfyUI help tooltip (verified manually)
- Zero `getExtraMenuOptions` references remain in codebase
- Zero `w.hidden = true` references remain in codebase

## Next Steps

1. Approve requirements, then proceed to task breakdown
2. Implement in dependency order (Items 2, 8, 5, 1, 3, 6, version bump)
3. Manual testing per TESTING_CHECKLIST.md after each major item
4. Final round-trip test with old and new workflows
