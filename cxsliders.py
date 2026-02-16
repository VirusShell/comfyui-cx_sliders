# ComfyUI - cxSlider Custom Nodes
# Slider nodes for INT and FLOAT value control
# Based on mxToolkit slider design by Max Smirnov
# Supports both V1 (legacy) and V3 (modern) schema

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension

    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation

    class cxSliderInt(io.ComfyNode):
        """
        Integer slider node with adjustable range and step values.
        Provides a visual slider interface for controlling integer values.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxSliderInt",
                display_name="cxSlider - Int",
                category="utils/cxSliders",
                description="Integer slider with visual control",
                inputs=[
                    io.Int.Input(
                        "int",
                        default=1,
                        min=-2147483648,
                        max=2147483647,
                        step=1,
                    ),
                ],
                outputs=[
                    io.Int.Output(display_name="INT"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            value = kwargs.get("int", 1)
            return io.NodeOutput(int(round(value)))

    class cxSliderFloat(io.ComfyNode):
        """
        Float slider node with adjustable range, step, and decimal precision.
        Provides a visual slider interface for controlling floating-point values.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxSliderFloat",
                display_name="cxSlider - Float",
                category="utils/cxSliders",
                description="Float slider with visual control and decimal precision",
                inputs=[
                    io.Float.Input(
                        "float",
                        default=1.0,
                        min=-3.4028235e38,
                        max=3.4028235e38,
                        step=0.001,
                    ),
                ],
                outputs=[
                    io.Float.Output(display_name="FLOAT"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            value = kwargs.get("float", 1.0)
            return io.NodeOutput(float(value))

    class cxSliderExtension(ComfyExtension):
        """Extension class for cxSlider nodes."""

        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxSliderInt, cxSliderFloat]

    async def comfy_entrypoint() -> cxSliderExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxSliderExtension()

    # V1 compatibility mappings (may still be needed for some ComfyUI features)
    NODE_CLASS_MAPPINGS = {
        "cxSliderInt": cxSliderInt,
        "cxSliderFloat": cxSliderFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSliderInt": "cxSlider - Int",
        "cxSliderFloat": "cxSlider - Float",
    }

else:
    # V1 Schema Implementation (Fallback)

    class cxSliderInt:
        """
        Integer slider node with adjustable range and step values.
        Provides a visual slider interface for controlling integer values.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "int": (
                        "INT",
                        {
                            "default": 1,
                            "min": -2147483648,
                            "max": 2147483647,
                        },
                    ),
                },
            }

        RETURN_TYPES = ("INT",)
        RETURN_NAMES = ("INT",)
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            value = kwargs.get("int", 1)
            return (int(round(value)),)

    class cxSliderFloat:
        """
        Float slider node with adjustable range, step, and decimal precision.
        Provides a visual slider interface for controlling floating-point values.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "float": (
                        "FLOAT",
                        {
                            "default": 1.0,
                            "min": -3.4028235e38,
                            "max": 3.4028235e38,
                            "step": 0.001,
                        },
                    ),
                },
            }

        RETURN_TYPES = ("FLOAT",)
        RETURN_NAMES = ("FLOAT",)
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            value = kwargs.get("float", 1.0)
            return (float(value),)

    # V1 Node mappings
    NODE_CLASS_MAPPINGS = {
        "cxSliderInt": cxSliderInt,
        "cxSliderFloat": cxSliderFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSliderInt": "cxSlider - Int",
        "cxSliderFloat": "cxSlider - Float",
    }

    # Placeholder for V3 entrypoint (not used in V1 mode)
    comfy_entrypoint = None
