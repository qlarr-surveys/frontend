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
import { useCollapsibleHandler, ensureCollapsiblesClosed } from "~/hooks/useCollapsibleHandler";
import {
  parseUsedInstructions,
  transformInstructionText,
  INSTRUCTION_PATTERN,
} from "./TipTapEditor/instructionUtils";

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

  const instructionList = useSelector(
    (state) => state.designState[code]?.instructionList
  );

  const value = content?.[lang]?.[contentKey] || "";

  const referenceInstruction = useMemo(() => {
    return parseUsedInstructions(value, index, designState, mainLang);
  }, [value, index, designState, mainLang]);

  const fixedValue = useMemo(() => {
    if (!referenceInstruction || !Object.keys(referenceInstruction).length) {
      return value;
    }
    let updated = cloneDeep(value);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = updated;

    Object.keys(referenceInstruction).forEach((key) => {
      const spans = tempDiv.querySelectorAll(`span[data-id="${key}"]`);

      spans.forEach((span) => {
        const dataValue = span.getAttribute("data-value");
        if (dataValue) {
          const newDataValue = dataValue.replace(
            new RegExp(`{{${key}:`, "g"),
            `{{${referenceInstruction[key].index}:`
          );
          const nestedSpan = span.querySelector(
            'span[contenteditable="false"]'
          );
          if (nestedSpan) {
            nestedSpan.textContent = newDataValue;
          }
        }
        if (referenceInstruction[key].text) {
          span.setAttribute("title", referenceInstruction[key].text);
        }
      });
    });

    return tempDiv.innerHTML;
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

  useEffect(() => {
    if (!isActive && renderedContentRef.current) {
      highlightInstructionsInStaticContent(renderedContentRef.current);
    }
  }, [isActive, fixedValue, referenceInstruction]);

  function highlightInstructionsInStaticContent(element) {
    const filterNode = (node) => {
      const parent = node.parentElement;
      if (
        parent?.classList.contains("mention") ||
        parent?.classList.contains("instruction-highlight")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      filterNode
    );

    const nodesToProcess = [];
    let node;
    const regex = new RegExp(INSTRUCTION_PATTERN.source, "g");

    while ((node = walker.nextNode())) {
      regex.lastIndex = 0;
      if (regex.test(node.textContent)) {
        nodesToProcess.push(node);
      }
    }

    nodesToProcess.forEach((textNode) => {
      const parent = textNode.parentNode;
      const text = textNode.textContent;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      const matchRegex = new RegExp(INSTRUCTION_PATTERN.source, "g");
      while ((match = matchRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        const { transformedText, tooltip } = transformInstructionText(
          match[0],
          referenceInstruction
        );

        const span = document.createElement("span");
        span.className = "instruction-highlight";
        span.textContent = transformedText;
        if (tooltip) {
          span.title = tooltip;
        }
        fragment.appendChild(span);

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });
  }

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
          className={`content-editor ${isRtl ? "rtl" : "ltr"} ${
            styles.noPadding
          }`}
          dangerouslySetInnerHTML={{
            __html: ensureCollapsiblesClosed(fixedValue),
          }}
        />
      ) : (
        <div
          className={`${isRtl ? "rtl" : "ltr"} ${styles.placeholder}`}
          dangerouslySetInnerHTML={{ __html: finalPlaceholder }}
        />
      )}
    </Box>
  );
}
export default React.memo(ContentEditor);
