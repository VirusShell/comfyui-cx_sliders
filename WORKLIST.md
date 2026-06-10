# Worklist — comfyui-cx_sliders

**Updated:** 2026-06-09 · Ordered by what matters. Rationale/evidence for each item lives in [RELEASE_READINESS.md](RELEASE_READINESS.md) (the assessment); this file is just the actionable queue.

Legend: ☐ todo · ☑ done · ⊘ deferred (intentionally out of scope now)

---

## Now — local quality (no GitHub needed)

- ☑ Fix cxSliderBank double-click rounding bug (`js/cxsliderbank.js:145`) — *done 2026-06-09*
- ☑ Remove stray `.tasks.lock`; tidy stale spec frontmatter + `web/docs`→`js/docs` doc error — *done 2026-06-09*
- ☑ Stage & commit the above + GitHub-readiness docs to Gitea — *done 2026-06-09*
- ☑ **Manual smoke test in ComfyUI** — renders fine (confirmed by user, 2026-06-09). Nodes render correctly in the v3 rewrite.
- ☑ Add JS syntax check to CI (`node --input-type=module --check` over `js/*.js`) — *done 2026-06-09*

## Before going public (GitHub + ComfyUI Registry)

- ☑ **GitHub owner set to `xVir`** (2026-06-09) — fixed `github.com/am_Vir`→`github.com/xVir` in `pyproject.toml`, `README.md`, `CONTRIBUTING.md`, `publish.yml`. Gitea URLs left as `am_Vir` (real Gitea path).
- ☐ **Register ComfyUI registry publisher `@amvir`** at registry.comfy.org (`pyproject.toml` `[tool.comfy] PublisherId = "amvir"` is set), create an API key, and add it as a **Repository** secret `REGISTRY_ACCESS_TOKEN` on the GitHub repo (not an Environment secret — `publish.yml` declares no `environment:`). *(P0)*
- ☐ Create the GitHub repo, push the branch, open PR into `main` with a descriptive title (branch name is historical). *(P0)*
- ☐ Finalize the version: move CHANGELOG `[Unreleased]` (the rounding fix) into a tagged release entry and bump per SemVer when you cut the release.

## Nice-to-have / polish

- ☐ Add `example_workflows/` preview thumbnails (`.jpg`/`.png`) — registry listings show them. Capture from ComfyUI after the smoke test. *(R-3)*
- ☐ Optional `[tool.comfy] Icon` for registry listing polish.
- ☐ Check off the 23 `[VERIFY]` boxes in `specs/custom-widget-rewrite/tasks.md` (cosmetic; all impl tasks already done).
- ☐ Propose refresh of `~/.claude/.../MEMORY.md` "Pending Next Steps" (stale — says lessons-learned is incomplete; it isn't). *Propose-only — don't edit `~/.claude` directly.*

## Deferred (post-release / future spec)

- ⊘ Remove `CxBaseWidget` base class → standalone widgets — scoped to a separate spec.
- ⊘ Automated browser/E2E tests, keyboard nav, touch/mobile, global theme, undo/redo.
- ⊘ Dial Ctrl+drag out-of-range parity with slider.
- ⊘ **Decide the cxDial nodes' future** (deferred 2026-06-10): now **disabled** in `__init__.py` (code retained). Interaction + resize bugs are fixed, but dials duplicate slider output and the click-the-angle UX is fiddly. When revisited: improve (vertical drag-to-adjust knob) and re-enable, or remove `cxDialInt`/`cxDialFloat` entirely.
