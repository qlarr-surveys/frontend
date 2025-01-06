import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "./ImageMcqItem.module.css";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Card, Checkbox, Grid } from "@mui/material";
import { buildResourceUrl } from "~/networking/common";
import { setDirty } from "~/state/templateState";

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
    ? `url('${buildResourceUrl(props.option.resources.image)}')`
    : `url('/placeholder-image.jpg')`;

  return (
    <Grid key={props.option.code} item xs={12 / props.columns}>
      <Box
        className={styles.imageContainer}
        onClick={() => handleChange(props.option.qualifiedCode, !state.checked)}
        style={{
          backgroundImage: backgroundImage,
          borderRadius: "4px",
          backgroundColor: theme.palette.background.default,
          margin: props.spacing + "px",
          height: props.imageHeight + "px",
          border: state.checked
            ? `2px solid ${theme.palette.primary.main}`
            : "2px solid transparent",
        }}
      >
        <Checkbox
          className={styles.selection}
          onChange={(event) =>
            handleChange(props.option.qualifiedCode, !state.checked)
          }
          checked={state.checked}
        />
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
    </Grid>
  );
}

export default ImageMcqItem;
