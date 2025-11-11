import React from "react";
import { MenuItem, Typography, FormControl, InputLabel, Select } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { updateInstruction } from "../../../../state/design/designState";

function ScqDefaultValue({ code }) {
  const dispatch = useDispatch();

  // Get the question data and its children (answers)
  const answers = useSelector((state) => state.designState[code]?.children || []);

  // Get current default value from the "value" instruction
  const currentDefaultValue = useSelector((state) => {
    const valueInstruction = state.designState[code]?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
    return valueInstruction?.text || "";
  });

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
    
    if (selectedValue === "") {
      // Remove instruction if no value selected
      const instruction = {
        code: "value",
        remove: true
      };
      dispatch(updateInstruction({ code, instruction }));
    } else {
      // Update instruction with selected value and enum returnType
      const instruction = {
        code: "value",
        isActive: false,
        returnType: "enum",
        text: selectedValue
      };
      dispatch(updateInstruction({ code, instruction }));
    }
  };

  if (!answers.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Typography fontWeight={700} style={{ marginBottom: '8px' }}>
        Default Value
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Select default answer</InputLabel>
        <Select
          value={currentDefaultValue}
          onChange={handleDefaultValueChange}
          label="Select default answer"
        >
          <MenuItem value="">
            <em>No default</em>
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