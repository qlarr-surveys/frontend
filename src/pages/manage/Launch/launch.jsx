import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";

import EditSurveyGeneral from "~/components/manage/EditSurveyGeneral";
import SurveySharing from "~/components/manage/SurveySharing";
import styles from "./Launch.module.css";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { newVersionReceived, setSaving } from "~/state/design/designState";
import { useTranslation } from "react-i18next";
import { useService } from "~/hooks/use-service";
function LaunchPage({ onPublish }) {
  const { t } = useTranslation("manage");
  const designService = useService("design");

  const dispatch = useDispatch();

  const versionDto = useSelector((state) => {
    return state.designState.versionDto;
  });
  const published = versionDto?.published;

  const hasFatalErrors = useSelector((state) => {
    return (
      state.designState.Survey?.errors &&
      state.designState.Survey.errors.length > 0
    );
  });

  const params = new URLSearchParams([
    ["version", versionDto?.version],
    ["sub_version", versionDto?.subVersion],
  ]);

  const publish = () => {
    dispatch(setSaving(true));
    designService
      .publish(params)
      .then((data) => {
        dispatch(setSaving(false));
        dispatch(newVersionReceived(data));
        onPublish();
      })
      .catch((error) => {
        dispatch(setSaving(false));
      });
  };

  return (
    <Box className={styles.box}>
      {!published && (
        <Box
          display="flex"
          alignItems="center"
          className={styles.publishContainer}
        >
          <Typography variant="subtitle1">
            {t("launch.publish_text")}
          </Typography>

          <>
            <Tooltip
              title={
                !hasFatalErrors
                  ? `${t("launch.publish_tooltip")}`
                  : `${t("launch.publish_error")}`
              }
              placement="top"
            >
              <span>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={styles.actionButton}
                  onClick={() => {
                    if (!hasFatalErrors) {
                      publish();
                    }
                  }}
                  disabled={hasFatalErrors}
                >
                  <SurveyIcon
                    name="launch"
                    color={!hasFatalErrors ? "#fff" : "#bdbdbd"}
                  />
                  {t("launch.publish")}
                </Button>
              </span>
            </Tooltip>
          </>
        </Box>
      )}
      <EditSurveyGeneral />
      <SurveySharing />
    </Box>
  );
}

export default LaunchPage;
