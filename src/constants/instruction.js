export const INSTRUCTION_SYNTAX_PATTERN = /\{\{[^}]*\}\}/g;

export const DISPLAY_INDEX_PATTERN = /^Q\d+$/;

export const QUESTION_CODE_PATTERN = /^Q[a-z0-9_]+$/;

export const GROUP_CODE_PATTERN = /^G[a-z0-9_]+$/;

export const REFERENCED_CODE_PATTERN = /\b([A-Z][a-zA-Z0-9_]*)\s*[.:]/g;

export const INSTRUCTION_CODE_EXTRACTION_PATTERN = /\{\{\s*([^.:}\s]+)(?:\s*[.:][^}]*)?\}\}/;

export const STRIP_TAGS_PATTERN = /<[^>]*>|&nbsp;|\n/g;

const patternCache = new Map();

export function createQuestionCodePattern(questionCode) {
  if (patternCache.has(questionCode)) {
    return patternCache.get(questionCode);
  }

  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escapedCode}\\b(?=[.:\\s}])`, "g");
  patternCache.set(questionCode, pattern);
  return pattern;
}

export function resolveQuestionCode(refCode, reverseIndex = {}) {
  if (DISPLAY_INDEX_PATTERN.test(refCode) && reverseIndex[refCode]) {
    return reverseIndex[refCode];
  }
  return refCode;
}
