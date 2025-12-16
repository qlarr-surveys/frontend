import React from "react";
import TextField from "@mui/material/TextField";
import styles from "./TimeQuestionDesign.module.css";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

function TimeQuestionDesign({ code }) {
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
        variant="standard"
        size="small"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        label={
          state.showHint && state.content?.[lang]
            ? state.content[lang].hint
            : "" || ""
        }
        value={""}
        type="time"
      />
    </div>
  );
}

export default React.memo(TimeQuestionDesign);
