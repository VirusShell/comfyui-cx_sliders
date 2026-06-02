# Manual Testing Checklist — cx Sliders (v3.0.0+)

All nodes are under **Add Node > utils > cxSliders**.

---

## 0. Startup & Loading

- [x] ComfyUI starts without console errors related to `[cx_sliders]`
- [x] All 8 node types appear in the node menu:
  - [x] cxSlider - Int
  - [x] cxSlider - Float
  - [x] cxDial - Int
  - [x] cxDial - Float
  - [x] cxToggle
  - [x] cxSeed
  - [x] cxSliderBank - Int
  - [x] cxSliderBank - Float
- [ ] No "missing node" errors for any of the 8 node types
- [ ] Browser console shows `[cx_sliders]` debug messages when `window.CX_SLIDERS_DEBUG = true`
- [ ] Debug messages are silent when `window.CX_SLIDERS_DEBUG = false` (or unset)

---

## 1. cxSlider - Int

### 1.1 Visual Rendering
- [x] Widget renders as a horizontal bar with colored fill
- [x] Value text is centered on the bar
- [x] No overlap with input/output slots
- [x] Rounded corners on the bar
- [x] At extreme zoom-out (canvas scale < 0.5), text disappears (low-quality mode)

### 1.2 Interaction
- [x] Click on bar sets value proportionally (value changes to match click position)
- [x] Drag along bar updates value in real time
- [x] Value snaps to step increments (default step=1 for int)
- [x] **Shift+drag** inverts snap (freeform when snap=true, snapped when snap=false)
- [x] **Ctrl+drag** extends beyond min/max bounds
- [x] **Double-click** opens a text prompt to enter a value manually
- [x] Entering a valid integer in the prompt updates the value
- [x] Entering non-numeric text in the prompt is rejected (value unchanged)

### 1.3 Context Menu
- [x] Right-click shows standard LiteGraph menu PLUS custom entries
- [x] Fill color picker works (changes bar fill color)
- [x] Border color picker works
- [x] Text color picker works
- [x] "Reset to Defaults" restores original colors, min=0, max=100, step=1

### 1.4 Properties Panel
- [x] `min`, `max`, `step`, `snap`, `padding`, `fillColor`, `borderColor`, `textColor` visible
- [x] Changing `min` or `max` clamps the current value if out of new range
- [-] `textColor = "auto"` gives readable contrast against the fill

### 1.5 Serialization
- [x] Connect output to a Debug/Print node — correct integer value arrives at Python backend
- [x] Save workflow, reload — value is preserved
- [x] Queue prompt — node executes and passes value correctly

---

## 2. cxSlider - Float

### 2.1 Visual Rendering
- [x] Same as Int slider but displays decimal values (e.g., `0.500`)

### 2.2 Interaction
- [x] Same as Int slider but with float precision
- [x] Default step is 0.5, value shows decimals based on `padding` property
- [x] Shift+drag, Ctrl+drag, double-click all work

### 2.3 Serialization
- [x] Output is a float value (not rounded to int)
- [x] Save/reload preserves float precision

---

## 3. cxDial - Int

### 3.1 Visual Rendering
- [ ] Widget renders as a 270-degree arc (gap at bottom)
- [ ] Arc has: dark background, colored fill proportional to value, needle indicator, center dot
- [ ] Value text displayed below the arc
- [ ] No overlap with input/output slots
- [ ] Rounded proportions resize responsively with node width
- [ ] Low-quality mode hides detail at extreme zoom-out

### 3.2 Interaction
- [ ] Click on or near the arc sets value by angle
- [ ] Drag rotates the value smoothly
- [ ] 90-degree dead zone at the bottom snaps to nearest endpoint (min or max)
- [ ] **Shift+drag** inverts snap behavior
- [ ] **No Ctrl+drag** (dial is always bounded — verify Ctrl has no effect)
- [ ] **Double-click** opens manual entry prompt
- [ ] Hit area is generous (30% expanded circular bounds)

