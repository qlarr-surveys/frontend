import { getparam } from "~/networking/run";
import styles from "./PreviewSurvey.module.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { useState } from "react";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { isSurveyAdmin } from "~/constants/roles";
import { useService } from "~/hooks/use-service";
import { SurveyClone } from "~/components/manage/SurveyClone";
import { BG_COLOR } from '~/constants/theme';

function PreviewSurvey({ guest = false }) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewMode, setPreviewMode] = useState(
    searchParams.get("mode") || "online"
  );
  const surveyId = getparam(useParams(), "surveyId");

  const surveyModel = {
    id: surveyId,
    example: true,
  };

  const resolveMode = (mode) => {
    if (mode == "offline") return "offline";
    return "online";
  };

  const withEmbeddedParam = () => {
    const surveyId = getparam(useParams(), "surveyId");
    let location = guest
      ? `/preview-guest-survey/${surveyId}`
      : `/preview-survey/${surveyId}`;
    if (location.indexOf("?mode") == -1) {
      location = location + "?mode=" + resolveMode(previewMode);
    } else {
      location = location.replace(
        "?mode=offline",
        `?mode=${resolveMode(previewMode)}`
      );
      location = location.replace(
        "?mode=online",
        `?mode=${resolveMode(previewMode)}`
      );
    }
    return location;
  };

  const handleChange = (event, newValue) => {
    setPreviewMode(newValue);

    navigate(
      `${guest ? "/guest" : ""}/preview/${params.surveyId}?mode=${newValue}`,
      { replace: true }
    );
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
            value="online"
            label={
              <>
                <SurveyIcon name="pc" />
              </>
            }
          />
          <Tab
            value="online-phone"
            label={
              <>
                <SurveyIcon name="phone" />
              </>
            }
          />
          <Tab
            value="offline"
            label={
              <>
                <SurveyIcon name="offline" />
              </>
            }
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
      style={{
        backgroundColor: BG_COLOR,
      }}>

        {previewMode == "online" ? (
          <div style={{ height: "calc(100vh - 112px)" }}>
            <iframe
              src={withEmbeddedParam()}
              className={styles.onlinePreview}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : previewMode == "online-phone" ? (
          <>
            <div className={styles.wrapperMob}>
              <img src="/phone-android.png" className={styles.phoneBg} />
              <iframe
                src={withEmbeddedParam()}
                className={styles.offlinePreview}
              />
            </div>
          </>
        ) : (
          <div className={styles.wrapperMob}>
            <img src="/phone-android.png" className={styles.phoneBg} />
            <iframe
              src={withEmbeddedParam()}
              className={styles.offlinePreview}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(PreviewSurvey);
