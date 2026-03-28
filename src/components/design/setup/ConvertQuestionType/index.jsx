import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertQuestion } from "~/state/design/designState";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import styles from "./ConvertQuestionType.module.css";

export default function ConvertQuestionType({ code, t }) {
  const dispatch = useDispatch();
  const type = useSelector((s) => s.designState[code]?.type);

  const handleChange = (_, newType) => {
    if (newType && newType !== type) {
      dispatch(convertQuestion({ questionCode: code, newType }));
    }
  };

  return (
    <div className={styles.container}>
      <Typography fontWeight={700}>{t("question_type")}</Typography>
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleChange}
        size="small"
      >
        <ToggleButton value="scq">{t("single_choice")}</ToggleButton>
        <ToggleButton value="mcq">{t("multiple_choice")}</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
