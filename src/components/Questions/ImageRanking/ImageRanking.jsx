import React, { useEffect, useRef, useState } from "react";
import styles from "./ImageRanking.module.css";
import { useTheme } from "@emotion/react";
import { Box, Grid } from "@mui/material";
import { shallowEqual, useDispatch } from "react-redux";
import { valueChange } from "~/state/runState";
import { buildResourceUrl } from "~/networking/common";
import { useSelector } from "react-redux";
import { setDirty } from "~/state/templateState";
import { rtlLanguage } from "~/utils/common";

function ImageRanking(props) {
  const values = useSelector((state) => {
    let valuesMap = {};
    props.component.answers.forEach((element) => {
      valuesMap[element.qualifiedCode] =
        state.runState.values[element.qualifiedCode].value;
    });
    return valuesMap;
  }, shallowEqual);
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    setWidth(containerRef?.current?.offsetWidth);
  }, [containerRef]);
  const imageWidth =
    (width - props.component.columns * props.component.spacing * 2) /
    props.component.columns;
  const imageHeight = imageWidth / (props.component.imageAspectRatio || 1);

  useEffect(() => {
    const resizeListener = () => {
      // change width from the state object
      setWidth(containerRef?.current?.offsetWidth);
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const onItemClick = (componentCode) => {
    dispatch(setDirty(props.component.qualifiedCode));
    dispatch(setDirty(props.parentCode));
    if (+values[componentCode] > 0) {
      dispatch(valueChange({ componentCode, undefined }));
    } else {
      let keys = Object.keys(values);
      let allValues = keys.map((key) => values[key]);
      for (var i = 1; i <= keys.length; i++) {
        if (!allValues.includes(i)) {
          dispatch(valueChange({ componentCode, value: i }));
          return;
        }
      }
    }
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
        return (
          <ImageRankingItem
            option={option}
            spacing={props.component.spacing}
            columns={props.component.columns}
            hideText={props.component.hideText}
            onClick={() => onItemClick(option.qualifiedCode)}
            parentCode={props.component.qualifiedCode}
            imageHeight={imageHeight}
            imageWidth={imageWidth}
            key={option.qualifiedCode}
          />
        );
      })}
    </Box>
  );
}

function ImageRankingItem(props) {
  const theme = useTheme();
  const state = useSelector((state) => {
    let answerState = state.runState.values[props.option.qualifiedCode];
    return {
      showAnswer:
        typeof answerState?.relevance == "undefined" || answerState.relevance,
      value: answerState?.value || 0,
    };
  }, shallowEqual);

  const backgroundImage = props.option.resources?.image
    ? `url('${buildResourceUrl(props.option.resources.image)}')`
    : `url('/placeholder-image.jpg')`;

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
        onClick={() => props.onClick()}
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{
          paddingTop: 100 / props.aspectRatio + "%",
          backgroundImage: backgroundImage,
          backgroundColor: theme.palette.background.default,
          borderRadius: "4px",
          boxShadow: 2,
          height: props.imageHeight + "px",
          border: state.checked
            ? `2px solid ${theme.palette.primary.main}`
            : "2px solid transparent",
        }}
      >
        {state.value > 0 && (
          <div
            style={{
              height: Math.min(props.imageHeight, props.imageWidth) + "px",
              width: Math.min(props.imageHeight, props.imageWidth) + "px",
              borderRadius:
                Math.min(props.imageHeight, props.imageWidth) / 2 + "px",
              fontSize:
                Math.min(props.imageHeight, props.imageWidth) / 2 + "px",
              background: theme.palette.primary.main,

            }}
            className={styles.rankContainer}
          >
            <span
              className={styles.rankValue}
              style={{
                color: theme.textStyles.text.color,
              }}
            >
              {state.value}
            </span>
          </div>
        )}
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

export default ImageRanking;
