import { Drawer, IconButton } from "@mui/material";
import styles from "./SurveyDrawer.module.css";
import SurveyIndex from "~/components/run/SurveyIndex";
import React, { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Close } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { getForegroundColor } from "~/components/Questions/utils";

function SurveyDrawer({ expanded, toggleDrawer, t }) {
  const theme = useTheme();

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);
  const relevanceMap = useSelector((state) => {
    return state.runState.values["Survey"].relevance_map;
  }, shallowEqual);
  const surveyValues = useSelector((state) => {
    return state.runState.values;
  }, shallowEqual);

  const { answeredCount, totalCount } = useMemo(() => {
    if (!survey?.groups) return { answeredCount: 0, totalCount: 0 };
    let total = 0;
    let answered = 0;
    for (const group of survey.groups) {
      if (group.groupType === "END") continue;
      if (!relevanceMap[group.code]) continue;
      for (const question of group.questions || []) {
        if (!relevanceMap[question.code]) continue;
        total += 1;
        if (surveyValues[question.code]?.value !== undefined) {
          answered += 1;
        }
      }
    }
    return { answeredCount: answered, totalCount: total };
  }, [survey, relevanceMap, surveyValues]);

  const onPaper =
    theme.contrast?.onPaper ||
    getForegroundColor(theme.palette.background.paper);
  const hoverPaper =
    theme.contrast?.hoverPaper || theme.palette.action?.hover || "transparent";
  const mildBorder =
    theme.contrast?.mildPaperBorder ||
    theme.palette.divider ||
    "rgba(0,0,0,0.12)";

  const cssVars = {
    "--qlarr-on-paper": onPaper,
    "--qlarr-hover-paper": hoverPaper,
    "--qlarr-mild-border": mildBorder,
    "--qlarr-error": theme.palette.error?.main || "#d32f2f",
    "--qlarr-primary": theme.palette.primary?.main || onPaper,
  };

  return (
    <Drawer
      anchor="left"
      transitionDuration={expanded !== COLLAPSE_IMMEDIATE ? 500 : 0}
      open={expanded == EXPAND}
      onClose={toggleDrawer(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: "350px",
          maxWidth: "90%",
          "@media (max-width: 600px)": {
            width: "300px",
          },
        },
      }}
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
        />
      </div>
    </Drawer>
  );
}

export default React.memo(SurveyDrawer);

export const COLLAPSE_IMMEDIATE = "COLLAPSE_IMMEDIATE";
export const COLLAPSE = "COLLAPSE";
export const EXPAND = "EXPAND";
