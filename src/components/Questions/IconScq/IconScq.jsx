import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "./IconScq.module.css";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Grid } from "@mui/material";
import DynamicSvg from '~/components/DynamicSvg';
import { buildResourceUrl } from '~/networking/common';

function IconScq(props) {
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

  const runValues = useSelector((s) => s.runState.values);

  return (
    <Box
      sx={{
        gap: `${props.component.spacing || 8}px`,
      }}
      className={styles.iconFlexContainer}
    >
      {props.component.answers.map((option) => {
        const isSelected = state.value == option.code;
        const relevance = runValues[option.qualifiedCode]?.relevance ?? true;
        if (!relevance) return null;
        return (
          <Box
            key={option.code}
            sx={{
              flex: `0 1 calc(${100 / props.component.columns}% - ${
                props.component.spacing || 8
              }px)`,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%"
              }}
            >
              <DynamicSvg
                onIconClick={() =>
                  handleChange(props.component.qualifiedCode, option.code)
                }
                imageHeight={"100%"}
                maxHeight={(props.component.iconSize || 150) + "px"}
                svgUrl={
                  option?.resources?.icon
                    ? buildResourceUrl(option?.resources?.icon)
                    : undefined
                }
                isSelected={isSelected}
                theme={theme}
              />
            </div>

            {!hideText && (
              <Box
                sx={{
                  textAlign: "center",
                  fontFamily: theme.textStyles.text.font,
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.textStyles.text.color,
                  fontSize: theme.textStyles.text.size,
                }}
              >
                {option.content?.label}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default IconScq;
