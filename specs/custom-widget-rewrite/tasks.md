# Tasks: Custom Widget Rewrite (v2.0.0)

## Phase 1: Make It Work (POC)

Focus: Validate the custom widget pattern works end-to-end with cxToggle. Create shared infrastructure (cx_utils.js, cx_base_widget.js), rewrite cxToggle using CxBaseWidget, validate splice-then-insert, framework layout, mouse events, and save/load round-trip. Then extend with CxNumericWidget and implement all remaining nodes.

### Phase 1a: POC Foundation (cx_utils + CxBaseWidget + cxToggle)

- [x] 1.1 Create cx_utils.js with value utilities and constants
  - **Do**:
    1. Create `js/cx_utils.js` with exports: `clamp`, `getDecimalPlaces`, `formatValue`, `isValidHexColor`, `CX_VERSION`, `MARGIN`, `COLORS` constant object (full palette from design.md)
    2. Do NOT include `getContentStartY` or `cleanProperties` (anti-patterns per AC-1.4)
    3. Use ES module `export` syntax
  - **Files**: `js/cx_utils.js` (create)
  - **Done when**: File exports all value utilities and constants from design; no anti-pattern functions present
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js`
  - **Commit**: `feat(utils): create cx_utils.js shared utility module`
  - _Requirements: FR-1, FR-14, AC-1.1, AC-1.4, AC-14.1, AC-14.2_
  - _Design: cx_utils.js component_

- [x] 1.2 Add color utilities and logging to cx_utils.js
  - **Do**:
    1. Add `openColorPicker(currentColor, callback)` function
    2. Add `getContrastColor(hexColor)` function using luminance formula
    3. Add `cxLog(level, ...args)` function with `[cx_sliders]` prefix and `window.CX_SLIDERS_DEBUG` gate
  - **Files**: `js/cx_utils.js` (modify)
  - **Done when**: All 3 functions exported; cxLog respects debug flag; getContrastColor returns `#000000` or `#ffffff`
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js`
  - **Commit**: `feat(utils): add color utilities and structured logging`
  - _Requirements: FR-1, FR-16, AC-1.1, AC-12.1, AC-12.4_
  - _Design: cx_utils.js — Color utilities, Logging implementation_

- [x] 1.3 Create cx_base_widget.js with CxBaseWidget class
  - **Do**:
    1. Create `js/cx_base_widget.js` importing from `./cx_utils.js`
    2. Implement `CxBaseWidget` class with: constructor(name, defaultValue, options), `type = "custom"`, framework methods `draw()`, `mouse()`, `computeSize()`, `serializeValue()`
    3. Implement error boundary wrappers in `draw()` and `mouse()` calling `_draw()` and `_dispatchMouse()` respectively, with try/catch logging via `cxLog`
    4. Implement `_getProp(key, fallback)`, `_resolveTextColor()`, `_isLowQuality()`, `_drawBackground()`, `_drawBorder()` helper methods
  - **Files**: `js/cx_base_widget.js` (create)
  - **Done when**: CxBaseWidget exported with all framework contract methods and helpers from design.md
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Commit**: `feat(base): create CxBaseWidget class with framework contract`
  - _Requirements: FR-2, FR-14, FR-15, AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.6, AC-14.3, AC-14.4, AC-14.5_
  - _Design: CxBaseWidget section_

- [x] 1.4 Add hit area dispatch and mouse tracking to CxBaseWidget
  - **Do**:
    1. Add `_hitAreas` object, `_isDragging`, `_activeDragArea`, `_dragStartPos`, `_lastHeight` state properties to constructor
    2. Implement `_dispatchMouse(event, pos, node)` with pointerdown/pointermove/pointerup handling and `_activeDragArea` tracking
    3. Implement `_inBounds(pos, bounds)` supporting both `[x, width]` and `[x, y, width, height]` formats
  - **Files**: `js/cx_base_widget.js` (modify)
  - **Done when**: Hit area system dispatches mouse events to named areas; drag events route only to the initiating area; `_inBounds` handles both 2-element and 4-element bounds
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Commit**: `feat(base): add hit area dispatch and mouse tracking system`
  - _Requirements: FR-2, AC-2.3_
  - _Design: CxBaseWidget — _dispatchMouse, _inBounds_

- [ ] 1.5 [VERIFY] Quality checkpoint: syntax validation
  - **Do**: Validate both new shared modules parse without errors
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Done when**: Both files pass syntax check with exit code 0
  - **Commit**: `chore(shared): pass quality checkpoint` (only if fixes needed)

- [ ] 1.6 Rewrite cxtoggle.js with CxToggleWidget class
  - **Do**:
    1. Rewrite `js/cxtoggle.js` from scratch using design.md `cxtoggle.js` section
    2. Implement `CxToggleWidget extends CxBaseWidget` with `_draw()`, `_getLabels()`, `_getCurrentLabel()`, `computeSize()` returning `[width, 28]`
    3. In `_draw()`: render button background (active/inactive fill), border, centered label text, and register full-width hit area that cycles `value` on click
    4. Keep `app.registerExtension` with `beforeRegisterNodeDef` matching `cxToggle` node
  - **Files**: `js/cxtoggle.js` (rewrite)
  - **Done when**: CxToggleWidget renders a button, click cycles state, label updates per state
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Commit**: `feat(toggle): rewrite cxToggle with CxToggleWidget custom widget`
  - _Requirements: FR-8, AC-6.1, AC-6.2, AC-6.3, AC-6.6_
  - _Design: cxtoggle.js — CxToggleWidget, Registration Hook_

- [ ] 1.7 Add widget splice-then-insert registration to cxtoggle.js
  - **Do**:
    1. In `onNodeCreated`: find auto-created `"toggle"` widget index with `widgets.findIndex()`, splice it out, create `CxToggleWidget`, insert at same index via `widgets.splice(idx, 0, widget)`
    2. Set default `node.properties`: min, max, labels, fillColor, borderColor, textColor
    3. Call `this.setSize(this.computeSize())` and lowercase output labels
    4. Add fallback: if `idx === -1`, use `this.addCustomWidget(widget)` instead
  - **Files**: `js/cxtoggle.js` (modify)
  - **Done when**: Toggle widget replaces framework widget at same index; node renders with custom widget in correct layout position; config-only state (colors, labels) stored in node.properties
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Commit**: `feat(toggle): add splice-then-insert widget registration`
  - _Requirements: FR-3, FR-4, AC-2.5, AC-6.6, AC-6.7_
  - _Design: Widget Serialization Order — splice-then-insert strategy_

- [ ] 1.8 Add double-click, context menu, and onPropertyChanged to cxtoggle.js
  - **Do**:
    1. Add `onDblClick` prototype: find toggle widget, call `canvas.prompt()` for manual numeric entry
    2. Add `getExtraMenuOptions` prototype: color pickers for fill/border/text via `openColorPicker`, plus "Reset to Defaults" option
    3. Add `onPropertyChanged` prototype: if min/max changes, clamp `widget.value`; call `setDirtyCanvas`
  - **Files**: `js/cxtoggle.js` (modify)
  - **Done when**: Double-click opens value prompt; right-click shows color pickers and reset; property panel changes reflect in widget
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Commit**: `feat(toggle): add double-click entry, context menu, property sync`
  - _Requirements: AC-6.4, AC-6.5, AC-6.7_
  - _Design: cxtoggle.js — Registration section_

- [ ] 1.9 Add v1.x migration support to cxtoggle.js
  - **Do**:
    1. Add `migrateToggleProps(node, info)` function: detect old format via `info.properties.current !== undefined` or `info.properties.toggleProps !== undefined`
    2. Extract old `current` value, write to `widget.value`; set new-format properties (colors reset to defaults per AC-9.3)
    3. Clean up legacy keys: delete `current`, `toggleProps`, `ver`, `aux_id` from `node.properties`
    4. Add `onConfigure` prototype: call migration, then clamp widget value to valid range
  - **Files**: `js/cxtoggle.js` (modify)
  - **Done when**: Loading a v1.x workflow with cxToggle preserves toggle state value; old property keys cleaned up
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Commit**: `feat(toggle): add v1.x migration support`
  - _Requirements: FR-11, AC-9.1, AC-9.2, AC-9.3, AC-9.4, AC-9.5_
  - _Design: Migration Design section_

- [ ] 1.10 [VERIFY] Quality checkpoint: all POC files
  - **Do**: Validate all 3 POC files parse without syntax errors
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Done when**: All 3 files pass syntax check
  - **Commit**: `chore(poc): pass quality checkpoint` (only if fixes needed)

- [ ] 1.11 POC Checkpoint -- Manual Testing Pause
  - **Do**:
    1. User restarts ComfyUI
    2. Add a cxToggle node from `utils/cxSliders` category
    3. Validate: widget renders in correct position (no slot overlap), click cycles state, label updates
    4. Validate: double-click opens prompt, right-click shows color pickers + reset
    5. Validate: save workflow, reload, verify `widget.value` preserved
    6. Validate: inspect saved workflow JSON, confirm `widgets_values` contains toggle state at correct index
    7. Validate: open a v1.x workflow with cxToggle, verify value preserved
    8. Validate: Properties Panel shows min/max/labels/colors, editing them updates widget
    9. Document: does `widgets.splice(idx, 0, widget)` produce a widget that receives `draw()`/`mouse()` calls?
  - **Files**: None (manual testing)
  - **Done when**: All 9 validations pass; widget replacement strategy confirmed working
  - **Verify**: User confirms all checks pass (this is the decision gate before continuing)
  - **Commit**: `feat(poc): validate cxToggle POC` (tag commit for reference)
  - _Requirements: FR-3, FR-4, FR-8, FR-11_
  - _Design: POC Scope: cxToggle_

### Phase 1b: CxNumericWidget Foundation

- [ ] 1.12 Add CxNumericWidget class to cx_base_widget.js
  - **Do**:
    1. Add `CxNumericWidget extends CxBaseWidget` class to `js/cx_base_widget.js`
    2. Implement constructor with `isInteger` flag
    3. Add property getters: `_min`, `_max`, `_step`, `_snap`, `_padding`, `_fillColor`, `_borderColor`, `_textColor` (all reading from `node.properties` via `_getProp`)
    4. Export both `CxBaseWidget` and `CxNumericWidget`
  - **Files**: `js/cx_base_widget.js` (modify)
  - **Done when**: CxNumericWidget exported with isInteger flag and all numeric property getters
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Commit**: `feat(base): add CxNumericWidget with property getters`
  - _Requirements: FR-2, FR-5, AC-3.2, AC-3.3_
  - _Design: CxNumericWidget section_

- [ ] 1.13 Add numeric helper methods to CxNumericWidget
  - **Do**:
    1. Add `_getDecimals()`, `_formatValue(v)`, `_roundValue(v)` methods
    2. Add `_applySnap(ratio, shiftKey)` method with shift-invert behavior
    3. Add `_valueFromRatio(ratio)` and `_ratioFromValue(v)` conversion methods
    4. Add `_promptEntry(canvas, event, title, currentFormatted)` for manual value entry via `canvas.prompt()`
  - **Files**: `js/cx_base_widget.js` (modify)
  - **Done when**: All numeric conversion/formatting/snap methods work for both integer and float modes
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Commit**: `feat(base): add numeric helpers — snap, format, conversion`
  - _Requirements: FR-5, AC-3.2, AC-3.3, AC-4.3, AC-5.4_
  - _Design: CxNumericWidget — numeric helpers_

- [ ] 1.14 Add shared color menu builder to CxNumericWidget
  - **Do**:
    1. Add `_buildColorMenu(options, labelPrefix)` method that appends fill/border/text color picker menu items to the `options` array
    2. Each picker calls `openColorPicker` and updates `node.properties` on selection
  - **Files**: `js/cx_base_widget.js` (modify)
  - **Done when**: `_buildColorMenu` appends 3 color picker items + separator to provided options array
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Commit**: `feat(base): add shared color menu builder`
  - _Requirements: AC-4.5, AC-5.6_
  - _Design: CxNumericWidget — _buildColorMenu_

- [ ] 1.15 [VERIFY] Quality checkpoint: base widget complete
  - **Do**: Validate both shared modules after CxNumericWidget additions
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js`
  - **Done when**: Both files pass syntax check
  - **Commit**: `chore(base): pass quality checkpoint` (only if fixes needed)

