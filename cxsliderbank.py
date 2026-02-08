# ComfyUI - cxSliderBank Custom Nodes
# Vertically stacked slider bank with dynamic add/remove outputs
# Part of the cxSlider package

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension
    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation

    class cxSliderBankInt(io.ComfyNode):
        """
        Integer slider bank with up to 8 vertically stacked sliders.
        Dynamic add/remove of output slots.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxSliderBankInt",
                display_name="cxSliderBank - Int",
                category="utils/cxSliders",
                description="Bank of integer sliders with dynamic outputs",
                inputs=[
                    io.Int.Input("slider_1", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_2", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_3", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_4", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_5", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_6", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_7", default=0, min=-2147483648, max=2147483647),
                    io.Int.Input("slider_8", default=0, min=-2147483648, max=2147483647),
                ],
                outputs=[
                    io.Int.Output(display_name="OUT_1"),
                    io.Int.Output(display_name="OUT_2"),
                    io.Int.Output(display_name="OUT_3"),
                    io.Int.Output(display_name="OUT_4"),
                    io.Int.Output(display_name="OUT_5"),
                    io.Int.Output(display_name="OUT_6"),
                    io.Int.Output(display_name="OUT_7"),
                    io.Int.Output(display_name="OUT_8"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            values = []
            for i in range(1, 9):
                values.append(int(round(kwargs.get(f"slider_{i}", 0))))
            return io.NodeOutput(*values)


    class cxSliderBankFloat(io.ComfyNode):
        """
        Float slider bank with up to 8 vertically stacked sliders.
        Dynamic add/remove of output slots.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxSliderBankFloat",
                display_name="cxSliderBank - Float",
                category="utils/cxSliders",
                description="Bank of float sliders with dynamic outputs",
                inputs=[
                    io.Float.Input("slider_1", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_2", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_3", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_4", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_5", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_6", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_7", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                    io.Float.Input("slider_8", default=0.0, min=-3.4028235e+38, max=3.4028235e+38, step=0.001),
                ],
                outputs=[
                    io.Float.Output(display_name="OUT_1"),
                    io.Float.Output(display_name="OUT_2"),
                    io.Float.Output(display_name="OUT_3"),
                    io.Float.Output(display_name="OUT_4"),
                    io.Float.Output(display_name="OUT_5"),
                    io.Float.Output(display_name="OUT_6"),
                    io.Float.Output(display_name="OUT_7"),
                    io.Float.Output(display_name="OUT_8"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            values = []
            for i in range(1, 9):
                values.append(float(kwargs.get(f"slider_{i}", 0.0)))
            return io.NodeOutput(*values)


    class cxSliderBankExtension(ComfyExtension):
        """Extension class for cxSliderBank nodes."""

        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxSliderBankInt, cxSliderBankFloat]


    async def comfy_entrypoint() -> cxSliderBankExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxSliderBankExtension()

    # V1 compatibility mappings
    NODE_CLASS_MAPPINGS = {
        "cxSliderBankInt": cxSliderBankInt,
        "cxSliderBankFloat": cxSliderBankFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSliderBankInt": "cxSliderBank - Int",
        "cxSliderBankFloat": "cxSliderBank - Float",
    }

else:
    # V1 Schema Implementation (Fallback)

    class cxSliderBankInt:
        """
        Integer slider bank with up to 8 vertically stacked sliders.
        Dynamic add/remove of output slots.
        """

        @classmethod
        def INPUT_TYPES(cls):
            inputs = {}
            for i in range(1, 9):
                inputs[f"slider_{i}"] = ("INT", {
                    "default": 0,
                    "min": -2147483648,
                    "max": 2147483647,
                })
            return {"required": inputs}

        RETURN_TYPES = ("INT",) * 8
        RETURN_NAMES = tuple(f"OUT_{i}" for i in range(1, 9))
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            values = []
            for i in range(1, 9):
                values.append(int(round(kwargs.get(f"slider_{i}", 0))))
            return tuple(values)


    class cxSliderBankFloat:
        """
        Float slider bank with up to 8 vertically stacked sliders.
        Dynamic add/remove of output slots.
        """

        @classmethod
        def INPUT_TYPES(cls):
            inputs = {}
            for i in range(1, 9):
                inputs[f"slider_{i}"] = ("FLOAT", {
                    "default": 0.0,
                    "min": -3.4028235e+38,
                    "max": 3.4028235e+38,
                    "step": 0.001,
                })
            return {"required": inputs}

        RETURN_TYPES = ("FLOAT",) * 8
        RETURN_NAMES = tuple(f"OUT_{i}" for i in range(1, 9))
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            values = []
            for i in range(1, 9):
                values.append(float(kwargs.get(f"slider_{i}", 0.0)))
            return tuple(values)


    # V1 Node mappings
    NODE_CLASS_MAPPINGS = {
        "cxSliderBankInt": cxSliderBankInt,
        "cxSliderBankFloat": cxSliderBankFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxSliderBankInt": "cxSliderBank - Int",
        "cxSliderBankFloat": "cxSliderBank - Float",
    }

    # Placeholder for V3 entrypoint
    comfy_entrypoint = None
