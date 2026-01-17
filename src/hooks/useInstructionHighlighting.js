import { useMemo, useRef, useEffect } from "react";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
} from "~/components/design/ContentEditor/TipTapEditor/instructionUtils";
import QuestionDisplayTransformer from "~/utils/QuestionDisplayTransformer";

export function useInstructionHighlighting({
  content,
  index,
  designState,
  mainLang,
  isActive,
  renderedContentRef,
}) {
  const referenceInstruction = useMemo(() => {
    return parseUsedInstructions(content, index, designState, mainLang);
  }, [content, index, designState, mainLang]);

  const fixedValue = useMemo(() => {
    const transformer = new QuestionDisplayTransformer(referenceInstruction);
    return transformer.transformText(content);
  }, [referenceInstruction, content]);

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
