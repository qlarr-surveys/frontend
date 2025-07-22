import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/RadioGroup";

import React, { memo, useRef } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import TextField from "@mui/material/TextField";

import Checkbox from "@mui/material/Checkbox";
import Validation from "~/components/run/Validation";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";
import MCQAnswer from "./MCQAnswer";

function MCQ(props) {
  return (
    <FormControl component="fieldset">
      <FormGroup>
        {props.component.answers.map((option) => {
          if (option.type === "other") {
            return (
              <McqAnswerOther
                key={option.qualifiedCode}
                Answer={option}
                parentCode={props.component.qualifiedCode}
              />
            );
          } else {
            return (
              <MCQAnswer
                lang={props.lang}
                key={option.qualifiedCode}
                Answer={option}
                parentCode={props.component.qualifiedCode}
              />
            );
          }
        })}
      </FormGroup>
    </FormControl>
  );
}

function McqAnswerOther(props) {
  const theme = useTheme();
  const nestedTextChild = props.Answer.answers[0];
  const parentValue = useSelector((state) => {
    return state.runState.values[props.parentCode].value || [];
  }, shallowEqual);
  const isSelected = parentValue.indexOf(props.Answer.code) > -1;
  const state = useSelector((state) => {
    let own = state.runState.values[props.Answer.qualifiedCode];
    let textChild = state.runState.values[nestedTextChild.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isChildDirty = state.templateState[nestedTextChild.qualifiedCode];
    return {
      showAnswer: typeof own?.relevance === "undefined" || own.relevance,
      childInvalid:
        (show_errors || isChildDirty) &&
        textChild?.relevance === true &&
        textChild?.validity === false,
      textValue: textChild?.value || "",
      textRelevance: state.textChild?.relevance,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const onButtonClick = (event) => {
    let value = [...parentValue];
    if (event.target.checked) {
      value.push(props.Answer.code);
    } else {
      value = value.filter((el) => el !== props.Answer.code);
    }
    dispatch(
      valueChange({
        componentCode: props.parentCode,
        value: value,
      })
    );
    dispatch(setDirty(event.target.name));
    dispatch(setDirty(props.parentCode));
    if (event.target.checked) {
      textInput.current.focus();
    }
  };
  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: event.target.name,
        value: event.target.value,
      })
    );
  };

  const textInput = useRef();
  const handleFocus = (event) => {
    let value = [...parentValue];
    if (value.indexOf(props.Answer.code) == -1) {
      value.push(props.Answer.code);
      dispatch(
        valueChange({ componentCode: props.parentCode, value: value })
      );
    }
    
  };

  const lostFocus = (event) => {
    dispatch(setDirty(event.target.name));
  };

  const showAnswer = () => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={isSelected}
            onChange={onButtonClick}
            name={props.Answer.qualifiedCode}
            sx={{
              color: theme.textStyles.text.color,
            }}
          />
        }
        label={
          <div className="w-100">
            <TextField
              variant="standard"
              required={
                state.textRelevance && nestedTextChild.validation?.required
              }
              inputRef={textInput}
              id={nestedTextChild.qualifiedCode}
              name={nestedTextChild.qualifiedCode}
              label={props.Answer.content?.label}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={lostFocus}
              sx={{
                label: { color: theme.textStyles.text.color },
              }}
              value={state.textValue}
              InputProps={{
                sx: {
                  fontFamily: theme.textStyles.text.font,
                  color: theme.textStyles.text.color,
                  fontSize: theme.textStyles.text.size,
                },
              }}
              helperText={
                state.childInvalid ? (
                  <Validation component={nestedTextChild} limit={1} />
                ) : (
                  ""
                )
              }
            />
          </div>
        }
      />
    );
  };

  return state.showAnswer ? showAnswer() : "";
}

export default memo(MCQ);
