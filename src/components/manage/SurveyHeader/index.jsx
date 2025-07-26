import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import { ArrowBack, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import styles from "./SurveyHeader.module.css";
import { onEditErrorSeen } from "~/state/edit/editState";
import { isSessionRtl } from "~/utils/common";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { MANAGE_SURVEY_LANDING_PAGES, routes } from "~/routes";
import TokenService from "~/services/TokenService";
import { availablePages } from "~/pages/ManageSurvey";

export const SurveyHeader = () => {
  const { t } = useTranslation("manage");
  const dispatch = useDispatch();
  const nav = useNavigate();
  const isRtl = isSessionRtl();
  const { surveyId } = useParams();
  const surveyName = useSelector(
    (state) => state.editState?.survey?.name || ""
  );

  const user = TokenService.getUser();
  const tabAvailable = (tab) => availablePages(user).includes(tab);
  return (
    <Box className={styles.header}>
      <Box
        onClick={() => {
          dispatch(onEditErrorSeen());
          nav("/");
        }}
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
        <Typography variant="h3">{surveyName}</Typography>
      </Box>
      {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.PREVIEW) && (
          <CustomTooltip title={t("preview")} showIcon={false}>
            <IconButton sx={{ mr: 2 }}
              onClick={() => {
                window.open(
                  routes.preview.replace(":surveyId", surveyId),
                  "_blank"
                );
              }}
            >
              <Visibility />
            </IconButton>
          </CustomTooltip>
      )}
    </Box>
  );
};
