import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ValidationItem.module.css";
import { ErrorOutlineOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import Content from "../Content";

function ValidationItem({ name, validation, componentCode, content }) {
  if (content && validation.isCustomErrorActive) {
    return (
      <Box sx={{ color: "error.main" }} className={styles.wrapper}>
        <ErrorOutlineOutlined />
        <Content name={name} elementCode={componentCode} content={content} />
      </Box>
    );
  } else {
    const { t } = useTranslation(["run"]);
    var translationKey = name.replace(/[0-9]/g, "");
    const validationMessage = t(translationKey, { ...validation });
    if (validationMessage) {
      return (
        <Box sx={{ color: "error.main" }} className={styles.wrapper}>
          <ErrorOutlineOutlined />
          {validationMessage}
        </Box>
      );
    } else {
      return <></>;
    }
  }
}

export default ValidationItem;