### Phase 1c: Slider Widget

- [ ] 1.16 Create cxslider.js with CxSliderWidget class and draw method
  - **Do**:
    1. Create `js/cxslider.js` importing from `./cx_utils.js` and `./cx_base_widget.js`
    2. Implement `CxSliderWidget extends CxNumericWidget` with `static HEIGHT = 28`
    3. Implement `computeSize(width)` returning `[width, 28]`
    4. Implement `_draw()`: render background bar, colored fill proportional to ratio, border, centered value text (skip at low quality), and register `slider` hit area
  - **Files**: `js/cxslider.js` (create)
  - **Done when**: CxSliderWidget renders horizontal bar with fill and value text
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxslider.js`
  - **Commit**: `feat(slider): create CxSliderWidget with bar rendering`
  - _Requirements: FR-6, AC-4.1, AC-4.6, AC-4.7_
  - _Design: cxslider.js — CxSliderWidget draw_

- [ ] 1.17 Add drag interaction and Ctrl/Shift modifiers to CxSliderWidget
  - **Do**:
    1. Add `_unlock` state property to constructor
    2. Implement `_updateFromPos(posX, width, event)`: calculate ratio, apply Ctrl+drag unlock, Shift+snap invert via `_applySnap`, clamp if not unlocked, set `widget.value`
    3. Wire hit area's `onDown`, `onMove`, `onUp` callbacks to `_updateFromPos`
  - **Files**: `js/cxslider.js` (modify)
  - **Done when**: Click/drag sets value; Ctrl+drag extends range beyond bounds; Shift+drag inverts snap
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxslider.js`
  - **Commit**: `feat(slider): add drag interaction with Ctrl/Shift modifiers`
  - _Requirements: AC-4.1, AC-4.2, AC-4.3_
  - _Design: cxslider.js — _updateFromPos_

