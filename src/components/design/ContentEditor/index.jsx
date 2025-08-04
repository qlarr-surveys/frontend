import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
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

function ContentEditor({
  placeholder,
  extended,
  contentKey,
  onNewLine,
  code,
  onMoreLines,
  editable,
  editorTheme = "snow",
  style,
  sx,
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
  }, [instructionList, index]);



  const value = content?.[lang]?.[contentKey] || "";

  const fixedValue = useMemo(
    () => {
      if (!referenceInstruction || !Object.keys(referenceInstruction).length) {
        return value;
      }
      let updated = cloneDeep(value);

      // Create a temporary DOM element to parse and manipulate the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = updated;

      Object.keys(referenceInstruction).forEach((key) => {
        // Find all spans with data-id matching the key
        const spans = tempDiv.querySelectorAll(`span[data-id="${key}"]`);

        spans.forEach((span) => {
          // Get the data-value attribute
          const dataValue = span.getAttribute("data-value");
          if (dataValue) {
            // Replace the key with referenceInstruction[key] in the data-value
            const newDataValue = dataValue.replace(
              new RegExp(`{{${key}:`, "g"),
              `{{${referenceInstruction[key]}:`
            );
            // Find the nested span with contenteditable="false" and update its content
            const nestedSpan = span.querySelector(
              'span[contenteditable="false"]'
            );
            if (nestedSpan) {
              nestedSpan.textContent = newDataValue;
            }
          }
        });
      });

      return tempDiv.innerHTML;
    },
    [referenceInstruction, value]
  );

  const finalPlaceholder = onMainLang
    ? placeholder
    : isNotEmptyHtml(content?.[mainLang]?.[contentKey])
    ? content?.[mainLang]?.[contentKey]
    : placeholder;
  const [isActive, setActive] = useState(false);

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
      style={style}
      sx={sx}
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
          dangerouslySetInnerHTML={{ __html: fixedValue }}
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
