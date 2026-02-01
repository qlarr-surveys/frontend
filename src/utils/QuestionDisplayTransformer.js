import { extractReferencedCodes } from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import {
  INSTRUCTION_SYNTAX_PATTERN,
  createQuestionCodePattern,
  resolveQuestionCode,
} from "~/constants/instruction";

class QuestionDisplayTransformer {
  static getDisplayId(questionCode, referenceInstruction = {}) {
    const ref = referenceInstruction[questionCode];

    if (ref && typeof ref === "object" && ref.index) {
      return ref.index;
    }

    if (typeof ref === "string") {
      return ref;
    }

    return questionCode;
  }

  static getTooltipContent(questionCode, referenceInstruction = {}) {
    const ref = referenceInstruction[questionCode];

    if (!ref || typeof ref !== "object") {
      return "";
    }

    return QuestionDisplayTransformer.formatTooltipContent(ref);
  }

  static transformText(text, referenceInstruction = {}) {
    if (!text) return text;

    if (!referenceInstruction || Object.keys(referenceInstruction).length === 0) {
      return text;
    }

    const referencedCodes = extractReferencedCodes(text);

    if (referencedCodes.size === 0) return text;

    let transformedText = text;

    referencedCodes.forEach((questionCode) => {
      const ref = referenceInstruction[questionCode];

      if (ref && typeof ref === "object" && ref.index) {
        const pattern = createQuestionCodePattern(questionCode);
        transformedText = transformedText.replace(pattern, ref.index);
        pattern.lastIndex = 0;
      }
    });

    return transformedText;
  }

  static formatTooltipContent(ref) {
    return ref.index && ref.text ? `${ref.index} - ${ref.text}` : ref.text || "";
  }

  static findAllCodesInPattern(fullPattern, referenceInstruction, indexToCodeMap) {
    const matches = [];
    const codesInPattern = extractReferencedCodes(fullPattern);

    if (codesInPattern.size === 0) {
      return matches;
    }

    codesInPattern.forEach((codeOrIndex) => {
      const questionCode = resolveQuestionCode(codeOrIndex, indexToCodeMap);
      const searchCode = codeOrIndex;

      const ref = referenceInstruction?.[questionCode];

      if (!ref || !ref.index) {
        return;
      }

      const codePattern = createQuestionCodePattern(searchCode);
      let match;

      while ((match = codePattern.exec(fullPattern)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          code: questionCode,
          text: match[0],
          ref: ref,
        });
      }
      codePattern.lastIndex = 0;
    });

    return matches.sort((a, b) => a.start - b.start);
  }

  static decodeInstructionEntities(html) {
    if (!html) return html;

    return html.replace(INSTRUCTION_SYNTAX_PATTERN, (match) => {
      return match
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    });
  }
}

export default QuestionDisplayTransformer;