- [ ] 1.18 Add registration hook for cxSliderInt and cxSliderFloat
  - **Do**:
    1. Add `app.registerExtension` with `beforeRegisterNodeDef` matching both `cxSliderInt` and `cxSliderFloat` via `SLIDER_NODES` map
    2. In `onNodeCreated`: splice out auto-created widget, insert `CxSliderWidget` at same index, set default properties
    3. Add `onConfigure` with `migrateSliderProps()` migration function
    4. Add `onDblClick`, `getExtraMenuOptions` (color pickers + Reset), `onPropertyChanged` (clamp on min/max change)
  - **Files**: `js/cxslider.js` (modify)
  - **Done when**: Both cxSliderInt and cxSliderFloat register correctly with custom widgets; all interactions wired
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxslider.js`
  - **Commit**: `feat(slider): add dual int/float registration with migration`
  - _Requirements: FR-5, FR-6, FR-11, AC-3.1, AC-3.4, AC-4.4, AC-4.5, AC-4.8, AC-4.9, AC-9.1, AC-9.2_
  - _Design: cxslider.js — Registration Hook_

- [ ] 1.19 Delete old cxslider_int.js and cxslider_float.js
  - **Do**:
    1. Delete `js/cxslider_int.js`
    2. Delete `js/cxslider_float.js`
  - **Files**: `js/cxslider_int.js` (delete), `js/cxslider_float.js` (delete)
  - **Done when**: Both old files removed; new `cxslider.js` handles both variants
  - **Verify**: `test ! -f D:/ai/comfyui-cx_sliders/js/cxslider_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxslider_float.js && echo "PASS"`
  - **Commit**: `refactor(slider): delete old int/float variant files`
  - _Requirements: FR-5, AC-3.1_

- [ ] 1.20 [VERIFY] Quality checkpoint: slider complete
  - **Do**: Validate slider file and shared modules
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_utils.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cx_base_widget.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxslider.js && node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxtoggle.js`
  - **Done when**: All files pass syntax check
  - **Commit**: `chore(slider): pass quality checkpoint` (only if fixes needed)

### Phase 1d: Dial Widget

- [ ] 1.21 Create cxdial.js with CxDialWidget class and arc rendering
  - **Do**:
    1. Create `js/cxdial.js` importing from `./cx_utils.js` and `./cx_base_widget.js`
    2. Implement `CxDialWidget extends CxNumericWidget` with static constants: `MIN_HEIGHT = 70`, `START_ANGLE = 0.75 * Math.PI`, `SWEEP = 1.5 * Math.PI`
    3. Implement `computeSize(width)` returning `[width, 70]`
    4. Implement `_draw()` with 5 layers: dark background arc, colored fill arc, needle indicator, center dot, value text below (skip detail layers at low quality)
  - **Files**: `js/cxdial.js` (create)
  - **Done when**: CxDialWidget renders 270-degree arc with fill proportional to value
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxdial.js`
  - **Commit**: `feat(dial): create CxDialWidget with arc rendering`
  - _Requirements: FR-7, AC-5.1, AC-5.7_
  - _Design: cxdial.js — CxDialWidget draw, _getGeometry_

- [ ] 1.22 Add angle-based interaction and dead zone to CxDialWidget
  - **Do**:
    1. Implement `_getGeometry(width, y, height)` returning `{ cx, cy, radius, arcWidth }` with responsive sizing
    2. Implement `_updateFromAngle(pos, geo, event)`: calculate angle from cursor position, handle 90-degree dead zone at bottom (snap to nearest endpoint), convert to ratio, apply snap, set value
    3. Register `dial` hit area with 30% expanded circular bounds
  - **Files**: `js/cxdial.js` (modify)
  - **Done when**: Click/drag on arc sets value by angle; dead zone snaps to endpoints; Shift+drag inverts snap
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxdial.js`
  - **Commit**: `feat(dial): add angle interaction with dead zone handling`
  - _Requirements: AC-5.2, AC-5.3, AC-5.4, AC-5.10_
  - _Design: cxdial.js — _updateFromAngle, hit area_

- [ ] 1.23 Add registration hook for cxDialInt and cxDialFloat
  - **Do**:
    1. Add `app.registerExtension` with `beforeRegisterNodeDef` matching both `cxDialInt` and `cxDialFloat`
    2. In `onNodeCreated`: splice out auto-created widget, insert `CxDialWidget` at same index, set default properties
    3. Add `onConfigure` with migration, `onDblClick`, `getExtraMenuOptions`, `onPropertyChanged`
    4. No Ctrl+drag unlock (per AC-5.10)
  - **Files**: `js/cxdial.js` (modify)
  - **Done when**: Both cxDialInt and cxDialFloat register correctly with all interactions
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxdial.js`
  - **Commit**: `feat(dial): add dual int/float registration with migration`
  - _Requirements: FR-5, FR-7, FR-11, AC-3.1, AC-3.4, AC-5.5, AC-5.6, AC-5.8, AC-5.9_
  - _Design: cxdial.js — Registration section_

- [ ] 1.24 Delete old cxdial_int.js and cxdial_float.js
  - **Do**:
    1. Delete `js/cxdial_int.js`
    2. Delete `js/cxdial_float.js`
  - **Files**: `js/cxdial_int.js` (delete), `js/cxdial_float.js` (delete)
  - **Done when**: Both old files removed; new `cxdial.js` handles both variants
  - **Verify**: `test ! -f D:/ai/comfyui-cx_sliders/js/cxdial_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxdial_float.js && echo "PASS"`
  - **Commit**: `refactor(dial): delete old int/float variant files`
  - _Requirements: FR-5, AC-3.1_

- [ ] 1.25 [VERIFY] Quality checkpoint: dial complete
  - **Do**: Validate all JS files
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "ALL PASS"`
  - **Done when**: All 5 files pass syntax check
  - **Commit**: `chore(dial): pass quality checkpoint` (only if fixes needed)

### Phase 1e: Seed Widget

