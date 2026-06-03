import { Drawer, IconButton } from "@mui/material";
import styles from "./SurveyDrawer.module.css";
import SurveyIndex from "~/components/run/SurveyIndex";
import React, { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Close } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { useThemeContrast } from "~/components/Questions/useThemeContrast";
import { selectAnsweredCounts } from "~/state/runState";

const drawerSx = {
  "& .MuiDrawer-paper": {
    width: "350px",
    maxWidth: "90%",
    "@media (max-width: 600px)": {
      width: "300px",
    },
  },
};

function SurveyDrawer({ expanded, toggleDrawer, t, onPendingScrollTarget }) {
  const theme = useTheme();
  const contrast = useThemeContrast();

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);
  const { answeredCount, totalCount } = useSelector(
    selectAnsweredCounts,
    shallowEqual,
  );

  const cssVars = useMemo(
    () => ({
      "--qlarr-on-paper": contrast.onPaper,
      "--qlarr-hover-paper": contrast.hoverPaper,
      "--qlarr-mild-border": contrast.mildPaperBorder,
      "--qlarr-error": theme.palette.error?.main || "#d32f2f",
      "--qlarr-primary": theme.palette.primary?.main || contrast.onPaper,
    }),
    [contrast, theme.palette.error?.main, theme.palette.primary?.main],
  );

  return (
    <Drawer
      anchor="left"
      transitionDuration={expanded !== COLLAPSE_IMMEDIATE ? 500 : 0}
      open={expanded == EXPAND}
      onClose={toggleDrawer(false)}
      sx={drawerSx}
    >
      <div className={styles.drawer} style={cssVars}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderText}>
            <span className={styles.drawerTitle}>
              {t("survey_navigation")}
            </span>
            {totalCount > 0 && (
              <span className={styles.drawerSubtitle}>
                {t("answered_progress", {
                  answered: answeredCount,
                  total: totalCount,
                })}
              </span>
            )}
          </div>
          <IconButton
            className={styles.closeButton}
            onClick={toggleDrawer(false)}
            size="small"
            aria-label="close"
          >
            <Close fontSize="small" />
          </IconButton>
        </div>
        <SurveyIndex
          navigationIndex={navigationIndex}
          survey={survey}
          t={t}
          onCloseDrawer={toggleDrawer(false)}
          onPendingScrollTarget={onPendingScrollTarget}
        />
      </div>
    </Drawer>
  );
}

export default React.memo(SurveyDrawer);

export const COLLAPSE_IMMEDIATE = "COLLAPSE_IMMEDIATE";
export const COLLAPSE = "COLLAPSE";
export const EXPAND = "EXPAND";
