# Manual Testing Checklist: Custom Widget Rewrite (v2.0.0)

This checklist is used at key implementation checkpoints to verify nodes work correctly in a live ComfyUI environment. The tester loads ComfyUI, adds/interacts with nodes, and checks off each item.

**Setup**: ComfyUI must be running with the dev version of comfyui-cx_sliders installed (symlinked or copied to `custom_nodes/`). Open the browser console (F12) to watch for errors.

---

## Section 1: POC Testing (cxToggle Only)

Used at task 1.11 (POC decision gate). This is the most thorough section because it validates the foundational custom widget pattern that all other nodes depend on.

### 1.1 Node Creation and Rendering

- [ ] Add a cxToggle node from `utils/cxSliders` category -- node appears without errors
- [ ] Widget renders inside the node body with correct height (28px)
- [ ] Widget does NOT overlap input/output slot areas
- [ ] Widget background is dark (`#2a2a2a`) in inactive state (value = 0)
- [ ] Widget has a visible border
- [ ] Widget text shows "Off" label centered in the button
- [ ] Node title bar and slot labels are visible and not covered

### 1.2 Basic Interaction

- [ ] Click on toggle button -- state cycles from 0 to 1 (shows "On")
- [ ] Click again -- state wraps from 1 back to 0 (shows "Off")
- [ ] Click repeatedly -- cycles without errors or freezing
- [ ] When active (value > 0), button fill color changes to green (`#5aaa5a`)
- [ ] When inactive (value = 0), button fill color is dark background

### 1.3 Double-Click (Manual Entry)

- [ ] Double-click on node -- `canvas.prompt()` dialog appears
- [ ] Enter `1` -- toggle updates to value 1 ("On")
- [ ] Enter `0` -- toggle updates to value 0 ("Off")
- [ ] Enter non-numeric text (e.g., "abc") -- no change, no error
- [ ] Enter a value outside range (e.g., `5` with max=1) -- value clamped to valid range

### 1.4 Right-Click Context Menu

- [ ] Right-click node -- context menu includes cx-specific options
- [ ] "Toggle Fill Color..." option opens a color picker
- [ ] Pick a new fill color -- active state button changes to chosen color
- [ ] "Toggle Border Color..." opens a color picker -- border updates
- [ ] "Toggle Text Color..." opens a color picker -- text updates
- [ ] "Reset to Defaults" -- all colors revert to default palette

### 1.5 Properties Panel

- [ ] Select node, open Properties Panel in sidebar
- [ ] `min` property visible and editable (default: 0)
- [ ] `max` property visible and editable (default: 1)
- [ ] `labels` property visible (default: "Off,On")
- [ ] `fillColor` property visible and editable
- [ ] `borderColor` property visible and editable
- [ ] `textColor` property visible (default: "auto")
- [ ] Change `max` to `3` -- clicking now cycles 0, 1, 2, 3
- [ ] Change `labels` to "A,B,C,D" -- labels update on each click
- [ ] Change `labels` to "X" (fewer than states) -- remaining states show numeric labels (1, 2, 3)

### 1.6 Value Round-Trip (Serialization)

- [ ] Set toggle to value 1
- [ ] Save workflow (Ctrl+S or File > Save)
- [ ] Close/reload the browser tab
- [ ] Load the saved workflow -- toggle shows value 1 ("On")
- [ ] Open the saved workflow JSON file -- find the cxToggle node's `widgets_values`
- [ ] Confirm `widgets_values` contains `[1]` (single integer at index 0)
- [ ] Confirm `properties` contains config keys (labels, colors) but NOT the numeric value

### 1.7 Migration from v1.x Workflow

- [ ] Open a workflow saved with v1.x that contains a cxToggle node
- [ ] Node loads without console errors (check F12)
- [ ] Numeric value (toggle state) is preserved from the old workflow
- [ ] Colors may have reset to new defaults -- this is expected (AC-9.3)
- [ ] Console shows `[cx_sliders] Migrating v1.x toggle properties` at debug level

### 1.8 Error Resilience

- [ ] In Properties Panel, set `min` to a non-numeric string -- no crash, value coerced or ignored
- [ ] Set `fillColor` to an invalid value (e.g., "notacolor") -- node does not crash
- [ ] Open browser console -- any errors are prefixed with `[cx_sliders]`

### 1.9 Low-Quality Rendering

- [ ] Zoom out on the canvas until scale is <= 0.5 (very zoomed out)
- [ ] Toggle widget still renders its background shape
- [ ] Text labels are NOT drawn (performance optimization)
- [ ] Zoom back in -- text reappears

