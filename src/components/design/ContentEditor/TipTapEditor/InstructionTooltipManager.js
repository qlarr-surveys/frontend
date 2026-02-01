import tippy from "tippy.js";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";

class InstructionTooltipManager {
  constructor() {
    this.instances = new Map();
  }

  updateTooltips(editorElement) {
    if (!editorElement) return;

    const currentHighlights = new Set(
      editorElement.querySelectorAll(".instruction-highlight [data-tooltip]")
    );

    this.instances.forEach((instance, element) => {
      if (!currentHighlights.has(element)) {
        instance.destroy();
        this.instances.delete(element);
      }
    });

    currentHighlights.forEach((element) => {
      if (this.instances.has(element)) return;

      const tooltipContent = element.getAttribute("data-tooltip");
      if (!tooltipContent) return;

      const instance = tippy(element, {
        content: tooltipContent,
        ...INSTRUCTION_EDITOR_CONFIG.TOOLTIP,
      });

      this.instances.set(element, instance);
    });
  }

  destroy() {
    this.instances.forEach((instance) => {
      instance.destroy();
    });
    this.instances.clear();
  }
}

export default InstructionTooltipManager;
