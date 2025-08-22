import React from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import styles from "./IconMcq.module.css";
import { valueChange } from "~/state/runState";
import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import DynamicSvg from "~/components/DynamicSvg";
import { buildResourceUrl } from "~/networking/common";

function IconMcq(props) {
  const theme = useTheme();

  const parentValue = useSelector((state) => {
    return state.runState.values[props.component.qualifiedCode].value || [];
  }, shallowEqual);



  const hideText = props.component?.hideText || false;


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
            parentValue={parentValue}
            parentCode={props.component.qualifiedCode}
            component={option}
            columns={props.component.columns || 3}
            iconSize={props.component.iconSize || "150"}
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
  parentValue,
  parentCode,
  iconSize,
  columns,
  spacing,
  hideText,
  theme,
}) {
  const dispatch = useDispatch();
  const checked = parentValue.indexOf(component.code) > -1;
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
          onIconClick={() =>{
            let parentValue2 = [...parentValue];
            if (checked) {
              parentValue2 = parentValue2.filter((el) => el !== component.code);
            } else {
              parentValue2.push(component.code);
            }
            dispatch(valueChange({ componentCode: parentCode, value: parentValue2 }));
          }}
          imageHeight="100%"
          maxHeight={iconSize + "px"}
          svgUrl={
            component?.resources?.icon
              ? buildResourceUrl(component?.resources?.icon)
              : undefined
          }
          isSelected={checked}
          theme={theme}
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
