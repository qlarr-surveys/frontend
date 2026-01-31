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

  const hasDisplayIndexRefs = useMemo(() => {
    return Array.from(referencedCodes).some((code) => DISPLAY_INDEX_PATTERN.test(code));
  }, [referencedCodes]);

  const customEquality = useCallback((prev, next) => {
    if (prev === next) return true;

    const prevKeys = Object.keys(prev.questions);
    const nextKeys = Object.keys(next.questions);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (!next.questions[key] ||
          prev.questions[key].content !== next.questions[key].content) {
        return false;
      }
    }

    if (prev.mainLang !== next.mainLang) {
      return false;
    }

    const prevIdxKeys = Object.keys(prev.index);
    const nextIdxKeys = Object.keys(next.index);

    if (prevIdxKeys.length !== nextIdxKeys.length) {
      return false;
    }

    for (const key of prevIdxKeys) {
      if (prev.index[key] !== next.index[key]) {
        return false;
      }
    }

    const prevRevKeys = Object.keys(prev.reverseIndex);
    const nextRevKeys = Object.keys(next.reverseIndex);

    if (prevRevKeys.length !== nextRevKeys.length) {
      return false;
    }

    for (const key of prevRevKeys) {
      if (prev.reverseIndex[key] !== next.reverseIndex[key]) {
        return false;
      }
    }

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
      relevantData.mainLang,
      referencedCodes,
      relevantData.reverseIndex
    );
  }, [content, relevantData, referencedCodes]);

  const transformer = useMemo(() => {
    return new QuestionDisplayTransformer(referenceInstruction);
  }, [referenceInstruction]);

  const fixedValue = useMemo(() => {
    return transformer.transformText(content);
  }, [transformer, content]);

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
