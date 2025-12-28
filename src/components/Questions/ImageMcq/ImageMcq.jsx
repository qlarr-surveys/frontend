import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box, Checkbox } from "@mui/material";
import { buildResourceUrl } from "~/networking/common";
import styles from "./ImageMcq.module.css";
import { setDirty } from "~/state/templateState";
import { rtlLanguage } from "~/utils/common";

function ImageMcq(props) {
  const lang = useSelector((state) => {
    return state.runState.values["Survey"].lang;
  });

  const parentValue = useSelector((state) => {
    return state.runState.values[props.component.qualifiedCode].value || [];
  }, shallowEqual);
  const isRtl = rtlLanguage.includes(lang);

  const runValues = useSelector((s) => s.runState.values);

  return (
    <Box
      sx={{
        gap: `${props.component.spacing}px`,
        justifyContent: isRtl ? "flex-end" : "flex-start",
      }}
      className={styles.imageFlexContainer}
    >
      {props.component.answers.map((option) => {
        const relevance = runValues[option.qualifiedCode]?.relevance ?? true;
        if (!relevance) return null;

        return (
          <ImageMcqItem
            option={option}
            parentValue={parentValue}
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

  const dispatch = useDispatch();
  const checked = props.parentValue.indexOf(props.option.code) > -1;

  const handleChange = () => {
    let parentValue = [...props.parentValue];
    if (checked) {
      parentValue = parentValue.filter((el) => el !== props.option.code);
    } else {
      parentValue.push(props.option.code);
    }
    dispatch(
      valueChange({
        componentCode: props.parentCode,
        value: parentValue,
      })
    );
    dispatch(setDirty(props.option.qualifiedCode));
    dispatch(setDirty(props.parentCode));
  };
  const backgroundImage = props.option.resources?.image
    ? `url('${buildResourceUrl(props.option.resources?.image)}')`
    : `url('/placeholder-image.jpg')`;

  return (
    <Box
      key={props.option.code}
      data-code={props.option.code}
      sx={{
        flex: `0 1 calc(${100 / props.columns}% - ${props.spacing}px)`,
        cursor: "pointer",
      }}
    >
      <Box
        className={styles.imageContainer}
        onClick={handleChange}
        style={{
          paddingTop: 100 / props.aspectRatio + "%",
          backgroundImage: backgroundImage,
          borderRadius: "4px",
          border: checked
            ? `4px solid ${theme.palette.primary.main}`
            : "4px solid transparent",
        }}
      >
        <div className={styles.selection}>
          <Checkbox
            onChange={handleChange}
            size="large"
            sx={{
              m: "5px",
            }}
            className={styles.radioCheck}
            checked={checked}
          />
        </div>
      </Box>
      {!props.hideText && <Box>{props.option.content?.label}</Box>}
    </Box>
  );
}

export default ImageMcq;
