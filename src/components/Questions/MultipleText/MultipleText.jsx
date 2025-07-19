import React, { useRef } from "react";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useTheme } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Validation from "~/components/run/Validation";
import Radio from "@mui/material/Radio";
import { valueChange } from "~/state/runState";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { Box } from "@mui/material";
import { setDirty } from "~/state/templateState";
import Content from "~/components/run/Content";

function MultipleText(props) {
  console.log(props.component);

  return (
    <Box
      style={{
        gap: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {props.component.answers.map((option) => {
        console.log(option);
        return (
          <MultipleTextItem
            lang={props.lang}
            key={option.qualifiedCode}
            item={option}
          />
        );
      })}
    </Box>
  );
}

function MultipleTextItem({ lang, item }) {
  const key = item.qualifiedCode;
  const theme = useTheme();
  const state = useSelector((state) => {
    let answerState = state.runState.values[key];
    let show_errors = state.runState.values.Survey.show_errors;
    let isDirty = state.templateState[key];
    let validity = answerState?.validity;
    let invalid = (show_errors || isDirty) && validity === false;
    return {
      value: answerState?.value || "",
      invalid: invalid,
    };
  }, shallowEqual);
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
    <Box
      sx={{
        gap: "10px",
        display: "flex",
      }}
    >
      <Content
        style={{
          flex: 1,
        }}
        elementCode={item.code}
        fontFamily={theme.textStyles.text.font}
        color={theme.textStyles.text.color}
        fontSize={theme.textStyles.text.size}
        name="label"
        lang={lang}
        content={item.content?.label}
      />
      <TextField
        variant="outlined"
        size="small"
        name={key}
        value={state.value}
        InputProps={{
          sx: {
            fontFamily: theme.textStyles.text.font,
            color: theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
          },
        }}
        error={state.invalid}
        onBlur={lostFocus}
        fullWidth
        onChange={handleChange}
        required={item.validation?.required}
        sx={{
          flex: 2,
        }}
      />
    </Box>
  );
}

export default MultipleText;
