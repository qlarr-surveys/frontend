import { useMemo, useRef, useEffect, useCallback } from "react";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
  extractReferencedCodes,
  buildReverseIndex,
} from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { useSelector } from "react-redux";
import { DISPLAY_INDEX_PATTERN, resolveQuestionCode } from "~/constants/instruction";

export function useInstructionHighlighting({
  content,
  mainLang,
  isActive,
  renderedContentRef,
}) {
  const referencedCodes = useMemo(() => {
    return extractReferencedCodes(content);
  }, [content]);

  const hasDisplayIndexRefs = Array.from(referencedCodes).some((code) => DISPLAY_INDEX_PATTERN.test(code));

  const customEquality = useCallback((prev, next) => {
    if (prev === next) return true;

    if (prev.mainLang !== next.mainLang) return false;

    const prevIndexKeys = Object.keys(prev.index);
    const nextIndexKeys = Object.keys(next.index);

    if (prevIndexKeys.length !== nextIndexKeys.length) return false;

    // Check if index values changed (e.g., Q1 became Q2 after reordering)
    for (const key of prevIndexKeys) {
      if (prev.index[key] !== next.index[key]) {
        return false;
      }
    }

    // Check actual question content, not just length
    const prevQuestionKeys = Object.keys(prev.questions);
    const nextQuestionKeys = Object.keys(next.questions);

    if (prevQuestionKeys.length !== nextQuestionKeys.length) return false;

    for (const key of prevQuestionKeys) {
      const prevQ = prev.questions[key];
      const nextQ = next.questions[key];

      if (!nextQ) return false;

      // Compare the actual content object for the current language
      const prevContent = prevQ?.content?.[prev.mainLang];
      const nextContent = nextQ?.content?.[next.mainLang];

      // Deep comparison of content (label is what we show in tooltips)
      if (prevContent?.label !== nextContent?.label) {
        return false;
      }
    }

    // Check reverseIndex mappings, not just length
    const prevRevKeys = Object.keys(prev.reverseIndex);
    const nextRevKeys = Object.keys(next.reverseIndex);

    if (prevRevKeys.length !== nextRevKeys.length) return false;

    for (const key of prevRevKeys) {
      if (prev.reverseIndex[key] !== next.reverseIndex[key]) {
        return false;
      }
    }

    return true;
  }, []);

  const fullIndex = useSelector((state) => state.designState.index);

  const reverseIndex = useMemo(() => {
    if (!hasDisplayIndexRefs || !fullIndex) return {};
    return buildReverseIndex(fullIndex);
  }, [hasDisplayIndexRefs, fullIndex]);

  const relevantData = useSelector((state) => {
    const codes = referencedCodes;

    const data = {
      index: {},
      questions: {},
      reverseIndex,
      mainLang,
    };

    codes.forEach((refCode) => {
      const questionCode = resolveQuestionCode(refCode, reverseIndex);

      if (state.designState[questionCode] && state.designState.index[questionCode]) {
        data.index[questionCode] = state.designState.index[questionCode];
        data.questions[questionCode] = {
          code: questionCode,
          content: state.designState[questionCode].content,
        };
      }
    });

    return data;
  }, customEquality);

  const referenceInstruction = useMemo(() => {
    return parseUsedInstructions(
      content,
      relevantData.index,
      relevantData.questions,
      relevantData.mainLang,
      reverseIndex
    );
  }, [content, relevantData, reverseIndex]);

  const indexToCodeMap = useMemo(() => {
    const map = {};
    if (referenceInstruction) {
      Object.keys(referenceInstruction).forEach((key) => {
        const ref = referenceInstruction[key];
        if (ref && ref.index) {
          map[ref.index] = key;
        }
      });
    }
    return map;
  }, [referenceInstruction]);

  const fixedValue = useMemo(() => {
    const transformer = new QuestionDisplayTransformer(referenceInstruction);
    return transformer.transformText(content);
  }, [referenceInstruction, content]);

  const highlightedContentRef = useRef(null);
  const lastReferenceInstructionRef = useRef(null);

  useEffect(() => {
    if (isActive) return;
    if (!renderedContentRef.current) return;

    const currentContent = fixedValue;
    const contentChanged = highlightedContentRef.current !== currentContent;
    const refChanged = lastReferenceInstructionRef.current !== referenceInstruction;

    if (!contentChanged && !refChanged) return;

    const cleanup = highlightInstructionsInStaticContent(
      renderedContentRef.current,
      referenceInstruction,
      indexToCodeMap
    );

    highlightedContentRef.current = currentContent;
    lastReferenceInstructionRef.current = referenceInstruction;

    return cleanup;
  }, [isActive, fixedValue, referenceInstruction, renderedContentRef]);

  useEffect(() => {
    if (!isActive) return;

    highlightedContentRef.current = null;
    lastReferenceInstructionRef.current = null;
  }, [isActive]);

  return { referenceInstruction, fixedValue };
}
