# Worklist — comfyui-cx_sliders

**Updated:** 2026-06-09 · Ordered by what matters. Rationale/evidence for each item lives in [RELEASE_READINESS.md](RELEASE_READINESS.md) (the assessment); this file is just the actionable queue.

Legend: ☐ todo · ☑ done · ⊘ deferred (intentionally out of scope now)

---

## Now — local quality (no GitHub needed)

- ☑ Fix cxSliderBank double-click rounding bug (`js/cxsliderbank.js:145`) — *done 2026-06-09*
- ☑ Remove stray `.tasks.lock`; tidy stale spec frontmatter + `web/docs`→`js/docs` doc error — *done 2026-06-09*
- ☑ Stage & commit the above + GitHub-readiness docs to Gitea — *done 2026-06-09*
- ☐ **Manual smoke test in ComfyUI** — the one thing CI can't cover. Run `specs/custom-widget-rewrite/TESTING_CHECKLIST.md` §0/§7/§8, load both `example_workflows/*.json`, confirm no `[cx_sliders]` console errors with debug on. *(Highest-value remaining check — validates the v3 rewrite actually renders.)*
- ☐ Add JS syntax check to CI (`node --input-type=module --check` over `js/*.js`) — CI parses Python but not JS. Low effort. *(RELEASE_READINESS R-5)*

## Before going public (GitHub + ComfyUI Registry)

- ☐ **Decide the real GitHub owner/org** — `am_Vir` is a Gitea username, invalid on GitHub (underscore). Update `pyproject.toml:17-19`, `README.md:29`, `.github/workflows/publish.yml:21-22`. *(P0 — needs your decision)*
- ☐ **Confirm/register ComfyUI registry publisher `@vir`** (`pyproject.toml` `[tool.comfy] PublisherId`) and add the `REGISTRY_ACCESS_TOKEN` secret on the GitHub repo. *(P0)*
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
