# Requirements: Custom Widget Rewrite (v2.0.0)

## Goal

Rewrite all JS frontend files from hidden-widget/onDrawForeground anti-pattern to framework-correct custom widget pattern (`addCustomWidget` with `draw`/`mouse`/`computeSize`). Merge int/float variant pairs, drop cxRangeSlider, extract shared utilities. Eliminates slot overlap, 60-70% code duplication, and three-way state sync.

---

## User Stories

### Foundation / Shared Infrastructure

#### US-1: Shared Utility Module
**As a** maintainer
**I want** common utility functions in a single shared module
**So that** duplicated code across 10 files is eliminated

**Acceptance Criteria:**
- [ ] AC-1.1: `cx_utils.js` exports: `clamp`, `getDecimalPlaces`, `formatValue`, `isValidHexColor`, `openColorPicker`, `getContrastColor`
- [ ] AC-1.2: No utility function is duplicated in any node JS file
- [ ] AC-1.3: All node files import from `cx_utils.js`
- [ ] AC-1.4: `getContentStartY` and `cleanProperties` are NOT carried forward (anti-patterns)

#### US-2: Base Widget Class
**As a** maintainer
**I want** a base widget class with shared draw/mouse/sizing behavior
**So that** each node widget only implements its unique rendering and interaction

**Acceptance Criteria:**
- [ ] AC-2.1: `cx_base_widget.js` exports `CxBaseWidget` class
- [ ] AC-2.2: Base class implements `draw()`, `mouse()`, `computeSize()`, `serializeValue()` method signatures matching framework contract
- [ ] AC-2.3: Base class provides: low-quality rendering check (`scale <= 0.5`), standard background drawing, mouse capture/release, hit area management
- [ ] AC-2.4: Base class uses `widget.value` as single source of truth for serializable state
- [ ] AC-2.5: Config-only state (colors, labels) stored in `node.properties` — NOT in widget.value
- [ ] AC-2.6: `widget.type` is `"custom"` for all cx widgets

#### US-3: Int/Float Unification
**As a** maintainer
**I want** merged int/float files with an `isInteger` flag
**So that** near-identical variant pairs share a single implementation

**Acceptance Criteria:**
- [ ] AC-3.1: Each node type has ONE JS file (not two) handling both int and float variants
- [ ] AC-3.2: Int mode rounds values to integers and uses `step >= 1`
- [ ] AC-3.3: Float mode preserves decimal precision based on `padding` property
- [ ] AC-3.4: Both variants register correctly via `beforeRegisterNodeDef` (matching both node IDs)

---

### Per-Node Type

#### US-4: cxSlider Widget (Int + Float)
**As a** user
**I want** a horizontal bar slider with colored fill
**So that** I can set numeric values by click/drag with visual feedback

**Acceptance Criteria:**
- [ ] AC-4.1: Click/drag sets value proportionally within [min, max]
- [ ] AC-4.2: Ctrl+drag unlocks min/max bounds (extends range beyond configured limits)
- [ ] AC-4.3: Shift+drag inverts snap behavior (snap ON -> free, snap OFF -> snapped)
- [ ] AC-4.4: Double-click opens `canvas.prompt()` for manual numeric entry
- [ ] AC-4.5: Right-click context menu offers: fill color picker, border color picker, text color picker, Reset to Defaults
- [ ] AC-4.6: Value text centered on slider bar; auto-contrast text color when `textColor = "auto"`
- [ ] AC-4.7: Widget participates in framework layout (no slot overlap)
- [ ] AC-4.8: `widget.value` is the current numeric value, serialized to Python backend
- [ ] AC-4.9: Properties Panel exposes: min, max, step, snap, fillColor, borderColor, textColor

#### US-5: cxDial Widget (Int + Float)
**As a** user
**I want** a circular arc knob (270-degree sweep)
**So that** I can set values with rotary interaction and visual arc fill

