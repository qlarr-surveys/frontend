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
import {
  DESIGN_SURVEY_MODE,
  MANAGE_SURVEY_LANDING_PAGES,
  routes,
} from "~/routes";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { resetLang, resetSetup, setup } from "~/state/design/designState";
import {
  hasMajorSetup,
  languageSetup,
  reorderSetup,
  themeSetup,
} from "~/constants/design";
import { GTranslate, Palette } from "@mui/icons-material";
import ReorderIcon from "@mui/icons-material/Reorder";

function SideTabs({ selectedPage, onPageChange, availablePages, surveyId }) {
  const tabAvailable = (tab) => availablePages.indexOf(tab) !== -1;
  const { t } = useTranslation("design");
  const dispatch = useDispatch();
  const getTabButtonStyle = (selected) => ({
    minWidth: "auto",
    margin: "0px !important",
    padding: "12px 0px",
    backgroundColor: selected ? "#2d3cb2" : undefined,
    color: "#fff",
  });

  const setupInfo = useSelector((state) => state.designState.setup || {});

  const showTheme = () => {
    dispatch(resetLang());
    dispatch(setup(themeSetup));
  };
  const showTranslation = () => {
    dispatch(setup(languageSetup));
  };
  const reOrder = () => {
    dispatch(resetLang());
    dispatch(setup(reorderSetup));
  };

  const versionDto = useSelector((state) => {
    return state.designState.versionDto;
  });

  const published = versionDto?.published;

  const value = availablePages.indexOf(selectedPage);
  function component() {
    return (
      <List>
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.DESIGN) && (
          <>
            <SideTab
              tooltip={t("design")}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN &&
                  !hasMajorSetup(setupInfo)
              )}
              link={routes.designSurvey.replace(":surveyId", surveyId)}
              icon={<Edit sx={{ color: "#fff" }} />}
              onClick={() => {
                dispatch(resetSetup());
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
              }}
            />
            <SideTab
              tooltip={t("design")}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN &&
                  setupInfo == languageSetup
              )}
              link={
                routes.designSurvey.replace(":surveyId", surveyId) +
                `?mode=${DESIGN_SURVEY_MODE.LANGUAGES}`
              }
              icon={<GTranslate sx={{ color: "#fff" }} />}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                showTranslation();
              }}
            />
            <SideTab
              tooltip={t("design")}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN &&
                  setupInfo == themeSetup
              )}
              link={
                routes.designSurvey.replace(":surveyId", surveyId) +
                `?mode=${DESIGN_SURVEY_MODE.THEME}`
              }
              icon={<Palette sx={{ color: "#fff" }} />}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                showTheme();
              }}
            />
            <SideTab
              tooltip={t("design")}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN &&
                  setupInfo == reorderSetup
              )}
              link={
                routes.designSurvey.replace(":surveyId", surveyId) +
                `?mode=${DESIGN_SURVEY_MODE.REORDER}`
              }
              icon={<ReorderIcon sx={{ color: "#fff" }} />}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                reOrder();
              }}
            />
          </>
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.PREVIEW) && (
          <SideTab
            tooltip={t("preview")}
            style={getTabButtonStyle(
              selectedPage == MANAGE_SURVEY_LANDING_PAGES.PREVIEW
            )}
            link={routes.preview.replace(":surveyId", surveyId)}
            icon={<Visibility sx={{ color: "#fff" }} />}
            onClick={() => {
              onPageChange(MANAGE_SURVEY_LANDING_PAGES.PREVIEW);
            }}
          />
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.SETTINGS) && (
          <SideTab
            tooltip={t("settings")}
            style={getTabButtonStyle(
              selectedPage == MANAGE_SURVEY_LANDING_PAGES.SETTINGS
            )}
            link={routes.editSurvey.replace(":surveyId", surveyId)}
            icon={
              <div className={styles.launchContainer}>
                <Settings sx={{ color: "#fff" }} />
                {!published && (
                  <span className={styles.unpublishedChangesDot}></span>
                )}
              </div>
            }
            onClick={() => {
              onPageChange(MANAGE_SURVEY_LANDING_PAGES.SETTINGS);
            }}
          />
        )}
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.RESPONSES) && (
          <SideTab
            tooltip={t("responses")}
            style={getTabButtonStyle(
              selectedPage == MANAGE_SURVEY_LANDING_PAGES.RESPONSES
            )}
            link={routes.editSurvey.replace(":surveyId", surveyId)}
            icon={<TableRowsIcon sx={{ color: "#fff" }} />}
            onClick={() => {
              onPageChange(MANAGE_SURVEY_LANDING_PAGES.RESPONSES);
            }}
          />
        )}
      </List>
    );
  }

  return <div className={styles.surveyHeader}>{component()}</div>;
}

export default React.memo(SideTabs);

function SideTab({ tooltip, style, link, onClick, icon }) {
  return (
    <Tooltip title={tooltip} placement="right">
      <ListItem disablePadding style={style}>
        <ListItemButton>
          <Link to={link}>
            <ListItemIcon onClick={() => onClick()}>{icon}</ListItemIcon>
          </Link>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
}
