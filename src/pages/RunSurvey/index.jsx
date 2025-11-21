import React, { useEffect, useMemo, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import styles from "./RunSurvey.module.css";
import { useTranslation } from "react-i18next";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import {
  loadScript,
  startNavigation,
  continueNavigation,
} from "~/networking/run";
import { cacheRtl, rtlLanguage } from "~/utils/common";
import { defualtTheme } from "~/constants/theme";
import {
  previewModeChange,
  stateReceived,
  } from "~/state/runState";
import { Box, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { setFetching } from "~/state/templateState";
import Survey from "~/components/run/Survey";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import ErrorLayout from "~/components/common/ErrorLayout";
import { useService } from "~/hooks/use-service";
import { buildResourceUrl } from "~/networking/common";
import Image from "~/components/image/image";
import CompactLayout from "~/layouts/compact";
import { isEquivalent } from "~/utils/design/utils";
import RunLoadingDots from "~/components/common/RunLoadingDots";

import SurveyDrawer, { COLLAPSE, EXPAND } from "~/components/run/SurveyDrawer";
import SurveyAppBar from "~/components/run/SurveyAppBar";
import { routes } from "~/routes";

function RunSurvey({
  preview,
  mode,
  resume = false,
  responseId,
  navigationMode,
}) {
  const runService = useService("run");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lang = searchParams.get("lang");
  const [render, setRender] = React.useState(false);
  const [expanded, setExpanded] = React.useState(COLLAPSE);
  const [error, setError] = React.useState(false);
  const [inlineError, setInlineError] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState(mode);
  const [currentNavigationMode, setCurrentNavigationMode] =
    React.useState(navigationMode);
  const containerRef = useRef(null);

  const surveyTheme = useSelector((state) => {
    return state.runState.data?.survey?.theme;
  }, isEquivalent);

  const navResponseId = useSelector((state) => {
    return state.runState.data?.responseId;
  });

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const SURVEY_ENDED = navigationIndex?.name === "end";

  const backgroundImage = useSelector((state) => {
    return state.runState.data?.survey?.resources?.backgroundImage;
  });

  const navigation = useSelector((state) => {
    return state.runState.navigation;
  }, isEquivalent);

  // Get survey state for custom CSS
  const runSurveyState = useSelector((state) => {
    return state.runState.data?.survey;
  });

  const { t, i18n } = useTranslation("run");
  const dispatch = useDispatch();

  // Function to apply custom CSS globally (Survey-level and all question-level CSS)
  const applyGlobalCustomCSS = (surveyState) => {
    if (!surveyState) return;
    
    console.log('[CSS] RunSurvey: Applying custom CSS for preview...');
    
    // Survey-level CSS
    const surveyCSS = surveyState?.theme?.customCSS;
    console.log('[CSS] Survey CSS found:', !!surveyCSS);
    
    // Question-level CSS - find all questions with customCSS from groups
    const questionCSSList = [];
    
    // Look for questions inside groups
    if (surveyState?.groups) {
      surveyState.groups.forEach(group => {
        if (group.questions) {
          group.questions.forEach(question => {
            if (question.customCSS?.trim()) {
              questionCSSList.push({ code: question.code, css: question.customCSS });
              console.log(`[CSS] Found question CSS for ${question.code}`);
              console.log(`[CSS] CSS content: ${question.customCSS}`);
            }
          });
        }
      });
    }
    
    console.log('[CSS] Questions with CSS found:', questionCSSList.length);
    console.log('[CSS] Survey state structure check - has groups:', !!surveyState?.groups);
    if (surveyState?.groups) {
      console.log('[CSS] Number of groups:', surveyState.groups.length);
      surveyState.groups.forEach((group, index) => {
        console.log(`[CSS] Group ${index} has ${group.questions?.length || 0} questions`);
      });
    }
    
    // Scope CSS function
    const scopeCSS = (css, questionCode = null) => {
      if (!css.trim()) return '';
      return css.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
        const cleanSelector = selector.trim();
        const cleanProps = props.trim();
        
        // Check if already scoped
        const alreadyScoped = cleanSelector.includes('.content-panel') || 
                             cleanSelector.includes('.muiltr-uwwqev') ||
                             cleanSelector.includes('.survey-container') ||
                             cleanSelector.includes(`[data-code=`) ||
                             cleanSelector.includes('.question-');
        
        if (alreadyScoped) {
          return fullMatch;
        }
        
        if (questionCode) {
          // Question-specific scoping for preview mode - use data-code attribute on QuestionWrapper
          return `[data-code="${questionCode}"] ${cleanSelector}, .question-${questionCode} ${cleanSelector} { ${cleanProps} }`;
        } else {
          // Survey-wide scoping for both design and preview modes
          return `.content-panel ${cleanSelector}, .muiltr-uwwqev ${cleanSelector}, .survey-container ${cleanSelector} { ${cleanProps} }`;
        }
      });
    };
    
    // Remove existing global CSS elements
    const existingElements = document.querySelectorAll('[id^="survey-preview-custom-css"]');
    existingElements.forEach(el => document.head.removeChild(el));
    
    // Apply Survey-level CSS
    if (surveyCSS?.trim()) {
      const scopedCSS = scopeCSS(surveyCSS);
      const styleElement = document.createElement('style');
      styleElement.id = 'survey-preview-custom-css';
      styleElement.type = 'text/css';
      styleElement.setAttribute('data-source', 'preview-survey-css');
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      console.log('[CSS] Preview Survey CSS applied');
    }
    
    // Apply question-level CSS
    questionCSSList.forEach(({ code, css }) => {
      const scopedCSS = scopeCSS(css, code);
      const styleElement = document.createElement('style');
      styleElement.id = `survey-preview-custom-css-${code}`;
      styleElement.type = 'text/css';
      styleElement.setAttribute('data-source', 'preview-question-css');
      styleElement.setAttribute('data-code', code);
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      console.log(`[CSS] Preview question CSS applied for ${code}`);
      console.log(`[CSS] Scoped CSS: ${scopedCSS}`);
    });
    
    console.log('[CSS] All preview custom CSS applied');
  };

  useEffect(() => {
    if (navigation) {
      continueNav(navigation, navResponseId);
    }
  }, [navigation]);

  // Apply custom CSS when survey state changes (for preview)
  useEffect(() => {
    if (runSurveyState) {
      console.log('[CSS] RunSurvey: Survey state changed, applying custom CSS...');
      applyGlobalCustomCSS(runSurveyState);
    }
  }, [runSurveyState]);

  useEffect(() => {
    if (preview) {
      const handleMessage = (event) => {
        // Always verify the origin for security
        if (
          event.origin !== window.location.origin ||
          event.data.type !== "PREVIEW_MODE_CHANGED"
        ) {
          return;
        }

        const mode = event.data.mode;
        const navigationMode = event.data.navigationMode;
        dispatch(
          previewModeChange({ mode: mode, navigationMode: navigationMode })
        );
      };

      window.addEventListener("message", handleMessage);

      // Cleanup listener on component unmount
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  useEffect(() => {
    if (rtlLanguage.includes(i18n.language)) {
      document.dir = "rtl";
    } else {
      document.dir = "ltr";
    }
  }, [i18n.language]);

  const handleError = (procesed) => {
    if (
      [
        PROCESSED_ERRORS.SURVEY_DESIGN_ERROR,
        PROCESSED_ERRORS.SURVEY_NOT_ACTIVE,
        PROCESSED_ERRORS.SURVEY_CLOSED,
        PROCESSED_ERRORS.SURVEY_EXPIRED,
        PROCESSED_ERRORS.SURVEY_SCHEDULED,
      ].indexOf(procesed) > -1
    ) {
      setInlineError(procesed);
    } else {
      setError(procesed);
    }
    dispatch(setFetching(false));
  };

  const startNav = () => {
    startNavigation(runService, lang, preview, mode, navigationMode)
      .then((response) => {
        setRender(true);
        dispatch(stateReceived({ response, preview }));
        if (preview) {
          window.parent.postMessage(
            {
              type: "RESPONSE_ID_RECEIVED",
              responseId: response.responseId,
            },
            window.location.origin
          );
        } else {
          window.history.replaceState(
            {},
            "",
            routes.resumeSurvey
              .replace(":surveyId", sessionStorage.getItem("surveyId"))
              .replace(":responseId", response.responseId)
          );
        }
        sessionStorage.setItem("responseId", response.responseId);
        i18n.changeLanguage(response.lang.code);
        dispatch(setFetching(false));
      })
      .catch((err) => {
        console.error(err);
        handleError(err);
      });
  };

  const continueNav = (payload, responseId) => {
    dispatch(setFetching(true));
    if (payload.mode) {
      setCurrentMode(payload.mode);
    }
    if (payload.navigationMode) {
      setCurrentNavigationMode(payload.navigationMode);
    }

    const useCaseMode = payload.mode ?? currentMode;
    const useCaseNavMode = payload.navigationMode ?? currentNavigationMode;
    continueNavigation(
      runService,
      payload,
      responseId,
      preview,
      useCaseMode,
      useCaseNavMode
    )
      .then((response) => {
        setRender(true);
        dispatch(stateReceived({ response, preview }));
        sessionStorage.setItem("responseId", response.responseId);
        i18n.changeLanguage(response.lang.code);
        dispatch(setFetching(false));
      })
      .catch((err) => {
        console.error(err);
        handleError(err);
      });
  };

  useEffect(() => {
    if (!navigation && containerRef.current) {
      containerRef.current.scrollTo({ top: 0 });
    }
  }, [navigation, containerRef.current]);

  useEffect(() => {
    document.body.style.overflow = "visible";
    dispatch(setFetching(true));
    loadScript(runService, preview)
      .then(() => {
        if (resume) {
          continueNav({ navigationDirection: { name: "RESUME" } }, responseId);
        } else {
          startNav();
        }
      })
      .catch((err) => {
        handleError(err);
      });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        ...defualtTheme(surveyTheme),
        direction: rtlLanguage.includes(i18n.language) ? "rtl" : "ltr",
      }),
    [i18n.language, surveyTheme]
  );

  const cacheRtlMemo = useMemo(() => cacheRtl(i18n.language), [i18n.language]);

  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setExpanded(open ? EXPAND : COLLAPSE);
  };

  return (
    <>
      <CacheProvider value={cacheRtlMemo}>
        <ThemeProvider theme={theme}>
          {error && (
            <ErrorLayout
              error={error}
              setErrorSeen={() => {
                setError(null);
              }}
            />
          )}
          {render && (
            <>
              {backgroundImage && (
                <div
                  aria-hidden
                  className={styles.fixedBg}
                  style={{
                    backgroundImage: `url(${buildResourceUrl(
                      backgroundImage
                    )})`,
                  }}
                />
              )}
              <div
                className={styles.mainContainer}
                ref={containerRef}
                style={{
                  backgroundColor: theme.palette.background.default,
                  fontFamily: theme.textStyles.text.font,
                  color: theme.textStyles.text.color,
                  fontSize: theme.textStyles.text.size,
                  height: "calc(100vh - 48px)",
                }}
              >
                {!SURVEY_ENDED && <SurveyAppBar preview={preview} toggleDrawer={toggleDrawer} />}
                <SurveyMemo key="Survey" />
                <SurveyDrawer
                  expanded={expanded}
                  toggleDrawer={toggleDrawer}
                  t={t}
                />
              </div>
            </>
          )}
          <RunLoadingDots />
        </ThemeProvider>
      </CacheProvider>
      {inlineError && (
        <Box style={{ height: "100%", overflow: "auto" }}>
          <CompactLayout>
            <Typography variant="h3" paragraph>
              {t("error")}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              {t("processed_errors." + inlineError.name)}
            </Typography>
            <Image
              alt="500"
              src="/illustration_500.svg"
              sx={{
                mx: "auto",
                maxWidth: 320,
                my: { xs: 5, sm: 8 },
              }}
            />
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="contained"
              className={styles.goBack}
              onClick={() => navigate(-1)}
            >
              {t("goBack")}
            </Button>
          </CompactLayout>
        </Box>
      )}
    </>
  );
}

const SurveyMemo = React.memo(Survey);

export default RunSurvey;
