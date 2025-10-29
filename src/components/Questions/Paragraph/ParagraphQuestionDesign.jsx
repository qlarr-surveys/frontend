import React from "react";

import styles from "./ParagraphQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { TextField } from '@mui/material';

function ParagraphQuestionDesign({ code, t }) {
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
        multiline
        className={styles.paragraph}
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        placeholder={state.showHint && (state.content?.[lang]?.hint || "")}
        minRows={state.minRows || 15}
        value={""}
        sx={{
          pointerEvents: 'none',
        }}
      />
      {state.showWordCount ? (
        <div className={styles.wordCount}>
          <span>{t("word_count", { lng: lang, count: 0 })}</span>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default React.memo(ParagraphQuestionDesign);
