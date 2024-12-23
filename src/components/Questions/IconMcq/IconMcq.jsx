import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "./IconMcq.module.css";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Grid } from "@mui/material";
import { rtlLanguage } from "~/utils/common";
import DynamicSvg from "~/components/DynamicSvg";
import { buildResourceUrl } from "~/networking/common";

function IconMcq(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    let show_errors = state.runState.values.Survey.show_errors;
    let isDirty = state.templateState[props.component.qualifiedCode];
    return {
      value: questionState?.value || "",
      showValidation:
        (show_errors || isDirty) && questionState?.validity === false,
    };
  }, shallowEqual);
  const dispatch = useDispatch();

  const handleChange = (componentCode, value) => {
    dispatch(valueChange({ componentCode, value }));
  };

  const hideText = props.component?.hideText || false;

  const lang = useSelector((state) => {
    return state.runState.values["Survey"].lang;
  });
  const isRtl = rtlLanguage.includes(lang);

  return (
    <Box
      sx={{
        gap: `${props.component.spacing || 8}px`,
      }}
      className={styles.iconFlexContainer}
    >
      {props.component.answers.map((option) => {
        return (
          <IconMcqChoice
            key={option.code}
            component={option}
            columns={props.component.columns || 3}
            iconSize={props.component.iconSize || 150}
            spacing={props.component.spacing || 8}
            theme={theme}
            hideText={hideText}
          />
        );
      })}
    </Box>
  );
}

function IconMcqChoice({
  key,
  component,
  iconSize,
  columns,
  spacing,
  hideText,
  theme,
}) {
  const dispatch = useDispatch();
  const checked = useSelector(
    (state) => state.runState.values[component.qualifiedCode].value || false
  );
  return (
    <Box
      key={key}
      sx={{
        flex: `0 1 calc(${100 / columns}% - ${spacing || 8}px)`,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <DynamicSvg
        onIconClick={() =>
          dispatch(
            valueChange({
              componentCode: component.qualifiedCode,
              value: !checked,
            })
          )}
          imageHeightPx="100%"
          maxHeight={iconSize + "px"}
          iconColor={
            checked ? theme.palette.primary.main : theme.textStyles.text.color
          }
          svgUrl={
            component?.resources?.icon
              ? buildResourceUrl(component?.resources?.icon)
              : undefined
          }
        />
      </div>

      {!hideText && (
        <Box
          sx={{
            textAlign: "center",
            fontFamily: theme.textStyles.text.font,
            color: checked
              ? theme.palette.primary.main
              : theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
          }}
        >
          {component.content?.label}
        </Box>
      )}
    </Box>
  );
}

export default IconMcq;
