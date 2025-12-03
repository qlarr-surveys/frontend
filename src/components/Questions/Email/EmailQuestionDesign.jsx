import React from "react";
import TextField from "@mui/material/TextField";

import styles from "./EmailQuestionDesign.module.css";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

function EmailQuestionDesign({ code }) {
  const theme = useTheme();

  const state = useSelector((state) => {
    return state.designState[code];
  });

  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  return (
    <div className={styles.questionItem}>
      <TextField
        type="email"
        variant="outlined"
        size="small"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        label={state.showHint && (state.content?.[lang]?.hint || "")}
        sx={{
          pointerEvents: "none",
        }}
        value={""}
      />
    </div>
  );
}

export default React.memo(EmailQuestionDesign);
