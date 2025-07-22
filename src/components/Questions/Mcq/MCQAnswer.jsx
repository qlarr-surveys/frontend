import React, { memo } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";
import Content from "~/components/run/Content";

function McqAnswer(props) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const relevance = useSelector((state) => {
    let answerState = state.runState.values[props.Answer?.qualifiedCode];
    return (
      typeof answerState?.relevance == "undefined" || answerState.relevance
    );
  }, shallowEqual);

  const parentValue = useSelector((state) => {
    return state.runState.values[props.parentCode].value || [];
  }, shallowEqual);

  
  const handleChange = (event) => {
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
  };


  return relevance ? (
    <FormControlLabel
      control={
        <Checkbox
          checked={parentValue.indexOf(props.Answer.code) > -1}
          onChange={handleChange}
          name={props.Answer.qualifiedCode}
          sx={{
            color: theme.textStyles.text.color,
          }}
        />
      }
      label={
        <Content
          elementCode={props.Answer.code}
          fontFamily={theme.textStyles.text.font}
          color={theme.textStyles.text.color}
          fontSize={theme.textStyles.text.size}
          name="label"
          lang={props.lang}
          content={props.Answer.content?.label}
        />
      }
    />
  ) : (
    ""
  );
}

export default memo(McqAnswer);
