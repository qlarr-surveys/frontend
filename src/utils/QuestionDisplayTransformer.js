const patternCache = new Map();

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

  transformText(text) {
    if (!text) return text;

    if (
      !this.referenceInstruction ||
      Object.keys(this.referenceInstruction).length === 0
    ) {
      return text;
    }

    const referencedCodes = this._extractReferencedCodes(text);

    if (referencedCodes.size === 0) return text;

    let transformedText = text;

    referencedCodes.forEach((questionCode) => {
      const ref = this.referenceInstruction[questionCode];

      if (ref && typeof ref === "object" && ref.index) {
        const pattern = this.constructor.createQuestionCodePattern(questionCode);
        transformedText = transformedText.replace(pattern, `{{${ref.index}$1`);
      }
    });

    return transformedText;
  }

  extractQuestionCode(instruction) {
    if (!instruction) return null;

    const match = instruction.match(/\{\{([^.:}]+)(?:[.:][^}]*)?\}\}/);
    return match ? match[1] : null;
  }

  _extractReferencedCodes(text) {
    const codes = new Set();
    const pattern = /\{\{([^.:}]+)[.:}]/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      codes.add(match[1]);
    }

    return codes;
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
