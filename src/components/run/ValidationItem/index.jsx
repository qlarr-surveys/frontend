import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ValidationItem.module.css";
import { ErrorOutlineOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";

function ValidationItem(props) {
  const { t } = useTranslation(["run"]);
  function messages() {
    let validationMessage = "";
    if (props.validation.content && props.validation.isCustomErrorActive) {
      validationMessage = props.validation.content;
    } else {
      var translationKey = props.name.replace(/[0-9]/g, "");
      validationMessage = t(translationKey, { ...props.validation });
    }
    if (validationMessage) {
      return (
        <Box sx={{ color: "error.main" }} className={styles.wrapper}>
          <ErrorOutlineOutlined />
          {validationMessage}
        </Box>
      );
    } else {
      return "";
    }
  }
  return messages();
}

export default ValidationItem;
