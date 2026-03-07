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
                search_aliases=["slider bank", "multi slider", "cx bank"],
                inputs=[
                    io.String.Input("values",
                        default='{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0,"s6":0,"s7":0,"s8":0}',
                        multiline=False),
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
        def execute(cls, *, values: str) -> io.NodeOutput:
            import json
            try:
                data = json.loads(values)
            except (json.JSONDecodeError, TypeError) as e:
                raise ValueError(f"cxSliderBankInt: malformed JSON: {e}") from e
            return io.NodeOutput(*[int(round(data.get(f"s{i}", 0))) for i in range(1, 9)])


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
                search_aliases=["slider bank", "multi slider", "cx bank"],
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
            return {"required": {
                "values": ("STRING", {
                    "default": '{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0,"s6":0,"s7":0,"s8":0}',
                }),
            }}

        RETURN_TYPES = ("INT",) * 8
        RETURN_NAMES = tuple(f"OUT_{i}" for i in range(1, 9))
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"
        SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]

        def execute(self, *, values: str) -> tuple:
            import json
            try:
                data = json.loads(values)
            except (json.JSONDecodeError, TypeError) as e:
                raise ValueError(f"cxSliderBankInt: malformed JSON in values input: {e}") from e
            results = []
            for i in range(1, 9):
                results.append(int(round(data.get(f"s{i}", 0))))
            return tuple(results)


    class cxSliderBankFloat:
        """
        Float slider bank with up to 8 vertically stacked sliders.
        Dynamic add/remove of output slots.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {
                "values": ("STRING", {
                    "default": '{"s1":0.0,"s2":0.0,"s3":0.0,"s4":0.0,"s5":0.0,"s6":0.0,"s7":0.0,"s8":0.0}',
                }),
            }}

        RETURN_TYPES = ("FLOAT",) * 8
        RETURN_NAMES = tuple(f"OUT_{i}" for i in range(1, 9))
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"
        SEARCH_ALIASES = ["slider bank", "multi slider", "cx bank"]

        def execute(self, *, values: str) -> tuple:
            import json
            try:
                data = json.loads(values)
            except (json.JSONDecodeError, TypeError) as e:
                raise ValueError(f"cxSliderBankFloat: malformed JSON in values input: {e}") from e
            results = []
            for i in range(1, 9):
                results.append(float(data.get(f"s{i}", 0.0)))
            return tuple(results)


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
