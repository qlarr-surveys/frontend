import { useMemo, useRef, useEffect } from "react";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
  extractReferencedCodes,
  buildReverseIndex,
} from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { useSelector } from "react-redux";
import { DISPLAY_INDEX_PATTERN } from "~/constants/instruction";
import { makeSelectRelevantInstructionData } from "./instructionSelectors";

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

  const fullIndex = useSelector((state) => state.designState.index);

  const reverseIndex = useMemo(() => {
    if (!hasDisplayIndexRefs || !fullIndex) return {};
    return buildReverseIndex(fullIndex);
  }, [hasDisplayIndexRefs, fullIndex]);

  const selectRelevantData = useMemo(
    () => makeSelectRelevantInstructionData(),
    []
  );

  const relevantData = useSelector((state) =>
    selectRelevantData(state, referencedCodes, reverseIndex, mainLang)
  );

  const referenceInstruction = useMemo(() => {
    return parseUsedInstructions(
      content,
      relevantData.index,
      relevantData.questions,
      relevantData.mainLang,
      reverseIndex
    );
  }, [content, relevantData, reverseIndex]);

  const indexToCodeMap = {};
  if (referenceInstruction) {
    Object.keys(referenceInstruction).forEach((key) => {
      const ref = referenceInstruction[key];
      if (ref && ref.index) {
        indexToCodeMap[ref.index] = key;
      }
    });
  }

  const fixedValue = useMemo(() => {
    return QuestionDisplayTransformer.transformText(content, referenceInstruction);
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
