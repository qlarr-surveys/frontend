import React, { useEffect, useMemo, useRef } from "react";
import {
  Backdrop,
  Box,
  Chip,
  SpeedDial,
  SpeedDialAction,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import styles from "./DesignSurvey.module.css";
import ContentPanel from "~/components/design/ContentPanel";

import { defualtTheme } from "~/constants/theme";
import { I18nextProvider, useTranslation } from "react-i18next";
import { cacheRtl, rtlLanguage } from "~/utils/common";
import { CacheProvider } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import LeftPanel from "~/components/design/LeftPanel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isTouchDevice } from "~/utils/isTouchDevice";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  resetSetup,
  setDesignModeToLang,
  setDesignModeToReorder,
  setDesignModeToTheme,
} from "~/state/design/designState";
import TranslateIcon from "@mui/icons-material/Translate";
import { Cancel, Palette } from "@mui/icons-material";
import ReorderIcon from "@mui/icons-material/Reorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { DESIGN_SURVEY_MODE } from "~/routes";
import { buildResourceUrl } from "~/networking/common";

function DesignSurvey() {
  const { t, i18n } = useTranslation(["design", "run"]);
  const childI18n = i18n.cloneInstance();
  const contentRef = useRef(null);

  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const containerRef = useRef();

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });
  const dispatch = useDispatch();

  const designMode = useSelector((state) => {
    return state.designState.designMode;
  });

  const toDesign = (() => {
    dispatch(resetSetup())
  });

  const lang = langInfo?.lang;

  const theme = useSelector((state) => {
    return state.designState["Survey"]?.theme;
  });

  function changeLanguage(lang) {
    return new Promise((resolve, reject) => {
      const dir = rtlLanguage.includes(lang) ? "rtl" : "ltr";
      const contentPanel = contentRef.current;
      if (contentPanel.dir != dir) {
        contentPanel.dir = dir;
      }
      contentPanel.scrollTop = 0;
      if (lang && childI18n && lang != childI18n.language) {
        childI18n.changeLanguage(lang);
      }
      resolve();
    });
  }

  useEffect(() => {
    if (contentRef.current) {
      changeLanguage(lang);
    }
  }, [lang, contentRef]);

  const cacheRtlMemo = useMemo(() => cacheRtl(lang), [lang]);

  const surveyTheme = React.useCallback(
    createTheme({
      ...defualtTheme(theme),
      direction: rtlLanguage.includes(lang) ? "rtl" : "ltr",
    }),
    [theme]
  );

  const backgroundImage = useSelector(
    (state) => state.designState["Survey"]?.resources?.backgroundImage
  );

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${buildResourceUrl(backgroundImage)})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "background.default",
      };

  return (
    <Box
      className={styles.mainContainer}
      ref={containerRef}
      sx={{ ...backgroundStyle }}
    >
      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        <CacheProvider value={cacheRtlMemo}>
          <LeftPanel t={t} />
          <ThemeProvider theme={surveyTheme}>
            <I18nextProvider i18n={childI18n}>
              <ContentPanel
                designMode={designMode}
                ref={contentRef}
                className={styles.contentPanel}
              />
            </I18nextProvider>
          </ThemeProvider>
          <DesignChip onCancel={toDesign} designMode={designMode} />
          <DesignOptions
            designMode={designMode}
            optionsOpen={optionsOpen}
            setOptionsOpen={setOptionsOpen}
          />
        </CacheProvider>
      </DndProvider>
    </Box>
  );
}

export default React.memo(DesignSurvey);


function DesignOptions({ setOptionsOpen, optionsOpen, designMode }) {
  const dispatch = useDispatch();
  const actions = [
    {
      icon: <TranslateIcon />,
      name: "Language",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToLang());
      },
    },
    {
      icon: <Palette />,
      name: "Theme",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToTheme());
      },
    },
    {
      icon: <ReorderIcon />,
      name: "Reorder",
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToReorder());
      },
    },
  ];
  return (
    designMode == DESIGN_SURVEY_MODE.DESIGN && (
      <>
        <Backdrop style={{ zIndex: 1 }} open={optionsOpen} />
        <SpeedDial
          open={optionsOpen}
          onClick={() => setOptionsOpen(!optionsOpen)}
          ariaLabel="SpeedDial basic example"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          icon={<MoreHorizIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              onClick={action.onClick}
              key={action.name}
              icon={action.icon}
              tooltipOpen
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      </>
    )
  );
}

function DesignChip({ designMode, onCancel }) {
  return (
    designMode != DESIGN_SURVEY_MODE.DESIGN && (
      <Chip
        sx={{
          borderRadius: "48px",
          height: "48px",
          fontSize: "24px",
          position: "absolute",
          bottom: "16px",
          padding: "8px",
          right: "16px",
        }}
        label="Back to Design"
        icon={<Cancel />}
        color="primary"
        onClick={onCancel}
      />
    )
  );
}