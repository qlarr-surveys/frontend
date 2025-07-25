import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useTranslation } from "react-i18next";

import styles from "./ParagraphQuestion.module.css";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";
import { TextField } from "@mui/material";

function ParagraphQuestion(props) {
  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isDirty = state.templateState[props.component.qualifiedCode];
    let validity = questionState?.validity;
    let invalid = (show_errors || isDirty) && validity === false;
    let value = questionState?.value || "";

    return {
      value: value,
      wordCount: window.QlarrScripts
        ? window.QlarrScripts.wordCount(value)
        : 0,
      invalid: invalid,
    };
  }, shallowEqual);

  const isPreviewMode = useSelector((state)=>{
    return state.runState.data?.survey.isPreviewMode;
  })

  const dispatch = useDispatch();

  const { t } = useTranslation("run");

  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: event.target.name,
        value: event.target.value,
      })
    );
  };

  const lostFocus = (event) => {
    dispatch(setDirty(event.target.name));
  };

  return (
    <div className={styles.questionItem}>
      <TextField
      size="small"
        className={styles.paragraph}
        required={
          props.component.validation?.validation_required?.isActive
            ? true
            : false
        }
        multiline
        id={props.component.qualifiedCode}
        name={props.component.qualifiedCode}
        minRows={!isPreviewMode ? (props.component.minRows || 2) : 1}
        label={(props.component.showHint && props.component.content?.hint )|| ""}
        onChange={handleChange}
        onBlur={lostFocus}
        value={!isPreviewMode ? (state.value) : 'Input disabled because of preview mode'}
        disabled={isPreviewMode}
      />
      {props.component.showWordCount ? (
        <div className={styles.wordCount}>
          <span>{t("word_count", { count: state.wordCount })}</span>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ParagraphQuestion;
