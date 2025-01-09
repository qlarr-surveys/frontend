import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "./ImageScq.module.css";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Card, Grid, Radio } from "@mui/material";
import { buildResourceUrl } from "~/networking/common";
import { rtlLanguage } from "~/utils/common";

function ImageScq(props) {
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

  const lang = useSelector((state) => {
    return state.runState.values["Survey"].lang;
  });
  const isRtl = rtlLanguage.includes(lang);

  return (
    <Box
      sx={{
        gap: `${props.component.spacing}px`,
        justifyContent: isRtl ? "flex-end" : "flex-start",
      }}
      className={styles.imageFlexContainer}
    >
      {props.component.answers.map((option) => {
        const backgroundImage = option.resources?.image
          ? `url('${buildResourceUrl(option.resources?.image)}')`
          : "0";
        return (
          <Box
            key={option.code}
            sx={{
              flex: `0 1 calc(${100 / props.component.columns}% - ${props.component.spacing}px)`,
              cursor: "pointer",
            }}
            onClick={() =>
              handleChange(props.component.qualifiedCode, option.code)
            }
          >
            <Box
              className={styles.imageContainer}
              style={{
                paddingTop: `${100 / props.component.imageAspectRatio}%`,
                borderRadius: "4px",
                backgroundImage: backgroundImage,
                border:
                  state.value === option.code
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
              }}
            >
              <div className={styles.selection}>
                <Radio
                  checked={state.value === option.code}
                  onChange={(event) =>
                    handleChange(event.target.name, event.target.value)
                  }
                  value={option.code}
                  className={styles.radioCheck}
                  name={props.component.qualifiedCode}
                  size="large"
                  sx={{
                    m:'5px',
                    color: theme.textStyles.text.color,
                  }}
                />
              </div>
            </Box>
            {!props.component.hideText && (
              <Box
                sx={{
                  fontFamily: theme.textStyles.text.font,
                  color: theme.textStyles.text.color,
                  fontSize: theme.textStyles.text.size,
                  textAlign: "center",
                  marginTop: "8px",
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

export default ImageScq;
