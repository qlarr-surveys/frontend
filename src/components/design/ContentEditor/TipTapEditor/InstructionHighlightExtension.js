import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { getInstructionRegex } from "./instructionUtils";
import InstructionTooltipManager from "./InstructionTooltipManager";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";

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
              decorations: findInstructionPatterns(doc),
              lastReferenceInstructionStr: JSON.stringify(referenceInstruction),
            };
          },
          apply(tr, oldState, newEditorState) {
            const currentRefStr = JSON.stringify(referenceInstruction);
            const refChanged =
              currentRefStr !== oldState.lastReferenceInstructionStr;

            if (refChanged || tr.docChanged) {
              const newDecorations = findInstructionPatterns(
                newEditorState.doc
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

function findInstructionPatterns(doc) {
  const decorations = [];
  const regex = getInstructionRegex();

  doc.descendants((node, pos) => {
    if (node.isText) {
      regex.lastIndex = 0;
      const text = node.text;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const patternStart = pos + match.index;
        const patternEnd = patternStart + fullMatch.length;

        decorations.push(
          Decoration.inline(patternStart, patternEnd, {
            class: INSTRUCTION_EDITOR_CONFIG.SELECTORS.HIGHLIGHT_CLASS,
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default InstructionHighlightExtension;
