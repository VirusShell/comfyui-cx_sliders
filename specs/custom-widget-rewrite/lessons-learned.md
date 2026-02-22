# Lessons Learned — custom-widget-rewrite

Maintained throughout the spec lifecycle. Captures decisions, surprises, and insights for future reference.

---

## Design Phase

### Decision: Two-level class hierarchy
- **Choice**: `CxBaseWidget` → `CxNumericWidget` → concrete widgets (Slider, Dial, SliderBank). cxToggle and cxSeed extend CxBaseWidget directly.
- **Rationale**: Slider, Dial, and SliderBank share substantial min/max/step/snap + Ctrl+drag/Shift+drag logic. Intermediate class deduplicates this without adding unnecessary depth for simpler nodes.

### Decision: One file per node type (not shared registry)
- **Choice**: Each of 5 node types gets its own JS file with `registerExtension`.
- **Rationale**: Surveyed 32 installed custom node packages — split is ~55% one-per-node vs ~45% shared registry. Neither is "the standard." One-per-node fits better when nodes are independent (cx_sliders nodes don't coordinate). Real deduplication comes from the class hierarchy, not registration centralization.
- **Lesson**: Don't assume one pattern dominates — always verify against real installed packages before claiming something is "standard."

### Finding: Widget replacement patterns across ecosystem
- **Pattern 1 — Hide + Override** (~70%): Hide backend widget, draw manually in `onDrawForeground`. Most common but is an anti-pattern (bypasses layout).
- **Pattern 2 — Splice and Remove** (~5%): rgthree-comfy uses `widgets.splice()` to cleanly remove unwanted auto-widgets.
- **Pattern 3 — Custom Widget via `addCustomWidget()`** (~15-20%): Framework manages layout, no manual Y calculations. Cleanest but newer, less adopted.
- **Pattern 4 — `getCustomWidgets()` hook** (~10%): Most modern, registers widget factories via extension hook. Emerging pattern.
- **Lesson**: The "correct" pattern (3/4) has low ecosystem adoption because most packages predate it. Being correct and being common are different things — choose correctness for new architecture.

### Decision: Widget replacement strategy — defer to POC
- **Choice**: Design supports both replace-in-place and hide+overlay. POC task with cxToggle will try replace-in-place first; fall back to hide+overlay if `widgets_values` serialization breaks.
- **Rationale**: Replace-in-place is architecturally cleaner but has unverified serialization risk. POC eliminates guesswork.

### Decision: New unified color palette
- **Choice**: Design a cohesive new color system from scratch rather than evolving the existing blue/orange identity.
- **Rationale**: Since this is a v2.0.0 breaking change anyway, fresh palette avoids being anchored to arbitrary legacy colors. Gives design freedom for better contrast and visual coherence.

---

## Research Phase (prior)

### Key architectural finding
- All 10 existing JS files use the wrong pattern (hidden widgets + onDrawForeground).
- Correct pattern verified via rgthree-comfy source code.
- Custom widget `value` IS serialized automatically — no hidden backend widgets needed (except cxSliderBank's special case).

---

### Review Finding: Promote shared methods to base class
- `_getProp()` and `_resolveTextColor()` were initially placed only in `CxNumericWidget`, but `CxToggleWidget` (which extends `CxBaseWidget` directly) also needs them. Promoted to `CxBaseWidget` to avoid duplication.
- **Lesson**: When designing class hierarchies, check if ALL subclasses (not just one branch) need a method before placing it in an intermediate class.

### Review Finding: Track drag initiator in base class
- Base class `_dispatchMouse` was dispatching `onMove` to ALL hit areas during a drag. For CxSliderBankWidget with multiple slider rows, this required per-subclass guards. Fix: `_activeDragArea` in base class tracks which hit area started the drag.
- **Lesson**: Base class mouse dispatch should be precise, not broadcast. Subclasses shouldn't need to filter events the base class could scope correctly.

### Review Finding: Cache framework-provided values
- `_height` getter was calling `computeSize()` on every mouse event. Fix: store `_lastHeight` from the `draw()` parameter.
- **Lesson**: Framework callbacks often provide useful values as parameters. Cache them rather than recomputing.

### Review Finding: Widget insertion order matters for serialization
- `addCustomWidget()` appends to end of `widgets` array, which can shift `widgets_values` serialization indices. Fix: use `widgets.splice(idx, 0, widget)` to insert at the same position as the replaced widget.
- **Lesson**: ComfyUI serializes widgets by array position. Any operation that changes widget order must account for serialization impact.

## Tasks Phase

### Decision: Per-file task granularity
- **Choice**: Each JS file = 1 task + 1 commit. Not per-feature (too many tasks) or per-phase (too coarse).
- **Rationale**: Balanced — each commit produces a complete working file, easy to test and debug independently.

### Decision: Pause after POC for manual testing
- **Choice**: Explicit pause at task 1.11 for user to restart ComfyUI and manually test cxToggle.
- **Rationale**: The POC validates the foundational pattern (splice-then-insert, framework layout, mouse events). If it's wrong, everything built on it is wrong. Worth the pause.

### Decision: Delete old files as you go
- **Choice**: Delete old JS files in the same commit as their replacements.
- **Rationale**: Keeps workspace clean, on a feature branch so git history is the fallback.

### Review Finding: Traceability gaps catch requirement coverage holes
- Reviewer found 8 acceptance criteria (AC-2.5, AC-10.4, AC-11.4, AC-13.4, AC-14.1-14.4) with no task coverage. All were real gaps.
- **Lesson**: "Obvious" requirements (like "no other Python changes needed" = AC-13.4) still need explicit task traceability. Negative requirements are easy to miss.

## Process Observations

- Spec-reviewer caught 5 real architectural issues on first pass (design) — the review loop is worth the time
- All 5 issues were fixable without restructuring the design (targeted revisions, not rewrites)
- Second review passed cleanly — revision quality was high
- Tasks review caught 6 traceability issues — mostly annotation gaps, not structural problems
- Phase 2 "Refactoring" was a misnomer for what was really "Error Handling & Hardening" — naming matters for clarity
