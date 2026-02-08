# ComfyUI - cxSlider Custom Nodes
# Package initialization - supports both V1 and V3 schema

__version__ = "1.0.0"

from .cxsliders import NODE_CLASS_MAPPINGS as SLIDER_MAPPINGS
from .cxsliders import NODE_DISPLAY_NAME_MAPPINGS as SLIDER_DISPLAY_MAPPINGS
from .cxseed import NODE_CLASS_MAPPINGS as SEED_MAPPINGS
from .cxseed import NODE_DISPLAY_NAME_MAPPINGS as SEED_DISPLAY_MAPPINGS

# Combine mappings
NODE_CLASS_MAPPINGS = {**SLIDER_MAPPINGS, **SEED_MAPPINGS}
NODE_DISPLAY_NAME_MAPPINGS = {**SLIDER_DISPLAY_MAPPINGS, **SEED_DISPLAY_MAPPINGS}

# V3 entrypoint (if available) - combine both extensions
try:
    from .cxsliders import comfy_entrypoint as slider_entrypoint
    from .cxseed import comfy_entrypoint as seed_entrypoint
    
    # Check if V3 is available
    if slider_entrypoint is not None and seed_entrypoint is not None:
        from comfy_api.latest import io, ComfyExtension
        
        # Import node classes
        from .cxsliders import cxSliderInt, cxSliderFloat
        from .cxseed import cxSeed
        
        class cxSliderExtensionCombined(ComfyExtension):
            """Combined extension class for all cxSlider nodes."""
            
            async def get_node_list(self) -> list[type[io.ComfyNode]]:
                return [cxSliderInt, cxSliderFloat, cxSeed]
        
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
