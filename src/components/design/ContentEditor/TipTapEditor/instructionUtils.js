import tippy from "tippy.js";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { stripTags } from "~/utils/design/utils";
import {
  DISPLAY_INDEX_PATTERN,
  INSTRUCTION_SYNTAX_PATTERN,
  REFERENCED_CODE_PATTERN,
  resolveQuestionCode,
} from "~/constants/instruction";

export const getInstructionRegex = () => {
  return new RegExp(INSTRUCTION_SYNTAX_PATTERN.source, "g");
};

function createInstructionTooltip(element, tippyInstances) {
  const tooltipContent = element.getAttribute("data-tooltip");
  if (tooltipContent && !element._tippy) {
    const instance = tippy(element, {
      content: tooltipContent,
      ...INSTRUCTION_EDITOR_CONFIG.TOOLTIP,
    });
    tippyInstances.push(instance);
  }
}

export function extractReferencedCodes(content) {
  if (typeof content !== "string") return new Set();

  const codes = new Set();
  let match;

  while ((match = REFERENCED_CODE_PATTERN.exec(content)) !== null) {
    codes.add(match[1].trim());
  }
  REFERENCED_CODE_PATTERN.lastIndex = 0;

  return codes;
}

function processInstructionContent(
  fullPattern,
  referenceInstruction,
  indexToCodeMap
) {
  const fragment = document.createDocumentFragment();

  const codeMatches = QuestionDisplayTransformer.findAllCodesInPattern(
    fullPattern,
    referenceInstruction,
    indexToCodeMap
  );

  if (codeMatches.length === 0) {
    const wrapperSpan = document.createElement("span");
    wrapperSpan.className = "instruction-highlight";
    wrapperSpan.textContent = fullPattern;
    fragment.appendChild(wrapperSpan);
    return fragment;
  }

  const wrapperSpan = document.createElement("span");
  wrapperSpan.className = "instruction-highlight";

  let lastIndex = 0;

  codeMatches.forEach((codeMatch) => {
    if (codeMatch.start > lastIndex) {
      wrapperSpan.appendChild(
        document.createTextNode(fullPattern.slice(lastIndex, codeMatch.start))
      );
    }

    const codeSpan = document.createElement("span");
    codeSpan.textContent = codeMatch.text;

    const tooltipContent = QuestionDisplayTransformer.formatTooltipContent(codeMatch.ref);
    codeSpan.setAttribute("data-tooltip", tooltipContent);
    codeSpan.setAttribute("data-question-code", codeMatch.code);

    wrapperSpan.appendChild(codeSpan);
    lastIndex = codeMatch.end;
  });

  if (lastIndex < fullPattern.length) {
    wrapperSpan.appendChild(
      document.createTextNode(fullPattern.slice(lastIndex))
    );
  }

  fragment.appendChild(wrapperSpan);
  return fragment;
}

export function buildReverseIndex(index) {
  const reverse = {};
  Object.keys(index).forEach((questionCode) => {
    reverse[index[questionCode]] = questionCode;
  });
  return reverse;
}

export function parseUsedInstructions(content, index, questions, mainLang, reverseIndex = {}) {
  const result = {};

  if (!content || !index) {
    return result;
  }

  const codes = extractReferencedCodes(content);

  if (codes.size === 0) {
    return result;
  }

  codes.forEach((refCode) => {
    const questionCode = resolveQuestionCode(refCode, reverseIndex);

    if (!index[questionCode]) {
      return;
    }

    const displayIndex = index[questionCode];
    const questionState = questions?.[questionCode];
    const questionTextHtml = questionState?.content?.[mainLang]?.label || "";
    const questionText = stripTags(questionTextHtml);

    result[questionCode] = {
      index: displayIndex,
      text: questionText,
    };
  });

  return result;
}

export function highlightInstructionsInStaticContent(
  element,
  referenceInstruction,
  indexToCodeMap
) {
  if (!element || !(element instanceof HTMLElement)) {
    return () => {};
  }

  const tippyInstances = [];

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

      regex.lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const fullPattern = match[0];

        const processedFragment = processInstructionContent(
          fullPattern,
          referenceInstruction,
          indexToCodeMap
        );

        fragment.appendChild(processedFragment);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });

    const tooltipElements = element.querySelectorAll(
      ".instruction-highlight [data-tooltip]"
    );

    tooltipElements.forEach((span) => {
      createInstructionTooltip(span, tippyInstances);
    });
  } catch (error) {
    console.error("Error highlighting instructions:", error);
  }

  return () => {
    tippyInstances.forEach((instance) => instance.destroy());
  };
}
