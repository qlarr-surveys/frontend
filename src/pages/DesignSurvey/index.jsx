import React, { Suspense, useEffect, useMemo, useRef } from "react";
import {
  Backdrop,
  Box,
  Chip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./DesignSurvey.module.css";


import ExtensionIcon from '@mui/icons-material/Extension';
import { defualtTheme } from "~/constants/theme";
import { I18nextProvider, useTranslation } from "react-i18next";
import { cacheRtl, isSessionRtl, rtlLanguage } from "~/utils/common";
import { CacheProvider } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";

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
import { DESIGN_SURVEY_MODE } from "~/routes";
import { buildResourceUrl } from "~/networking/common";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import LoadingDots from '~/components/common/LoadingDots';



const ContentPanel = React.lazy(() => import("~/components/design/ContentPanel"));
const LeftPanel = React.lazy(() => import("~/components/design/LeftPanel"));

function DesignSurvey() {
  const { t, i18n } = useTranslation(["design", "run"]);
  const childI18n = useMemo(() => i18n.cloneInstance(), []);
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

  const toDesign = () => {
    dispatch(resetSetup());
  };

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
        backgroundPosition: "center",
      }
    : {};

  return (
    <Box
      className={styles.mainContainer}
      ref={containerRef}
      sx={backgroundStyle}
    >
      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <Suspense fallback={<LoadingDots fullHeight />}>
        <LeftPanel t={t} />
        </Suspense>
        <CacheProvider value={cacheRtlMemo}>
          <ThemeProvider theme={surveyTheme}>
            <I18nextProvider i18n={childI18n}>
            <Suspense fallback={<LoadingDots fullHeight />}>
              <ContentPanel
                designMode={designMode}
                ref={contentRef}
                className={styles.contentPanel}
                />
              </Suspense>
            </I18nextProvider>
          </ThemeProvider>
        </CacheProvider>
        <DesignChip onCancel={toDesign} designMode={designMode} t={t} />
        <DesignOptions
          t={t}
          designMode={designMode}
          optionsOpen={optionsOpen}
          setOptionsOpen={setOptionsOpen}
        />
      </DndProvider>
    </Box>
  );
}

export default React.memo(DesignSurvey);

function DesignOptions({ setOptionsOpen, optionsOpen, designMode, t }) {
  const dispatch = useDispatch();
  const actions = [
    {
      icon: <TranslateIcon />,
      name: t("translation"),
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToLang());
      },
    },
    {
      icon: <Palette />,
      name: t("theme"),
      onClick: () => {
        setOptionsOpen(false);
        dispatch(setDesignModeToTheme());
      },
    },
    {
      icon: <SurveyIcon name="sort" />,
      name: t("reorder"),
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
          sx={{ position: "absolute", bottom: "16px", right: "16px" }}
          icon={
            <SpeedDialIcon icon={<ExtensionIcon />} openIcon={<CloseIcon />} />
          }
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

function DesignChip({ designMode, onCancel, t }) {
  const isRtl = isSessionRtl();
  return (
    designMode != DESIGN_SURVEY_MODE.DESIGN && (
      <Chip
        sx={{
          borderRadius: "48px",
          height: "48px",
          fontSize: "24px",
          padding: "8px",
        }}
        style={
          isRtl
            ? { position: "absolute", bottom: "16px", left: "16px" }
            : { position: "absolute", bottom: "16px", right: "16px" }
        }
        label={t("back_to_design")}
        icon={<Cancel />}
        color="primary"
        onClick={onCancel}
      />
    )
  );
}