- [ ] 1.26 Rewrite cxseed.js with CxSeedButtonWidget class
  - **Do**:
    1. Rewrite `js/cxseed.js` from scratch per design.md
    2. Implement `CxSeedButtonWidget extends CxBaseWidget` with `{serialize: false}`, `static HEIGHT = 26`, `static BTN_SIZE = 22`, `static BTN_GAP = 8`
    3. Implement `_draw()`: render Recall and Randomize buttons centered, with hover state colors, tooltips, and emoji icons (skip detail at low quality)
    4. Register `recall` and `randomize` hit areas with `[x, y, w, h]` bounds
  - **Files**: `js/cxseed.js` (rewrite)
  - **Done when**: CxSeedButtonWidget renders two centered buttons with hover states
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxseed.js`
  - **Commit**: `feat(seed): rewrite cxSeed with CxSeedButtonWidget`
  - _Requirements: FR-9, AC-7.3, AC-7.5, AC-7.6_
  - _Design: cxseed.js — CxSeedButtonWidget_

- [ ] 1.27 Add recall, randomize, and helper functions to cxseed.js
  - **Do**:
    1. Implement `_doRecall(node)`: restore `lastSeed` to seed widget, set control to "fixed"
    2. Implement `_doRandomize(node)`: save current seed to `lastSeed`, generate new random seed using BigInt, set control to "randomize"
    3. Add module-level helpers: `_findControlWidget(node)` using `linkedWidgets[0]` first, `_randomSeed(min, max)` with BigInt, `_getEffectiveMax(max, maxDigits)`
    4. Implement `_mouse()` override for hover tracking (pointermove detects which button is hovered)
  - **Files**: `js/cxseed.js` (modify)
  - **Done when**: Recall restores seed + sets fixed; Randomize generates new seed with BigInt; hover state tracks correctly
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxseed.js`
  - **Commit**: `feat(seed): add recall, randomize, and BigInt seed generation`
  - _Requirements: AC-7.1, AC-7.2, AC-7.8, AC-7.9, AC-7.10_
  - _Design: cxseed.js — _doRecall, _doRandomize, helpers_

- [ ] 1.28 Add registration hook for cxSeed with deferred setup
  - **Do**:
    1. Add `app.registerExtension` with `beforeRegisterNodeDef` matching `cxSeed`
    2. In `onNodeCreated`: use `requestAnimationFrame` to defer widget creation (Node 2.0 timing requirement)
    3. Inside deferred callback: create `CxSeedButtonWidget`, add via `addCustomWidget()` (NOT splice — seed/control widgets are kept), set size, lowercase output labels
    4. Add `getExtraMenuOptions` with "Randomize Seed Now" and "Reset to Defaults", `onConfigure` for migration
  - **Files**: `js/cxseed.js` (modify)
  - **Done when**: cxSeed node keeps framework seed/control widgets visible; button widget added after them; deferred setup preserved
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxseed.js`
  - **Commit**: `feat(seed): add deferred registration preserving framework widgets`
  - _Requirements: FR-9, AC-7.4, AC-7.5, AC-7.6, AC-7.7_
  - _Design: cxseed.js — Registration section_

- [ ] 1.29 [VERIFY] Quality checkpoint: seed complete
  - **Do**: Validate all JS files including cxseed
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "ALL PASS"`
  - **Done when**: All 6 files pass syntax check
  - **Commit**: `chore(seed): pass quality checkpoint` (only if fixes needed)

### Phase 1f: Slider Bank Widget

- [ ] 1.30 Create cxsliderbank.js with CxSliderBankWidget class and button rendering
  - **Do**:
    1. Create `js/cxsliderbank.js` importing from `./cx_utils.js` and `./cx_base_widget.js`
    2. Implement `CxSliderBankWidget extends CxNumericWidget` with `{serialize: false}`, static constants: `BTN_ROW_H = 24`, `BTN_GAP = 6`, `MINI_H = 20`, `MINI_GAP = 2`, `LABEL_W = 50`, `SIDE_PAD = 6`
    3. Implement `computeSize(width)` calculating height from `sliderCount` property
    4. Implement `_drawButtons(ctx, width, y, count)` rendering [+] and [-] buttons with hit areas that modify `sliderCount`
  - **Files**: `js/cxsliderbank.js` (create)
  - **Done when**: CxSliderBankWidget renders add/remove buttons; [+] adds slider (max 8), [-] removes (min 1)
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): create CxSliderBankWidget with button row`
  - _Requirements: FR-10, AC-8.1_
  - _Design: cxsliderbank.js — CxSliderBankWidget, _drawButtons_

- [ ] 1.31 Add mini-slider row rendering to CxSliderBankWidget
  - **Do**:
    1. Implement `_drawMiniSlider(ctx, node, index, width, y, label)`: render label (truncated with ".." if too wide), bar background, fill proportional to hidden widget value, border, centered value text
    2. Implement `_draw()` that calls `_drawButtons` then loops `_drawMiniSlider` for each active slider
    3. Implement `_getLabels()` parsing comma-separated labels with auto-padding to 8
    4. Read values from hidden `slider_N` widgets via `node.widgets.find(w => w.name === 'slider_N')`
  - **Files**: `js/cxsliderbank.js` (modify)
  - **Done when**: Mini-slider rows render with labels and fill bars; values read from hidden backend widgets
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): add mini-slider row rendering with labels`
  - _Requirements: AC-8.2, AC-8.3_
  - _Design: cxsliderbank.js — _drawMiniSlider, _getLabels_

- [ ] 1.32 Add drag interaction and hit areas to CxSliderBankWidget mini-sliders
  - **Do**:
    1. Register per-row hit areas `slider_0` through `slider_7` in `_drawMiniSlider`
    2. Implement `_updateMiniSlider(node, index, posX, barX, barW, event)`: calculate ratio, clamp, apply snap, update hidden widget value
    3. Each hit area's `onDown`/`onMove` calls `_updateMiniSlider`; drag isolation handled by base class `_activeDragArea`
  - **Files**: `js/cxsliderbank.js` (modify)
  - **Done when**: Click/drag on a mini-slider row updates only that row's value; no cross-talk between rows
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): add per-row drag interaction with isolation`
  - _Requirements: AC-8.4, AC-8.11_
  - _Design: cxsliderbank.js — _updateMiniSlider, hit areas_

- [ ] 1.33 Add output reconciliation to CxSliderBankWidget
  - **Do**:
    1. Implement `_reconcileOutputs(node)`: add/remove outputs to match `sliderCount`, using correct type name (`INT` or `FLOAT`), lowercase labels
    2. Wire output reconciliation into [+] and [-] button hit area callbacks
    3. Call `node.setSize(node.computeSize())` after reconciliation
  - **Files**: `js/cxsliderbank.js` (modify)
  - **Done when**: Adding/removing sliders updates output count to match; output types match int/float variant
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): add dynamic output reconciliation`
  - _Requirements: AC-8.9_
  - _Design: cxsliderbank.js — _reconcileOutputs_

- [ ] 1.34 [VERIFY] Quality checkpoint: slider bank core
  - **Do**: Validate all JS files
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "ALL PASS"`
  - **Done when**: All 7 files pass syntax check
  - **Commit**: `chore(bank): pass quality checkpoint` (only if fixes needed)

- [ ] 1.35 Add registration hook for cxSliderBankInt and cxSliderBankFloat
  - **Do**:
    1. Add `app.registerExtension` matching both `cxSliderBankInt` and `cxSliderBankFloat`
    2. In `onNodeCreated`: hide all 8 `slider_N` widgets (set `hidden = true`, `computeSize = () => [0, -4]`), add `CxSliderBankWidget` via `addCustomWidget()` with `{serialize: false}`
    3. Set default properties: sliderCount, min, max, step, snap, padding, labels, colors
    4. Call `_reconcileOutputs` to set initial output count
  - **Files**: `js/cxsliderbank.js` (modify)
  - **Done when**: Both bank variants register; 8 hidden widgets preserved; UI widget added; outputs match sliderCount
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): add dual int/float registration with hidden widget management`
  - _Requirements: FR-5, FR-10, AC-3.1, AC-3.4, AC-8.7, AC-8.8, AC-8.10_
  - _Design: cxsliderbank.js — Registration section_

