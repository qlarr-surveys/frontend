import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import styles from "./ContentEditor.module.css";
import "./ContentEditor.css";
import { Box } from "@mui/material";
import DraftEditor from "./QuillEditor";
import { rtlLanguage } from "~/utils/common";
import { useDispatch } from "react-redux";
import { changeContent, resetFocus } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { isNotEmptyHtml } from "~/utils/design/utils";
import cloneDeep from "lodash.clonedeep";

function ContentEditor({ placeholder, extended, contentKey, onNewLine,code,onMoreLines, editable, editorTheme = "snow" }) {
  const dispatch = useDispatch();

  const content = useSelector((state) => {
    return state.designState[code].content;
  });

  const focus = useSelector((state) => {
    return state.designState["focus"] == code;
  });

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const index = useSelector((state) => {
    return state.designState.index;
  });

  const lang = langInfo.lang;
  const mainLang = langInfo.mainLang;
  const onMainLang = langInfo.onMainLang;

  const instructionList = useSelector(
    (state) => state.designState[code]?.instructionList
  );

  const referenceInstruction = useMemo(() => {
    let returnResult = {};
    const referenceInstruction = instructionList?.find(
      (instruction) => instruction.code === `reference_${contentKey}_${lang}`
    );
    const references = referenceInstruction?.references;

    if (!references || !Array.isArray(references)) {
      return [];
    }

    references.forEach((reference) => {
      const uniqueCode = reference.split(".")[0];
      returnResult[uniqueCode] = index[uniqueCode];
    });
    return returnResult;
  }, [instructionList]);

  const fixedValue = useCallback(
    (value) => {
      let updated = cloneDeep(value);
      Object.keys(referenceInstruction).forEach((key) => {
        updated = updated.replace(
          `>{{${key}:`,
          `>{{${referenceInstruction[key]}:`
        );
      })
      return updated;
    },
    [referenceInstruction]
  );

  const value = content?.[lang]?.[contentKey] || "";

  const finalPlaceholder = onMainLang
    ? placeholder
    : isNotEmptyHtml(content?.[mainLang]?.[contentKey])
    ? content?.[mainLang]?.[contentKey]
    : placeholder;
  const [isActive, setActive] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (focus && !isActive && editable) {
      setActive(true);
      dispatch(resetFocus());
    }
  }, [focus, isActive, editable]);

  const OnEditorBlurred = useCallback(
    (text, editorLang) => {
      setActive(false);
      if (lang != editorLang) {
        return;
      } else if (text != value) {
        dispatch(changeContent({ code, key: contentKey, lang, value: text }));
      }
    },
    [value]
  );

  const onContainerClicked = (event) => {
    event.preventDefault();
    setActive(true);
  };

  const isRtl = rtlLanguage.includes(lang);

  return (
    <Box
      ref={boxRef}
      className={styles.fullWidth}
      onClick={(e) => {
        if (editable) {
          onContainerClicked(e);
        }
      }}
    >
      {isActive ? (
        <DraftEditor
          lang={lang}
          referenceInstruction={referenceInstruction}
          isRtl={isRtl}
          onMoreLines={onMoreLines}
          onNewLine={onNewLine}
          code={code}
          extended={extended}
          editorTheme={editorTheme}
          onBlurListener={OnEditorBlurred}
          value={value}
        />
      ) : isNotEmptyHtml(value) ? (
        <div
          className={`${isRtl ? "rtl" : "ltr"} ql-editor ${styles.noPadding}`}
          dangerouslySetInnerHTML={{ __html: fixedValue(value) }}
        />
      ) : (
        <div
          className={`${isRtl ? "rtl" : "ltr"} ql-editor ${styles.placeholder}`}
          dangerouslySetInnerHTML={{ __html: finalPlaceholder }}
        />
      )}
    </Box>
  );
}
export default React.memo(ContentEditor);