**Acceptance Criteria:**
- [ ] AC-5.1: Arc renders 5 layers: dark background arc, colored fill arc, needle indicator, center dot, value text below
- [ ] AC-5.2: Click/drag on or near arc sets value by angle. 90-degree dead zone at bottom snaps to nearest endpoint
- [ ] AC-5.3: Hit test uses circular bounds with 30% expansion for ease of use
- [ ] AC-5.4: Shift+drag inverts snap behavior
- [ ] AC-5.5: Double-click opens manual numeric entry
- [ ] AC-5.6: Right-click context menu with color pickers + Reset to Defaults
- [ ] AC-5.7: Dial radius is responsive — calculates from available widget space
- [ ] AC-5.8: `widget.value` is the current numeric value
- [ ] AC-5.9: Properties Panel exposes: min, max, step, snap, fillColor, borderColor, textColor
- [ ] AC-5.10: No Ctrl+drag unlock (dial is always bounded)

#### US-6: cxToggle Widget
**As a** user
**I want** a button-style toggle cycling through discrete states
**So that** I can select from labeled options with a single click

**Acceptance Criteria:**
- [ ] AC-6.1: Click cycles to next state (wraps max -> min)
- [ ] AC-6.2: Labels parsed from comma-separated string; auto-pads with numeric labels if fewer labels than states
- [ ] AC-6.3: Button appearance changes color/label per state
- [ ] AC-6.4: Double-click opens manual numeric entry for direct state selection
- [ ] AC-6.5: Right-click context menu with color pickers + Reset to Defaults
- [ ] AC-6.6: `widget.value` is the current integer state
- [ ] AC-6.7: Properties Panel exposes: min, max, labels, fillColor, borderColor, textColor

#### US-7: cxSeed Widget
**As a** user
**I want** a seed control with recall/randomize buttons
**So that** I can manage seed values with one-click convenience

**Acceptance Criteria:**
- [ ] AC-7.1: Recall button restores `lastSeed` and sets `control_after_generate` to "fixed"
- [ ] AC-7.2: Randomize button saves current seed to `lastSeed`, generates new random seed
- [ ] AC-7.3: Hover state shows color change + tooltip text on buttons
- [ ] AC-7.4: Right-click context menu offers "Randomize Seed Now" + "Reset to Defaults"
- [ ] AC-7.5: Seed and `control_after_generate` remain standard framework widgets (NOT custom)
- [ ] AC-7.6: Button widget added with `{serialize: false}` — UI-only, does not send to Python
- [ ] AC-7.7: `requestAnimationFrame` deferred setup preserved for Node 2.0 linked widget timing
- [ ] AC-7.8: Random generation uses `BigInt` for 64-bit range
- [ ] AC-7.9: `max_digits` property constrains effective max to `10^digits - 1` (0 = no limit)
- [ ] AC-7.10: `_controlWidget` lookup uses `seedWidget.linkedWidgets[0]` first, name/type fallback second

#### US-8: cxSliderBank Widget (Int + Float)
**As a** user
**I want** a bank of 1-8 mini-sliders with add/remove buttons
**So that** I can output multiple numeric values from a single compact node

**Acceptance Criteria:**
- [ ] AC-8.1: [+] button adds a slider row (max 8), [-] button removes (min 1)
- [ ] AC-8.2: Each mini-slider row: label on left, horizontal fill bar on right
- [ ] AC-8.3: Labels from comma-separated string; truncated with ".." when too wide
- [ ] AC-8.4: Click/drag on a mini-slider row sets that row's value
- [ ] AC-8.5: Double-click on a mini-slider row opens manual entry showing row label
- [ ] AC-8.6: Right-click context menu with color pickers + Reset to Defaults
- [ ] AC-8.7: All 8 backend `slider_N` widgets are hidden — each holds one serializable value
- [ ] AC-8.8: Single compound UI widget has `{serialize: false}` and manages all 8 hidden widgets' values
- [ ] AC-8.9: Dynamic output reconciliation: visible outputs match slider count
- [ ] AC-8.10: Properties Panel exposes: sliderCount, min, max, step, snap, labels, fillColor, borderColor, textColor
- [ ] AC-8.11: No Ctrl+drag unlock, no Shift+snap invert (simplified interaction)

---

### Migration & Backwards Compatibility

#### US-9: Value Preservation on Workflow Load
**As a** user
**I want** my existing workflow values to load correctly after upgrading to v2.0.0
**So that** I don't lose work when updating the package

