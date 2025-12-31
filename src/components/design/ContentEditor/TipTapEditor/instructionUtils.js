export const INSTRUCTION_PATTERN = /\{\{[^}]*\}\}/g;

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
        tooltip = ref.text || "";
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

  return result;
}

export function highlightInstructionsInStaticContent(
  element,
  referenceInstruction
) {
  if (!element || !(element instanceof HTMLElement)) {
    return;
  }

  try {
    const existingHighlights = element.querySelectorAll(
      ".instruction-highlight"
    );

    existingHighlights.forEach((span) => {
      const text = span.textContent.trim();
      const match = text.match(/\{\{([^:}]+):/);
      if (match && match[1]) {
        const questionCode = match[1];
        const ref = referenceInstruction[questionCode];
        if (ref && ref.text) {
          if (span.getAttribute("title") !== ref.text) {
            span.setAttribute("title", ref.text);
          }
        }
      }
    });

    if (existingHighlights.length > 0) {
      return;
    }

    const filterNode = (node) => {
      const parent = node.parentElement;
      if (
        parent?.classList.contains("mention") ||
        parent?.classList.contains("instruction-highlight")
      ) {
        return NodeFilter.FILTER_REJECT;
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
    const regex = new RegExp(INSTRUCTION_PATTERN.source, "g");

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
      let match;

      const matchRegex = new RegExp(INSTRUCTION_PATTERN.source, "g");
      while ((match = matchRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const { transformedText, tooltip } = transformInstructionText(
          match[0],
          referenceInstruction
        );

        const span = document.createElement("span");
        span.className = "instruction-highlight";
        span.textContent = transformedText;
        if (tooltip) {
          span.setAttribute("title", tooltip);
        }
        fragment.appendChild(span);

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });
  } catch (error) {
    console.error("Error highlighting instructions in static content:", error);
  }
}
