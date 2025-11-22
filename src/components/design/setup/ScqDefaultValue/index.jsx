import React from "react";
import { MenuItem, Typography, FormControl, InputLabel, Select } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { updateInstruction } from "../../../../state/design/designState";

function ScqDefaultValue({ code }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Get the question data and its children (answers)
  const answers = useSelector((state) => state.designState[code]?.children || []);

  // Get the current "value" instruction
  const currentInstruction = useSelector((state) => {
    return state.designState[code]?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
  });

  // Get current default value from the instruction
  const currentDefaultValue = currentInstruction?.text || "";

  // Get answer labels for display
  const answerLabels = useSelector((state) => {
    const labels = {};
    answers.forEach(answer => {
      if (answer && answer.qualifiedCode) {
        const answerData = state.designState[answer.qualifiedCode];
        labels[answer.code] = answerData?.content?.en?.label || answer.code;
      }
    });
    return labels;
  });

  const getAnswerLabel = (answerCode) => {
    return answerLabels[answerCode] || answerCode;
  };

  const handleDefaultValueChange = (event) => {
    const selectedValue = event.target.value;
    
    // Only modify the text field, preserve all other properties
    const instruction = {
      ...currentInstruction,
      code: "value",
      text: selectedValue
    };
    
    dispatch(updateInstruction({ code, instruction }));
  };

  if (!answers.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography fontWeight={700} style={{ marginBottom: '8px' }}>
        {t("default_value")}
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>{t("select_default_answer")}</InputLabel>
        <Select
          value={currentDefaultValue}
          onChange={handleDefaultValueChange}
          label={t("select_default_answer")}
        >
          <MenuItem value="">
            <em>{t("no_default")}</em>
          </MenuItem>
          {answers.map((answer) => (
            <MenuItem key={answer.code} value={answer.code}>
              {getAnswerLabel(answer.code)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default ScqDefaultValue;