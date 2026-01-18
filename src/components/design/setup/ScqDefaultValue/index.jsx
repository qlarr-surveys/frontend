import React from "react";
import { MenuItem, Typography, FormControl, Select } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { setDefaultValue } from "~/state/design/designState";
import { stripTags } from "~/utils/design/utils";

function ScqDefaultValue({ code }) {
  const dispatch = useDispatch();
  const { t } = useTranslation(NAMESPACES.DESIGN_CORE);

  // Get the question data and its children (answers)
  const answers = useSelector(
    (state) => state.designState[code]?.children || []
  );

  // Get the current "value" instruction
  const currentInstruction = useSelector((state) => {
    return state.designState[code]?.instructionList?.find(
      (instruction) => instruction.code === "value"
    );
  });

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  // Get current default value from the instruction
  const currentDefaultValue = currentInstruction?.text || "";

  // Get answer labels for display
  const answerLabels = useSelector((state) => {
    const labels = {};
    answers.forEach((answer) => {
      if (answer && answer.qualifiedCode) {
        const answerData = state.designState[answer.qualifiedCode];
        // Only use plain text properties
        const rawLabel =
          stripTags(answerData?.content?.[langInfo.mainLang]?.label) ||
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
    <div style={{ marginBottom: "16px" }}>
      <Typography fontWeight={700} style={{ marginBottom: "8px" }}>
        {t("default_value")}
      </Typography>
      <Select
        fullWidth
        value={currentDefaultValue}
        onChange={handleDefaultValueChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return t("no_default");
          }
          return getAnswerLabel(selected);
        }}
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
    </div>
  );
}

export default ScqDefaultValue;