**Acceptance Criteria:**
- [ ] AC-9.1: Workflows saved with v1.x load without errors in v2.0.0
- [ ] AC-9.2: Numeric values (slider current, seed, toggle state, dial value, bank values) are preserved
- [ ] AC-9.3: Config state (colors, labels, custom min/max) may be lost — this is accepted
- [ ] AC-9.4: `onConfigure` handles both old format (`sliderProps`/`seedProps` in properties) and new format (`widget.value` + `node.properties`)
- [ ] AC-9.5: Missing or corrupt widget data defaults gracefully (no console errors, uses defaults)

#### US-10: cxRangeSlider Removal
**As a** user
**I want** the deprecated cxRangeSlider to be cleanly removed
**So that** there is no dead code in the package

**Acceptance Criteria:**
- [ ] AC-10.1: `cxrangeslider.py` deleted from repo
- [ ] AC-10.2: `js/cxrangeslider_int.js` and `js/cxrangeslider_float.js` deleted
- [ ] AC-10.3: All commented-out range slider references in `__init__.py` removed
- [ ] AC-10.4: Workflows containing cxRangeSlider nodes show ComfyUI's standard "missing node" behavior (not a crash)

---

### Error Handling & Debugging

#### US-11: Error Resilience
**As a** user
**I want** nodes to degrade gracefully when data is missing or corrupt
**So that** a single bad node doesn't break my entire workflow

**Acceptance Criteria:**
- [ ] AC-11.1: Missing `widget.value` on load -> use default value (no error)
- [ ] AC-11.2: Invalid property values (NaN, null, wrong type) -> clamp/coerce to valid range
- [ ] AC-11.3: Missing widgets array on node -> skip custom widget setup (log warning)
- [ ] AC-11.4: All caught errors log to console with `[cx_sliders]` prefix for filterability

#### US-12: Console Logging
**As a** developer
**I want** structured console logging during widget lifecycle
**So that** I can debug issues during development and when users report bugs

**Acceptance Criteria:**
- [ ] AC-12.1: `cx_utils.js` exports a `cxLog(level, ...args)` function with `[cx_sliders]` prefix
- [ ] AC-12.2: Lifecycle events logged at debug level: widget creation, value changes, configure/serialize
- [ ] AC-12.3: Errors and warnings logged at warn/error level
- [ ] AC-12.4: Logging can be silenced by setting `window.CX_SLIDERS_DEBUG = false`

---

### Cleanup & Packaging

#### US-13: Python Backend Cleanup
**As a** maintainer
**I want** the Python backend updated to match the new JS structure
**So that** the package is clean and consistent at v2.0.0

**Acceptance Criteria:**
- [ ] AC-13.1: `__init__.py` version bumped to `"2.0.0"`
- [ ] AC-13.2: `cxrangeslider.py` deleted
- [ ] AC-13.3: All commented-out range slider imports/references removed from `__init__.py`
- [ ] AC-13.4: No other Python backend changes needed (node declarations unchanged)

#### US-14: Visual Refresh
**As a** user
**I want** modernized widget proportions, contrast, and styling
**So that** the nodes look polished and professional in the ComfyUI canvas

