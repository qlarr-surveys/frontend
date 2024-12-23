import React, { useCallback, useState } from "react";
import styles from "./ContentEditor.module.css";
import "./ContentEditor.css";
import { Box } from "@mui/material";
import DraftEditor from "./QuillEditor";
import { rtlLanguage } from "~/utils/common";
import { useDispatch } from "react-redux";
import { changeContent, setup } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { isNotEmptyHtml } from "~/utils/design/utils";

function ContentEditor({ placeholder, extended, contentKey, code, editable }) {
  const dispatch = useDispatch();

  const content = useSelector((state) => {
    return state.designState[code].content?.[contentKey];
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


  const value = content?.[lang] || "";

  const finalPlaceholder = onMainLang
    ? placeholder
    : isNotEmptyHtml(content?.[mainLang])
    ? content?.[mainLang]
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
        <DraftEditor
          lang={lang}
          isRtl={isRtl}
          code={code}
          extended={extended}
          onBlurListener={OnEditorBlurred}
          value={value}
        />
      ) : isNotEmptyHtml(value) ? (
        <div
          className={`${isRtl ? "rtl" : "ltr"} ql-editor ${styles.noPadding}`}
          dangerouslySetInnerHTML={{ __html: value }}
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
