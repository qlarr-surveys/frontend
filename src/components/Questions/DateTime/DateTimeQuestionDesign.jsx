import React from "react";
import TextField from "@mui/material/TextField";
import styles from "./DateTimeQuestionDesign.module.css";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

function DateTimeQuestionDesign({ code }) {
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
        disabled
        size="small"
        variant="outlined"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        label={
          state.showHint && state.content?.[lang]
            ? state.content[lang].hint
            : "" || ""
        }
        value={""}
        placeholder={state.dateFormat}
      />
    </div>
  );
}

export default React.memo(DateTimeQuestionDesign);
