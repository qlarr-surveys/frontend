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

function findCodesInPattern(
  fullPattern,
  patternStart,
  referenceInstruction,
  transformer,
  indexToCodeMap
) {
  const decorations = [];

  // Find all question codes and their positions
  Object.keys(referenceInstruction || {}).forEach((questionCode) => {
    const ref = referenceInstruction[questionCode];
    if (!ref || !ref.index) return;

    const codePattern = QuestionDisplayTransformer.createQuestionCodePattern(questionCode);
    let match;

    while ((match = codePattern.exec(fullPattern)) !== null) {
      const codeStart = patternStart + match.index;
      const codeEnd = codeStart + match[0].length;

      const tooltipContent = transformer.formatTooltipContent(ref);

      decorations.push(
        Decoration.inline(codeStart, codeEnd, {
          "data-tooltip": tooltipContent,
          "data-question-code": questionCode,
        })
      );
    }
  });

  // Also check for display index patterns (Q1, Q2, etc.)
  Object.keys(indexToCodeMap || {}).forEach((displayIndex) => {
    const questionCode = indexToCodeMap[displayIndex];
    const ref = referenceInstruction?.[questionCode];
    if (!ref) return;

    // Escape special regex characters in display index
    const escapedIndex = displayIndex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Create pattern for display index
    const indexPattern = new RegExp(`\\b${escapedIndex}\\b(?=[.:\\s}])`, "g");
    let match;

    while ((match = indexPattern.exec(fullPattern)) !== null) {
      const codeStart = patternStart + match.index;
      const codeEnd = codeStart + match[0].length;

      const tooltipContent = transformer.formatTooltipContent(ref);

      decorations.push(
        Decoration.inline(codeStart, codeEnd, {
          "data-tooltip": tooltipContent,
          "data-question-code": questionCode,
        })
      );
    }
  });

  return decorations;
}

function findInstructionPatterns(doc, referenceInstruction) {
  const decorations = [];
  const regex = getInstructionRegex();
  const transformer = new QuestionDisplayTransformer(referenceInstruction);

  // Build indexToCodeMap
  const indexToCodeMap = {};
  if (referenceInstruction) {
    Object.keys(referenceInstruction).forEach((key) => {
      const ref = referenceInstruction[key];
      if (ref && ref.index) {
        indexToCodeMap[ref.index] = key;
      }
    });
  }

  doc.descendants((node, pos) => {
    if (node.isText) {
      regex.lastIndex = 0;
      const text = node.text;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const patternStart = pos + match.index;
        const patternEnd = patternStart + fullMatch.length;

        // First, create decoration for entire pattern (highlighting)
        decorations.push(
          Decoration.inline(patternStart, patternEnd, {
            class: "instruction-highlight",
          })
        );

        // Then, find all question codes within this pattern and add tooltip decorations
        const codeDecorations = findCodesInPattern(
          fullMatch,
          patternStart,
          referenceInstruction,
          transformer,
          indexToCodeMap
        );

        decorations.push(...codeDecorations);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export default InstructionHighlightExtension;
