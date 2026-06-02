# Contributing

Thanks for helping improve **comfyui-cx_sliders**.

## Setup

1. Clone into ComfyUI custom nodes (folder name is flexible; `comfyui_cxslider` is common):

   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/am_Vir/comfyui-cx_sliders.git comfyui_cxslider
   ```

2. Restart ComfyUI. Nodes appear under **Add Node → utils → cxSliders**.

3. For UI debugging, open the browser console and run: `window.CX_SLIDERS_DEBUG = true`.

## Before you open a PR

1. Run local checks (same as CI):

   ```bash
   python -c "import ast, pathlib; [ast.parse(p.read_text()) for p in pathlib.Path('.').glob('*.py')]"
   ```

2. Complete the manual testing checklist: [specs/custom-widget-rewrite/TESTING_CHECKLIST.md](specs/custom-widget-rewrite/TESTING_CHECKLIST.md).

3. If you change behavior, update [CHANGELOG.md](CHANGELOG.md) under **Unreleased**.

4. Bump version in all four places when releasing: `pyproject.toml`, `js/cx_utils.js` (`CX_VERSION`), `README.md` header, `CHANGELOG.md`.

## Code conventions

- **Python**: Dual V1/V3 schema per node file; backend stays pass-through.
- **JavaScript**: Custom widgets via `addCustomWidget()`; override `_draw` / `_mouse`, not `draw` / `mouse`.
- **Do not** reintroduce hidden widgets, `getExtraMenuOptions`, or manual slot Y math — see [CLAUDE.md](CLAUDE.md) and [CODEBASE.MD](CODEBASE.MD).

## Architecture docs

| Doc | Purpose |
|-----|---------|
| [CODEBASE.MD](CODEBASE.MD) | Repository map |
| [CLAUDE.md](CLAUDE.md) | Agent-oriented framework notes |
| [PROJECT_ISSUES.md](PROJECT_ISSUES.md) | Known gaps tracker |

## Releases

Optional versioned zips can be placed in `archives/` (gitignored). Tag releases on GitHub to match `CHANGELOG.md` sections.

## Remotes

This repo may also exist on a private Gitea instance. After forking or mirroring to GitHub, add a second remote if needed:

```bash
git remote add github https://github.com/am_Vir/comfyui-cx_sliders.git
```

Update `pyproject.toml` `[project.urls]` if your fork uses a different org or repo name.