- [ ] 1.36 Add double-click, context menu, migration, and property sync to cxsliderbank.js
  - **Do**:
    1. Add `onDblClick`: detect which mini-slider row was clicked by Y position, open prompt with row label
    2. Add `getExtraMenuOptions`: color pickers + Reset to Defaults
    3. Add `onConfigure` with `migrateBankProps()`: detect old format via `properties.value_1`, migrate values to hidden widgets
    4. Add `onPropertyChanged`: if `sliderCount` changes, reconcile outputs and resize
  - **Files**: `js/cxsliderbank.js` (modify)
  - **Done when**: Double-click on row opens prompt; context menu works; v1.x migration preserves values; property changes trigger resize
  - **Verify**: `node --input-type=module --check < D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: `feat(bank): add double-click, context menu, migration, property sync`
  - _Requirements: FR-11, AC-8.5, AC-8.6, AC-8.10, AC-9.1, AC-9.2_
  - _Design: cxsliderbank.js — Registration, Migration_

- [ ] 1.37 Delete old cxsliderbank_int.js and cxsliderbank_float.js
  - **Do**:
    1. Delete `js/cxsliderbank_int.js`
    2. Delete `js/cxsliderbank_float.js`
  - **Files**: `js/cxsliderbank_int.js` (delete), `js/cxsliderbank_float.js` (delete)
  - **Done when**: Both old files removed; new `cxsliderbank.js` handles both variants
  - **Verify**: `test ! -f D:/ai/comfyui-cx_sliders/js/cxsliderbank_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxsliderbank_float.js && echo "PASS"`
  - **Commit**: `refactor(bank): delete old int/float variant files`
  - _Requirements: FR-5, AC-3.1_

### Phase 1g: Cleanup and RangeSlider Removal

- [ ] 1.38 Delete cxRangeSlider files (JS and Python)
  - **Do**:
    1. Delete `js/cxrangeslider_int.js`
    2. Delete `js/cxrangeslider_float.js`
    3. Delete `cxrangeslider.py`
  - **Files**: `js/cxrangeslider_int.js` (delete), `js/cxrangeslider_float.js` (delete), `cxrangeslider.py` (delete)
  - **Done when**: All 3 range slider files removed; existing workflows referencing cxRangeSlider will show ComfyUI's standard "missing node" behavior (not a crash)
  - **Verify**: `test ! -f D:/ai/comfyui-cx_sliders/js/cxrangeslider_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxrangeslider_float.js && test ! -f D:/ai/comfyui-cx_sliders/cxrangeslider.py && echo "PASS"`
  - **Commit**: `refactor(rangeslider): delete deprecated cxRangeSlider files`
  - _Requirements: FR-12, AC-10.1, AC-10.2, AC-10.4_
  - _Note: AC-10.4 (missing node behavior, not crash) is satisfied by ComfyUI's default handling when node class is absent_

- [ ] 1.39 Update __init__.py: remove range slider references, bump version to 2.0.0
  - **Do**:
    1. Delete all commented-out range slider import lines and references
    2. Delete commented-out entries in `NODE_CLASS_MAPPINGS`, `NODE_DISPLAY_NAME_MAPPINGS`, `_entrypoints`, and `get_node_list`
    3. Change `__version__` from `"1.2.3"` to `"2.0.0"`
  - **Files**: `__init__.py` (modify)
  - **Done when**: No range slider references remain; version is 2.0.0; all active node imports intact; no other Python backend files modified
  - **Verify**: `python -c "import ast; ast.parse(open('D:/ai/comfyui-cx_sliders/__init__.py').read()); print('SYNTAX OK')" && ! grep -i rangeslider D:/ai/comfyui-cx_sliders/__init__.py && grep '__version__.*2.0.0' D:/ai/comfyui-cx_sliders/__init__.py && git diff --name-only D:/ai/comfyui-cx_sliders/cxsliders.py D:/ai/comfyui-cx_sliders/cxseed.py D:/ai/comfyui-cx_sliders/cxtoggle.py D:/ai/comfyui-cx_sliders/cxdial.py D:/ai/comfyui-cx_sliders/cxsliderbank.py 2>/dev/null | wc -l | grep -q 0 && echo "PASS"`
  - **Commit**: `feat(package): remove cxRangeSlider references, bump version to 2.0.0`
  - _Requirements: FR-12, FR-13, AC-10.3, AC-13.1, AC-13.2, AC-13.3, AC-13.4_
  - _Note: AC-13.4 verified by confirming cxsliders.py, cxseed.py, etc. are unmodified via git diff_

- [ ] 1.40 [VERIFY] Quality checkpoint: all files complete
  - **Do**: Validate all 7 JS files and Python entry point
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && python -c "import ast; ast.parse(open('D:/ai/comfyui-cx_sliders/__init__.py').read()); print('SYNTAX OK')" && echo "ALL PASS"`
  - **Done when**: All 7 JS files and __init__.py pass validation
  - **Commit**: `chore(all): pass quality checkpoint` (only if fixes needed)

- [ ] 1.41 Update CX_VERSION constant in cx_utils.js to match 2.0.0
  - **Do**:
    1. Ensure `CX_VERSION` in `js/cx_utils.js` is `"2.0.0"` matching `__init__.py`
  - **Files**: `js/cx_utils.js` (modify)
  - **Done when**: `CX_VERSION === "2.0.0"` in cx_utils.js
  - **Verify**: `grep 'CX_VERSION.*2.0.0' D:/ai/comfyui-cx_sliders/js/cx_utils.js && echo "PASS"`
  - **Commit**: `chore(utils): sync CX_VERSION to 2.0.0`

- [ ] 1.42 Verify JS directory contains exactly 7 files
  - **Do**:
    1. List `js/` directory contents
    2. Confirm exactly 7 files: `cx_utils.js`, `cx_base_widget.js`, `cxtoggle.js`, `cxslider.js`, `cxdial.js`, `cxseed.js`, `cxsliderbank.js`
    3. No old files remain
  - **Files**: None (verification only)
  - **Done when**: `js/` contains exactly 7 files, all new architecture
  - **Verify**: `ls D:/ai/comfyui-cx_sliders/js/*.js | wc -l | grep -q 7 && echo "PASS: 7 files" || echo "FAIL: wrong file count"`
  - **Commit**: None (verification only)
  - _Requirements: NFR-2_

---

## Phase 2: Error Handling & Hardening

After all nodes are implemented, improve error handling, add defensive guards, and ensure consistent logging patterns.

