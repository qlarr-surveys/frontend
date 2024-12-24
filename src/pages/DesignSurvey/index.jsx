import React, { useEffect, useMemo, useRef } from "react";
import {
  Backdrop,
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
import RightPanel from '~/components/design/RightPanel';

function DesignSurvey() {
  const { t, i18n } = useTranslation(["design", "run"]);
  const childI18n = i18n.cloneInstance();
  const contentRef = useRef(null);

  const containerRef = useRef();

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });
  const dispatch = useDispatch();

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

  const cacheRtlMemo = useMemo(() => cacheRtl(lang), [lang]);

  const surveyTheme = React.useCallback(
    createTheme({
      ...defualtTheme(theme),
      direction: rtlLanguage.includes(lang) ? "rtl" : "ltr",
    }),
    [theme]
  );

  const onCancel = () => {
    dispatch(resetSetup());
  };

  return (
    <div className={styles.mainContainer} ref={containerRef} >
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
          <RightPanel containerRef={containerRef} t={t} />
        </CacheProvider>
      </DndProvider>
    </div>
  );
}

export default React.memo(DesignSurvey);