### 1.10 Splice-Insert Validation

- [ ] Widget receives `draw()` calls (it renders on canvas -- this confirms it)
- [ ] Widget receives `mouse()` calls (clicking works -- this confirms it)
- [ ] No console warnings about unregistered widgets or missing draw/mouse methods
- [ ] If splice-insert fails, document the failure for fallback plan

### 1.11 POC Decision Gate

- [ ] All items in Section 1 pass -- PROCEED with remaining nodes
- [ ] If any critical failure (rendering, serialization, mouse events) -- STOP and redesign

---

## Section 2: Per-Node Checklists

Each subsection is used after the corresponding node implementation task completes.

---

### 2.1 cxSlider (cxSliderInt + cxSliderFloat)

#### Rendering

- [ ] Add cxSliderInt node -- renders a horizontal bar slider with blue fill
- [ ] Add cxSliderFloat node -- renders identically but with decimal values
- [ ] No slot overlap on either variant
- [ ] Value text is centered on the slider bar
- [ ] Text color auto-contrasts against fill color (white on blue)
- [ ] Border is visible around the slider bar

#### Basic Interaction

- [ ] Click on slider bar -- value jumps to clicked position
- [ ] Click and drag -- value follows mouse smoothly
- [ ] Release mouse -- value stays at last position
- [ ] Int variant shows whole numbers (e.g., "42")
- [ ] Float variant shows decimal values (e.g., "42.500")

#### Modifier Keys

- [ ] Shift+drag with snap ON -- disables snap (freeform movement)
- [ ] Shift+drag with snap OFF -- enables snap (stepped movement)
- [ ] Ctrl+drag -- value can exceed min/max bounds (unlock mode)
- [ ] Release Ctrl -- unlock resets (next drag is bounded)
- [ ] Ctrl+drag shows fill extending beyond normal bar width (or negative)

#### Double-Click

- [ ] Double-click on slider -- prompt dialog appears
- [ ] Enter valid number -- slider updates to that value
- [ ] Enter non-numeric text -- no change, no error

#### Context Menu

- [ ] Right-click -- "Slider Fill Color...", "Slider Border Color...", "Slider Text Color..." options
- [ ] Pick colors -- slider appearance updates immediately
- [ ] "Reset to Defaults" -- all colors and value revert

#### Properties Panel

- [ ] `min`, `max`, `step`, `snap`, `padding` visible and editable
- [ ] `fillColor`, `borderColor`, `textColor` visible and editable
- [ ] Change `min` to 10 -- slider value clamps if below 10
- [ ] Change `max` to 50 -- slider value clamps if above 50
- [ ] Change `step` to 5 (Int) -- snapped dragging moves in steps of 5
- [ ] Change `padding` to "0.0" (Float) -- value displays with 1 decimal

#### Serialization

- [ ] Set slider to a specific value, save workflow, reload -- value preserved
- [ ] Int and Float variants both round-trip correctly

#### Edge Cases

- [ ] Set min = max (e.g., both 50) -- no crash, slider is full or empty
- [ ] Set very large range (0 to 1000000) -- slider still functional
- [ ] Set negative range (-100 to 100) -- slider works with negative values

---

### 2.2 cxDial (cxDialInt + cxDialFloat)

#### Rendering

- [ ] Add cxDialInt node -- renders a circular arc knob
- [ ] Add cxDialFloat node -- renders identically with decimal values
- [ ] No slot overlap on either variant
- [ ] 5 layers visible: dark background arc, colored fill arc, needle indicator, center dot, value text below
- [ ] Dial radius is responsive to node width
- [ ] Arc sweep is 270 degrees with 90-degree dead zone at bottom

#### Basic Interaction

- [ ] Click on/near the arc -- value jumps to angle position
- [ ] Click and drag -- value follows mouse angle smoothly
- [ ] Dragging into the 90-degree dead zone at bottom -- snaps to nearest endpoint (min or max)
- [ ] Click within the expanded hit area (30% beyond arc radius) -- still registers

#### Modifier Keys

- [ ] Shift+drag with snap ON -- disables snap (freeform angle)
- [ ] Shift+drag with snap OFF -- enables snap (stepped angles)
- [ ] Ctrl+drag does NOT unlock bounds (dials are always bounded -- AC-5.10)

#### Double-Click

- [ ] Double-click on dial -- prompt dialog appears
- [ ] Enter valid number -- dial updates
- [ ] Enter non-numeric text -- no change, no error

#### Context Menu

- [ ] Right-click -- color picker options for fill, border, text
- [ ] "Reset to Defaults" -- reverts all settings

