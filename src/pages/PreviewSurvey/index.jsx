import { getparam } from "~/networking/run";
import styles from "./PreviewSurvey.module.css";
import {
  Link,
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
import { routes } from "~/routes";

function PreviewSurvey({ guest = false }) {
  const [searchParams] = useSearchParams();
  const [previewMode, setPreviewMode] = useState(
    searchParams.get("mode") || "online"
  );
  const surveyId = getparam(useParams(), "surveyId");

  const surveyModel = {
    id: surveyId,
    example: true,
  };

  useEffect(() => {
    const handlePopState = () => {
      console.log("handlePopState")
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode") || "online";
      setPreviewMode(mode);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const withEmbeddedParam = (surveyId, previewMode) => {
    return guest
      ? `/preview-guest-survey/${surveyId}`
      : `/preview-survey/${surveyId}` + "?mode=" + previewMode;
  };

  const handleChange = (event, newValue) => {
    console.log("handleChange")
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
            fetchSurveys();
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
            )}?mode=online`}
            value="online"
            label={<SurveyIcon name="pc" />}
          />
          <Tab
            component={Link}
            to={`${(guest ? routes.guestPreview : routes.preview).replace(
              ":surveyId",
              surveyId
            )}?mode=online-phone`}
            value="online-phone"
            label={<SurveyIcon name="phone" />}
          />
          <Tab
            value="offline"
            component={Link}
            to={`${(guest ? routes.guestPreview : routes.preview).replace(
              ":surveyId",
              surveyId
            )}?mode=offline`}
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
              src={withEmbeddedParam(surveyId, previewMode)}
              className={styles.onlinePreview}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : previewMode == "online-phone" ? (
          <>
            <div className={styles.wrapperMob}>
              <img src="/phone-android.png" className={styles.phoneBg} />
              <iframe
                src={withEmbeddedParam(surveyId, previewMode)}
                className={styles.offlinePreview}
              />
            </div>
          </>
        ) : (
          <div className={styles.wrapperMob}>
            <img src="/phone-android.png" className={styles.phoneBg} />
            <iframe
              src={withEmbeddedParam(surveyId, previewMode)}
              className={styles.offlinePreview}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(PreviewSurvey);
