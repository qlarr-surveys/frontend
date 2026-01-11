import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";

export function createMentionExtension({
  getMentionSuggestions,
  referenceInstruction = {},
}) {
  return Mention.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-id"),
          renderHTML: (attributes) => {
            if (!attributes.id) {
              return {};
            }
            return {
              "data-id": attributes.id,
            };
          },
        },
        instruction: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-instruction"),
          renderHTML: (attributes) => {
            if (!attributes.instruction) {
              return {};
            }
            return {
              "data-instruction": attributes.instruction,
            };
          },
        },
        type: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-type"),
          renderHTML: (attributes) => {
            if (!attributes.type) {
              return {};
            }
            return {
              "data-type": attributes.type,
            };
          },
        },
      };
    },

    renderHTML({ node, HTMLAttributes }) {
      let displayId = node.attrs.id;
      let questionText = "";

      if (referenceInstruction && referenceInstruction[node.attrs.id]) {
        const ref = referenceInstruction[node.attrs.id];

        if (ref !== null && typeof ref === "object" && ref.index) {
          displayId = ref.index;
          questionText = ref.text || "";
        } else if (typeof ref === "string") {
          displayId = ref;
        }
      }

      return ["span", {}, `{{${displayId}:${node.attrs.type}}}`];
    },
  }).configure({
    suggestion: suggestion(getMentionSuggestions),
  });
}
