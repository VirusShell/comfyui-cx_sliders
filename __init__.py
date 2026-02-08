# ComfyUI - cxSlider Custom Nodes
# Package initialization - supports both V1 and V3 schema

__version__ = "1.2.0"

from .cxsliders import NODE_CLASS_MAPPINGS as SLIDER_MAPPINGS
from .cxsliders import NODE_DISPLAY_NAME_MAPPINGS as SLIDER_DISPLAY_MAPPINGS
from .cxseed import NODE_CLASS_MAPPINGS as SEED_MAPPINGS
from .cxseed import NODE_DISPLAY_NAME_MAPPINGS as SEED_DISPLAY_MAPPINGS
from .cxtoggle import NODE_CLASS_MAPPINGS as TOGGLE_MAPPINGS
from .cxtoggle import NODE_DISPLAY_NAME_MAPPINGS as TOGGLE_DISPLAY_MAPPINGS
from .cxrangeslider import NODE_CLASS_MAPPINGS as RANGE_MAPPINGS
from .cxrangeslider import NODE_DISPLAY_NAME_MAPPINGS as RANGE_DISPLAY_MAPPINGS
from .cxdial import NODE_CLASS_MAPPINGS as DIAL_MAPPINGS
from .cxdial import NODE_DISPLAY_NAME_MAPPINGS as DIAL_DISPLAY_MAPPINGS
from .cxsliderbank import NODE_CLASS_MAPPINGS as BANK_MAPPINGS
from .cxsliderbank import NODE_DISPLAY_NAME_MAPPINGS as BANK_DISPLAY_MAPPINGS

# Combine mappings
NODE_CLASS_MAPPINGS = {
    **SLIDER_MAPPINGS,
    **SEED_MAPPINGS,
    **TOGGLE_MAPPINGS,
    **RANGE_MAPPINGS,
    **DIAL_MAPPINGS,
    **BANK_MAPPINGS,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    **SLIDER_DISPLAY_MAPPINGS,
    **SEED_DISPLAY_MAPPINGS,
    **TOGGLE_DISPLAY_MAPPINGS,
    **RANGE_DISPLAY_MAPPINGS,
    **DIAL_DISPLAY_MAPPINGS,
    **BANK_DISPLAY_MAPPINGS,
}

# V3 entrypoint (if available) - combine all extensions
try:
    from .cxsliders import comfy_entrypoint as slider_entrypoint
    from .cxseed import comfy_entrypoint as seed_entrypoint
    from .cxtoggle import comfy_entrypoint as toggle_entrypoint
    from .cxrangeslider import comfy_entrypoint as range_entrypoint
    from .cxdial import comfy_entrypoint as dial_entrypoint
    from .cxsliderbank import comfy_entrypoint as bank_entrypoint

    # Check if V3 is available (all entrypoints must be non-None)
    _entrypoints = [slider_entrypoint, seed_entrypoint, toggle_entrypoint,
                    range_entrypoint, dial_entrypoint, bank_entrypoint]
    if all(ep is not None for ep in _entrypoints):
        from comfy_api.latest import io, ComfyExtension

        # Import node classes
        from .cxsliders import cxSliderInt, cxSliderFloat
        from .cxseed import cxSeed
        from .cxtoggle import cxToggle
        from .cxrangeslider import cxRangeSliderInt, cxRangeSliderFloat
        from .cxdial import cxDialInt, cxDialFloat
        from .cxsliderbank import cxSliderBankInt, cxSliderBankFloat

        class cxSliderExtensionCombined(ComfyExtension):
            """Combined extension class for all cx nodes."""

            async def get_node_list(self) -> list[type[io.ComfyNode]]:
                return [
                    cxSliderInt, cxSliderFloat, cxSeed,
                    cxToggle,
                    cxRangeSliderInt, cxRangeSliderFloat,
                    cxDialInt, cxDialFloat,
                    cxSliderBankInt, cxSliderBankFloat,
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

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']

# Add comfy_entrypoint to exports if available
if comfy_entrypoint is not None:
    __all__.append('comfy_entrypoint')
