import { AppBar, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChangeLang from "../ChangeLang";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./SurveyAppBar.module.css";
import { useTheme } from '@emotion/react';

function SurveyAppBar({ toggleDrawer }) {
  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);

  const additionalLang = useSelector((state) => {
    return state.runState.data?.additionalLang;
  }, shallowEqual);

  const theme = useTheme();

  return (
    <Toolbar
      sx={{
        backgroundColor: theme.palette.background.default,
      }}
      className={styles.toolbar}
    >
      <IconButton
        color="primary"
        size="large"
        edge="start"
        aria-label="menu"
        sx={{
          backgroundColor: theme.palette.background.paper,
        }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
      <ChangeLang lang={lang} additionalLang={additionalLang} />
    </Toolbar>
  );
}

export default SurveyAppBar;
