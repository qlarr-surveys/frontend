import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Box, Chip, ThemeProvider, createTheme } from "@mui/material";
import styles from "./DesignSurvey.module.css";

import { defualtTheme } from "~/constants/theme";
import { I18nextProvider, useTranslation } from "react-i18next";
import { cacheRtl, rtlLanguage } from "~/utils/common";
import { CacheProvider } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isTouchDevice } from "~/utils/isTouchDevice";
import { TouchBackend } from "react-dnd-touch-backend";
import { buildResourceUrl } from "~/networking/common";
import LoadingDots from "~/components/common/LoadingDots";
import {
  setDesignModeToDesign,
  setDesignModeToLang,
  setDesignModeToTheme,
} from "~/state/design/designState";
import { DESIGN_SURVEY_MODE } from "~/routes";

const ContentPanel = React.lazy(() =>
  import("~/components/design/ContentPanel")
);
const LeftPanel = React.lazy(() => import("~/components/design/LeftPanel"));

function DesignSurvey() {
  const { t, i18n } = useTranslation(["design", "run"]);
  const childI18n = useMemo(() => i18n.cloneInstance(), []);
  const contentRef = useRef(null);
  const dispatch = useDispatch();

  const containerRef = useRef();

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const designMode = useSelector((state) => {
    return state.designState.designMode;
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

  useEffect(() => {
    if (designMode == DESIGN_SURVEY_MODE.DESIGN) {
      dispatch(setDesignModeToDesign());
    } else if (designMode == DESIGN_SURVEY_MODE.LANGUAGES) {
      dispatch(setDesignModeToLang());
    } else if (designMode == DESIGN_SURVEY_MODE.THEME) {
      dispatch(setDesignModeToTheme());
    }
  }, []);

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
      </DndProvider>
    </Box>
  );
}

export default React.memo(DesignSurvey);
