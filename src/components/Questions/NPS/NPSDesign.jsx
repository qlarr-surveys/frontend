import styles from "./NPSDesign.module.css";
import { Box, useTheme } from "@mui/material";
import React from 'react';
import { useSelector } from "react-redux";

function NPSDesign({ code }) {
  const theme = useTheme();
  let columns = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  return (
    <>
      <Box className={styles.choiceLabels}>
        <Box>{state.content?.lower_bound_hint?.[lang]}</Box>
        <Box>{state.content?.higher_bound_hint?.[lang]}</Box>
      </Box>
      <Box className={styles.choicesContainer}>
        {columns.map((option) => {
          return (
            <NPSOption key={option} code={code} option={option} />
          );
        })}
      </Box>
    </>
  );
}

// Component to show NPS option with default value highlighting
function NPSOption({ code, option }) {
  const theme = useTheme();
  
  const defaultValues = useSelector((state) => {
    if (!code) return [];
    const valueInstruction = state.designState[code]?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
    if (valueInstruction?.text) {
      try {
        const parsed = JSON.parse(valueInstruction.text);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const isSelected = option !== null && option !== undefined && Array.isArray(defaultValues) && defaultValues.includes(option.toString());

  return (
    <Box 
      key={option} 
      className={styles.choice}
      sx={{
        backgroundColor: isSelected ? theme.palette.primary.main : 'inherit',
        color: isSelected ? theme.palette.primary.contrastText : 'inherit',
        fontWeight: isSelected ? 'bold' : 'normal'
      }}
    >
      {option}
    </Box>
  );
}

export default React.memo(NPSDesign);
