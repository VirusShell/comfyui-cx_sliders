# ComfyUI - cxRangeSlider Custom Nodes
# Two-handle range slider for INT and FLOAT value control
# Part of the cxSlider package

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension
    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation

    class cxRangeSliderInt(io.ComfyNode):
        """
        Integer range slider with two handles for LOW and HIGH values.
        Enforces low <= high constraint.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxRangeSliderInt",
                display_name="cxRange - Int",
                category="utils/cxSliders",
                description="Integer range slider with LOW and HIGH outputs",
                inputs=[
                    io.Int.Input(
                        "low",
                        default=0,
                        min=-2147483648,
                        max=2147483647,
                    ),
                    io.Int.Input(
                        "high",
                        default=100,
                        min=-2147483648,
                        max=2147483647,
                    ),
                    io.Int.Input(
                        "low_override",
                        optional=True,
                        force_input=True,
                    ),
                    io.Int.Input(
                        "high_override",
                        optional=True,
                        force_input=True,
                    ),
                ],
                outputs=[
                    io.Int.Output(display_name="LOW"),
                    io.Int.Output(display_name="HIGH"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            low = kwargs.get("low", 0)
            high = kwargs.get("high", 100)
            low_override = kwargs.get("low_override", None)
            high_override = kwargs.get("high_override", None)
            if low_override is not None:
                low = low_override
            if high_override is not None:
                high = high_override
            low = int(round(low))
            high = int(round(high))
            # Enforce low <= high
            if low > high:
                low, high = high, low
            return io.NodeOutput(low, high)


    class cxRangeSliderFloat(io.ComfyNode):
        """
        Float range slider with two handles for LOW and HIGH values.
        Enforces low <= high constraint.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxRangeSliderFloat",
                display_name="cxRange - Float",
                category="utils/cxSliders",
                description="Float range slider with LOW and HIGH outputs",
                inputs=[
                    io.Float.Input(
                        "low",
                        default=0.0,
                        min=-3.4028235e+38,
                        max=3.4028235e+38,
                        step=0.001,
                    ),
                    io.Float.Input(
                        "high",
                        default=100.0,
                        min=-3.4028235e+38,
                        max=3.4028235e+38,
                        step=0.001,
                    ),
                    io.Float.Input(
                        "low_override",
                        optional=True,
                        force_input=True,
                    ),
                    io.Float.Input(
                        "high_override",
                        optional=True,
                        force_input=True,
                    ),
                ],
                outputs=[
                    io.Float.Output(display_name="LOW"),
                    io.Float.Output(display_name="HIGH"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            low = kwargs.get("low", 0.0)
            high = kwargs.get("high", 100.0)
            low_override = kwargs.get("low_override", None)
            high_override = kwargs.get("high_override", None)
            if low_override is not None:
                low = low_override
            if high_override is not None:
                high = high_override
            low = float(low)
            high = float(high)
            # Enforce low <= high
            if low > high:
                low, high = high, low
            return io.NodeOutput(low, high)


    class cxRangeSliderExtension(ComfyExtension):
        """Extension class for cxRangeSlider nodes."""

        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxRangeSliderInt, cxRangeSliderFloat]


    async def comfy_entrypoint() -> cxRangeSliderExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxRangeSliderExtension()

    # V1 compatibility mappings
    NODE_CLASS_MAPPINGS = {
        "cxRangeSliderInt": cxRangeSliderInt,
        "cxRangeSliderFloat": cxRangeSliderFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxRangeSliderInt": "cxRange - Int",
        "cxRangeSliderFloat": "cxRange - Float",
    }

else:
    # V1 Schema Implementation (Fallback)

    class cxRangeSliderInt:
        """
        Integer range slider with two handles for LOW and HIGH values.
        Enforces low <= high constraint.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "low": ("INT", {
                        "default": 0,
                        "min": -2147483648,
                        "max": 2147483647,
                    }),
                    "high": ("INT", {
                        "default": 100,
                        "min": -2147483648,
                        "max": 2147483647,
                    }),
                },
                "optional": {
                    "low_override": ("INT", {
                        "forceInput": True,
                    }),
                    "high_override": ("INT", {
                        "forceInput": True,
                    }),
                },
            }

        RETURN_TYPES = ("INT", "INT")
        RETURN_NAMES = ("LOW", "HIGH")
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            low = kwargs.get("low", 0)
            high = kwargs.get("high", 100)
            low_override = kwargs.get("low_override", None)
            high_override = kwargs.get("high_override", None)
            if low_override is not None:
                low = low_override
            if high_override is not None:
                high = high_override
            low = int(round(low))
            high = int(round(high))
            if low > high:
                low, high = high, low
            return (low, high)


    class cxRangeSliderFloat:
        """
        Float range slider with two handles for LOW and HIGH values.
        Enforces low <= high constraint.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "low": ("FLOAT", {
                        "default": 0.0,
                        "min": -3.4028235e+38,
                        "max": 3.4028235e+38,
                        "step": 0.001,
                    }),
                    "high": ("FLOAT", {
                        "default": 100.0,
                        "min": -3.4028235e+38,
                        "max": 3.4028235e+38,
                        "step": 0.001,
                    }),
                },
                "optional": {
                    "low_override": ("FLOAT", {
                        "forceInput": True,
                    }),
                    "high_override": ("FLOAT", {
                        "forceInput": True,
                    }),
                },
            }

        RETURN_TYPES = ("FLOAT", "FLOAT")
        RETURN_NAMES = ("LOW", "HIGH")
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            low = kwargs.get("low", 0.0)
            high = kwargs.get("high", 100.0)
            low_override = kwargs.get("low_override", None)
            high_override = kwargs.get("high_override", None)
            if low_override is not None:
                low = low_override
            if high_override is not None:
                high = high_override
            low = float(low)
            high = float(high)
            if low > high:
                low, high = high, low
            return (low, high)


    # V1 Node mappings
    NODE_CLASS_MAPPINGS = {
        "cxRangeSliderInt": cxRangeSliderInt,
        "cxRangeSliderFloat": cxRangeSliderFloat,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxRangeSliderInt": "cxRange - Int",
        "cxRangeSliderFloat": "cxRange - Float",
    }

    # Placeholder for V3 entrypoint
    comfy_entrypoint = None
