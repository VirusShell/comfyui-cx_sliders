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

## Execution Phase

### Finding: Splice-then-insert works for widget replacement
- POC (cxToggle) confirmed that `widgets.splice(idx, 1)` to remove the auto-created widget, then `widgets.splice(idx, 0, customWidget)` to insert the custom widget at the same index, preserves `widgets_values` serialization order.
- Framework correctly calls `draw()`/`mouse()`/`computeSize()` on splice-inserted widgets — no difference from `addCustomWidget()`.
- **Lesson**: The splice approach is cleaner than hide+overlay and fully supported, just underdocumented.

### Finding: Per-file commits kept debugging tractable
- Each JS file = 1 commit meant when manual testing found bugs, the scope of "what changed" was small.
- 7 bugs found in manual testing (task 2.7) spanned 4 files — fixing was fast because each file was a known-good baseline from its commit.
- **Lesson**: Per-file granularity pays off during debugging. Per-feature (bundling slider + dial + toggle) would have made bug isolation harder.

### Finding: Manual testing caught bugs that structural checks missed
- Syntax validation and grep-based checks (Phases 3-4) all passed, but manual testing (task 2.7) found 7 bugs:
  - Double-click prompt not working (missing `onPointerDown` in some widgets)
  - Dial sizing wrong at certain aspect ratios
  - Poor text contrast on light fill colors
  - Missing tooltips
  - `current` property not syncing on slider/dial
  - Seed properties not applied
  - SliderBank double-click targeting wrong row
- **Lesson**: Without automated tests, structural validation catches syntax/wiring issues but not behavioral bugs. Manual testing is irreplaceable for UI widgets.

### Finding: gh CLI not available — used Gitea API directly
- PR creation required raw REST API calls (`POST /api/v1/repos/:owner/:repo/pulls`) with Basic auth from git credential manager.
- **Lesson**: Don't assume gh CLI is installed. Know the underlying API for your git hosting platform.

### Finding: AC-13.4 failure was an intentional scope change
- `value_override` removal from cxSliders.py was done during implementation but not documented in the spec. AC-13.4 ("no Python backend changes") correctly flagged it.
- Resolution: Accepted as intentional v2.0.0 breaking change, updated README to remove references.
- **Lesson**: When implementation diverges from spec, document the divergence explicitly. AC verification exists to catch exactly this.

### Decision: CxNumericWidget layer justified by code reuse
- Slider, Dial, and SliderBank shared min/max/step/snap, Ctrl+drag precision, Shift+drag inversion, and color menu logic — ~120 lines of shared code.
- Toggle and Seed correctly skip this layer (fundamentally different interaction models).
- **Lesson**: Intermediate class layer was the right call. The alternative (copy-pasting 120 lines into 3 files) would have been worse.

### Finding: Error boundaries in base class eliminated boilerplate
- `CxBaseWidget.draw()` wraps `_draw()` in try/catch with structured logging. Subclasses never need error handling in their draw methods.
- Same pattern for `mouse()` → `_mouse()`.
- **Lesson**: Error boundary at the base class level is the right abstraction. It's the one thing base classes are unambiguously good for.

---

## Post-Release (v2.1.0, v3.0.0)

### Decision: Input name standardization (v2.1.0)
- Renamed `int`/`float` input names to `value` — avoids shadowing Python builtins and follows ComfyUI naming conventions.
- **Lesson**: Input naming matters for `execute(**kwargs)`. Names like `int` and `float` shadow builtins and cause subtle issues with type hints.

### Decision: Single `values` JSON input for SliderBank (v3.0.0)
- Replaced 8 separate `slider_N` hidden widgets with a single `values` STRING input containing `{"s1":N,...,"s8":N}`.
- Uses `serializeValue()`/`deserializeValue()` for JSON round-trip.
- v2.x migration via `onConfigure` detects old 8-number `widgets_values` format.
- **Lesson**: The 8-hidden-widget approach from v2.0.0 was the safe choice for the rewrite, but once the architecture proved stable, consolidating to a single JSON value was cleaner and eliminated serialization order fragility.

### Finding: Context menu API migration
- `getExtraMenuOptions` is deprecated; `getNodeMenuItems` is the modern API.
- Key difference: `getNodeMenuItems` receives `(app)` not `(canvas)`, and must return `null` (not empty array) for non-matching nodes.
- **Lesson**: Check ComfyUI deprecation notices before shipping. The old API works but generates console warnings.

### Finding: Extension name standardization matters
- Changed from ad-hoc names (e.g., `comfy.cx_sliders.toggle`) to consistent `cx.sliders.*` format.
- **Lesson**: Extension names are identifiers, not descriptions. Consistent naming prevents collisions and makes debugging easier.

---

## Process Observations

- Spec-reviewer caught 5 real architectural issues on first pass (design) — the review loop is worth the time
- All 5 issues were fixable without restructuring the design (targeted revisions, not rewrites)
- Second review passed cleanly — revision quality was high
- Tasks review caught 6 traceability issues — mostly annotation gaps, not structural problems
- Phase 2 "Refactoring" was a misnomer for what was really "Error Handling & Hardening" — naming matters for clarity
- **67 tasks across 5 phases** completed the full rewrite. POC gate (task 1.11) was the most valuable checkpoint — it validated the entire architecture before committing to the remaining 56 tasks.
- **Iterative releases worked well**: v2.0.0 (architecture rewrite) → v2.1.0 (naming cleanup) → v3.0.0 (schema simplification). Each release was independently shippable.
- **Spec-driven development ROI**: Research docs (5 memory files + 11 external docs) prevented dozens of wrong turns. The upfront research cost (~1 day) saved significantly more time during implementation.
- **Base class removal is still pending**: Only 1/85 ComfyUI packs uses a base class pattern. Consider refactoring to standalone widgets in a future release to reduce indirection.
