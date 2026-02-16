# ComfyUI - cxDial Custom Nodes
# 270-degree rotary knob for INT and FLOAT value control
# Part of the cxSlider package

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension

    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation

    class cxDialInt(io.ComfyNode):
        """
        Integer rotary dial with 270-degree arc.
        Provides a visual knob interface for controlling integer values.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxDialInt",
                display_name="cxDial - Int",
                category="utils/cxSliders",
                description="Integer dial with visual rotary control",
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

    class cxDialFloat(io.ComfyNode):
        """
        Float rotary dial with 270-degree arc.
        Provides a visual knob interface for controlling floating-point values.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxDialFloat",
                display_name="cxDial - Float",
                category="utils/cxSliders",
                description="Float dial with visual rotary control and decimal precision",
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

    class cxDialExtension(ComfyExtension):
        """Extension class for cxDial nodes."""

        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxDialInt, cxDialFloat]

    async def comfy_entrypoint() -> cxDialExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxDialExtension()

    # V1 compatibility mappings
    NODE_CLASS_MAPPINGS = {
        "cxDialInt": cxDialInt,
        "cxDialFloat": cxDialFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxDialInt": "cxDial - Int",
        "cxDialFloat": "cxDial - Float",
    }

else:
    # V1 Schema Implementation (Fallback)

    class cxDialInt:
        """
        Integer rotary dial with 270-degree arc.
        Provides a visual knob interface for controlling integer values.
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

    class cxDialFloat:
        """
        Float rotary dial with 270-degree arc.
        Provides a visual knob interface for controlling floating-point values.
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
        "cxDialInt": cxDialInt,
        "cxDialFloat": cxDialFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxDialInt": "cxDial - Int",
        "cxDialFloat": "cxDial - Float",
    }

    # Placeholder for V3 entrypoint
    comfy_entrypoint = None
