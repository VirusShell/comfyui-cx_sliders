# Release-Readiness Assessment — comfyui-cx_sliders

> **Status update 2026-09-14:** Public GitHub (`VirusShell/comfyui-cx_sliders`) and Comfy Registry publisher `@amvir` are live. **`1.0.0`** (2026-06-10) and **`1.1.0`** (2026-09-14: dial removal, dual-color text, packaging hygiene, publish-version gate) both published green. R-3 thumbnails + optional Icon landed (placeholders). Remaining: optional Vir GUI smoke for dual-color + optional real UI screenshot swap for JPGs — not publish blockers. Historical tables below retained for provenance; prefer [WORKLIST.md](WORKLIST.md) for the live queue.

---

**Assessment date:** 2026-06-09
**Assessed version:** 3.0.0 (internal) — **reset to `1.0.0` for the first public release on 2026-06-10**; prior 2.x/3.x numbers were unpublished internal milestones.
**Branch:** `fix/node-rendering-slot-overlap` (name is historical; holds the entire v3.0.0 effort — 15 commits ahead of origin, far ahead of `main`)
**Method:** Independent code-level verification (3 parallel audits) — did *not* rely on the prior optimistic `STANDARDS_AUDIT.md` / `PROJECT_ISSUES.md` (both dated 2026-06-02, largely auto-generated).

> This file supersedes `PROJECT_ISSUES.md` and `STANDARDS_AUDIT.md` as the live release tracker. Those remain accurate for their date but predate this verification pass.

---

## Verdict

**Shipped.** Historical note (2026-06-09): code was shippable; blockers were repo identity / registry token. Those are closed as of 1.1.0.

ComfyUI standards adherence is genuinely strong: the v2.0.0 custom-widget rewrite and v3.0.0 standards pass hold up under independent scrutiny. No critical bugs. The blockers are mechanical (where the repo lives + registry identity), not architectural.

---

## P0 — Blockers (must resolve before publishing)

| ID | Item | Detail | Owner decision needed? |
|----|------|--------|------------------------|
| B-1 | ✅ RESOLVED 2026-06-09 — GitHub owner set to **`VirusShell`** | Was: GitHub URLs copied the local-Gitea username `am_Vir` (invalid on GitHub — underscores). Fixed `github.com/am_Vir`→`github.com/VirusShell` in `pyproject.toml:17-19`, `README.md:29`, `CONTRIBUTING.md`, and the `publish.yml:22` owner guard. Real Gitea URLs (`192.168.1.163/am_Vir`) intentionally left as-is. | Done |
| B-2 | Create + push the public GitHub repo | RESOLVED 2026-06-10 — GitHub repo `VirusShell/comfyui-cx_sliders` public; mains synced with Gitea | Done |
| B-3 | Registry publisher registration | RESOLVED — `@amvir` registered; `REGISTRY_ACCESS_TOKEN` set; `1.0.0` + `1.1.0` published green | Done |

**B-1 fix touches:** `pyproject.toml:17-19`, `README.md:29`, `.github/workflows/publish.yml:21-22`. Once the real owner is known these are one-line edits.

---

## P1 — Should fix before release (low effort, blocks nothing technically)

| ID | Item | Location | Status |
|----|------|----------|--------|
| R-1 | Commit the staged GitHub-readiness changes | working tree | RESOLVED — landed with public release |
| R-2 | **cxSliderBank double-click skips rounding** *(real code bug)* | `js/cxsliderbank.js:145` | ✅ FIXED 2026-06-09 — `_onDblClick` now applies `_roundValue` to the typed entry, matching drag (`:128`). Logged under CHANGELOG `[Unreleased] / Fixed`. Syntax-checked. |
| R-3 | **Add xample_workflows/ preview thumbnails** | xample_workflows/ | DONE 2026-09-14 — same-name .jpg next to both demos (diagram placeholders; replaceable with live captures). Demos cover all 6 post-cxDial nodes. Optional Icon at media/icon.png wired in pyproject (no version bump). |
| R-4 | **Remove stray empty lock file** | `specs/custom-widget-rewrite/.tasks.lock` (0 bytes) | ✅ DONE 2026-06-09 — deleted (was untracked/gitignored). |
| R-5 | **CI validates Python syntax but not JS syntax** | `.github/workflows/ci.yml` | ✅ DONE 2026-06-09 — added `setup-node` + a `JS syntax check` step running `node --input-type=module --check` over `js/*.js`. |