- [ ] 2.1 Add defensive null checks to all widget lookup patterns
  - **Do**:
    1. Audit all `node.widgets?.find()` calls across all 5 node files
    2. Ensure every result is null-checked before use
    3. Add `cxLog("warn", ...)` for cases where expected widget is not found
  - **Files**: `js/cxtoggle.js`, `js/cxslider.js`, `js/cxdial.js` (modify as needed)
  - **Done when**: No widget lookup can cause uncaught TypeError; all missing-widget cases log warnings with `[cx_sliders]` prefix
  - **Verify**: `for f in cxtoggle.js cxslider.js cxdial.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "PASS"`
  - **Commit**: `fix(widgets): add defensive null checks for widget lookups`
  - _Requirements: FR-15, AC-11.3, AC-11.4_
  - _Design: Error Handling section_

- [ ] 2.2 Add defensive null checks to cxseed.js and cxsliderbank.js
  - **Do**:
    1. Audit all widget lookups in `cxseed.js` and `cxsliderbank.js`
    2. Ensure `_findControlWidget`, `_doRecall`, `_doRandomize` handle null seed widget
    3. Ensure `_updateMiniSlider` handles missing hidden widget
    4. Add try/catch around `canvas.prompt()` calls in case `prompt` is unavailable
  - **Files**: `js/cxseed.js`, `js/cxsliderbank.js` (modify)
  - **Done when**: No uncaught exceptions possible from missing widgets or unavailable APIs
  - **Verify**: `for f in cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "PASS"`
  - **Commit**: `fix(seed,bank): add defensive null checks and API guards`
  - _Requirements: FR-15, AC-11.1, AC-11.2, AC-11.3_
  - _Design: Error Handling section_

- [ ] 2.3 Add NaN/type coercion guards to value assignment paths
  - **Do**:
    1. In all `_promptEntry` callbacks and `onConfigure` handlers, add `isNaN()` check before assigning to `widget.value`
    2. In `onPropertyChanged`, validate property values: numbers must be finite, strings must be strings
    3. Coerce invalid values to defaults; log warnings via `cxLog("warn", ...)`
  - **Files**: `js/cx_base_widget.js`, `js/cxtoggle.js`, `js/cxslider.js` (modify as needed)
  - **Done when**: NaN, null, undefined, and wrong-type values never persist in widget.value or properties
  - **Verify**: `for f in cx_base_widget.js cxtoggle.js cxslider.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "PASS"`
  - **Commit**: `fix(widgets): add NaN and type coercion guards`
  - _Requirements: FR-15, AC-11.2_
  - _Design: Error Handling — Value coercion_

- [ ] 2.4 [VERIFY] Quality checkpoint: error handling complete
  - **Do**: Validate all 7 JS files after error handling additions
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "ALL PASS"`
  - **Done when**: All files pass syntax check
  - **Commit**: `chore(hardening): pass quality checkpoint` (only if fixes needed)

- [ ] 2.5 Ensure consistent debug logging across all lifecycle events
  - **Do**:
    1. Verify every `onNodeCreated`, `onConfigure`, and migration function logs at debug level via `cxLog("debug", ...)`
    2. Verify every error catch logs at error level via `cxLog("error", ...)`
    3. Ensure all messages use `[cx_sliders]` prefix (via cxLog)
    4. Verify `window.CX_SLIDERS_DEBUG = false` silences debug messages
  - **Files**: `js/cxtoggle.js`, `js/cxslider.js`, `js/cxdial.js`, `js/cxseed.js`, `js/cxsliderbank.js` (modify as needed — max 3 files per task, split if needed)
  - **Done when**: All lifecycle events have debug logging; all errors have error logging; debug flag works
  - **Verify**: `grep -c "cxLog" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js && echo "Logging calls present"`
  - **Commit**: `feat(logging): ensure consistent debug/error logging across all nodes`
  - _Requirements: FR-16, AC-11.4, AC-12.1, AC-12.2, AC-12.3, AC-12.4_

- [ ] 2.6 Ensure consistent debug logging in cxseed.js and cxsliderbank.js
  - **Do**:
    1. Verify `cxseed.js` logs: widget creation, recall/randomize actions, migration events
    2. Verify `cxsliderbank.js` logs: widget creation, slider add/remove, migration events
    3. All error catches use `cxLog("error", ...)` with context
  - **Files**: `js/cxseed.js`, `js/cxsliderbank.js` (modify as needed)
  - **Done when**: Both files have comprehensive debug logging
  - **Verify**: `grep -c "cxLog" D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "Logging calls present"`
  - **Commit**: `feat(logging): add debug logging to seed and slider bank`
  - _Requirements: FR-16, AC-12.2, AC-12.3_

- [ ] 2.7 Verify no utility function duplication across node files
  - **Do**:
    1. Search all 5 node files for any locally-defined `clamp`, `getDecimalPlaces`, `formatValue`, `isValidHexColor`, `openColorPicker`, `getContrastColor` functions
    2. All should be imported from `cx_utils.js`, not redefined
    3. Search for any `getContentStartY` or `cleanProperties` — must not exist
  - **Files**: None (verification only)
  - **Done when**: Zero duplicated utility functions; zero anti-pattern functions
  - **Verify**: `! grep -n "function clamp\|function getDecimalPlaces\|function formatValue\|function isValidHexColor\|function openColorPicker\|function getContrastColor\|function getContentStartY\|function cleanProperties" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "PASS: no duplicated utilities"`
  - **Commit**: None (verification only)
  - _Requirements: NFR-1, AC-1.2, AC-1.3, AC-1.4_

- [ ] 2.8 [VERIFY] Quality checkpoint: error handling & hardening complete
  - **Do**: Full syntax validation of all project files
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && python -c "import ast; ast.parse(open('D:/ai/comfyui-cx_sliders/__init__.py').read())" && echo "ALL PASS"`
  - **Done when**: All files pass
  - **Commit**: `chore(hardening): pass final quality checkpoint` (only if fixes needed)

---

## Phase 3: Testing

Since this project has no automated test framework, testing consists of structured manual test checklists and automated code verification where possible.

- [ ] 3.1 Verify all node files import from cx_utils.js correctly
  - **Do**:
    1. Check that all 5 node files have `import { ... } from "./cx_utils.js"` with correct function names
    2. Check that `cx_base_widget.js` imports from `./cx_utils.js`
    3. Verify no circular imports
  - **Files**: None (verification only)
  - **Done when**: All imports resolve correctly; import graph is acyclic
  - **Verify**: `grep -n "from.*cx_utils" D:/ai/comfyui-cx_sliders/js/cx_base_widget.js D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "All imports present"`
  - **Commit**: None (verification only)
  - _Requirements: AC-1.3_

- [ ] 3.2 Verify all node files import CxBaseWidget or CxNumericWidget correctly
  - **Do**:
    1. Check cxtoggle.js and cxseed.js import `CxBaseWidget` from `./cx_base_widget.js`
    2. Check cxslider.js, cxdial.js, cxsliderbank.js import `CxNumericWidget` from `./cx_base_widget.js`
  - **Files**: None (verification only)
  - **Done when**: All class imports are correct for the hierarchy
  - **Verify**: `grep -n "from.*cx_base_widget" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "All imports present"`
  - **Commit**: None (verification only)

