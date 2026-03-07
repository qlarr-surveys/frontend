import React from "react";
import TextField from "@mui/material/TextField";

import styles from "./EmailQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";

function EmailQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  return (
    <div className={styles.questionItem}>
      <TextField
        type="email"
        variant="outlined"
        size="small"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        value={isEditable ? hintText : ""}
        onChange={isEditable ? handleHintChange : undefined}
        sx={{
          pointerEvents: isEditable ? "auto" : "none",
        }}
      />
    </div>
  );
}

export default React.memo(EmailQuestionDesign);
