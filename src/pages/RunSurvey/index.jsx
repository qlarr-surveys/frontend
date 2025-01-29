import React, { useEffect, useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";
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
import { stateReceived } from "~/state/runState";
import { useSelector } from "react-redux";
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

function RunSurvey({ preview, guest, mode, resume = false, responseId }) {
  const runService = useService("run");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lang = searchParams.get("lang");
  const [render, setRender] = React.useState(false);
  const [expanded, setExpanded] = React.useState(COLLAPSE);
  const [error, setError] = React.useState(false);
  const [inlineError, setInlineError] = React.useState(false);

  const surveyTheme = useSelector((state) => {
    return state.runState.data?.survey?.theme;
  }, isEquivalent);

  const navResponseId = useSelector((state) => {
    return state.runState.data?.responseId;
  });

  const canJump = useSelector(
    (state) => state.runState.data?.survey?.allowJump,
    shallowEqual
  );

  const backgroundImage = useSelector((state) => {
    return state.runState.data?.survey?.resources?.backgroundImage;
  });

  const navigation = useSelector((state) => {
    return state.runState.navigation;
  }, isEquivalent);

  const { t, i18n } = useTranslation("run");
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigation) {
      continueNav(navigation, navResponseId);
    }
  }, [navigation]);

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
    startNavigation(runService, lang, preview, guest, mode)
      .then((response) => {
        setRender(true);
        dispatch(stateReceived({ response, preview }));
        sessionStorage.setItem("responseId", response.responseId);
        i18n.changeLanguage(response.lang.code);
        dispatch(setFetching(false));
      })
      .catch((err) => {
        handleError(err);
      });
  };

  const continueNav = (payload, responseId) => {
    dispatch(setFetching(true));
    continueNavigation(runService, payload, responseId, preview, guest, mode)
      .then((response) => {
        setRender(true);
        dispatch(stateReceived({ response, preview }));
        sessionStorage.setItem("responseId", response.responseId);
        i18n.changeLanguage(response.lang.code);
        dispatch(setFetching(false));
        // document?.getElementById(FORM_ID)?.scrollTo(0, 0)
      })
      .catch((err) => {
        handleError(err);
      });
  };

  useEffect(() => {
    document.body.style.overflow = "visible";
    dispatch(setFetching(true));
    loadScript(runService, preview, guest)
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

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${buildResourceUrl(backgroundImage)})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }
    : {};

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
            <div
              className={styles.mainContainer}
              style={{
                backgroundColor: theme.palette.background.default,
                fontFamily: theme.textStyles.text.font,
                color: theme.textStyles.text.color,
                fontSize: theme.textStyles.text.size,
                ...backgroundStyle,
              }}
            >
              
              <SurveyAppBar toggleDrawer={toggleDrawer} />
              <SurveyMemo key="Survey" />
              <SurveyDrawer
                expanded={expanded}
                toggleDrawer={toggleDrawer}
                t={t}
              />
            </div>
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