**Acceptance Criteria:**
- [ ] AC-14.1: Updated default color palette (specific colors TBD during design phase)
- [ ] AC-14.2: Improved contrast ratios for readability
- [ ] AC-14.3: Consistent spacing/margins across all widget types (use 15px standard margin)
- [ ] AC-14.4: Rounded corners on all interactive elements
- [ ] AC-14.5: At canvas scale <= 0.5, skip text rendering and fine detail (low-quality mode)

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1 | Shared utility module (`cx_utils.js`) with all common functions | High | AC-1.1 through AC-1.4 |
| FR-2 | Base widget class (`cx_base_widget.js`) with draw/mouse/computeSize contract | High | AC-2.1 through AC-2.6 |
| FR-3 | Custom widgets added via `node.addCustomWidget()` — replace hidden backend widgets | High | Framework manages layout; no manual Y calculation |
| FR-4 | `widget.value` is single source of truth for serializable data | High | No three-way sync; `node.properties` for config only |
| FR-5 | Int/float merged per node type with `isInteger` flag | High | AC-3.1 through AC-3.4 |
| FR-6 | cxSlider: horizontal bar with fill, all interactions preserved | High | AC-4.1 through AC-4.9 |
| FR-7 | cxDial: circular arc with 270-degree sweep, all interactions preserved | High | AC-5.1 through AC-5.10 |
| FR-8 | cxToggle: discrete-state button with label cycling | High | AC-6.1 through AC-6.7 |
| FR-9 | cxSeed: buttons as `{serialize: false}` widget, standard seed/control widgets kept | High | AC-7.1 through AC-7.10 |
| FR-10 | cxSliderBank: compound UI widget managing 8 hidden backend widgets | High | AC-8.1 through AC-8.11 |
| FR-11 | Migration: `onConfigure` reads old format, maps to new | Medium | AC-9.1 through AC-9.5 |
| FR-12 | cxRangeSlider: delete all files (py, js) and references | High | AC-10.1 through AC-10.4 |
| FR-13 | Python backend: bump version to 2.0.0, clean dead code | High | AC-13.1 through AC-13.4 |
| FR-14 | Visual refresh: modernized colors, spacing, contrast | Medium | AC-14.1 through AC-14.5 |
| FR-15 | Error resilience: graceful degradation for all failure modes | Medium | AC-11.1 through AC-11.4 |
| FR-16 | Console logging: structured, filterable, silenceable | Low | AC-12.1 through AC-12.4 |

---

## Non-Functional Requirements

| ID | Requirement | Metric | Target |
|----|-------------|--------|--------|
| NFR-1 | Code deduplication | Shared code in utility/base modules | Zero duplicated utility functions across node files |
| NFR-2 | File count reduction | JS files in `js/` directory | 10 files -> 7 files (5 node + 2 shared) |
| NFR-3 | Total lines reduction | Combined JS line count | ~6,000 -> ~2,500 (estimated 60% reduction) |
| NFR-4 | Performance at zoom-out | Canvas scale <= 0.5 | Skip text rendering and fine lines |
| NFR-5 | Error resilience | Uncaught exceptions from widget code | Zero — all errors caught and logged |
| NFR-6 | Console logging | Debug output with prefix | All messages prefixed `[cx_sliders]`, silenceable via global flag |
| NFR-7 | Single source of truth | State management locations per widget | Exactly 1 (widget.value for data, node.properties for config) |
| NFR-8 | Framework compliance | Custom widget API contract | All widgets implement draw/mouse/computeSize per rgthree pattern |
| NFR-9 | Separation of concerns | File responsibilities | Each file has one clear purpose; no mixed concerns |
| NFR-10 | ComfyUI compatibility | Minimum version | v0.3.75+ (both V1 and V3 schema) |

---

## Glossary

| Term | Definition |
|------|------------|
| **Custom widget** | Widget added via `node.addCustomWidget()` with `draw`/`mouse`/`computeSize` methods. Framework manages its position in node layout. |
| **widget.value** | The widget's current value. Auto-serialized to `widgets_values` and sent to Python backend. Must NOT be an array (arrays signal node connections). |
| **node.properties** | Persistent key-value store on the node. Survives save/load. Used for config (colors, labels) — NOT for serializable data. Visible in Properties Panel. |
| **onDrawForeground** | LiteGraph callback that fires BEFORE slots/widgets are drawn. Anti-pattern to draw widget UI here (causes overlap). |
| **addCustomWidget** | LiteGraph method to register a custom widget instance on a node. The framework then includes it in layout calculations. |
| **Three-way sync** | Anti-pattern where state lives in 3 places (internal object, node.properties, widget.value) requiring manual synchronization. |
| **Hit area** | Clickable sub-region within a widget (e.g., individual slider rows, +/- buttons). Base class dispatches mouse events to hit areas. |
| **serialize: false** | Widget option that tells the framework to skip this widget during prompt serialization. For UI-only widgets. |
| **V1 schema** | Legacy ComfyUI node definition pattern using `INPUT_TYPES`, `RETURN_TYPES`, `FUNCTION` class attributes. |
| **V3 schema** | Modern ComfyUI node definition using `define_schema()` classmethod, `io.ComfyNode` base, and `ComfyExtension`. |
| **Node 2.0 frontend** | ComfyUI's newer frontend that changed widget naming behavior (uses control value like "randomize" instead of fixed name). |
| **canvas.prompt()** | LiteGraph method to show an input dialog for manual value entry. |
| **LiteGraph** | The graph framework underlying ComfyUI's node editor. Handles node rendering, connections, and widget layout. |
| **Mouse capture** | When a widget calls `captureInput(true)`, all subsequent mouse events route to that widget until `captureInput(false)`. Used for drag operations. |

