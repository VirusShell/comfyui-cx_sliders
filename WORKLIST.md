# Worklist - comfyui-cx_sliders

**Updated:** 2026-09-14 — Ordered by what matters. Historical assessment: [RELEASE_READINESS.md](RELEASE_READINESS.md). This file is the actionable queue.

Legend: `[ ]` todo · `[x]` done · `[~]` deferred (intentionally out of scope now)

---

## Shipped (do not reopen)

- [x] Fix cxSliderBank double-click rounding (`js/cxsliderbank.js`) — 2026-06-09
- [x] JS syntax check in CI — 2026-06-09
- [x] GitHub owner / URLs → `VirusShell` — 2026-06-09
- [x] Public GitHub repo + first Registry publish `1.0.0` — 2026-06-10
- [x] Standards hygiene (`.comfyignore`, `requires-python >=3.10`, empty `dependencies`) — 2026-09-14
- [x] **cxDial removed entirely** — 2026-09-14
- [x] Dual-color slider value text adopted onto main — 2026-09-14
- [x] Registry publish gate (skip when `[project].version` unchanged) + bump **`1.1.0`** — published green 2026-09-14
- [x] Dual remotes aligned on shared tree (Gitea `origin` + GitHub `github`)

## Open / polish

- [ ] **Manual ComfyUI visual smoke** for dual-color `textColor=auto` across fill ratios (needs Vir / GUI host) — code landed; no further JS polish owed without smoke findings
- [x] Example workflow preview thumbnails (.jpg) for template browser — *(R-3 done 2026-09-14: diagram placeholders; Vir may replace with live ComfyUI captures)*
- [~] Optional `[tool.comfy] Icon` for Registry listing polish
- [~] Historical VERIFY boxes in archived rewrite tasks (cosmetic; see `.archive/specs/`)

## Deferred (post-release / future spec)

- [~] Remove `CxBaseWidget` → standalone widgets — separate spec
- [~] Pin `comfy_api.v0_0_2` (vs `latest`) — needs Comfy version smoke
- [~] Comfy-Action / pytest scaffold
- [~] Automated browser/E2E, keyboard nav, touch/mobile, global theme, undo/redo
- [~] Package / node-id rename (breaking / immutable after Registry publish)