---

## P2 — Stale / contradictory docs (tidy; harmless if shipped as-is)

| ID | Item | Location | Status |
|----|------|----------|--------|
| D-1 | `MEMORY.md` "Pending Next Steps" is stale — claims `lessons-learned.md` is missing post-implementation content, but that content **is present**. Only the CxBaseWidget-removal step is genuinely still open. *(MEMORY.md lives in `~/.claude/` — propose changes, do not edit directly.)* | `~/.claude/projects/.../MEMORY.md` | OPEN — propose-only; left for user. |
| D-2 | `.progress.md` frontmatter read `phase: requirements / task: 0/0 / "Awaiting next task"` despite all 31 tasks `[x]` and shipped. | `specs/standards-compliance-update/.progress.md` | ✅ DONE 2026-06-09 — frontmatter → `phase: complete / 31/31`; current-task line updated. |
| D-3 | Spec doc said help pages go in `web/docs/`; correct path is `js/docs/` (WEB_DIRECTORY is `./js`). | `specs/standards-compliance-update.md:21,351` | ✅ DONE 2026-06-09 — corrected with an explicit impl note. |
| D-4 | `specs/custom-widget-rewrite/tasks.md` has 23 unchecked `[ ]` boxes — **all `[VERIFY]` checkpoints**; every implementation task is `[x]` and shipped. Process boxes, not missing work. | `specs/custom-widget-rewrite/tasks.md` | OPEN — cosmetic; left as-is (historical spec record). |
| D-5 | `PROJECT_ISSUES.md` ISSUE-012 says the old `manual-testing-checklist.md` was "marked deprecated; points to TESTING_CHECKLIST" — it was actually **deleted** (staged `D`). Note is inaccurate; no lingering references. | `PROJECT_ISSUES.md:41` | OPEN — minor; superseded by this file. |

---

## Standards adherence — verified PASS

Independently re-verified against actual code (not the prior audit). All core claims hold.

| Area | Verdict | Evidence |
|------|---------|----------|
| Anti-pattern scan (getExtraMenuOptions / hidden widget / `computeSize [0,-4]` / getContentStartY / converted-widget / cleanProperties / onDrawForeground paint) | **PASS** | Zero hits in `js/` except a self-documenting comment at `cx_utils.js:2`. |
| Custom-widget pattern (override `_draw`/`_mouse`, not framework methods) | **PASS** | `CxBaseWidget` owns `draw`/`mouse` with try/catch; concrete widgets override `_draw`/`_mouse`/`_onDblClick`. |
| `widget.value` never an array | **PASS** | Bank holds object `{s1..s8}`; `deserializeValue` rejects arrays (`cxsliderbank.js:31`). |
| Menu API `getNodeMenuItems` + `[]` guard for non-matching nodes | **PASS** | All 4 extensions; guards in `cxslider.js`, `cxsliderbank.js`, `cxtoggle.js`, `cxseed.js`. |
| Extension names `cx.sliders.*` | **PASS** | slider/toggle/seed/sliderbank all namespaced. |
| Python V1+V3 dual schema, all node files | **PASS** | `try: from comfy_api.latest import io, ComfyExtension` gate in all 5. |
| `WEB_DIRECTORY`, merged `NODE_CLASS_MAPPINGS`/display names | **PASS** | `__init__.py:102`, `:35-48`, combined V3 extension `:79-89`. |
| `SEARCH_ALIASES` (V1) + `search_aliases` (V3) | **PASS** | Every node class. |
| cxSeed `IS_CHANGED`/`fingerprint_inputs` → `NaN` | **PASS** | `cxseed.py:49-50` (V3), `:105-106` (V1). |
| No Python builtin shadowing in input names | **PASS** | Inputs are `value`/`toggle`/`seed`/`values` (old `int`/`float` gone since v2.1.0). |
| `pyproject.toml` registry metadata `[tool.comfy]` | **PASS** (identity unverified — see B-1/B-3) | `PublisherId`/`DisplayName`/`requires-comfyui >=0.3.75` present. |
| `onNodeCreated` / `onConfigure` chaining | **PASS** | All save+`?.apply(this, arguments)`. One exception: cxSeed `onMouseMove` (`:288`) unchained — low severity, no competing consumer. |
| Version consistency (4 user-visible locations + `__init__`) | **PASS** | `1.0.0` (reset 2026-06-10) in `pyproject.toml:3`, `cx_utils.js:7`, `README.md:3`, `CHANGELOG.md`; `__init__.py` reads from pyproject (SSOT). CI greps all four. |
| CI workflow | **PASS** | `ci.yml`: Python `ast.parse`, version-consistency grep, banned-pattern grep, `getNodeMenuItems` bare-return check. |
| Publish workflow | **PASS** (inert until B-3) | `publish.yml` uses `Comfy-Org/publish-node-action@v1` + `secrets.REGISTRY_ACCESS_TOKEN` (Repository secret), triggers on pyproject change to main — correct per registry docs. Owner-guarded to `VirusShell`. |
| Repo hygiene (LICENSE, README install, CONTRIBUTING, CODE_OF_CONDUCT, issue templates, .gitignore) | **PASS** | All present; `.gitignore` ignores `archives/`, `*.zip`, ralph transient state. |

