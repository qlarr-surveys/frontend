import { extractReferencedCodes } from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import {
  DISPLAY_INDEX_PATTERN,
  INSTRUCTION_SYNTAX_PATTERN,
  INSTRUCTION_CODE_EXTRACTION_PATTERN,
  createQuestionCodePattern,
  resolveQuestionCode,
} from "~/constants/instruction";

class QuestionDisplayTransformer {
  constructor(referenceInstruction = {}) {
    this.referenceInstruction = referenceInstruction || {};
  }

  getDisplayId(questionCode) {
    const ref = this.referenceInstruction[questionCode];

    if (ref && typeof ref === "object" && ref.index) {
      return ref.index;
    }

    if (typeof ref === "string") {
      return ref;
    }

    return questionCode;
  }

  getTooltipContent(questionCode) {
    const ref = this.referenceInstruction[questionCode];

    if (!ref || typeof ref !== "object") {
      return "";
    }

    return this.formatTooltipContent(ref);
  }

  getTooltipFromInstruction(instruction) {
    const questionCode = this.extractQuestionCode(instruction);
    return questionCode ? this.getTooltipContent(questionCode) : "";
  }

  transformInstruction(instructionText) {
    if (!instructionText) {
      return {
        transformedText: instructionText,
        tooltip: "",
      };
    }

    if (
      !this.referenceInstruction ||
      Object.keys(this.referenceInstruction).length === 0
    ) {
      return {
        transformedText: instructionText,
        tooltip: "",
      };
    }

    let transformedText = instructionText;
    let tooltip = "";

    Object.keys(this.referenceInstruction).forEach((questionCode) => {
      const ref = this.referenceInstruction[questionCode];

      if (ref && typeof ref === "object" && ref.index) {
        const pattern = createQuestionCodePattern(questionCode);

        if (pattern.test(transformedText)) {
          pattern.lastIndex = 0;
          transformedText = transformedText.replace(pattern, ref.index);
          tooltip = this.formatTooltipContent(ref);
        }

        pattern.lastIndex = 0;
      }
    });

    return { transformedText, tooltip };
  }


  transformText(text) {
    if (!text) return text;

    if (
      !this.referenceInstruction ||
      Object.keys(this.referenceInstruction).length === 0
    ) {
      return text;
    }

    const referencedCodes = extractReferencedCodes(text);

    if (referencedCodes.size === 0) return text;

    let transformedText = text;

    referencedCodes.forEach((questionCode) => {
      const ref = this.referenceInstruction[questionCode];

      if (ref && typeof ref === "object" && ref.index) {
        const pattern = createQuestionCodePattern(questionCode);
        transformedText = transformedText.replace(pattern, ref.index);
        pattern.lastIndex = 0;
      }
    });

    return transformedText;
  }

  extractQuestionCode(instruction) {
    if (!instruction) return null;

    const match = instruction.match(INSTRUCTION_CODE_EXTRACTION_PATTERN);
    return match ? match[1].trim() : null;
  }


  formatTooltipContent(ref) {
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
