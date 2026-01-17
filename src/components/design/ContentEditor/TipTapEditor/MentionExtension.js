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
      };
    },

    renderHTML({ node, HTMLAttributes }) {
      const transformer = new QuestionDisplayTransformer(referenceInstruction);
      const instruction = transformer.getDisplayId(node.attrs.instruction);

      return ["span", {}, `{{${instruction}}}`];
    },
  }).configure({
    suggestion: suggestion(getMentionSuggestions),
  });
}
