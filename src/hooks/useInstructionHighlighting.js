import { useMemo, useRef, useEffect } from "react";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
  extractReferencedCodes,
  buildReverseIndex,
} from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";
import { useSelector } from "react-redux";

export function useInstructionHighlighting({
  content,
  mainLang,
  isActive,
  renderedContentRef,
}) {
  const referencedCodes = useMemo(() => {
    return extractReferencedCodes(content);
  }, [content]);

  const customEquality = (prev, next) => {
    const prevKeys = Object.keys(prev.questions).sort().join(',');
    const nextKeys = Object.keys(next.questions).sort().join(',');

    if (prevKeys !== nextKeys) {
      return false;
    }

    for (const key in prev.questions) {
      if (prev.questions[key].content !== next.questions[key].content) {
        return false;
      }
    }

    if (prev.mainLang !== next.mainLang) {
      return false;
    }

    const prevReverseKeys = Object.keys(prev.reverseIndex).sort().join(',');
    const nextReverseKeys = Object.keys(next.reverseIndex).sort().join(',');

    if (prevReverseKeys !== nextReverseKeys) {
      return false;
    }

    return true;
  };

  const relevantData = useSelector((state) => {
    const codes = referencedCodes;

    const hasDisplayIndexRefs = Array.from(codes).some((code) => /^Q\d+$/.test(code));
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

      if (/^Q\d+$/.test(refCode) && reverseIndex[refCode]) {
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
    let cleanup = null;

    if (!isActive && renderedContentRef.current) {
      const currentContent = fixedValue;
      const contentChanged = highlightedContentRef.current !== currentContent;
      const refChanged =
        lastReferenceInstructionRef.current !== referenceInstruction;

      if (contentChanged || refChanged) {
        cleanup = highlightInstructionsInStaticContent(
          renderedContentRef.current,
          referenceInstruction
        );
        highlightedContentRef.current = currentContent;
        lastReferenceInstructionRef.current = referenceInstruction;
      }
    } else if (isActive) {
      highlightedContentRef.current = null;
      lastReferenceInstructionRef.current = null;
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isActive, fixedValue, referenceInstruction, renderedContentRef]);

  return { referenceInstruction, fixedValue };
}
