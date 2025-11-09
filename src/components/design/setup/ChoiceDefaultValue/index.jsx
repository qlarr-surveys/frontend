import React from "react";
import { MenuItem, Typography, FormControl, InputLabel, Select, Chip, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { changeInstructionValue } from "~/state/design/designState";
import styles from "./McqDefaultValue.module.css";

function ChoiceDefaultValue({ code, t }) {
  const dispatch = useDispatch();
  
  // Debug translation function
  console.log('ChoiceDefaultValue t function:', typeof t);
  console.log('Translation test:', t("select_default_answer"), t("select_default_answers"));

  // Get the question data and its children (answers)
  const questionData = useSelector((state) => state.designState[code]);
  const questionType = questionData?.type;
  const answers = questionData?.children || [];
  const langInfo = useSelector((state) => state.designState.langInfo);
  const currentLang = langInfo?.lang || langInfo?.mainLang || "en";

  // Check if this is an array question type
  const isArrayQuestion = questionType?.includes('array');
  
  // Determine if this is a single choice question (only one default answer allowed)
  const isSingleChoice = [
    'scq', 'select', 'icon_scq', 'image_scq', 'nps', 
    'scq_array', 'scq_icon_array'
  ].includes(questionType);

  // For NPS questions, generate numeric options 0-10
  const npsOptions = questionType === 'nps' ? 
    Array.from({ length: 11 }, (_, i) => ({ code: i.toString(), content: { title: { [currentLang]: i.toString() } } })) : 
    [];

  // Use NPS options for NPS questions, regular answers for others
  const availableOptions = questionType === 'nps' ? npsOptions : answers;

  // Get current default values from the "value" instruction
  const currentDefaultValues = useSelector((state) => {
    const valueInstruction = state.designState[code]?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
    if (valueInstruction?.text) {
      try {
        return JSON.parse(valueInstruction.text);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const handleDefaultValueChange = (event) => {
    let selectedValues = event.target.value;
    
    // For single choice questions, ensure only one value is selected
    if (isSingleChoice) {
      // If it's a string, keep it as is. If it's an array, take the last selected value
      if (Array.isArray(selectedValues)) {
        selectedValues = selectedValues[selectedValues.length - 1] || "";
      }
      // For single choice, store as array with single value for consistency
      selectedValues = selectedValues ? [selectedValues] : [];
    } else {
      // For multiple choice, ensure it's always an array
      if (!Array.isArray(selectedValues)) {
        selectedValues = selectedValues ? [selectedValues] : [];
      }
    }
    
    // Update the "value" instruction's text field
    const instruction = {
      code: "value",
      isActive: false,
      returnType: {
        type: "list",
        values: availableOptions.map(answer => answer.code)
      },
      text: JSON.stringify(selectedValues)
    };

    console.log('Dispatching value instruction:', { code, instruction });
    dispatch(changeInstructionValue({ code, instruction }));
  };

  // Get answer labels for display
  const answerLabels = useSelector((state) => {
    const labels = {};
    availableOptions.forEach(answer => {
      if (questionType === 'nps') {
        // For NPS, use the numeric value as both code and label
        labels[answer.code] = answer.code;
      } else if (answer && answer.qualifiedCode) {
        // For regular questions, get labels from state
        const answerData = state.designState[answer.qualifiedCode];
        labels[answer.code] = answerData?.content?.[currentLang]?.label || answer.code;
      }
    });
    return labels;
  });

  const getAnswerLabel = (answerCode) => {
    return answerLabels[answerCode] || answerCode;
  };

  if (!availableOptions.length) {
    return null;
  }

  return (
    <div className={styles.mcqDefaultValue}>
        <div className={styles.label}>
          <CustomTooltip body={t("tooltips.mcq_default_value")} />
          <Typography fontWeight={700}>{t("mcq_default_value")}</Typography>
        </div>      <FormControl fullWidth size="small">
        <InputLabel id="mcq-default-value-label">
          {isSingleChoice ? "Select default answer" : "Select default answers"}
        </InputLabel>
        <Select
          labelId="mcq-default-value-label"
          multiple={!isSingleChoice}
          value={isSingleChoice ? (currentDefaultValues[0] || "") : currentDefaultValues}
          onChange={handleDefaultValueChange}
          label={isSingleChoice ? "Select default answer" : "Select default answers"}
          renderValue={isSingleChoice ? undefined : (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={getAnswerLabel(value)}
                  size="small"
                />
              ))}
            </Box>
          )}
        >
          {availableOptions.map((answer) => (
            <MenuItem key={answer.code} value={answer.code}>
              {getAnswerLabel(answer.code)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default ChoiceDefaultValue;