#### Properties Panel

- [ ] `min`, `max`, `step`, `snap`, `padding` visible and editable
- [ ] `fillColor`, `borderColor`, `textColor` visible and editable
- [ ] Changing properties reflects immediately in dial rendering

#### Serialization

- [ ] Set dial to a specific value, save workflow, reload -- value preserved
- [ ] Int and Float variants both round-trip correctly

---

### 2.3 cxSeed

#### Rendering

- [ ] Add cxSeed node -- renders with standard seed widget, control dropdown, AND custom button row
- [ ] Button row shows Recall and Randomize buttons side-by-side
- [ ] Framework seed and control_after_generate widgets are visible and interactive
- [ ] No slot overlap -- buttons appear below the framework widgets
- [ ] Buttons have correct icons/labels

#### Recall Button

- [ ] Initially, Recall button appears dimmed (no lastSeed stored)
- [ ] Click Randomize first to store a seed, then click Recall
- [ ] Recall restores the previous seed value
- [ ] Recall sets `control_after_generate` to "fixed"
- [ ] Seed widget value updates to the recalled value

#### Randomize Button

- [ ] Click Randomize -- current seed is saved, new random seed is generated
- [ ] Seed widget shows a new random value
- [ ] `control_after_generate` changes to "randomize"
- [ ] Recall button becomes active (no longer dimmed)

#### Hover States

- [ ] Hover over Recall button -- color changes to hover state
- [ ] Hover over Randomize button -- color changes to hover state
- [ ] Tooltip text appears on hover ("Recall" / "Randomize")
- [ ] Moving mouse away -- buttons return to normal state

#### Context Menu

- [ ] Right-click node -- "Randomize Seed Now" option available
- [ ] "Reset to Defaults" available

#### Properties Panel

- [ ] `min`, `max`, `max_digits` visible and editable
- [ ] Set `max_digits` to 6 -- randomize generates seeds <= 999999
- [ ] Set `max_digits` to 0 -- full 64-bit range (very large seeds)

#### Serialization