---

## Out of Scope

- **New node types** — no new nodes in v2.0.0; this is architecture-only
- **cxRangeSlider preservation** — already disabled, being deleted
- **Python backend logic changes** — backend is pass-through; only cleanup/version bump
- **Automated testing** — manual testing workflow continues (no test framework)
- **TypeScript migration** — staying in plain JavaScript
- **Themeing system** — individual node color customization preserved, but no global theme support
- **Keyboard shortcuts** — beyond existing double-click/modifier-key interactions
- **Undo/redo integration** — beyond cxSeed's single-level lastSeed recall
- **Mobile/touch support** — desktop pointer events only
- **Backwards compatibility for config state** — colors, labels, custom styling will reset to defaults on migration; only numeric values preserved

---

## Dependencies

| Dependency | Requirement | Notes |
|------------|-------------|-------|
| ComfyUI | v0.3.75+ | Both V1 and V3 schema support required |
| LiteGraph | `node.addCustomWidget()` API | Core to the rewrite; present in all supported ComfyUI versions |
| Canvas API | `ctx.roundRect()` | Modern browsers only; already a requirement in v1.x |
| ES Modules | `import`/`export` syntax | ComfyUI JS extension system supports this |
| rgthree-comfy pattern | Verified reference implementation | Not a runtime dependency; architectural reference only |

---

## Unresolved Questions

1. **Mouse coordinate system**: The `mouse(event, pos, node)` method receives `pos` as canvas-absolute coordinates. Need to verify during POC whether `pos[1]` compares against `widget.last_y` (absolute) or `widget.y` (node-relative). The rgthree reference suggests `last_y`.

2. **Widget replacement vs. addition**: For nodes where the framework auto-creates a widget from Python `INPUT_TYPES` (e.g., cxSlider's `value` widget), should we (a) splice out the auto-created widget and replace with custom, or (b) keep it hidden and add a `{serialize: false}` UI widget? Option A is cleaner but needs POC validation.

3. **cxSliderBank widget.value constraint**: Since `widget.value` cannot be an array, the bank uses 8 hidden backend widgets for serialization. Need to confirm the hidden widgets participate in `widgets_values` serialization correctly alongside the `{serialize: false}` UI widget.

4. **Visual refresh specifics**: Exact color palette, proportions, and spacing TBD during design phase. Requirements only mandate "modernized" — specific values deferred.

5. **`onConfigure` migration detection**: How to reliably detect old-format workflow data? Presence of `sliderProps`/`seedProps` in `node.properties` could serve as the signal, but need to verify this survives ComfyUI's workflow serialization.

---

## Success Criteria

1. All 8 active node IDs (cxSliderInt, cxSliderFloat, cxDialInt, cxDialFloat, cxToggle, cxSeed, cxSliderBankInt, cxSliderBankFloat) render without slot/text overlap
2. All interactions from v1.x preserved (Ctrl+drag, Shift+drag, double-click, right-click menus, hover states)
3. JS file count: 10 -> 7; total lines: ~6,000 -> ~2,500
4. Zero duplicated utility functions across files
5. `widget.value` is single source of truth — no three-way sync
6. v1.x workflows load with values preserved (config loss acceptable)
7. All errors caught and logged with `[cx_sliders]` prefix
8. Low-quality rendering at canvas scale <= 0.5 (skip text, fine detail)

---

## Next Steps

1. Review and approve these requirements
2. Proceed to design phase: file structure, class hierarchy, method signatures
3. POC with cxToggle (simplest node) to validate custom widget pattern
4. Implement remaining nodes in dependency order: shared -> slider -> dial -> seed -> bank
