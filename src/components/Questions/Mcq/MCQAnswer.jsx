import React, { memo } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { Box } from "@mui/material";
import { setDirty } from "~/state/templateState";
import Content from '~/components/run/Content';

function McqAnswer(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let answerState = state.runState.values[props.Answer?.qualifiedCode];
    return {
      showAnswer:
        typeof answerState?.relevance == "undefined" || answerState.relevance,
      checked: answerState?.value || false,
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const handleChange = (event) => {
    dispatch(
      valueChange({
        componentCode: event.target.name,
        value: event.target.checked,
      })
    );
    dispatch(setDirty(event.target.name));
    dispatch(setDirty(props.parentCode));
  };

  return state.showAnswer ? (
    <FormControlLabel
      control={
        <Checkbox
          checked={state.checked}
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
