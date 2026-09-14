# ComfyUI - cxSeed Custom Node
# Seed generation node with control options
# Part of the cxSlider package

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension
    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation
    
    class cxSeed(io.ComfyNode):
        """
        Seed generation node with configurable control after generation.
        Uses ComfyUI's built-in seed control mechanism.
        """
        
        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxSeed",
                display_name="cxSeed",
                category="utils/cxSliders",
                description="Seed generator with control options",
                search_aliases=["seed", "random seed", "cx seed"],
                inputs=[
                    io.Int.Input(
                        "seed",
                        default=0,
                        min=0,
                        max=0xffffffffffffffff,
                        control_after_generate="randomize",
                    ),
                ],
                outputs=[
                    io.Int.Output(display_name="SEED"),
                ],
            )
        
        @classmethod
        def execute(cls, seed: int) -> io.NodeOutput:
            return io.NodeOutput(seed)

        @classmethod
        def fingerprint_inputs(cls, seed: int) -> float:
            return float("NaN")


    class cxSeedExtension(ComfyExtension):
        """Extension class for cxSeed node."""
        
        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxSeed]


    async def comfy_entrypoint() -> cxSeedExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxSeedExtension()
    
    # V1 compatibility mappings
    NODE_CLASS_MAPPINGS = {
        "cxSeed": cxSeed,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSeed": "cxSeed",
    }

else:
    # V1 Schema Implementation (Fallback)
    
    class cxSeed:
        """
        Seed generation node with configurable control after generation.
        Uses ComfyUI's built-in seed control mechanism.
        """
        
        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "seed": ("INT", {
                        "default": 0,
                        "min": 0,
                        "max": 0xffffffffffffffff,
                        "control_after_generate": "randomize",
                    }),
                },
            }

        RETURN_TYPES = ("INT",)
        RETURN_NAMES = ("SEED",)
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"
        SEARCH_ALIASES = ["seed", "random seed", "cx seed"]
        
        def execute(self, seed: int):
            return (seed,)

        @classmethod
        def IS_CHANGED(cls, seed: int) -> float:
            return float("NaN")


    # V1 Node mappings
    NODE_CLASS_MAPPINGS = {
        "cxSeed": cxSeed,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSeed": "cxSeed",
    }
    
    # Placeholder for V3 entrypoint
    comfy_entrypoint = None
