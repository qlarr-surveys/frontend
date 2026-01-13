import { getparam } from "~/networking/run";
import styles from "./PreviewSurvey.module.css";
import { useParams, useSearchParams } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { BG_COLOR } from "~/constants/theme";
import { PREVIEW_MODE, routes } from "~/routes";
import { useTranslation } from "react-i18next";

function PreviewSurvey({ responseId = null }) {
  const [searchParams] = useSearchParams();
  const [previewMode, setPreviewMode] = useState(
    searchParams.get("mode") || "online"
  );
  const [navigationMode, setNavigationMode] = useState(
    searchParams.get("navigation_mode") || "ALL_IN_ONE"
  );
  const [currentResponseId, setCurrentResponseId] = useState(responseId);
  const { t: tDesign } = useTranslation("design");

  const surveyId = getparam(useParams(), "surveyId");

  const notifyIframe = (previewMode, navigationMode) => {
    const iframe = document.getElementById("myIframe");
    iframe.contentWindow.postMessage(
      {
        type: "PREVIEW_MODE_CHANGED",
        mode: previewMode == "offline" ? "offline" : "online",
        navigationMode: navigationMode,
      },
      window.location.origin
    );
  };

  const embeddedParams = useMemo(
    () =>
      (responseId
        ? routes.resumeIframePreviewSurvey
            .replace(":surveyId", surveyId)
            .replace(":responseId", responseId)
        : routes.iframePreviewSurvey.replace(":surveyId", surveyId)) +
          "?mode=" + previewMode +
          (navigationMode ? "&navigation_mode=" + navigationMode : ""),
    []
  );

  const handleChange = (event, newValue) => {
    notifyIframe(newValue, navigationMode);
    setPreviewMode(newValue);
    formatUrl(newValue, navigationMode);
  };

  const handleNavigationModeChange = (event) => {
    notifyIframe(previewMode, event.target.value);
    setNavigationMode(event.target.value);
    formatUrl(previewMode, event.target.value);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      // Always verify the origin for security
      if (
        event.origin !== window.location.origin ||
        event.data.type !== "RESPONSE_ID_RECEIVED"
      ) {
        return;
      }

      const iFrameResponseId = event.data.responseId;
      if (currentResponseId != iFrameResponseId) {
        setCurrentResponseId(iFrameResponseId);
        window.history.replaceState(
          {},
          "",
          routes.resumePreview
            .replace(":surveyId", surveyId)
            .replace(":responseId", iFrameResponseId)
        );
      }
      // Handle the message data here
    };

    window.addEventListener("message", handleMessage);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const formatUrl = (previewMode, navigationMode) => {
    window.history.replaceState(
      {},
      "",
      routes.resumePreview
        .replace(":surveyId", surveyId)
        .replace(":responseId", currentResponseId) +
        "?mode=" +
        previewMode +
        (navigationMode ? "&navigation_mode=" + navigationMode : ""),
    );
  };

  return (
    <>
      <Box
        display="flex"
        position="relative"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Tabs
          value={previewMode}
          onChange={handleChange}
          aria-label={tDesign("aria.preview_mode_tabs")}
        >
          <Tab value={PREVIEW_MODE.ONLINE} label={<SurveyIcon name="pc" />} />
          <Tab
            value={PREVIEW_MODE.ONLINE_PHONE}
            label={<SurveyIcon name="phone" />}
          />
          <Tab
            value={PREVIEW_MODE.OFFLINE}
            label={<SurveyIcon name="offline" />}
          />
        </Tabs>

        <Box position="absolute" right="16px" top="0px">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="navigation-mode-select-label">
              {tDesign("navigation_mode")}
            </InputLabel>
            <Select
              labelId="navigation-mode-select-label"
              id="navigation-mode-select"
              size="small"
              value={navigationMode}
              onChange={handleNavigationModeChange}
              label={tDesign("navigation_mode")}
            >
              <MenuItem value="ALL_IN_ONE">{tDesign("all_in_one")}</MenuItem>
              <MenuItem value="GROUP_BY_GROUP">
                {tDesign("group_by_group")}
              </MenuItem>
              <MenuItem value="QUESTION_BY_QUESTION">
                {tDesign("question_by_question")}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <div
        className={styles.container}
        style={{
          backgroundColor: BG_COLOR,
        }}
      >
        <div
          className={previewMode === "online" ? "" : styles.wrapperMob}
          style={
            previewMode === "online" ? { height: "calc(100vh - 48px)" } : {}
          }
        >
          {previewMode !== "online" && (
            <img src="/phone-android.png" className={styles.phoneBg} />
          )}
          <iframe
            id="myIframe"
            src={embeddedParams}
            className={
              previewMode === "online"
                ? styles.onlinePreview
                : styles.offlinePreview
            }
            style={
              previewMode === "online" ? { width: "100%", height: "100%" } : {}
            }
          />
        </div>
      </div>
    </>
  );
}

export default React.memo(PreviewSurvey);
