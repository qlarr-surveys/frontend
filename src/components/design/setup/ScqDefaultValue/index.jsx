import React from "react";
import { MenuItem, Typography, FormControl, InputLabel, Select } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setDefaultValue } from '~/state/design/designState';

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
        // Only use plain text properties
        const rawLabel = answerData?.content?.en?.text || 
                        answerData?.content?.en?.title || 
                        answer.code;
        labels[answer.code] = rawLabel;
      }
    });
    return labels;
  });

  const getAnswerLabel = (answerCode) => {
    return answerLabels[answerCode] || answerCode;
  };

  const handleDefaultValueChange = (event) => {
    const selectedValue = event.target.value;
    dispatch(setDefaultValue({ code, selectedValue }));
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
        <InputLabel>{currentDefaultValue ? t("select_default_answer") : t("no_default")}</InputLabel>
        <Select
          value={currentDefaultValue}
          onChange={handleDefaultValueChange}
          label={currentDefaultValue ? t("select_default_answer") : t("no_default")}
          displayEmpty
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