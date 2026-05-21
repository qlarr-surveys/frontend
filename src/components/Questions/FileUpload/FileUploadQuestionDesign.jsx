import React, { useMemo } from "react";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { getThemedButtonSx } from "~/components/Questions/utils";
import styles from "./FileUploadQuestionDesign.module.css";

function FileUploadQuestionDesign({ t }) {
  const theme = useTheme();
  const buttonSx = useMemo(
    () => ({ pointerEvents: "none", ...getThemedButtonSx(theme) }),
    [theme]
  );

  return (
    <div className={styles.questionItem}>
      <Button variant="outlined" disableRipple sx={buttonSx}>
        {t("choose_file")}
      </Button>
    </div>
  );
}

export default React.memo(FileUploadQuestionDesign);