### 3.3 Context Menu
- [ ] Fill color picker, border color picker, text color picker
- [ ] "Reset to Defaults" works

### 3.4 Properties Panel
- [ ] `min`, `max`, `step`, `snap`, `fillColor`, `borderColor`, `textColor` visible
- [ ] Changing min/max clamps value

### 3.5 Serialization
- [ ] Output passes correct integer to Python backend
- [ ] Save/reload preserves value

---

## 4. cxDial - Float

### 4.1 Rendering & Interaction
- [ ] Same as Int dial but with float values and decimal display
- [ ] All interactions work with float precision

### 4.2 Serialization
- [ ] Output is float, save/reload preserves precision

---

## 5. cxToggle

### 5.1 Visual Rendering
- [ ] Widget renders as a button showing the current state label
- [ ] Button color changes per state
- [ ] No overlap with input/output slots

### 5.2 Interaction
- [ ] **Click** cycles to next state (wraps from max back to min)
- [ ] Default states: 0 and 1 (min=0, max=1)
- [ ] **Double-click** opens manual entry for direct state number
- [ ] Labels display correctly (default: "Off", "On" or similar)

### 5.3 Context Menu
- [ ] Color pickers work
- [ ] "Reset to Defaults" works

### 5.4 Properties Panel
- [ ] `min`, `max`, `labels`, `fillColor`, `borderColor`, `textColor` visible
- [ ] Changing `labels` to "A,B,C" and `max` to 2 gives 3 states with custom labels
- [ ] Labels auto-pad with numeric values if fewer labels than states

### 5.5 Serialization
- [ ] Output is current integer state
- [ ] Save/reload preserves state value

---

## 6. cxSeed

### 6.1 Visual Rendering
- [ ] Node shows standard seed input widget (editable number field)
- [ ] Node shows standard `control_after_generate` dropdown (fixed/increment/decrement/randomize)
- [ ] Two small buttons appear below: Recall (recycle icon) and Randomize (dice icon)
- [ ] Hover over buttons shows color change and tooltip text
- [ ] Output label is lowercase ("seed")

### 6.2 Recall Button
- [ ] Before any randomization, Recall button appears dimmed/inactive
- [ ] Click Randomize first — note the old seed value
- [ ] Click Recall — seed reverts to the old value
- [ ] After Recall, `control_after_generate` is set to "fixed"

### 6.3 Randomize Button
- [ ] Click Randomize — seed changes to a new random number
- [ ] After Randomize, `control_after_generate` is set to "randomize"
- [ ] Repeat several times — each click produces a different seed

### 6.4 Context Menu
- [ ] "Randomize Seed Now" menu item works
- [ ] "Reset to Defaults" clears lastSeed and randomizes

### 6.5 Properties Panel
- [ ] `min`, `max`, `max_digits` visible
- [ ] Setting `max_digits = 4` constrains seeds to 0-9999

### 6.6 Serialization
- [ ] Seed value passes to Python backend correctly
- [ ] Queue prompt — node executes (check `IS_CHANGED` forces re-execution)
- [ ] Save/reload preserves seed value and control mode

---

## 7. cxSliderBank - Int

### 7.1 Visual Rendering
- [ ] Node shows [+] and [-] buttons at top
- [ ] Below buttons: rows of mini-sliders (default 3)
- [ ] Each row has: label on left, horizontal fill bar on right, value text centered
- [ ] Labels are "Slider 1", "Slider 2", etc. by default
- [ ] Long labels are truncated with ".."
- [ ] Output slots match slider count (3 outputs by default, labeled lowercase)

### 7.2 Add/Remove Sliders
- [ ] Click [+] adds a row (node resizes, new output appears)
- [ ] Click [-] removes last row (node resizes, output removed)
- [ ] Maximum 8 sliders — [+] does nothing at 8
- [ ] Minimum 1 slider — [-] does nothing at 1
- [ ] Connections on removed outputs are disconnected cleanly

