import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { getInstructionRegex } from "./instructionUtils";
import InstructionTooltipManager from "./InstructionTooltipManager";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";

const InstructionHighlightExtension = Extension.create({
  name: "instructionHighlight",

  addOptions() {
    return {};
  },

  addProseMirrorPlugins() {
    const tooltipManager = new InstructionTooltipManager();

    return [
      new Plugin({
        key: new PluginKey("instructionHighlight"),
        state: {
          init(_, { doc }) {
            console.log("init");
            return findInstructionPatterns(doc);
          },
          apply(tr, oldState, oldEditorState, newEditorState) {
            console.log("apply");
            // Only recalculate if document actually changed
            if (!tr.docChanged) {
              return oldState;
            }
            return findInstructionPatterns(newEditorState.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
        view() {
          let rafId = null;

          return {
            update(view) {
              if (rafId !== null) {
                cancelAnimationFrame(rafId);
              }

              rafId = requestAnimationFrame(() => {
                rafId = null;
                tooltipManager.updateTooltips(view.dom);
              });
            },
            destroy() {
              if (rafId !== null) {
                cancelAnimationFrame(rafId);
              }
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
      const text = node.text;
      console.log(text);
      let match;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const patternStart = pos + match.index;
        const patternEnd = patternStart + fullMatch.length;

        decorations.push(
          Decoration.inline(patternStart, patternEnd, {
            class: INSTRUCTION_EDITOR_CONFIG.SELECTORS.HIGHLIGHT_CLASS,
          }),
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default InstructionHighlightExtension;
