import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import styles from "./SurveyHeader.module.css";
import { onEditErrorSeen } from "~/state/edit/editState";
import { isSessionRtl } from "~/utils/common";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

export const SurveyHeader = () => {
  const { t } = useTranslation("manage");
  const dispatch = useDispatch();
  const nav = useNavigate();
  const isRtl = isSessionRtl();

  const surveyName = useSelector(
    (state) => state.editState?.survey?.name || ""
  );

  return (
    <Box className={styles.header}>
      <Box
        onClick={() => {
          dispatch(onEditErrorSeen());
          nav("/");
        }}
        gap="12px"
        className={isRtl ? styles.containerRtl : styles.container}
      >
        <CustomTooltip showIcon={false} title={t(`goBack`)}>
          <IconButton>
            <ArrowBack
              sx={{
                fontSize: 30,
                transform: isRtl ? "scaleX(-1)" : "none",
                cursor: "pointer",
                color: "black",
              }}
            />
          </IconButton>
        </CustomTooltip>
      </Box>
      <Typography variant="h3">{surveyName}</Typography>
    </Box>
  );
};
