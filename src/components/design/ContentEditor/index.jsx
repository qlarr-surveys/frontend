import React, { useCallback, useState } from "react";
import styles from "./ContentEditor.module.css";
import "./ContentEditor.css";
import { Box } from "@mui/material";
import TiptapEditor from "./TiptapEditor";
import TemplateRenderer from "./TemplateRenderer";
import { rtlLanguage } from "~/utils/common";
import { useDispatch } from "react-redux";
import { changeContent, setup } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { isNotEmptyHtml } from "~/utils/design/utils";
import templateService from "~/services/TemplateService";

function ContentEditor({ placeholder, extended, contentKey, code, editable, useSampleData = null }) {
  const dispatch = useDispatch();

  const content = useSelector((state) => {
    return state.designState[code].content
  });

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const type = useSelector((state) => {
    return code[0] == "G"
      ? state.designState[code].groupType?.toLowerCase() || "group"
      : state.designState[code].type;
  });

  const lang = langInfo.lang;
  const mainLang = langInfo.mainLang;
  const onMainLang = langInfo.onMainLang;

  // Determine if we should use sample data based on context
  // If useSampleData is explicitly set, use that
  // Otherwise, use sample data only when in editable (design) mode
  const shouldUseSampleData = useSampleData !== null ? useSampleData : editable;


  const value = content?.[lang]?.[contentKey] || "";

  const finalPlaceholder = onMainLang
    ? placeholder
    : isNotEmptyHtml(content?.[mainLang]?.[contentKey])
    ? content?.[mainLang]?.[contentKey]
    : placeholder;
  const [isActive, setActive] = useState(false);

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
      className={styles.fullWidth}
      onClick={(e) => {
        if (editable) {
          onContainerClicked(e);
        }
      }}
    >
      {isActive ? (
        <TiptapEditor
          lang={lang}
          isRtl={isRtl}
          code={code}
          extended={extended}
          onBlurListener={OnEditorBlurred}
          value={value}
        />
      ) : isNotEmptyHtml(value) ? (
        <TemplateRenderer
          content={value}
          className={`${isRtl ? "rtl" : "ltr"} tiptap-display ${styles.noPadding}`}
          useSampleData={shouldUseSampleData}
          currentQuestionCode={code}
          lang={lang}
        />
      ) : (
        <TemplateRenderer
          content={finalPlaceholder}
          className={`${isRtl ? "rtl" : "ltr"} tiptap-display ${styles.placeholder}`}
          useSampleData={shouldUseSampleData}
          currentQuestionCode={code}
          lang={lang}
        />
      )}
    </Box>
  );
}
export default React.memo(ContentEditor);