### 7.3 Mini-Slider Interaction
- [ ] Click on a mini-slider bar sets that row's value
- [ ] Drag on a mini-slider updates value in real time
- [ ] Dragging one row does NOT affect other rows (drag isolation)
- [ ] **Double-click** on a row opens prompt showing row label
- [ ] **No Ctrl+drag or Shift+snap** on mini-sliders

### 7.4 Context Menu
- [ ] Color pickers work (affect all mini-slider rows)
- [ ] "Reset to Defaults" restores 3 sliders, default values, default labels

### 7.5 Properties Panel
- [ ] `sliderCount`, `min`, `max`, `step`, `snap`, `labels`, colors visible
- [ ] Changing `labels` to "X,Y,Z" updates row labels
- [ ] Changing `sliderCount` via Properties Panel updates rows and outputs

### 7.6 Serialization
- [ ] Each output passes its row's integer value to Python backend
- [ ] Save/reload preserves all slider values and count
- [ ] Queue prompt — Python receives `values` JSON; all 8 outputs returned (unused rows default to 0 in JSON)

---

## 8. cxSliderBank - Float

### 8.1 Rendering & Interaction
- [ ] Same as Int bank but with float values and decimal display
- [ ] All add/remove, drag, double-click interactions work

### 8.2 Serialization
- [ ] Outputs are float values
- [ ] Save/reload preserves float precision

---

## 9. Layout & Framework Integration

- [ ] **No slot overlap**: All node types render widgets below input/output slots, no visual collision
- [x] **Node resize**: Dragging node handle resizes correctly, widgets reflow
- [o] **Collapse/expand**: Collapsing a node (double-click title) hides widgets; expanding restores them
  - There's a button top-left that handles this. It works.
- [x] **Copy/paste**: Ctrl+C / Ctrl+V duplicates a node with correct values
- [x] **Group**: Adding nodes to a group works normally
- [o] **Arrange** (if available): Auto-arrange correctly sizes nodes based on widget content
  - Sorta works, but this may be an issue with the frontend.

---

## 10. Migration — v1.x Workflow Loading

If you have workflows saved with v1.x of this package:

- [x] Load a v1.x workflow containing cxSlider nodes — values are preserved
- [ ] Load a v1.x workflow containing cxDial nodes — values are preserved
- [ ] Load a v1.x workflow containing cxToggle nodes — state is preserved
- [x] Load a v1.x workflow containing cxSeed nodes — seed value is preserved
- [ ] Load a v1.x workflow containing cxSliderBank nodes — slider values are preserved
- [x] Colors/labels from v1.x may be lost (expected) — nodes use new defaults
- [ ] No console errors during migration (check for `[cx_sliders]` migration messages)
- [x] Workflows containing old cxRangeSlider nodes show "missing node" (not a crash)

---

## 11. Error Resilience

- [ ] Delete a widget's value from workflow JSON, reload — node uses default (no crash)
- [0] Set a property to NaN via Properties Panel — reverts to default, logs warning
  - No warning in log, but this is acceptable. Value reverts correctly
- [x] Multiple nodes of same type on canvas — each operates independently
- [ ] Rapid clicking/dragging — no uncaught exceptions in console

---

## 12. Multi-Node Workflow Test

Build a workflow connecting multiple cx nodes together to verify end-to-end:

1. Add cxSlider - Int, cxSlider - Float, cxDial - Int, cxToggle, cxSeed, cxSliderBank - Int
2. Connect outputs to Debug/Print nodes or KSampler inputs
3. Queue prompt — all values pass correctly
4. Save workflow
5. Close and reopen ComfyUI
6. Load saved workflow — all values preserved, all widgets render correctly
7. Queue prompt again — same results

---

## Testing Notes

- **Browser console**: Keep DevTools open (F12) to watch for errors during all tests
- **Filter console**: Type `[cx_sliders]` in the console filter to see only this package's messages
- **Debug mode**: Run `window.CX_SLIDERS_DEBUG = true` in console before testing to see lifecycle logs
