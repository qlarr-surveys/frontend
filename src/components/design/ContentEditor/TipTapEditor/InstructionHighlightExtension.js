import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import {
  transformInstructionText,
  INSTRUCTION_PATTERN,
} from "./instructionUtils";

const InstructionHighlightExtension = Extension.create({
  name: "instructionHighlight",

  addOptions() {
    return {
      referenceInstruction: {},
    };
  },

  addProseMirrorPlugins() {
    const referenceInstruction = this.options.referenceInstruction;

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
              return {
                decorations: findInstructionPatterns(
                  newEditorState.doc,
                  referenceInstruction
                ),
                lastReferenceInstructionStr: currentRefStr,
              };
            }

            return {
              decorations: oldState.decorations.map(
                tr.mapping,
                newEditorState.doc
              ),
              lastReferenceInstructionStr: currentRefStr,
            };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          },
        },
      }),
    ];
  },
});

function findInstructionPatterns(doc, referenceInstruction) {
  const decorations = [];
  const regex = new RegExp(INSTRUCTION_PATTERN.source, "g");

  doc.descendants((node, pos) => {
    if (node.type.name === "mention") {
      return false;
    }

    if (node.isText) {
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(node.text)) !== null) {
        const from = pos + match.index;
        const to = from + match[0].length;

        const { tooltip } = transformInstructionText(
          match[0],
          referenceInstruction
        );

        decorations.push(
          Decoration.inline(from, to, {
            class: "instruction-highlight",
            ...(tooltip && { title: tooltip }),
          })
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default InstructionHighlightExtension;
