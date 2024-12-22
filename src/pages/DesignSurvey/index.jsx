import React, { useEffect, useMemo, useRef } from "react";
import { ThemeProvider, createTheme } from "@mui/material";

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
import RightPanel from "~/components/design/RightPanel";
import { isTouchDevice } from "~/utils/isTouchDevice";
import { TouchBackend } from "react-dnd-touch-backend";
import { resetSetup, setup } from "~/state/design/designState";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
import { DESIGN_SURVEY_MODE } from "~/routes";

function DesignSurvey({ designMode }) {
  const { t, i18n } = useTranslation(["design", "run"]);
  const childI18n = i18n.cloneInstance();
  const contentRef = useRef(null);
  const dispatch = useDispatch();

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
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
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");
    if (mode == DESIGN_SURVEY_MODE.THEME) {
      dispatch(setup(themeSetup));
    } else if (mode == DESIGN_SURVEY_MODE.LANGUAGES) {
      dispatch(setup(languageSetup));
    } else if (mode == DESIGN_SURVEY_MODE.REORDER) {
      dispatch(setup(reorderSetup));
    } else {
      dispatch(resetSetup());
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
  return (
    <div className={styles.mainContainer}>
      <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
        {designMode == DESIGN_SURVEY_MODE.DESIGN && <LeftPanel t={t} />}
        <CacheProvider value={cacheRtlMemo}>
          <ThemeProvider theme={surveyTheme}>
            <I18nextProvider i18n={childI18n}>
              <ContentPanel
                designMode={designMode}
                ref={contentRef}
                className={styles.contentPanel}
              />
            </I18nextProvider>
          </ThemeProvider>
        </CacheProvider>
        {<RightPanel t={t} />}
      </DndProvider>
    </div>
  );
}

export default React.memo(DesignSurvey);
