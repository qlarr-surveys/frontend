import tippy from "tippy.js";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { stripTagsCached } from "~/utils/design/utils";

export const INSTRUCTION_PATTERN = INSTRUCTION_EDITOR_CONFIG.PATTERN;
export const TIPPY_INSTRUCTION_CONFIG = INSTRUCTION_EDITOR_CONFIG.TOOLTIP;

let cachedInstructionRegex = null;

export const getInstructionRegex = () => {
  if (!cachedInstructionRegex) {
    cachedInstructionRegex = new RegExp(INSTRUCTION_PATTERN.source, "g");
  }
  cachedInstructionRegex.lastIndex = 0;
  return cachedInstructionRegex;
};

function createInstructionTooltip(element, tippyInstances) {
  const tooltipContent = element.getAttribute("data-tooltip");
  if (tooltipContent && !element._tippy) {
    const instance = tippy(element, {
      content: tooltipContent,
      ...TIPPY_INSTRUCTION_CONFIG,
    });
    tippyInstances.push(instance);
  }
}

const EMPTY_SET = Object.freeze(new Set());

export function extractReferencedCodes(content) {
  if (!content) return EMPTY_SET;

  const codes = new Set();
  const pattern = /\{\{([^.:}]+)[.:]/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  return codes;
}

export function buildReverseIndex(index) {
  const reverse = {};
  Object.keys(index).forEach((questionCode) => {
    reverse[index[questionCode]] = questionCode;
  });
  return reverse;
}

export function parseUsedInstructions(
  content,
  index,
  designState,
  mainLang,
  referencedCodes,
  reverseIndex
) {
  const result = {};

  if (!content || !index || Object.keys(index).length === 0) {
    return result;
  }

  const codes = referencedCodes || extractReferencedCodes(content);

  if (codes.size === 0) {
    return result;
  }

  const reverse = reverseIndex !== undefined
    ? reverseIndex
    : (Array.from(codes).some((code) => /^Q\d+$/.test(code)) ? buildReverseIndex(index) : {});

  codes.forEach((refCode) => {
    let questionCode = refCode;

    if (/^Q\d+$/.test(refCode) && reverse[refCode]) {
      questionCode = reverse[refCode];
    }

    if (!index[questionCode]) {
      return;
    }

    const displayIndex = index[questionCode];
    const questionState = designState?.[questionCode];
    const questionTextHtml = questionState?.content?.[mainLang]?.label || "";
    const questionText = stripTagsCached(questionTextHtml);

    result[questionCode] = {
      index: displayIndex,
      text: questionText,
    };
  });

  return result;
}

export function highlightInstructionsInStaticContent(
  element,
  referenceInstruction
) {
  if (!element || !(element instanceof HTMLElement)) {
    return () => {};
  }

  const tippyInstances = [];
  const transformer = new QuestionDisplayTransformer(referenceInstruction);

  try {
    const existingHighlights = element.querySelectorAll(
      ".instruction-highlight"
    );

    existingHighlights.forEach((span) => {
      if (span._tippy) {
        span._tippy.destroy();
      }
      const textNode = document.createTextNode(span.textContent);
      span.replaceWith(textNode);
    });

    const indexToCodeMap = {};
    if (referenceInstruction) {
      Object.keys(referenceInstruction).forEach((key) => {
        const ref = referenceInstruction[key];
        if (ref && ref.index) {
          indexToCodeMap[ref.index] = key;
        }
      });
    }

    const filterNode = (node) => {
      let current = node.parentElement;
      while (current) {
        if (current.classList.contains("instruction-highlight")) {
          return NodeFilter.FILTER_REJECT;
        }
        current = current.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      filterNode
    );

    const nodesToProcess = [];
    let node;
    const regex = getInstructionRegex();

    while ((node = walker.nextNode())) {
      regex.lastIndex = 0;
      if (regex.test(node.textContent)) {
        nodesToProcess.push(node);
      }
    }

    nodesToProcess.forEach((textNode) => {
      const parent = textNode.parentNode;
      if (!parent) return;

      const text = textNode.textContent;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      const matchRegex = getInstructionRegex();
      let match;

      while ((match = matchRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const originalPattern = match[0];
        const refMatch = originalPattern.match(/\{\{([^.:}]+)[.:]/);
        const questionRef = refMatch ? refMatch[1] : null;

        const span = document.createElement("span");
        span.className = "instruction-highlight";
        span.textContent = originalPattern;

        if (questionRef && referenceInstruction) {
          const foundCode = indexToCodeMap[questionRef];

          if (foundCode) {
            const foundRef = referenceInstruction[foundCode];

            if (foundRef && foundRef.text) {
              const tooltipContent = transformer.formatTooltipContent(foundRef);
              span.setAttribute("data-tooltip", tooltipContent);
              span.setAttribute("data-question-code", foundCode);
            }
          }
        }

        fragment.appendChild(span);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });

    const newHighlights = element.querySelectorAll(".instruction-highlight");
    newHighlights.forEach((span) => {
      createInstructionTooltip(span, tippyInstances);
    });
  } catch (error) {
  }

  return () => {
    tippyInstances.forEach((instance) => instance.destroy());
  };
}
