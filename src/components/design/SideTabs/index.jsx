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
import { resetSetup } from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

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
                selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN
              )}
              link={routes.designSurvey.replace(":surveyId", surveyId)}
              icon={<Edit sx={{ color: "#fff" }} />}
              onClick={() => {
                dispatch(resetSetup());
                onPageChange(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
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
    <CustomTooltip showIcon={false} title={tooltip} placement="right">
      <Link to={link} onClick={() => onClick()}>
        <ListItem disablePadding style={style}>
          <ListItemButton>
            <ListItemIcon>{icon}</ListItemIcon>
          </ListItemButton>
        </ListItem>
      </Link>
    </CustomTooltip>
  );
}