- [ ] Set a specific seed, save workflow, reload -- seed value preserved
- [ ] `control_after_generate` mode preserved
- [ ] `lastSeed` is NOT serialized (it's runtime-only on the button widget)

#### BigInt Range

- [ ] With `max_digits` = 0, click Randomize multiple times
- [ ] Verify seeds can be very large numbers (beyond 2^32)

#### Control Widget Lookup

- [ ] Verify that control_after_generate widget is found correctly
- [ ] Check console for no errors about missing linked widgets

---

### 2.4 cxSliderBank (cxSliderBankInt + cxSliderBankFloat)

#### Rendering

- [ ] Add cxSliderBankInt node -- renders [+] and [-] buttons above mini-slider rows
- [ ] Add cxSliderBankFloat node -- renders identically with decimal values
- [ ] Default shows 3 mini-slider rows
- [ ] Each row has: label on left, horizontal fill bar on right
- [ ] No slot overlap -- all rows fit within the node body
- [ ] Node has 3 outputs (matching slider count)

#### Add/Remove Buttons

- [ ] Click [+] -- a new slider row appears, output count increases
- [ ] Click [+] repeatedly until 8 rows -- [+] button becomes disabled/dimmed
- [ ] Click [-] -- last slider row removed, output count decreases
- [ ] Click [-] until 1 row -- [-] button becomes disabled/dimmed
- [ ] Node resizes automatically when rows are added/removed

#### Mini-Slider Interaction

- [ ] Click on a mini-slider bar -- value jumps to clicked position
- [ ] Click and drag a mini-slider -- value follows mouse smoothly
- [ ] Drag one mini-slider -- ONLY that slider's value changes (no cross-talk)
- [ ] All 8 sliders (when visible) are independently controllable

#### Double-Click

- [ ] Double-click on a specific mini-slider row -- prompt dialog shows the row's label
- [ ] Enter valid number -- that row's slider updates
- [ ] Other rows are unaffected

#### Labels

- [ ] Default labels show "Slider 1", "Slider 2", etc.
- [ ] In Properties Panel, change `labels` to "R,G,B" -- first 3 rows show R, G, B
- [ ] Remaining rows (4+) show "Slider 4", "Slider 5" etc. (auto-padded)
- [ ] Very long labels are truncated with ".." when too wide for label area

#### Context Menu

- [ ] Right-click -- color picker options
- [ ] "Reset to Defaults" available

#### Properties Panel

- [ ] `sliderCount`, `min`, `max`, `step`, `snap`, `labels` visible
- [ ] `fillColor`, `borderColor`, `textColor` visible
- [ ] Change `sliderCount` via Properties Panel -- rows and outputs update

#### Serialization

- [ ] Set each slider to a different value, save workflow, reload
- [ ] All slider values are preserved
- [ ] Slider count is preserved
- [ ] Open saved JSON -- `widgets_values` contains 8 values (one per hidden widget)
- [ ] UI widget value is NOT in `widgets_values` (serialize: false)

#### Output Wiring

- [ ] Connect output_1 to a downstream node -- correct value flows
- [ ] Connect output_3 to another node -- correct value flows (independent of output_1)
- [ ] Remove a slider (click [-]) -- connections on removed outputs disconnect
- [ ] Add a slider back (click [+]) -- new output has no connections (clean state)

#### Modifier Keys

- [ ] Shift+drag and Ctrl+drag do NOT apply to slider bank (AC-8.11)
- [ ] Only basic click/drag interaction on mini-sliders

---

## Section 3: Migration Testing

Used after all nodes are implemented. Tests backwards compatibility with v1.x workflows.

### 3.1 v1.x Workflow Load

- [ ] Open a workflow saved with v1.x containing ALL cx node types
- [ ] No console errors on load (check F12 -- filter by `[cx_sliders]`)
- [ ] No JavaScript exceptions or stack traces

### 3.2 Value Preservation

- [ ] cxSliderInt -- numeric value matches what was saved in v1.x
- [ ] cxSliderFloat -- numeric value matches (including decimals)
- [ ] cxDialInt -- numeric value preserved
- [ ] cxDialFloat -- numeric value preserved
- [ ] cxToggle -- toggle state (integer) preserved
- [ ] cxSeed -- seed value preserved
- [ ] cxSliderBankInt -- all slider values preserved
- [ ] cxSliderBankFloat -- all slider values preserved

### 3.3 Expected Config Loss

- [ ] Custom fill colors from v1.x are reset to new defaults -- this is expected (AC-9.3)
- [ ] Custom border colors are reset -- expected
- [ ] Custom text colors are reset -- expected
- [ ] Custom labels may be reset -- expected
- [ ] Min/max/step config IS preserved (numeric config, not visual config)

### 3.4 cxRangeSlider (Removed Node)

- [ ] Open a v1.x workflow containing cxRangeSlider nodes
- [ ] ComfyUI shows standard "missing node" placeholder (red border or placeholder text)
- [ ] No crash, no unhandled exception
- [ ] Other cx nodes in the same workflow still load correctly
- [ ] Workflow can still be executed (missing node is skipped)

### 3.5 Migration Logging

- [ ] Console (F12) shows debug-level messages like `[cx_sliders] Migrating v1.x ... properties`
- [ ] No error-level migration messages unless data is actually corrupt

---

## Section 4: Cross-Node Testing

Tests interactions between multiple cx nodes and general canvas behavior.

### 4.1 Multiple Nodes in One Workflow

- [ ] Add one of each cx node type (8 total) to a single workflow
- [ ] All render correctly, no visual glitches
- [ ] No console errors from any node
- [ ] Each node operates independently (changing one doesn't affect others)

### 4.2 Connections Between Nodes

- [ ] Connect cxSliderInt output to a downstream node's input -- value flows correctly
- [ ] Connect cxSliderFloat output -- value flows correctly
- [ ] Connect cxSeed output to another node expecting an INT -- works
- [ ] Connect cxSliderBank outputs to multiple downstream nodes -- each output independent
- [ ] Disconnect and reconnect -- no stale values

### 4.3 Canvas Zoom

- [ ] Zoom to normal scale (1.0) -- all text, borders, and details visible
- [ ] Zoom out to scale ~0.5 -- text disappears, colored shapes still visible
- [ ] Zoom out further (<0.3) -- nodes are minimal colored rectangles
- [ ] Zoom back in -- all detail returns, no rendering artifacts

### 4.4 Undo/Redo

- [ ] Change a slider value, then Ctrl+Z -- observe behavior
- [ ] Redo with Ctrl+Y -- observe behavior
- [ ] Undo/redo does not cause console errors
- [ ] Node state remains consistent after undo/redo cycles

### 4.5 Node Collapse/Expand

- [ ] Double-click a node title to collapse it
- [ ] No console errors during collapse
- [ ] Double-click title again to expand
- [ ] Widget renders correctly after expand
- [ ] Widget interaction works after expand

### 4.6 Node Copy/Paste

- [ ] Select a cx node, Ctrl+C then Ctrl+V
- [ ] Pasted node has same value and properties as original
- [ ] Pasted node is independently controllable
- [ ] Both original and paste render correctly

### 4.7 Node Deletion

- [ ] Select a cx node, press Delete
- [ ] No console errors
- [ ] Connected downstream nodes handle the disconnection gracefully

### 4.8 Workflow Execution

- [ ] Build a simple workflow with cx nodes connected to downstream processing
- [ ] Queue a prompt (click "Queue Prompt")
- [ ] Verify values arrive at downstream nodes correctly
- [ ] Check Python console for no backend errors related to cx_sliders

---

## Section 5: Final Validation

Full regression pass after all nodes are implemented and cleanup is complete. Run through this entire section before creating the PR.

### 5.1 File Structure Verification

- [ ] `js/` directory contains exactly 7 files: `cx_utils.js`, `cx_base_widget.js`, `cxslider.js`, `cxdial.js`, `cxtoggle.js`, `cxseed.js`, `cxsliderbank.js`
- [ ] No old files remain: `cxslider_int.js`, `cxslider_float.js`, `cxdial_int.js`, `cxdial_float.js`, `cxsliderbank_int.js`, `cxsliderbank_float.js`, `cxrangeslider_int.js`, `cxrangeslider_float.js`
- [ ] `cxrangeslider.py` is deleted from repo root
- [ ] `__init__.py` version is `"2.0.0"`
- [ ] No commented-out range slider references in `__init__.py`

### 5.2 All 8 Node IDs Render

- [ ] cxSliderInt -- renders, interacts, serializes
- [ ] cxSliderFloat -- renders, interacts, serializes
- [ ] cxDialInt -- renders, interacts, serializes
- [ ] cxDialFloat -- renders, interacts, serializes
- [ ] cxToggle -- renders, interacts, serializes
- [ ] cxSeed -- renders, interacts, serializes
- [ ] cxSliderBankInt -- renders, interacts, serializes
- [ ] cxSliderBankFloat -- renders, interacts, serializes

### 5.3 No Slot Overlap

- [ ] For each of the 8 node IDs: widget content does NOT overlap input slot labels
- [ ] For each of the 8 node IDs: widget content does NOT overlap output slot labels
- [ ] For each of the 8 node IDs: widget starts below the title bar

### 5.4 Console Cleanliness

- [ ] Open browser console, filter for `[cx_sliders]`
- [ ] On fresh page load with no cx nodes: zero `[cx_sliders]` messages
- [ ] After adding all 8 node types: only debug-level creation messages
- [ ] After interacting with nodes: no error or warning messages
- [ ] Set `window.CX_SLIDERS_DEBUG = false` in console -- debug messages stop
- [ ] Error messages (if any) still appear even with debug silenced

### 5.5 Error Resilience Spot-Checks

- [ ] Delete a property key from a node via Properties Panel, reload -- node recovers with defaults
- [ ] Manually edit saved workflow JSON to corrupt a `widgets_values` entry (set to `null`) -- node loads with default value, no crash
- [ ] Manually edit saved workflow JSON to remove `properties` object entirely -- node loads with defaults

### 5.6 Visual Refresh Confirmation

- [ ] Overall look is "modernized" -- consistent spacing, rounded corners, good contrast
- [ ] Standard 15px margin on both sides of all widgets
- [ ] Rounded corners on all interactive elements (sliders, buttons, dials)
- [ ] Text is readable at normal zoom (good contrast ratios)
- [ ] Color palette feels cohesive across all node types (blue fills, dark backgrounds)

### 5.7 Full Workflow Test

- [ ] Create a workflow using at least 3 different cx node types
- [ ] Set values on each node
- [ ] Save workflow
- [ ] Close browser, reopen, load workflow
- [ ] All values intact
- [ ] Execute workflow -- all values flow to downstream nodes correctly
- [ ] Modify values, re-execute -- updated values flow correctly

---

## Quick Reference: Keyboard/Mouse Summary

| Action | cxSlider | cxDial | cxToggle | cxSeed | cxSliderBank |
|--------|----------|--------|----------|--------|--------------|
| Click | Set value | Set value | Cycle state | N/A (buttons) | Set mini-slider |
| Drag | Scrub value | Scrub angle | N/A | N/A | Scrub mini-slider |
| Ctrl+Drag | Unlock bounds | N/A | N/A | N/A | N/A |
| Shift+Drag | Invert snap | Invert snap | N/A | N/A | N/A |
| Double-Click | Manual entry | Manual entry | Manual entry | N/A | Manual entry (per row) |
| Right-Click | Color menu | Color menu | Color menu | Seed menu | Color menu |
