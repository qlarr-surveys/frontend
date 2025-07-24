import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import styles from "./TextQuestion.module.css";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";

function TextQuestion(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isDirty = state.templateState[props.component.qualifiedCode];
    let validity = questionState?.validity;
    let invalid = (show_errors || isDirty) && validity === false;
    return {
      value: questionState?.value || "",
      invalid: invalid,
    };
  }, shallowEqual);

  const isPreviewMode = useSelector((state) => state.runState.data?.survey.isPreviewMode);

  const dispatch = useDispatch();

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
        variant="standard"
        required={
          props.component.validation?.validation_required?.isActive
            ? true
            : false
        }
        id={props.component.qualifiedCode}
        name={props.component.qualifiedCode}
        label={
          (props.component.showHint && props.component.content?.hint) || ""
        }
        onChange={handleChange}
        onBlur={lostFocus}
        inputProps={{ maxLength: props.component.maxChars || undefined }}
        value={!isPreviewMode ? (state.value) : 'Input disabled because of preview mode'}
        error={state.invalid}
        disabled={isPreviewMode}
        InputProps={{
          sx: {
            fontFamily: theme.textStyles.text.font,
            color: theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
            borderBottom: "1px solid",
          },
        }}
      />
    </div>
  );
}

export default React.memo(TextQuestion);
