

import React, { memo } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { Box } from "@mui/material";
import { setDirty } from "~/state/templateState";

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

  const isPreviewMode = useSelector((state)=>{
    return state.runState.data?.survey.isPreviewMode;
  })

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
          disabled={isPreviewMode}
          sx={{
            color: theme.textStyles.text.color,
          }}
        />
      }
      label={
        <Box
          sx={{
            fontFamily: theme.textStyles.text.font,
            fontSize: theme.textStyles.text.size,
          }}
        >
          {props.Answer.content?.label}
        </Box>
      }
    />
  ) : (
    ""
  );
}

export default memo(McqAnswer);
