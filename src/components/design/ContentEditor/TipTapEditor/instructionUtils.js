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

const patternCache = new Map();

export function getCachedPattern(questionCode) {
  if (!patternCache.has(questionCode)) {
    patternCache.set(questionCode, createQuestionCodePattern(questionCode));
  }
  return patternCache.get(questionCode);
}

export function transformInstructionText(
  instructionText,
  referenceInstruction
) {
  if (!referenceInstruction || Object.keys(referenceInstruction).length === 0) {
    return {
      transformedText: instructionText,
      tooltip: "",
      wasTransformed: false,
    };
  }

  let transformedText = instructionText;
  let tooltip = "";
  let wasTransformed = false;

  Object.keys(referenceInstruction).forEach((questionCode) => {
    const ref = referenceInstruction[questionCode];

    if (ref && typeof ref === "object" && ref.index) {
      const pattern = getCachedPattern(questionCode);

      if (pattern.test(transformedText)) {
        pattern.lastIndex = 0;
        transformedText = transformedText.replace(pattern, `{{${ref.index}$1`);
        tooltip = ref.text || "";
        wasTransformed = true;
      }

      pattern.lastIndex = 0;
    }
  });

  return { transformedText, tooltip, wasTransformed };
}

export function parseUsedInstructions(content, index, designState, mainLang) {
  const result = {};

  if (!content || !index || Object.keys(index).length === 0) {
    return result;
  }

  Object.keys(index).forEach((questionCode) => {
    const pattern = getCachedPattern(questionCode);

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
