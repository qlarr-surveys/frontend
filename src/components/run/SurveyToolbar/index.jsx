import React from "react";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import { Menu as MenuIcon, ArrowBack } from "@mui/icons-material";
import { RHFSelect } from "~/components/hook-form";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { langChange } from "~/state/runState";

function SurveyToolbar({ onMenuToggle, isMenuOpen }) {
  const dispatch = useDispatch();

  const surveyState = useSelector((state) => state.runState.data, shallowEqual);

  const { lang: surveyLang, additionalLang } = surveyState || {};
  const languageOptions = [
    { code: surveyLang?.code, name: surveyLang?.name },
    ...(additionalLang || []),
  ];

  const handleLanguageChange = (selectedLanguage) => {
    dispatch(
      langChange({
        lang: selectedLanguage,
      })
    );
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "white",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 10px",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label={isMenuOpen ? "close menu" : "open menu"}
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <ArrowBack /> : <MenuIcon />}
        </IconButton>

        <RHFSelect
          style={{
            width: "150px",
          }}
          name="language"
          label="Select Language"
          value={surveyLang?.code}
          onChange={(event) => handleLanguageChange(event.target.value)}
        >
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </RHFSelect>
      </Toolbar>
    </AppBar>
  );
}

export default SurveyToolbar;
