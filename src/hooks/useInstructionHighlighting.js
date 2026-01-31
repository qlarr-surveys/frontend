import { useMemo, useRef, useEffect, useCallback } from "react";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
  extractReferencedCodes,
  buildReverseIndex,
} from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { useSelector } from "react-redux";

const DISPLAY_INDEX_PATTERN = /^Q\d+$/;

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

    if (Object.keys(prev.questions).length !== Object.keys(next.questions).length) return false;
    if (Object.keys(prev.reverseIndex).length !== Object.keys(next.reverseIndex).length) return false;

    return true;
  }, []);

  const relevantData = useSelector((state) => {
    const codes = referencedCodes;

    const reverseIndex = hasDisplayIndexRefs && state.designState.index
      ? buildReverseIndex(state.designState.index)
      : {};

    const data = {
      index: {},
      questions: {},
      reverseIndex,
      mainLang,
    };

    codes.forEach((refCode) => {
      let questionCode = refCode;

      if (DISPLAY_INDEX_PATTERN.test(refCode) && reverseIndex[refCode]) {
        questionCode = reverseIndex[refCode];
      }

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
      relevantData.mainLang
    );
  }, [content, relevantData]);

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
      referenceInstruction
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
