# Project issues tracker

Last audit: **2026-06-02** · Cleanup pass: **2026-06-02**

Use this file to track gaps before treating the repo as a public GitHub / ComfyUI Registry release.

---

## Summary

| Severity | Open | Resolved (this pass) |
|----------|------|----------------------|
| P0 | 0 | 2 |
| P1 | 0 | 6 |
| P2 | 0 | 7 |
| P3 | 0 | 4 |

---

## Open issues

*(none)*

---

## Resolved — 2026-06-02

| ID | Resolution |
|----|------------|
| ISSUE-001 | `LICENSE` added to repository |
| ISSUE-002 | GitHub-readiness changes committed on branch (push to origin/GitHub when ready) |
| ISSUE-003 | `pyproject.toml` and README use `https://github.com/am_Vir/comfyui-cx_sliders` |
| ISSUE-004 | Added `.github/workflows/ci.yml`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` |
| ISSUE-005 | README slider bank section + file tree updated for v3 |
| ISSUE-006 | `CLAUDE.md` synced to 3.0.0 and v3 architecture notes |
| ISSUE-007 | `pyproject.toml` expanded (readme, authors, keywords, classifiers, URLs) |
| ISSUE-008 | `example_workflows/` with two demo JSON files |
| ISSUE-009 | Removed unused `configparser` import from `__init__.py` |
| ISSUE-010 | CI workflow runs syntax + consistency + banned-pattern checks |
| ISSUE-011 | `TESTING_CHECKLIST.md` title and bank serialization items updated |
| ISSUE-012 | `manual-testing-checklist.md` marked deprecated; points to TESTING_CHECKLIST |
| ISSUE-013 | Documented in CONTRIBUTING: use descriptive PR titles when merging long-lived branches |
| ISSUE-014 | `**/.progress.md` ignore kept; tracked progress files removed from index |
| ISSUE-015 | Accepted `2026-03-07` as release date in CHANGELOG (no change) |
| ISSUE-016 | `specs/.index/` added to `.gitignore` |
| ISSUE-017 | `standards-compliance-update.md` header updated to v3.0.0 completed |
| ISSUE-018 | Archives documented in CONTRIBUTING and CLAUDE.md |
| ISSUE-019 | GitHub URLs in project metadata; `git remote add github …` documented in CONTRIBUTING |

---

## Verified healthy (ongoing)

- No `getExtraMenuOptions` in `js/`
- No hidden-widget anti-pattern in slider bank JS
- Version **3.0.0** in `pyproject.toml`, `cx_utils.js`, `README.md`, `CHANGELOG.md`
- Eight node types; Python parses; `js/docs/` help files present

---

## Manual follow-up (not automated)

1. **Create/push GitHub repo** at `am_Vir/comfyui-cx_sliders` (or update URLs if org/name differs).
2. **Push branch** and open PR into `main` with a descriptive title (branch name is historical).
3. **ComfyUI Manager / Registry** listing after public repo exists.
4. **Load example workflows** once in ComfyUI to confirm node types resolve on your install.

---

## How to maintain this file

1. Re-open issues here when new gaps are found.
2. On release prep: run CI locally or rely on GitHub Actions after push.
