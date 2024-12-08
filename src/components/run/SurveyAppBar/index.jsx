import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Content from "../Content";
import ChangeLang from "../ChangeLang";
import { shallowEqual, useSelector } from "react-redux";

function SurveyAppBar({ toggleDrawer }) {
  const label = useSelector((state) => {
    return state.runState.data?.survey?.content?.label;
  }, shallowEqual);

  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);

  const additionalLang = useSelector((state) => {
    return state.runState.data?.additionalLang;
  }, shallowEqual);

  return (
    <Toolbar
      style={{
        minHeight: "56px",
        fontSize: "32px",
        lineHeight: "1.334",
        fontWeight: "400",
      }}
    >
      <IconButton
      color="primary"
        size="large"
        edge="start"
        aria-label="menu"
        sx={{ mr: 2 }}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
      <div style={{ width: "100%" }}></div>
      <ChangeLang lang={lang} additionalLang={additionalLang} />
    </Toolbar>
  );
}

export default SurveyAppBar;
