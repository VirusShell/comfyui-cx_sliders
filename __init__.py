# ComfyUI - cxSlider Custom Nodes
# Package initialization - supports both V1 and V3 schema

import os

def _read_version():
    """Read version from pyproject.toml (single source of truth)."""
    pyproject_path = os.path.join(os.path.dirname(__file__), "pyproject.toml")
    try:
        # Line scan: [project] version = "X.Y.Z" (no TOML parser dependency)
        with open(pyproject_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("version"):
                    # Parse: version = "X.Y.Z"
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except (OSError, IndexError):
        pass
    return "0.0.0"

__version__ = _read_version()

from .cxsliders import NODE_CLASS_MAPPINGS as SLIDER_MAPPINGS
from .cxsliders import NODE_DISPLAY_NAME_MAPPINGS as SLIDER_DISPLAY_MAPPINGS
from .cxseed import NODE_CLASS_MAPPINGS as SEED_MAPPINGS
from .cxseed import NODE_DISPLAY_NAME_MAPPINGS as SEED_DISPLAY_MAPPINGS
from .cxtoggle import NODE_CLASS_MAPPINGS as TOGGLE_MAPPINGS
from .cxtoggle import NODE_DISPLAY_NAME_MAPPINGS as TOGGLE_DISPLAY_MAPPINGS
from .cxsliderbank import NODE_CLASS_MAPPINGS as BANK_MAPPINGS
from .cxsliderbank import NODE_DISPLAY_NAME_MAPPINGS as BANK_DISPLAY_MAPPINGS

# Combine mappings
NODE_CLASS_MAPPINGS = {
    **SLIDER_MAPPINGS,
    **SEED_MAPPINGS,
    **TOGGLE_MAPPINGS,
    **BANK_MAPPINGS,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    **SLIDER_DISPLAY_MAPPINGS,
    **SEED_DISPLAY_MAPPINGS,
    **TOGGLE_DISPLAY_MAPPINGS,
    **BANK_DISPLAY_MAPPINGS,
}

# V3 entrypoint (if available) - combine all extensions
try:
    from .cxsliders import comfy_entrypoint as slider_entrypoint
    from .cxseed import comfy_entrypoint as seed_entrypoint
    from .cxtoggle import comfy_entrypoint as toggle_entrypoint
    from .cxsliderbank import comfy_entrypoint as bank_entrypoint

    # Check if V3 is available (all entrypoints must be non-None)
    _entrypoints = [
        slider_entrypoint,
        seed_entrypoint,
        toggle_entrypoint,
        bank_entrypoint,
    ]
    if all(ep is not None for ep in _entrypoints):
        from comfy_api.latest import io, ComfyExtension

        # Import node classes
        from .cxsliders import cxSliderInt, cxSliderFloat
        from .cxseed import cxSeed
        from .cxtoggle import cxToggle
        from .cxsliderbank import cxSliderBankInt, cxSliderBankFloat

        class cxSliderExtensionCombined(ComfyExtension):
            """Combined extension class for all cx nodes."""

            async def get_node_list(self) -> list[type[io.ComfyNode]]:
                return [
                    cxSliderInt,
                    cxSliderFloat,
                    cxSeed,
                    cxToggle,
                    cxSliderBankInt,
                    cxSliderBankFloat,
                ]

        async def comfy_entrypoint() -> cxSliderExtensionCombined:
            """ComfyUI calls this to load the extension and its nodes."""
            return cxSliderExtensionCombined()

    else:
        comfy_entrypoint = None

except ImportError:
    comfy_entrypoint = None

# Web directory for JavaScript extensions
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

# Add comfy_entrypoint to exports if available
if comfy_entrypoint is not None:
    __all__.append("comfy_entrypoint")
