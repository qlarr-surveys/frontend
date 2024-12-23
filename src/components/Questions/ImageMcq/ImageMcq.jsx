import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Card, Checkbox, Grid } from "@mui/material";
import { buildResourceUrl } from "~/networking/common";
import styles from "./ImageMcq.module.css";
import { setDirty } from "~/state/templateState";
import { rtlLanguage } from "~/utils/common";

function ImageMcq(props) {
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
        return (
          <ImageMcqItem
            option={option}
            aspectRatio={props.component.imageAspectRatio}
            columns={props.component.columns || 3}
            spacing={props.component.spacing || 8}
            hideText={props.component.hideText}
            parentCode={props.component.qualifiedCode}
            key={option.qualifiedCode}
          />
        );
      })}
    </Box>
  );
}

function ImageMcqItem(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let answerState = state.runState.values[props.option.qualifiedCode];
    return {
      showAnswer:
        typeof answerState?.relevance == "undefined" || answerState.relevance,
      checked: answerState?.value || false,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const handleChange = (componentCode, value) => {
    dispatch(valueChange({ componentCode, value }));
    dispatch(setDirty(componentCode));
    dispatch(setDirty(props.parentCode));
  };
  const backgroundImage = props.option.resources?.image
    ? `url('${buildResourceUrl(props.option.resources?.image)}')`
    : "0";

  return (
    <Box
      key={props.option.code}
      sx={{
        flex: `0 1 calc(${100 / props.columns}% - ${props.spacing}px)`,
        cursor: "pointer",
      }}
    >
      <Box
        className={styles.imageContainer}
        onClick={() => handleChange(props.option.qualifiedCode, !state.checked)}
        style={{
          paddingTop: 100 / props.aspectRatio + "%",
          backgroundImage: backgroundImage,
          backgroundColor: theme.palette.background.default,
          borderRadius: "4px",
          border: state.checked
            ? `2px solid ${theme.palette.primary.main}`
            : "2px solid transparent",

        }}
      >
        <div className={styles.selection}>
          <Checkbox
            onChange={(event) =>
              handleChange(props.option.qualifiedCode, !state.checked)
            }
            className={styles.radioCheck}
            checked={state.checked}
          />
        </div>
      </Box>
      {!props.hideText && (
        <Box
          sx={{
            fontFamily: theme.textStyles.text.font,
            color: theme.textStyles.text.color,
            fontSize: theme.textStyles.text.size,
          }}
        >
          {props.option.content?.label}
        </Box>
      )}
    </Box>
  );
}

export default ImageMcq;
