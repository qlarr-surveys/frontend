import React from "react";
import styles from "./FileUploadQuestionDesign.module.css";
import { Button } from '@mui/material';

function FileUploadQuestionDesign({ t }) {
  return (
    <div className={styles.questionItem}>
      <Button
          onClick={()=>{}}
          variant="contained"
          component="span"
        >
          {t("choose_file")}
        </Button>
    </div>
  );
}

export default React.memo(FileUploadQuestionDesign);
