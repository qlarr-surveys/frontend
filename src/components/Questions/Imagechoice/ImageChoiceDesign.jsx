import React from "react";
import styles from "./ImageChoiceDesign.module.css";
import { useSelector } from "react-redux";

import { Box, Grid } from "@mui/material";
import ImageChoiceItemDesign from "./ImageChoiceItemDesign";
import IconChoiceItemDesign from "../Iconchoice/IconChoiceItemDesign";

function ImageChoiceQuestion(props) {
  const state = useSelector((state) => {
    return state.designState[props.code];
  });

  const children = state.children || [];

  const imageAspectRatio = useSelector((state) => {
    return state.designState[props.code].imageAspectRatio || 1;
  });

  const questionType = state.type;

  const childrenWithAdd = props.onMainLang
    ? [...children, { type: "add", code: "add" }]
    : children;

  const columnNumber = state.columns || 2;
  const hideText = state.hideText || false;
  const spacing = state.spacing || 8;
  const imageHeight = state.iconSize ? +state.iconSize : 64;

  
  const itemWidth = `calc(${100 / columnNumber}% - ${spacing}px)`;

  return (
    <div className={styles.questionItem}>
      {imageHeight && (
        <Box
          id={"items-" + props.code}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: `${spacing}px`,
          }}
        >
          {childrenWithAdd.map((item, index) =>
            props.icon ? (
              <Box
                key={item.code}
                sx={{
                  flex: `0 1 ${itemWidth}`,
                  maxWidth: itemWidth,
                }}
              >
                <IconChoiceItemDesign
                  key={item.code}
                  parentCode={props.code}
                  index={index}
                  columnNumber={columnNumber}
                  hideText={hideText}
                  imageHeight={imageHeight}
                  t={props.t}
                  addAnswer={() => props.addNewAnswer(props.code, questionType)}
                  type={item.type}
                  qualifiedCode={item.qualifiedCode}
                />
              </Box>

            ) : (
              <Box
                key={item.code}
                sx={{
                  flex: `0 1 ${itemWidth}`,
                  maxWidth: itemWidth,
                }}
              >
                <ImageChoiceItemDesign
                  key={item.code}
                  parentCode={props.code}
                  index={index}
                  imageAspectRatio={imageAspectRatio}
                  columnNumber={columnNumber}
                  hideText={hideText}
                  imageHeight={imageHeight}
                  t={props.t}
                  addAnswer={() => props.addNewAnswer(props.code, questionType)}
                  type={item.type}
                  qualifiedCode={item.qualifiedCode}
                />
              </Box>

            )
          )}
        </Box>
      )}
    </div>
  );
}

export default React.memo(ImageChoiceQuestion);
