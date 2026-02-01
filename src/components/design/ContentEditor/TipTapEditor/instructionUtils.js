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
  // Support spaces: {{ code.value }} or {{code.value}}
  const pattern = /\{\{\s*([^.:}\s]+)\s*[.:]/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    codes.add(match[1].trim());
  }

  return codes;
}

function processInstructionContent(
  fullPattern,
  referenceInstruction,
  transformer,
  indexToCodeMap
) {
  const fragment = document.createDocumentFragment();

  // Use shared method to find all code matches
  const codeMatches = QuestionDisplayTransformer.findAllCodesInPattern(
    fullPattern,
    referenceInstruction,
    indexToCodeMap
  );

  // If no matches found, just highlight the whole pattern
  if (codeMatches.length === 0) {
    const wrapperSpan = document.createElement("span");
    wrapperSpan.className = "instruction-highlight";
    wrapperSpan.textContent = fullPattern;
    fragment.appendChild(wrapperSpan);
    return fragment;
  }

  // Wrap entire pattern in a span with highlight class
  const wrapperSpan = document.createElement("span");
  wrapperSpan.className = "instruction-highlight";

  // Build content with nested spans for tooltips
  let lastIndex = 0;

  codeMatches.forEach((codeMatch) => {
    // Add text before this code (highlighted but no tooltip)
    if (codeMatch.start > lastIndex) {
      wrapperSpan.appendChild(
        document.createTextNode(fullPattern.slice(lastIndex, codeMatch.start))
      );
    }

    // Create nested span for this question code with tooltip
    const codeSpan = document.createElement("span");
    codeSpan.textContent = codeMatch.text;

    const tooltipContent = transformer.formatTooltipContent(codeMatch.ref);
    codeSpan.setAttribute("data-tooltip", tooltipContent);
    codeSpan.setAttribute("data-question-code", codeMatch.code);

    wrapperSpan.appendChild(codeSpan);
    lastIndex = codeMatch.end;
  });

  // Add any remaining text (highlighted but no tooltip)
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

export function parseUsedInstructions(
  content,
  index,
  questions,
  mainLang
) {
  const result = {};

  if (!content || !index || Object.keys(index).length === 0) {
    return result;
  }

  const codes = extractReferencedCodes(content);

  if (codes.size === 0) {
    return result;
  }

  const reverse = Array.from(codes).some((code) => /^Q\d+$/.test(code))
    ? buildReverseIndex(index)
    : {};

  codes.forEach((refCode) => {
    let questionCode = refCode;

    if (/^Q\d+$/.test(refCode) && reverse[refCode]) {
      questionCode = reverse[refCode];
    }

    if (!index[questionCode]) {
      return;
    }

    const displayIndex = index[questionCode];
    const questionState = questions?.[questionCode];
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

      regex.lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const fullPattern = match[0];

        // Process the content to find individual question codes
        const processedFragment = processInstructionContent(
          fullPattern,
          referenceInstruction,
          transformer,
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

    // Find all elements with data-tooltip within instruction highlights
    const tooltipElements = element.querySelectorAll(".instruction-highlight [data-tooltip]");
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
