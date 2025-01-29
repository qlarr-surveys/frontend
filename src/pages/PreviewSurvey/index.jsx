import { getparam } from "~/networking/run";
import styles from "./PreviewSurvey.module.css";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { Box, Chip, IconButton, Tab, Tabs } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { isSurveyAdmin } from "~/constants/roles";
import { SurveyClone } from "~/components/manage/SurveyClone";
import { BG_COLOR } from "~/constants/theme";
import { PREVIEW_MODE, routes } from "~/routes";
import { Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function PreviewSurvey({ guest = false }) {
  const navigate = useNavigate();

  const { t } = useTranslation("run");
  const [searchParams] = useSearchParams();
  const [previewMode, setPreviewMode] = useState(
    searchParams.get("mode") || "online"
  );
  const [lang, setLang] = useState(
    searchParams.get("lang")
  );
  const surveyId = getparam(useParams(), "surveyId");

  const surveyModel = {
    id: surveyId,
    example: true,
  };

  const withEmbeddedParam = (surveyId, previewMode, lang) => {
    return (guest
        ? routes.iframePreviewGuestSurvey
      : routes.iframePreviewSurvey).replace(":surveyId",surveyId) + "?mode=" + previewMode + (lang ? "&lang=" + lang : "");
  };

  const handleChange = (event, newValue) => {
    setPreviewMode(newValue);
  };
  const [openCloneModal, setOpenCloneModal] = useState(false);

  return (
    <>
      <Box
        mb={2}
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", left: "8px", top: "8px", zIndex: "1" }}
      >
        <Chip
          label={t("preview")}
          color="primary"
          onDelete={() => navigate(-1)}
          deleteIcon={<Close />}
          style={{ marginLeft: "auto", marginRight: "auto" }} // Centered
        />
      </Box>
      <SurveyClone
        open={openCloneModal}
        onClose={(cloned) => {
          setOpenCloneModal(false);
          if (cloned) {
            navigate(-1);
          }
        }}
        survey={surveyModel}
      />

      <Box
        display="flex"
        position="relative"
        width="100%"
        justifyContent="center"
      >
        <Tabs
          value={previewMode}
          onChange={handleChange}
          aria-label="Preview mode tabs"
        >
          <Tab
            value={PREVIEW_MODE.ONLINE}
            label={<SurveyIcon name="pc" />}
          />
          <Tab
            value={PREVIEW_MODE.ONLINE_PHONE}
            label={<SurveyIcon name="phone" />}
          />
          <Tab
            value={PREVIEW_MODE.OFFLINE}
            label={<SurveyIcon name="offline" />}
          />
        </Tabs>
        {guest && isSurveyAdmin() && (
          <IconButton
            className={styles.iconButton}
            aria-label="stop"
            size="large"
            onClick={() => setOpenCloneModal(true)}
          >
            <FileCopyIcon color="primary" />
          </IconButton>
        )}
      </Box>

      <div
        className={styles.container}
        style={{
          backgroundColor: BG_COLOR,
        }}
      >
        {previewMode == "online" ? (
          <div style={{ height: "calc(100vh - 48px)" }}>
            <iframe
              src={withEmbeddedParam(surveyId, previewMode, lang)}
              className={styles.onlinePreview}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : previewMode == "online-phone" ? (
          <>
            <div className={styles.wrapperMob}>
              <img src="/phone-android.png" className={styles.phoneBg} />
              <iframe
                src={withEmbeddedParam(surveyId, previewMode, lang)}
                className={styles.offlinePreview}
              />
            </div>
          </>
        ) : (
          <div className={styles.wrapperMob}>
            <img src="/phone-android.png" className={styles.phoneBg} />
            <iframe
              src={withEmbeddedParam(surveyId, previewMode, lang)}
              className={styles.offlinePreview}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(PreviewSurvey);
