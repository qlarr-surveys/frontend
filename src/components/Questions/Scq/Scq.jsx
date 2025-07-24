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
import Content from '~/components/run/Content';

function SCQ(props) {
  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    return {
      value: questionState?.value || "",
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
  return (
    <FormControl component="fieldset">
      <RadioGroup
        name={props.component.qualifiedCode}
        value={state.value}
        onChange={handleChange}
      >
        {props.component.answers.map((option) => {
          if (option.type === "other") {
            return (
              <ScqChoiceOther
                lang={props.lang}
                parentCode={props.component.qualifiedCode}
                key={option.qualifiedCode}
                Choice={option}
                isPreviewMode={isPreviewMode}
              />
            );
          } else {
            return <ScqChoice key={option.qualifiedCode} Choice={option} isPreviewMode={isPreviewMode} />;
          }
        })}
      </RadioGroup>
    </FormControl>
  );
}

function ScqChoice(props) {
  const theme = useTheme();

  const showChoice = () => {
    return (
      <FormControlLabel
        key={props.Choice.qualifiedCode}
        control={
          <Radio
            sx={{
              color: theme.textStyles.text.color,
            }}
          />
        }
        label={
            <Content
                elementCode={props.Choice.code}
                fontFamily={theme.textStyles.text.font}
                color={!props.isPreviewMode ? theme.textStyles.text.color : 'grey'}
                fontSize={theme.textStyles.text.size}
                name="label"
                lang={props.lang}
                content={props.Choice.content?.label}
              />

        }
        value={props.Choice.code}
        disabled={props.isPreviewMode}
      />
    );
  };

  return showChoice ? showChoice() : "";
}

function ScqChoiceOther(props) {
  const theme = useTheme();
  const nestedTextChild = props.Choice.answers[0];
  const state = useSelector((state) => {
    let choiceState = state.runState.values[props.Choice.qualifiedCode];
    let childState = state.runState.values[nestedTextChild.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isChildDirty = state.templateState[nestedTextChild.qualifiedCode];
    return {
      showChoice:
        typeof choiceState?.relevance === "undefined" || choiceState.relevance,
      childInvalid:
        (show_errors || isChildDirty) &&
        childState?.relevance === true &&
        childState?.validity === false,
      value: childState?.value || "",
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

  const handleFocus = (event) => {
    dispatch(
      valueChange({ componentCode: props.parentCode, value: props.Choice.code })
    );
  };

  const lostFocus = (event) => {
    dispatch(setDirty(event.target.name));
  };

  const textInput = useRef();
  const onButtonClick = (event) => {
    if (event.target.checked) {
      textInput.current.focus();
    }
  };

  const showChoice = () => {
    return (
      <div className="text-left d-flex">
        <FormControlLabel
          disabled={props.isPreviewMode}
          key={props.Choice.qualifiedCode}
          control={<Radio
            sx={{
              color: theme.textStyles.text.color,
            }}
          />}
          label={
              <TextField
                variant="standard"
                fullWidth
                required={
                  state.textChild?.relevance &&
                  nestedTextChild.validation?.required
                }
                sx={{
                  label: { color: theme.textStyles.text.color },
                }}
                inputRef={textInput}
                id={nestedTextChild.qualifiedCode}
                name={nestedTextChild.qualifiedCode}
                label={props.Choice.content?.label}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={lostFocus}
                value={state.value}
                disabled={props.isPreviewMode}
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
          }
          onChange={onButtonClick}
          value={props.Choice.code}
        />
        <p />
      </div>
    );
  };

  return state.showChoice ? showChoice() : "";
}

export default SCQ;
