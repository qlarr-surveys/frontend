import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";

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
      const transformer = new QuestionDisplayTransformer(referenceInstruction);
      const displayId = transformer.getDisplayId(node.attrs.id);

      return ["span", {}, `{{${displayId}:${node.attrs.type}}}`];
    },
  }).configure({
    suggestion: suggestion(getMentionSuggestions),
  });
}
