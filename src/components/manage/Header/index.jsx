import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Menu, MenuItem } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  LogoutOutlined,
  Person,
} from "@mui/icons-material";
import GroupsIcon from "@mui/icons-material/Groups";
import TokenService from "~/services/TokenService";
import styles from "./Header.module.css";
import { LanguageSelector } from "../LanguageSelector";
import { MANAGE_SURVEY_LANDING_PAGES, routes } from "~/routes";
import { useDispatch } from "react-redux";
import { onEditErrorSeen, setLoading } from "~/state/edit/editState";
import { isSuperAdmin } from "~/constants/roles";
import { isSessionRtl } from "~/utils/common";
import { useService } from "~/hooks/use-service";
import { useTranslation } from "react-i18next";
import { SurveyHeader } from "../SurveyHeader";

export const Header = () => {
  const authService = useService("auth");
  const { t } = useTranslation("manage");

  const nav = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isRtl = isSessionRtl();

  const logout = () => {
    setAnchorEl(null);
    dispatch(setLoading(true));
    authService
      .logout()
      .then(() => {
        nav(routes.login);
      })
      .catch((e) => {
        nav(routes.login);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const showSurveyTitle = useMemo(() => {
    return showTitle(location);
  }, [location]);

  if (showSurveyTitle) {
    return <SurveyHeader />;
  }
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className={styles.header}>
      <Box
        onClick={() => {
          dispatch(onEditErrorSeen());
          nav("/");
        }}
        gap="12px"
        className={isRtl ? styles.imageContainerRtl : styles.imageContainer}
      >
        <img src="/qlarr.png" style={{ height: "40px" }} />
      </Box>

      <Box className={isRtl ? styles.userInfoRtl : styles.userInfo}>
        <LanguageSelector />
        {TokenService.isAuthenticated() && (
          <>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #ececfd",
                borderRadius: "10px",
                cursor: "pointer",
                padding: ".125rem 1rem",
                backgroundColor: open ? "#e3f2fd" : "#fff",
              }}
              onClick={handleClick}
            >
              <Person sx={{ color: "#16205b", width: 32, height: 32 }} />
              {open ? (
                <KeyboardArrowUp
                  sx={{
                    transition: "transform 0.3s ease",
                    color: "#181735",
                    width: 24,
                    height: 24,
                  }}
                />
              ) : (
                <KeyboardArrowDown
                  sx={{
                    transition: "transform 0.3s ease",
                    color: "#181735",
                    width: 24,
                    height: 24,
                  }}
                />
              )}
            </Box>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClick={handleClose}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  width: "200px",
                  overflow: "visible",
                  filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))",
                  mt: 1.5,
                  borderRadius: "5px",
                  backgroundColor: "#ffffff",
                  color: "#333333",
                  "& .MuiMenuItem-root": {
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    "& .MuiListItemIcon-root": {
                      minWidth: "40px",
                    },
                  },
                  transition: "transform 0.2s ease",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={(event) => {
                  event.preventDefault();
                  handleClose();
                  setTimeout(() => {
                    nav(routes.profile);
                  }, 0);
                }}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                {t("profile.title")}
                <Person sx={{ color: "#16205b", width: 25, height: 25 }} />
              </MenuItem>
              <MenuItem
                disabled={!isSuperAdmin()}
                onClick={() => {
                  handleClose();
                  nav(routes.manageUsers);
                }}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                {t("profile.manage_users")}
                <GroupsIcon sx={{ color: "#16205b", width: 25, height: 25 }} />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  logout();
                }}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                {t("profile.logout")}
                <LogoutOutlined
                  sx={{ color: "#16205b", width: 25, height: 25 }}
                />
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};

const showTitle = (location) => {
  try {
    return (
      Object.values(MANAGE_SURVEY_LANDING_PAGES).indexOf(
        location.pathname.split("/")[1]
      ) > -1
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};
