import { AppBar, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChangeLang from "../ChangeLang";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./SurveyAppBar.module.css";

function SurveyAppBar({ toggleDrawer }) {
  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);

  const additionalLang = useSelector((state) => {
    return state.runState.data?.additionalLang;
  }, shallowEqual);

  return (
    <Toolbar className={styles.toolbar}>
      <IconButton
        color="primary"
        size="large"
        edge="start"
        aria-label="menu"
        sx={{
          backgroundColor: "white",
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
