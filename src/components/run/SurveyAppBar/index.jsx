import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Content from "../Content";

function SurveyAppBar({ showBack, label, onBackClick, toggleDrawer }) {
  return (
    <AppBar position="fixed">
      <Toolbar
        style={{
          fontSize: "32px",
          lineHeight: "1.334",
          fontWeight: "400",
        }}
      >
        {showBack && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={onBackClick}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Content elementCode="Survey" name="label" content={label} />
      </Toolbar>
    </AppBar>
  );
}

export default SurveyAppBar;