- [ ] 3.3 Verify widget.type is "custom" for all widget classes
  - **Do**:
    1. Confirm `CxBaseWidget` sets `type = "custom"` (propagates to all subclasses)
    2. Grep all widget files to ensure no override of `type` to something else
  - **Files**: None (verification only)
  - **Done when**: All custom widgets have `type = "custom"`
  - **Verify**: `grep -n 'type.*=.*"custom"' D:/ai/comfyui-cx_sliders/js/cx_base_widget.js && ! grep -n 'this.type\s*=' D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js 2>/dev/null && echo "PASS: type is custom everywhere"`
  - **Commit**: None (verification only)
  - _Requirements: AC-2.6_

- [ ] 3.4 Verify serialize:false is set correctly on cxSeed and cxSliderBank widgets
  - **Do**:
    1. Confirm CxSeedButtonWidget constructor passes `{ serialize: false }`
    2. Confirm CxSliderBankWidget constructor passes `{ serialize: false }`
    3. Confirm CxSliderWidget, CxDialWidget, CxToggleWidget do NOT use `serialize: false`
  - **Files**: None (verification only)
  - **Done when**: Only seed button and bank UI widgets have serialize:false
  - **Verify**: `grep -n "serialize.*false" D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && ! grep -n "serialize.*false" D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxtoggle.js 2>/dev/null && echo "PASS"`
  - **Commit**: None (verification only)
  - _Requirements: AC-7.6, AC-8.8_

