import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import styles from "./ContentEditor.module.css";
import "~/styles/tiptap-editor.css";
import { Box, css } from "@mui/material";
import TipTapEditor from "./TipTapEditor";
import { rtlLanguage } from "~/utils/common";
import { useDispatch } from "react-redux";
import { changeContent, resetFocus } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { isNotEmptyHtml } from "~/utils/design/utils";
import cloneDeep from "lodash.clonedeep";
import {
  useCollapsibleHandler,
  ensureCollapsiblesClosed,
} from "~/hooks/useCollapsibleHandler";
import {
  parseUsedInstructions,
  highlightInstructionsInStaticContent,
} from "./TipTapEditor/instructionUtils";
import { EDITOR_CONSTANTS } from "~/constants/editor";

const { CONTENT_EDITOR_CLASS, RTL_CLASS, LTR_CLASS } = EDITOR_CONSTANTS;

function ContentEditor({
  placeholder,
  extended,
  contentKey,
  onNewLine,
  code,
  onMoreLines,
  editable,
  customStyle,
  showToolbar = true,
}) {
  const dispatch = useDispatch();

  const content = useSelector((state) => {
    return state.designState[code].content;
  });

  const focus = useSelector((state) => {
    return contentKey == "label" && state.designState["focus"] == code;
  });

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const index = useSelector((state) => {
    return state.designState.index;
  });

  const designState = useSelector((state) => {
    return state.designState;
  });

  const lang = langInfo.lang;
  const mainLang = langInfo.mainLang;
  const onMainLang = langInfo.onMainLang;

  const value = content?.[lang]?.[contentKey] || "";

  const referenceInstruction = useMemo(() => {
    return parseUsedInstructions(value, index, designState, mainLang);
  }, [value, index, designState, mainLang]);

  const fixedValue = useMemo(() => {
    if (!referenceInstruction || !Object.keys(referenceInstruction).length) {
      return value;
    }

    let updated = value;

    // Transform instructions ({{questionCode.field}} → {{Q1.field}})
    Object.keys(referenceInstruction).forEach((key) => {
      const ref = referenceInstruction[key];
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\{\\{${escapedKey}([.:])`, 'g');
      const replacement = `{{${ref.index}$1`;
      updated = updated.replace(pattern, replacement);
    });

    return updated;
  }, [referenceInstruction, value]);

  const finalPlaceholder = onMainLang
    ? placeholder
    : isNotEmptyHtml(content?.[mainLang]?.[contentKey])
    ? content?.[mainLang]?.[contentKey]
    : placeholder;
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    if (focus && !isActive && editable) {
      setActive(true);
    }
  }, [focus, isActive, editable]);

  const OnEditorBlurred = useCallback(
    (text, editorLang) => {
      setActive(false);
      dispatch(resetFocus());
      if (lang !== editorLang) {
        return;
      }
      const normalizedText = isNotEmptyHtml(text) ? text : "";
      if (normalizedText !== value) {
        dispatch(
          changeContent({ code, key: contentKey, lang, value: normalizedText })
        );
      }
    },
    [value, lang, code, contentKey, dispatch]
  );

  const onContainerClicked = (event) => {
    event.preventDefault();
    setActive(true);
  };

  const isRtl = rtlLanguage.includes(lang);
  const renderedContentRef = useRef(null);

  useCollapsibleHandler(renderedContentRef, !isActive ? fixedValue : null);

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
  }, [isActive, fixedValue, referenceInstruction]);

  return (
    <Box
      className={styles.fullWidth}
      css={css`
        ${customStyle}
      `}
      onClick={(e) => {
        if (editable) {
          onContainerClicked(e);
        }
      }}
    >
      {isActive ? (
        <TipTapEditor
          lang={lang}
          isRtl={isRtl}
          onMoreLines={onMoreLines}
          onNewLine={onNewLine}
          code={code}
          extended={extended}
          showToolbar={showToolbar}
          onBlurListener={OnEditorBlurred}
          value={value}
          referenceInstruction={referenceInstruction}
        />
      ) : isNotEmptyHtml(value) ? (
        <div
          ref={renderedContentRef}
          className={`${CONTENT_EDITOR_CLASS} ${isRtl ? RTL_CLASS : LTR_CLASS} ${
            styles.noPadding
          }`}
          dangerouslySetInnerHTML={{
            __html: ensureCollapsiblesClosed(fixedValue),
          }}
        />
      ) : (
        <div
          className={`${isRtl ? RTL_CLASS : LTR_CLASS} ${styles.placeholder}`}
          dangerouslySetInnerHTML={{ __html: finalPlaceholder }}
        />
      )}
    </Box>
  );
}
export default React.memo(ContentEditor);
