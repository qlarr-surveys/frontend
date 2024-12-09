import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import styles from "./TopBanner.module.css";
import React from "react";
import { Edit, Settings, Visibility } from "@mui/icons-material";
import { MANAGE_SURVEY_LANDING_PAGES, routes } from "~/routes";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { resetSetup, setup } from "~/state/design/designState";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
import { GTranslate, Palette } from "@mui/icons-material";
import ReorderIcon from "@mui/icons-material/Reorder";

function TopBanner({ selectedTab, onTabChange, availableTabs, surveyId }) {
  const tabAvailable = (tab) => availableTabs.indexOf(tab) !== -1;
  const { t } = useTranslation("design");
  const dispatch = useDispatch();
  const getTabButtonStyle = (selected) => ({
    minWidth: "auto",
    margin: "0px !important",
    padding: "24px 16px",
    backgroundColor: selected ? "#2d3cb2" : undefined,
    color: "#fff",
  });

  const setupInfo = (state) => state.designState.setup || {};

  const showTheme = () => {
    dispatch(setup(themeSetup));
  };
  const showTranslation = () => {
    dispatch(setup(languageSetup));
  };
  const reOrder = () => {
    dispatch(setup(reorderSetup));
  };

  const versionDto = useSelector((state) => {
    return state.designState.versionDto;
  });

  const published = versionDto?.published;

  const value = availableTabs.indexOf(selectedTab);
  function component() {
    return (
      <List>
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.DESIGN) && (
          <>
            <Tooltip title={t("design")} placement="right">
              <ListItem disablePadding>
                <ListItemButton>
                  <Link to={routes.designSurvey.replace(":surveyId", surveyId)}>
                    <ListItemIcon
                      onClick={() => {
                        dispatch(resetSetup());
                        onTabChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                      }}
                    >
                      <Edit sx={{ color: "#fff" }} />
                    </ListItemIcon>
                  </Link>
                </ListItemButton>
              </ListItem>
            </Tooltip>
            <Tooltip title={t("design")} placement="right">
              <ListItem disablePadding>
                <ListItemButton>
                  <Link
                    to={
                      routes.designSurvey.replace(":surveyId", surveyId) +
                      "?mode=languages"
                    }
                  >
                    <ListItemIcon
                      onClick={() => {
                        onTabChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                        showTranslation();
                      }}
                    >
                      <GTranslate sx={{ color: "#fff" }} />
                    </ListItemIcon>
                  </Link>
                </ListItemButton>
              </ListItem>
            </Tooltip>
            <Tooltip title={t("design")} placement="right">
              <ListItem disablePadding>
                <ListItemButton>
                  <Link
                    to={
                      routes.designSurvey.replace(":surveyId", surveyId) +
                      "?mode=theme"
                    }
                  >
                    <ListItemIcon
                      onClick={() => {
                        onTabChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                        showTheme();
                      }}
                    >
                      <Palette sx={{ color: "#fff" }} />
                    </ListItemIcon>
                  </Link>
                </ListItemButton>
              </ListItem>
            </Tooltip>
            <Tooltip title={t("design")} placement="right">
              <ListItem disablePadding>
                <ListItemButton>
                  <Link
                    to={
                      routes.designSurvey.replace(":surveyId", surveyId) +
                      "?mode=reorder"
                    }
                  >
                    <ListItemIcon
                      onClick={() => {
                        onTabChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                        reOrder();
                      }}
                    >
                      <ReorderIcon sx={{ color: "#fff" }} />
                    </ListItemIcon>
                  </Link>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </>
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.PREVIEW) && (
          <Tooltip title={t("preview")} placement="right">
            <ListItem disablePadding>
              <ListItemButton>
                <Link to={routes.preview.replace(":surveyId", surveyId)}>
                  <ListItemIcon
                    onClick={() =>
                      onTabChange(MANAGE_SURVEY_LANDING_PAGES.PREVIEW)
                    }
                  >
                    <Visibility sx={{ color: "#fff" }} />
                  </ListItemIcon>
                </Link>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.SETTINGS) && (
          <Tooltip title={t("settings")} placement="right">
            <ListItem disablePadding>
              <ListItemButton>
                <Link to={routes.editSurvey.replace(":surveyId", surveyId)}>
                  <ListItemIcon
                    onClick={() =>
                      onTabChange(MANAGE_SURVEY_LANDING_PAGES.SETTINGS)
                    }
                  >
                    <div className={styles.launchContainer}>
                      <Settings sx={{ color: "#fff" }} />
                      {!published && (
                        <span className={styles.unpublishedChangesDot}></span>
                      )}
                    </div>
                  </ListItemIcon>
                </Link>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.RESPONSES) && (
          <Tooltip title={t("responses")} placement="right">
            <ListItem disablePadding>
              <ListItemButton>
                <Link to={routes.responses.replace(":surveyId", surveyId)}>
                  <ListItemIcon
                    onClick={() =>
                      onTabChange(MANAGE_SURVEY_LANDING_PAGES.RESPONSES)
                    }
                  >
                    <TableRowsIcon sx={{ color: "#fff" }} />
                  </ListItemIcon>
                </Link>
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}
      </List>
    );
  }

  return <div className={styles.surveyHeader}>{component()}</div>;
}

export default React.memo(TopBanner);
