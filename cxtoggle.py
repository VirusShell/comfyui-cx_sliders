# ComfyUI - cxToggle Custom Node
# Button-style toggle with configurable states and custom labels
# Part of the cxSlider package

# Try V3 schema first, fall back to V1
try:
    from comfy_api.latest import io, ComfyExtension

    V3_AVAILABLE = True
except ImportError:
    V3_AVAILABLE = False


if V3_AVAILABLE:
    # V3 Schema Implementation

    class cxToggle(io.ComfyNode):
        """
        Toggle button node with configurable states and custom labels.
        Click to cycle through states. Outputs current state as INT.
        """

        @classmethod
        def define_schema(cls) -> io.Schema:
            return io.Schema(
                node_id="cxToggle",
                display_name="cxToggle",
                category="utils/cxSliders",
                description="Toggle button with configurable states and labels",
                inputs=[
                    io.Int.Input(
                        "toggle",
                        default=0,
                        min=0,
                        max=100,
                    ),
                ],
                outputs=[
                    io.Int.Output(display_name="INT"),
                ],
            )

        @classmethod
        def execute(cls, **kwargs) -> io.NodeOutput:
            value = kwargs.get("toggle", 0)
            return io.NodeOutput(int(value))

    class cxToggleExtension(ComfyExtension):
        """Extension class for cxToggle node."""

        async def get_node_list(self) -> list[type[io.ComfyNode]]:
            return [cxToggle]

    async def comfy_entrypoint() -> cxToggleExtension:
        """ComfyUI calls this to load the extension and its nodes."""
        return cxToggleExtension()

    # V1 compatibility mappings
    NODE_CLASS_MAPPINGS = {
        "cxToggle": cxToggle,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxToggle": "cxToggle",
    }

else:
    # V1 Schema Implementation (Fallback)

    class cxToggle:
        """
        Toggle button node with configurable states and custom labels.
        Click to cycle through states. Outputs current state as INT.
        """

        @classmethod
        def INPUT_TYPES(cls):
            return {
                "required": {
                    "toggle": (
                        "INT",
                        {
                            "default": 0,
                            "min": 0,
                            "max": 100,
                        },
                    ),
                },
            }

        RETURN_TYPES = ("INT",)
        RETURN_NAMES = ("INT",)
        FUNCTION = "execute"
        CATEGORY = "utils/cxSliders"

        def execute(self, **kwargs):
            value = kwargs.get("toggle", 0)
            return (int(value),)

    # V1 Node mappings
    NODE_CLASS_MAPPINGS = {
        "cxToggle": cxToggle,
    }

    NODE_DISPLAY_NAME_MAPPINGS = {
        "cxToggle": "cxToggle",
    }

    # Placeholder for V3 entrypoint
    comfy_entrypoint = None
