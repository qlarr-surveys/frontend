import React from "react";
import Button from "@mui/material/Button";
import styles from "./FileUploadQuestionDesign.module.css";

const buttonSx = { pointerEvents: "none" };

function FileUploadQuestionDesign({ t }) {
  return (
    <div className={styles.questionItem}>
      <Button
        variant="contained"
        color="primary"
        disableRipple
        sx={buttonSx}
      >
        {t("choose_file")}
      </Button>
    </div>
  );
}

export default React.memo(FileUploadQuestionDesign);
