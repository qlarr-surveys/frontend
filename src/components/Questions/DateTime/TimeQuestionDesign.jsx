import React from "react";
import TextField from "@mui/material/TextField";
import styles from "./TimeQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";

function TimeQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  return (
    <div className={styles.questionItem}>
      <TextField
        variant="standard"
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

export default React.memo(TimeQuestionDesign);
