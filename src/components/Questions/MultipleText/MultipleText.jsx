import TextField from "@mui/material/TextField";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { valueChange } from "~/state/runState";
import { Box } from "@mui/material";
import { setDirty } from "~/state/templateState";
import Content from "~/components/run/Content";

function MultipleText(props) {
  return (
    <Box
      style={{
        gap: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {props.component.answers.map((option) => {
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
        customStyle={`
        flex: 1 !important;
        font-size: ${theme.textStyles.text.size}px;
        `}
        elementCode={item.code}
        name="label"
        lang={lang}
        content={item.content?.label}
      />
      <TextField
        variant="outlined"
        size="small"
        name={key}
        value={state.value}
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
