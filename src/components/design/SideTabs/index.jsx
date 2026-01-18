import { List, ListItem, ListItemButton, ListItemIcon } from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import styles from "./SideTabs.module.css";
import React from "react";
import {
  Edit,
  Palette,
  Settings,
  Translate,
  Visibility,
} from "@mui/icons-material";
import {
  DESIGN_SURVEY_MODE,
  MANAGE_SURVEY_LANDING_PAGES,
  routes,
} from "~/routes";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  resetSetup,
  setDesignModeToDesign,
  setDesignModeToLang,
  setDesignModeToTheme,
} from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function SideTabs({ selectedPage, onPageChange, availablePages, surveyId }) {
  const tabAvailable = (tab) => availablePages.indexOf(tab) !== -1;
  const { t } = useTranslation(NAMESPACES.DESIGN_CORE);
  const dispatch = useDispatch();
  const getTabButtonStyle = (selected) => ({
    minWidth: "auto",
    margin: "0px !important",
    padding: "12px 0px",
    backgroundColor: selected ? "#2d3cb2" : undefined,
    color: "#fff",
  });

  const versionDto = useSelector((state) => {
    return state.designState.versionDto;
  });

  const published = versionDto?.published;

  const designMode = useSelector((state) => {
    return state.designState.designMode;
  });

  function component() {
    return (
      <List>
        {tabAvailable(MANAGE_SURVEY_LANDING_PAGES.DESIGN) && (
          <>
            <SideTab
              tooltip={t("design")}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN && designMode == DESIGN_SURVEY_MODE.DESIGN
              )}
              link={routes.designSurvey.replace(":surveyId", surveyId)}
              icon={<Edit sx={{ color: "#fff" }} />}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                dispatch(setDesignModeToDesign());
              }}
            />
            <SideTab
              tooltip={t("theme")}
              style={getTabButtonStyle(selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN && designMode == DESIGN_SURVEY_MODE.THEME)}
              icon={<Palette sx={{ color: "#fff" }} />}
              link={routes.designSurvey.replace(":surveyId", surveyId)}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                dispatch(setDesignModeToTheme());
              }}
            />
            <SideTab
              tooltip={t("translation")}
              link={routes.designSurvey.replace(":surveyId", surveyId)}
              style={getTabButtonStyle(
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN && designMode == DESIGN_SURVEY_MODE.LANGUAGES
              )}
              icon={<Translate sx={{ color: "#fff" }} />}
              onClick={() => {
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
                dispatch(setDesignModeToLang());
              }}
            />
          </>
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
            link={routes.responses.replace(":surveyId", surveyId)}
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

function SideTab({ tooltip, style, link, onClick, icon, isLink = true }) {
  return (
    <CustomTooltip showIcon={false} title={tooltip} placement="right">
      {isLink ? (
        <Link to={link} onClick={() => onClick()}>
          <ListItem disablePadding style={style}>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
            </ListItemButton>
          </ListItem>
        </Link>
      ) : (
        <ListItem disablePadding style={style}>
          <ListItemButton onClick={() => onClick()}>
            <ListItemIcon>{icon}</ListItemIcon>
          </ListItemButton>
        </ListItem>
      )}
    </CustomTooltip>
  );
}
