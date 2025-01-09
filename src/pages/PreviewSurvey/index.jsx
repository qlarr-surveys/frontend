import { getparam } from "~/networking/run";
import styles from "./PreviewSurvey.module.css";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { isSurveyAdmin } from "~/constants/roles";
import { SurveyClone } from "~/components/manage/SurveyClone";
import { BG_COLOR } from "~/constants/theme";
import { PREVIEW_MODE, routes } from "~/routes";

function PreviewSurvey({ guest = false }) {
  const navigate = useNavigate();

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

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode") || "online";
      setPreviewMode(mode);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const withEmbeddedParam = (surveyId, previewMode, lang) => {
    console.log(lang)
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
            component={Link}
            to={`${(guest ? routes.guestPreview : routes.preview).replace(
              ":surveyId",
              surveyId
            )}?mode=${PREVIEW_MODE.ONLINE}`}
            value={PREVIEW_MODE.ONLINE}
            label={<SurveyIcon name="pc" />}
          />
          <Tab
            component={Link}
            to={`${(guest ? routes.guestPreview : routes.preview).replace(
              ":surveyId",
              surveyId
            )}?mode=${PREVIEW_MODE.ONLINE_PHONE}`}
            value={PREVIEW_MODE.ONLINE_PHONE}
            label={<SurveyIcon name="phone" />}
          />
          <Tab
            
            component={Link}
            to={`${(guest ? routes.guestPreview : routes.preview).replace(
              ":surveyId",
              surveyId
            )}?mode=${PREVIEW_MODE.OFFLINE}`}
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
