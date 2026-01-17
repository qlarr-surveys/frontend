import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { getInstructionRegex } from "./instructionUtils";
import InstructionTooltipManager from "./InstructionTooltipManager";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";

const InstructionHighlightExtension = Extension.create({
  name: "instructionHighlight",

  addOptions() {
    return {
      referenceInstruction: {},
    };
  },

  addProseMirrorPlugins() {
    const referenceInstruction = this.options.referenceInstruction;
    const tooltipManager = new InstructionTooltipManager();

    return [
      new Plugin({
        key: new PluginKey("instructionHighlight"),
        state: {
          init(_, { doc }) {
            return {
              decorations: findInstructionPatterns(doc, referenceInstruction),
              lastReferenceInstructionStr: JSON.stringify(referenceInstruction),
            };
          },
          apply(tr, oldState, newEditorState) {
            const currentRefStr = JSON.stringify(referenceInstruction);
            const refChanged =
              currentRefStr !== oldState.lastReferenceInstructionStr;

            if (refChanged || tr.docChanged) {
              const newDecorations = findInstructionPatterns(
                newEditorState.doc,
                referenceInstruction
              );

              return {
                decorations: newDecorations,
                lastReferenceInstructionStr: currentRefStr,
              };
            }

            return oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          },
        },
        view() {
          return {
            update(view) {
              requestAnimationFrame(() => {
                tooltipManager.updateTooltips(view.dom);
              });
            },
            destroy() {
              tooltipManager.destroy();
            },
          };
        },
      }),
    ];
  },
});

function findInstructionPatterns(doc, referenceInstruction) {
  const decorations = [];
  const regex = getInstructionRegex();
  const transformer = new QuestionDisplayTransformer(referenceInstruction);

  doc.descendants((node, pos) => {
    if (node.isText) {
      let match;
      regex.lastIndex = 0;
      const text = node.text;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const matchStart = pos + match.index;
        const matchEnd = matchStart + fullMatch.length;

        const tooltip = transformer.getTooltipFromInstruction(fullMatch);

        decorations.push(
          Decoration.inline(matchStart, matchEnd, {
            class: "instruction-highlight",
            ...(tooltip && { "data-tooltip": tooltip }),
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default InstructionHighlightExtension;
