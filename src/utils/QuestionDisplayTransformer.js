const patternCache = new Map();

class QuestionDisplayTransformer {
  constructor(referenceInstruction = {}) {
    this.referenceInstruction = referenceInstruction || {};
  }

  getDisplayId(questionCode) {
    const ref = this.referenceInstruction?.[questionCode];

    if (ref !== null && typeof ref === "object" && ref.index) {
      return ref.index;
    }

    if (typeof ref === "string") {
      return ref;
    }

    return questionCode;
  }

  getTooltipContent(questionCode) {
    const ref = this.referenceInstruction?.[questionCode];

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
        const pattern = QuestionDisplayTransformer.createQuestionCodePattern(questionCode);

        if (pattern.test(transformedText)) {
          pattern.lastIndex = 0;
          transformedText = transformedText.replace(
            pattern,
            `{{${ref.index}$1`
          );
          tooltip = this._formatTooltipContent(ref);
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

    let transformedText = text;

    Object.keys(this.referenceInstruction).forEach((questionCode) => {
      const ref = this.referenceInstruction[questionCode];

      if (ref && typeof ref === "object" && ref.index) {
        const pattern = QuestionDisplayTransformer.createQuestionCodePattern(questionCode);
        transformedText = transformedText.replace(pattern, `{{${ref.index}$1`);
        pattern.lastIndex = 0;
      }
    });

    return transformedText;
  }

  extractQuestionCode(instruction) {
    if (!instruction) return null;

    const match = instruction.match(/\{\{([^.:}]+)(?:[.:][^}]*)?\}\}/);
    return match ? match[1] : null;
  }

  static createQuestionCodePattern(questionCode) {
    if (patternCache.has(questionCode)) {
      return patternCache.get(questionCode);
    }

    const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\{\\{${escapedCode}([:.\\}])`, "g");
    patternCache.set(questionCode, pattern);
    return pattern;
  }

  formatTooltipContent(ref) {
    return ref.index && ref.text ? `${ref.index} - ${ref.text}` : ref.text || "";
  }

  static decodeInstructionEntities(html) {
    if (!html) return html;

    return html.replace(/\{\{[^}]*\}\}/g, (match) => {
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