### Minor code notes (not blockers, informational)
- cxSeed `max` default `0xffffffffffffffff` exceeds `Number.MAX_SAFE_INTEGER`; randomizer correctly uses BigInt + crypto rejection sampling. Value sent to backend can lose precision at the extreme top — matches ComfyUI's own seed convention.
- cxToggle `_onDblClick` uses `parseInt` (truncates) — consistent with integer-toggle semantics.

---

## Deferred / post-release (intentionally out of scope)

| Item | Source | Status |
|------|--------|--------|
| Remove `CxBaseWidget` base class → standalone widgets | MEMORY Pending step 3; `standards-compliance-update/requirements.md:166` | Scoped to a **separate future spec**. Not a blocker. |
| Automated browser/E2E tests | `STANDARDS_AUDIT.md`; tasks "Production TODOs" | Deferred — ComfyUI UI needs manual checklist; CI covers Python + grep. |
| Keyboard nav, touch/mobile, global theme, undo/redo | `tasks.md:782` | Deferred enhancements. |
| `[tool.comfy] Icon` for listing polish | registry docs (optional) | Nice-to-have. |

Standards spec **items 4 & 7** (repo URL fix; example workflows) were intentionally routed through `PROJECT_ISSUES.md` (ISSUE-003 / ISSUE-008) rather than the spec — both functionally addressed except the URL is still the Gitea-derived placeholder (B-1) and thumbnails are missing (R-3).

---

## Recommended path to release (ordered)

1. **Decide the real GitHub owner/org** and update `pyproject.toml:17-19`, `README.md:29`, `publish.yml:21-22` (B-1).
2. **Register registry publisher `@amvir`** at registry.comfy.org; add the API key as a Repository secret `REGISTRY_ACCESS_TOKEN` on the GitHub repo (B-3).
3. **Quick code fix:** add `_roundValue` to cxSliderBank `_onDblClick` (R-2). ✅ done; folded into the `1.0.0` public release.
4. **Tidy:** delete `.tasks.lock` (R-4); optionally fix stale doc states D-2/D-3/D-4; add thumbnails (R-3).
5. **Commit** the staged GitHub-readiness changes + untracked files (R-1) — single "GitHub/registry readiness" commit.
6. **Create the GitHub repo**, push the branch, open a PR into `main` with a descriptive title (branch name is historical) (B-2).
7. After repo is public + token set, **publish to ComfyUI Registry** (the `publish.yml` owner guard then passes and the action runs on the next pyproject change to main).
8. **Manual smoke test** in ComfyUI: `TESTING_CHECKLIST.md` §0/§7/§8 + load both `example_workflows/` JSONs + confirm no `[cx_sliders]` console errors with debug on.

---

*Findings consolidated from three independent verification passes on 2026-06-09. Update this file as items close; re-open in the P0–P2 tables rather than starting a new tracker.*
