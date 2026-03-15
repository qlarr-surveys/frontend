import React from "react";
import TextField from "@mui/material/TextField";

import styles from "./TextQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";
import { useTheme } from '@emotion/react';

function TextQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const theme = useTheme();

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  return (
    <div className={styles.questionItem}>
      <TextField
        variant="outlined"
        size="small"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        value={isEditable ? hintText : ""}
        onChange={isEditable ? handleHintChange : undefined}
        sx={{
          pointerEvents: isEditable ? "auto" : "none",
          input: { color: theme.palette.text.disabled },
        }}
      />
    </div>
  );
}

export default React.memo(TextQuestionDesign);
