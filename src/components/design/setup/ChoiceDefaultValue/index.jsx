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

  // Only support SCQ questions
  if (questionType !== 'scq') {
    return null;
  }

  // For SCQ, it's always single choice
  const isSingleChoice = true;
  const availableOptions = answers;

  // Get current default values from the "value" instruction
  const currentDefaultValues = useSelector((state) => {
    const questionData = state.designState[code];
    
    // Get from value instruction
    const valueInstruction = questionData?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
    if (valueInstruction?.text) {
      try {
        // For single choice, text might be just the string value (e.g., "A1")
        // For multiple choice, text is JSON array (e.g., "[\"A1\", \"A2\"]")
        if (isSingleChoice) {
          // For single choice, return the text directly as array for UI
          return valueInstruction.text ? [valueInstruction.text] : [];
        } else {
          // For multiple choice, parse JSON
          const parsedValue = JSON.parse(valueInstruction.text);
          return Array.isArray(parsedValue) ? parsedValue : [];
        }
      } catch (e) {
        // If JSON parsing fails, treat as single string value
        return valueInstruction.text ? [valueInstruction.text] : [];
      }
    }
    return [];
  });

  const handleDefaultValueChange = (event) => {
    let selectedValues = event.target.value;
    
    // For single choice questions, store as single string value
    if (isSingleChoice) {
      // If it's an array, take the last selected value
      if (Array.isArray(selectedValues)) {
        selectedValues = selectedValues[selectedValues.length - 1] || "";
      }
      // For single choice, store as single string (not array)
      // selectedValues is now a string or empty string
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
        type: "enum",
        values: availableOptions.map(answer => answer.code)
      },
      text: isSingleChoice ? selectedValues : JSON.stringify(selectedValues)
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