- [ ] 3.5 [VERIFY] Quality checkpoint: import/export verification
  - **Do**: Full syntax validation plus import checks
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && echo "ALL PASS"`
  - **Done when**: All files pass
  - **Commit**: `chore(test): pass quality checkpoint` (only if fixes needed)

- [ ] 3.6 Verify node registration matches correct node IDs
  - **Do**:
    1. Grep `cxtoggle.js` for `"cxToggle"` match
    2. Grep `cxslider.js` for both `"cxSliderInt"` and `"cxSliderFloat"` matches
    3. Grep `cxdial.js` for both `"cxDialInt"` and `"cxDialFloat"` matches
    4. Grep `cxseed.js` for `"cxSeed"` match
    5. Grep `cxsliderbank.js` for both `"cxSliderBankInt"` and `"cxSliderBankFloat"` matches
  - **Files**: None (verification only)
  - **Done when**: All 8 node IDs are matched in correct files
  - **Verify**: `grep "cxToggle" D:/ai/comfyui-cx_sliders/js/cxtoggle.js > /dev/null && grep "cxSliderInt" D:/ai/comfyui-cx_sliders/js/cxslider.js > /dev/null && grep "cxSliderFloat" D:/ai/comfyui-cx_sliders/js/cxslider.js > /dev/null && grep "cxDialInt" D:/ai/comfyui-cx_sliders/js/cxdial.js > /dev/null && grep "cxDialFloat" D:/ai/comfyui-cx_sliders/js/cxdial.js > /dev/null && grep "cxSeed" D:/ai/comfyui-cx_sliders/js/cxseed.js > /dev/null && grep "cxSliderBankInt" D:/ai/comfyui-cx_sliders/js/cxsliderbank.js > /dev/null && grep "cxSliderBankFloat" D:/ai/comfyui-cx_sliders/js/cxsliderbank.js > /dev/null && echo "PASS: all 8 node IDs found"`
  - **Commit**: None (verification only)
  - _Requirements: AC-3.4_

- [ ] 3.7 Verify widget names match Python INPUT_TYPES keys
  - **Do**:
    1. cxSlider: widget name "int" or "float" must match Python INPUT key
    2. cxDial: widget name "int" or "float"
    3. cxToggle: widget name "toggle"
    4. cxSeed: button widget name "cx_seed_buttons" (does not match Python — correct, it is serialize:false)
    5. cxSliderBank: UI widget name "cx_bank_ui" (does not match Python — correct, it is serialize:false)
  - **Files**: None (verification only)
  - **Done when**: All serializable widget names match Python INPUT_TYPES keys
  - **Verify**: `grep -n 'name.*=.*"int"\|name.*=.*"float"\|name.*=.*"toggle"' D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxtoggle.js && echo "Widget names verified"`
  - **Commit**: None (verification only)
  - _Requirements: AC-4.8, AC-5.8, AC-6.6_

- [ ] 3.8 Verify low-quality rendering guards exist in all draw methods
  - **Do**:
    1. Check that all `_draw()` methods call `_isLowQuality()` and skip text/fine detail when true
    2. Nodes to check: cxtoggle, cxslider, cxdial, cxseed, cxsliderbank
  - **Files**: None (verification only)
  - **Done when**: All 5 node files have low-quality guards in their draw methods
  - **Verify**: `grep -c "isLowQuality" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js`
  - **Commit**: None (verification only)
  - _Requirements: NFR-4, AC-14.5_

- [ ] 3.9 Verify migration detection keys match design spec
  - **Do**:
    1. Check cxslider.js migration detects `properties.current` or `properties.sliderProps`
    2. Check cxdial.js migration detects `properties.current`
    3. Check cxtoggle.js migration detects `properties.current` or `properties.toggleProps`
    4. Check cxsliderbank.js migration detects `properties.value_1`
  - **Files**: None (verification only)
  - **Done when**: All migration functions detect the correct old-format keys
  - **Verify**: `grep -n "sliderProps\|\.current\|toggleProps\|value_1" D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "Migration keys present"`
  - **Commit**: None (verification only)
  - _Requirements: FR-11, AC-9.4_
  - _Design: Migration Design — Per-Node Migration Keys_

- [ ] 3.10 Verify line count reduction target
  - **Do**:
    1. Count total lines across all 7 new JS files
    2. Compare against target: original ~6,205 lines -> target ~2,500 lines
  - **Files**: None (verification only)
  - **Done when**: Total line count documented; significant reduction achieved
  - **Verify**: `wc -l D:/ai/comfyui-cx_sliders/js/*.js`
  - **Commit**: None (verification only)
  - _Requirements: NFR-3_

- [ ] 3.11 Verify FR-14 visual refresh implementation
  - **Do**:
    1. Grep cx_utils.js for COLORS palette entries — must contain fill, border, text, active, inactive color keys
    2. Grep cx_base_widget.js for MARGIN constant usage (15px standard margin per AC-14.3)
    3. Grep all draw methods for `roundRect` calls (AC-14.4 rounded corners)
    4. Grep all draw methods for `_isLowQuality()` checks (AC-14.5 low-quality mode)
  - **Files**: None (verification only)
  - **Done when**: All 4 visual refresh elements confirmed present in codebase
  - **Verify**: `grep -c "COLORS" D:/ai/comfyui-cx_sliders/js/cx_utils.js && grep -c "MARGIN" D:/ai/comfyui-cx_sliders/js/cx_base_widget.js && grep -c "roundRect" D:/ai/comfyui-cx_sliders/js/cx_base_widget.js D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js && grep -c "isLowQuality" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js && echo "PASS: FR-14 visual refresh verified"`
  - **Commit**: None (verification only)
  - _Requirements: FR-14, AC-14.1, AC-14.2, AC-14.3, AC-14.4, AC-14.5_

- [ ] 3.12 Verify AC-2.5: config-only state in node.properties, NOT widget.value
  - **Do**:
    1. Grep all 5 node files for color/label storage patterns
    2. Confirm fillColor, borderColor, textColor, labels are read from `node.properties` (via `_getProp` or direct access), not from `widget.value`
    3. Confirm widget.value is only assigned numeric/state values, never config objects
  - **Files**: None (verification only)
  - **Done when**: All config state confirmed in node.properties; widget.value contains only serializable data values
  - **Verify**: `grep -n "fillColor\|borderColor\|textColor\|labels" D:/ai/comfyui-cx_sliders/js/cxtoggle.js D:/ai/comfyui-cx_sliders/js/cxslider.js D:/ai/comfyui-cx_sliders/js/cxdial.js D:/ai/comfyui-cx_sliders/js/cxseed.js D:/ai/comfyui-cx_sliders/js/cxsliderbank.js | grep -v "node.properties\|_getProp\|properties\." | grep "widget\.value\|this\.value" | wc -l | grep -q 0 && echo "PASS: no config in widget.value"`
  - **Commit**: None (verification only)
  - _Requirements: FR-4, AC-2.5_

- [ ] 3.13 [VERIFY] Quality checkpoint: testing phase complete
  - **Do**: Final syntax validation of all files
  - **Verify**: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done && python -c "import ast; ast.parse(open('D:/ai/comfyui-cx_sliders/__init__.py').read())" && echo "ALL PASS"`
  - **Done when**: All files pass
  - **Commit**: `chore(test): pass final testing quality checkpoint` (only if fixes needed)

---

## Phase 4: Quality Gates

- [ ] 4.1 [VERIFY] Full local validation: syntax + structure + no regressions
  - **Do**: Run complete local validation suite
  - **Verify**: All commands must pass:
    - JS syntax: `for f in cx_utils.js cx_base_widget.js cxtoggle.js cxslider.js cxdial.js cxseed.js cxsliderbank.js; do node --input-type=module --check < "D:/ai/comfyui-cx_sliders/js/$f" || exit 1; done`
    - Python syntax: `python -c "import ast; ast.parse(open('D:/ai/comfyui-cx_sliders/__init__.py').read())"`
    - File count: `ls D:/ai/comfyui-cx_sliders/js/*.js | wc -l | grep -q 7`
    - No old files: `test ! -f D:/ai/comfyui-cx_sliders/js/cxslider_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxslider_float.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxdial_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxdial_float.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxsliderbank_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxsliderbank_float.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxrangeslider_int.js && test ! -f D:/ai/comfyui-cx_sliders/js/cxrangeslider_float.js && test ! -f D:/ai/comfyui-cx_sliders/cxrangeslider.py`
    - No range slider refs: `! grep -i rangeslider D:/ai/comfyui-cx_sliders/__init__.py`
    - Version correct: `grep '__version__.*2.0.0' D:/ai/comfyui-cx_sliders/__init__.py`
  - **Done when**: All validation commands pass with no errors
  - **Commit**: `fix(quality): address validation issues` (only if fixes needed)

- [ ] 4.2 Create PR and verify
  - **Do**:
    1. Verify current branch is a feature branch: `git branch --show-current`
    2. If on default branch, STOP and alert user
    3. Push branch: `git push -u origin <branch-name>`
    4. Create PR using gh CLI: `gh pr create --title "feat: v2.0.0 custom widget rewrite" --body "<summary of all changes>"`
  - **Verify**: PR created successfully; `gh pr view --json state` shows OPEN
  - **Done when**: PR created and visible on GitHub
  - **Commit**: None (PR creation only)

---

## Phase 5: PR Lifecycle

- [ ] 5.1 [VERIFY] Post-push validation
  - **Do**:
    1. Verify all files pushed correctly: `git status` shows clean working tree
    2. Verify PR is open: `gh pr view --json state`
    3. Check diff looks correct: `gh pr diff`
  - **Verify**: `git status --porcelain | wc -l | grep -q 0 && gh pr view --json state -q '.state' | grep -q OPEN && echo "PASS"`
  - **Done when**: PR is open with correct diff
  - **Commit**: None

- [ ] 5.2 [VERIFY] AC checklist verification
  - **Do**: Programmatically verify each acceptance criteria is satisfied by checking code/tests/behavior:
    1. AC-1.1: `grep -c "export function" D:/ai/comfyui-cx_sliders/js/cx_utils.js` shows all 6 utility exports
    2. AC-1.4: No `getContentStartY` or `cleanProperties` in any file
    3. AC-2.5: Config-only state in node.properties, not widget.value
    4. AC-2.6: `type = "custom"` in CxBaseWidget
    5. AC-3.1: Each node type has ONE JS file (7 total)
    6. AC-10.1-10.3: No range slider files or references
    7. AC-10.4: cxRangeSlider files absent (ComfyUI handles missing nodes gracefully)
    8. AC-13.1: Version is 2.0.0
    9. AC-13.4: Python backend files (cxsliders.py, cxseed.py, etc.) unmodified
    10. AC-14.1-14.5: COLORS palette, MARGIN, roundRect, isLowQuality all present
  - **Verify**: Run each grep/check command above; all must pass
  - **Done when**: All verifiable acceptance criteria confirmed met via automated checks
  - **Commit**: None

---

## Notes

### POC Shortcuts Taken
- POC cxToggle implements full feature set (not minimal) since the widget is simple enough
- No automated tests — verification is syntax check + manual testing
- Migration tested only with available v1.x workflow files

### Production TODOs (Deferred)
- Automated test framework (if ever adopted for this project)
- Keyboard navigation for accessibility
- Touch/mobile support
- Global theme system
- Undo/redo beyond cxSeed's lastSeed

### Risk Areas
- `widgets.splice(idx, 0, widget)` -- POC validates this works; fallback to `addCustomWidget()` is designed in
- Mouse coordinate system (`pos[1]` vs `this.last_y`) -- POC validates exact mapping
- cxSliderBank's 8 hidden + 1 UI widget coexistence -- validated during bank implementation
- `requestAnimationFrame` timing in cxSeed -- preserved from working v1.x implementation

### Implementation Order Dependencies
```
cx_utils.js ────┐
                ├──> cx_base_widget.js (CxBaseWidget) ──> cxtoggle.js [POC]
                │                                     │
                │    cx_base_widget.js (CxNumericWidget) ──┬──> cxslider.js
                │                                          ├──> cxdial.js
                │                                          ├──> cxseed.js
                │                                          └──> cxsliderbank.js
                │
                └──> __init__.py (cleanup + version bump)
```

### Files Deleted During Implementation
| Task | Files Deleted |
|------|--------------|
| 1.19 | `js/cxslider_int.js`, `js/cxslider_float.js` |
| 1.24 | `js/cxdial_int.js`, `js/cxdial_float.js` |
| 1.37 | `js/cxsliderbank_int.js`, `js/cxsliderbank_float.js` |
| 1.38 | `js/cxrangeslider_int.js`, `js/cxrangeslider_float.js`, `cxrangeslider.py` |
