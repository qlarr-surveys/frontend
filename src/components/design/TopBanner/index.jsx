import { Tab, Tabs, Tooltip } from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import styles from "./TopBanner.module.css";
import React from "react";
import { Edit, Settings, Visibility } from "@mui/icons-material";
import { MANAGE_SURVEY_LANDING_PAGES, routes } from "~/routes";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function TopBanner({ selectedTab, onTabChange, availableTabs, onClick, surveyId }) {
  const tabAvailable = (tab) => availableTabs.indexOf(tab) !== -1;
  const { t } = useTranslation("design");
  const getTabButtonStyle = (tabValue) => ({
    minWidth: "auto",
    margin: "0px !important",
    padding: "24px 16px",
    backgroundColor: selectedTab === tabValue ? "#2d3cb2" : undefined,
    color: "#fff",
  });

  const versionDto = useSelector((state) => {
    return state.designState.versionDto;
  });

  const published = versionDto?.published;

  const value = availableTabs.indexOf(selectedTab);
  function component() {
    return (
      <>
        <Tabs
          orientation="vertical"
          value={value}
          onChange={(event, newValue) => {
            onTabChange(newValue);
          }}
        >
          {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.DESIGN) && (
            <Tooltip title={t("design")} placement="right">
              <Tab
                component={Link}
                to={routes.designSurvey.replace(':surveyId', surveyId)}
                onClick={() => onClick(MANAGE_SURVEY_LANDING_PAGES.DESIGN)}
                sx={getTabButtonStyle(MANAGE_SURVEY_LANDING_PAGES.DESIGN)}
                label={<Edit sx={{ color: "#fff" }} />}
                value={MANAGE_SURVEY_LANDING_PAGES.DESIGN}
              />
            </Tooltip>
          )}
          {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.PREVIEW) && (
            <Tooltip title={t("preview")} placement="right">
              <Tab
                component={Link}
                to={routes.preview.replace(':surveyId', surveyId)}
                sx={getTabButtonStyle(MANAGE_SURVEY_LANDING_PAGES.PREVIEW)}
                label={<Visibility sx={{ color: "#fff" }} />}
                value={MANAGE_SURVEY_LANDING_PAGES.PREVIEW}
              />
            </Tooltip>
          )}
          {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.SETTINGS) && (
            <Tooltip title={t("settings")} placement="right">
              <Tab
                component={Link}
                to={routes.editSurvey.replace(':surveyId', surveyId)}
                sx={getTabButtonStyle(MANAGE_SURVEY_LANDING_PAGES.SETTINGS)}
                label={
                  <div className={styles.launchContainer}>
                    <Settings sx={{ color: "#fff" }} />
                    {!published && (
                      <span className={styles.unpublishedChangesDot}></span>
                    )}
                  </div>
                }
                value={MANAGE_SURVEY_LANDING_PAGES.SETTINGS}
              />
            </Tooltip>
          )}
          {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.RESPONSES) && (
            <Tooltip title={t("responses")} placement="right">
              <Tab
                component={Link}
                to={routes.responses.replace(':surveyId', surveyId)}
                sx={getTabButtonStyle(MANAGE_SURVEY_LANDING_PAGES.RESPONSES)}
                label={<TableRowsIcon sx={{ color: "#fff" }} />}
                value={MANAGE_SURVEY_LANDING_PAGES.RESPONSES}
              />
            </Tooltip>
          )}
        </Tabs>
      </>
    );
  }

  return <div className={styles.surveyHeader}>{component()}</div>;
}

export default React.memo(TopBanner);
