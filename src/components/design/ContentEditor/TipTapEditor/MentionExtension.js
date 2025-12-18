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

    parseHTML() {
      return [
        {
          tag: "span.mention[data-id][data-instruction][data-type]",
          getAttrs: (element) => {
            const id = element.getAttribute("data-id");
            const instruction = element.getAttribute("data-instruction");
            const type = element.getAttribute("data-type");

            if (id && instruction && type) {
              return {
                id,
                instruction,
                type,
              };
            }
            return false;
          },
        },
      ];
    },

    renderHTML({ node, HTMLAttributes }) {
      const displayId =
        referenceInstruction && referenceInstruction[node.attrs.id]
          ? referenceInstruction[node.attrs.id]
          : node.attrs.id;

      const displayText = `{{${displayId}:${node.attrs.type}}}`;
      const dataValue = `{{${node.attrs.id}:${node.attrs.type}}}`;

      return [
        "span",
        {
          ...HTMLAttributes,
          class: "mention",
          "data-index": "1",
          "data-denotation-char": "",
          "data-id": node.attrs.id,
          "data-instruction": node.attrs.instruction,
          "data-value": dataValue,
          "data-type": node.attrs.type,
        },
        [
          "span",
          {
            contenteditable: "false",
          },
          displayText,
        ],
      ];
    },

    addCommands() {
      return {
        ...this.parent?.(),
        setMention:
          (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                id: options.id,
                instruction: options.instruction,
                type: options.type,
              },
            });
          },
      };
    },
  }).configure({
    HTMLAttributes: {
      class: "mention",
    },
    suggestion: suggestion(getMentionSuggestions),
  });
}
