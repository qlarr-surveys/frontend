import React, { useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import styles from "./SurveyHeader.module.css";
import { onEditErrorSeen } from "~/state/edit/editState";
import { isSessionRtl } from "~/utils/common";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { routes } from "~/routes";
import TokenService from "~/services/TokenService";
import { availablePages } from "~/constants/roles";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const SurveyHeader = () => {
  const { t } = useTranslation("manage");
  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();
  const isRtl = isSessionRtl();
  const { surveyId } = useParams();
  const surveyName = useSelector(
    (state) => state.editState?.survey?.name || ""
  );

  const user = TokenService.getUser();

  const availablePagesMemo = useMemo(() => {
    return availablePages(user);
  }, [user]);

  const isResponsesPage = location.pathname.includes('/responses');

  return (
    availablePagesMemo.length > 0 && (
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
        {!isResponsesPage && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            endIcon={<VisibilityIcon sx={{ color: "#fff" }} />}
            onClick={() => {
              window.open(
                routes.preview.replace(":surveyId", surveyId),
                "_blank"
              );
            }}
          >
            {t("preview")}
          </Button>
        )}
      </Box>
    )
  );
};
