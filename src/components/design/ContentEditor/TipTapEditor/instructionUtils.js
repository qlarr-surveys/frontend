import tippy from "tippy.js";
import { INSTRUCTION_EDITOR_CONFIG } from "~/constants/editor";

export const INSTRUCTION_PATTERN = INSTRUCTION_EDITOR_CONFIG.PATTERN;
export const TIPPY_INSTRUCTION_CONFIG = INSTRUCTION_EDITOR_CONFIG.TOOLTIP;

export const getInstructionRegex = () => {
  return new RegExp(INSTRUCTION_PATTERN.source, "g");
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

function formatTooltipContent(ref) {
  return ref.index && ref.text ? `${ref.index} - ${ref.text}` : ref.text || "";
}

export function stripHtml(html) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function createQuestionCodePattern(questionCode) {
  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\{\\{${escapedCode}([:.\\}])`, "g");
}

export function transformInstructionText(
  instructionText,
  referenceInstruction
) {
  if (!referenceInstruction || Object.keys(referenceInstruction).length === 0) {
    return {
      transformedText: instructionText,
      tooltip: "",
    };
  }

  let transformedText = instructionText;
  let tooltip = "";

  Object.keys(referenceInstruction).forEach((questionCode) => {
    const ref = referenceInstruction[questionCode];

    if (ref && typeof ref === "object" && ref.index) {
      const pattern = createQuestionCodePattern(questionCode);

      if (pattern.test(transformedText)) {
        pattern.lastIndex = 0;
        transformedText = transformedText.replace(pattern, `{{${ref.index}$1`);
        tooltip = formatTooltipContent(ref);
      }

      pattern.lastIndex = 0;
    }
  });

  return { transformedText, tooltip };
}

export function parseUsedInstructions(content, index, designState, mainLang) {
  const result = {};

  if (!content || !index || Object.keys(index).length === 0) {
    return result;
  }

  // Build reverse index map (display index → question code)
  const reverseIndex = {};
  Object.keys(index).forEach((questionCode) => {
    reverseIndex[index[questionCode]] = questionCode;
  });

  // PATTERN 1: Find instructions with question codes ({{questionCode.field}})
  Object.keys(index).forEach((questionCode) => {
    const pattern = createQuestionCodePattern(questionCode);

    if (pattern.test(content)) {
      const questionIndex = index[questionCode];
      const questionState = designState?.[questionCode];
      const questionTextHtml = questionState?.content?.[mainLang]?.label || "";
      const questionText = stripHtml(questionTextHtml);

      if (questionIndex) {
        result[questionCode] = {
          index: questionIndex,
          text: questionText,
        };
      }
    }

    pattern.lastIndex = 0;
  });

  // PATTERN 2: Find mentions with indices ({{Q1:field}})
  const mentionPattern = /\{\{(Q\d+):/g;
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    const displayIndex = match[1]; // e.g., "Q1"
    const questionCode = reverseIndex[displayIndex];

    if (questionCode && !result[questionCode]) {
      const questionState = designState?.[questionCode];
      const questionTextHtml = questionState?.content?.[mainLang]?.label || "";
      const questionText = stripHtml(questionTextHtml);

      result[questionCode] = {
        index: displayIndex,
        text: questionText,
      };
    }
  }

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

  try {
    // Remove all existing instruction highlights to start fresh
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

    // Build reverse index map for O(1) lookups (index → question code)
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

        // Find the matching reference by index (e.g., "Q1") not by question code
        if (questionRef && referenceInstruction) {
          const foundCode = indexToCodeMap[questionRef];

          if (foundCode) {
            const foundRef = referenceInstruction[foundCode];

            if (foundRef && foundRef.text) {
              const tooltipContent = formatTooltipContent(foundRef);
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
    console.error("Error highlighting instructions in static content:", error);
  }

  return () => {
    tippyInstances.forEach((instance) => instance.destroy());
  };
}
