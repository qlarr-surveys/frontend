import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import TextField from "@mui/material/TextField";
import styles from "./NumberQuestion.module.css";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";

function NumberQuestion(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isDirty = state.templateState[props.component.qualifiedCode];
    let validity = questionState?.validity;
    let invalid = (show_errors || isDirty) && validity === false;
    return {
      value: questionState?.value,
      invalid: invalid,
    };
  }, shallowEqual);
  const dispatch = useDispatch();

  const cleanupValue = (oldValue, newValue) => {
    const regex =
      props.component.decimal_separator == "."
        ? /^[0-9]+\.?[0-9]*$/
        : props.component.decimal_separator == ","
          ? /^[0-9]+,?[0-9]*$/
          : /^[0-9]*$/;
    if (newValue == "") {
      return undefined;
    }
    if (regex.test(newValue)) {
      let withDecimal = convertToDecimal(newValue)
      let processed = +withDecimal;
      let returning = isNaN(processed) ? oldValue : withDecimal;
      return returning;
    } else {
      return oldValue;
    }
  };

  const convertToDecimal = (value) => {
    if (props.component.decimal_separator != ",") {
      return value;
    }
    let stringValue = value.toString();
    return stringValue.replace(",", ".");
  };

  const formatValue = (value) => {
    return value === undefined
      ? ""
      : props.component.decimal_separator == ","
        ? value.toString().replace(".", ",")
        : value;
  };

  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: event.target.name,
        value: cleanupValue(state.value, event.target.value),
      })
    );
  };

  const lostFocus = (event) => {
    dispatch(setDirty(event.target.name));
    let processed = +state.value;
    if (!isNaN(processed)) {
      dispatch(
        valueChange({
          componentCode: props.component.qualifiedCode,
          value: processed,
        })
      );
    }
  };

  return (
    <div className={styles.questionItem}>
      <TextField
        variant="outlined"
        required={
          props.component.validation?.validation_required?.isActive
            ? true
            : false
        }
        size="small"
        id={props.component.qualifiedCode}
        name={props.component.qualifiedCode}
        label={(props.component.showHint && props.component.content?.hint )|| ""}
        onChange={handleChange}
        onBlur={lostFocus}
        inputProps={{ maxLength: props.component.maxChars || undefined }}
        value={formatValue(state.value)}
        error={state.invalid}
      />
    </div>
  );
}

export default NumberQuestion;
