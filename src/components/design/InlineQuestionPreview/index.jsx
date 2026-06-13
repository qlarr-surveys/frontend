import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Provider, shallowEqual, useSelector, useStore } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useTranslation } from "react-i18next";

import styles from "./InlineQuestionPreview.module.css";
import { assembleSurveyJson } from "~/utils/design/utils";
import { rtlLanguage } from "~/utils/common";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import LoadingDots from "~/components/common/LoadingDots";
import Survey from "~/components/run/Survey";
import runState, { stateReceived } from "~/state/runState";
import templateState from "~/state/templateState";
import { defualtTheme } from "~/constants/theme";
import { compileAndNavigate } from "~/services/engine/qlarrEngine";

const RECOMPUTE_DEBOUNCE_MS = 400;

// Isolated runtime store for the preview so it never touches a real run session.
function createPreviewStore() {
  return configureStore({ reducer: { templateState, runState } });
}

/**
 * Live single-question preview rendered inline, directly above the question being
 * edited in the design canvas.
 *
 * Renders the question through the real survey engine, entirely in the browser
 * (see ~/services/engine/qlarrEngine). It recompiles the live, unsaved design on a
 * short debounce, so edits to the question's label, options or validation rules show
 * up here within ~400ms — no save, no backend. One preview is mounted at a time
 * (keyed by `code` in editState), so this component owns its own isolated run store
 * for its lifetime and is torn down when the preview closes or moves.
 */
function InlineQuestionPreview({ code, onClose }) {
  const { t, i18n } = useTranslation(NAMESPACES.DESIGN_CORE);
  const store = useStore(); // the design (manage) store

  const [computing, setComputing] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const wrapperRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const previewStoreRef = useRef(null);
  if (!previewStoreRef.current) {
    previewStoreRef.current = createPreviewStore();
  }

  // Cheap, precise change signal: Immer hands back a new object reference for any
  // edit to the previewed question's node (label/option/validation/etc.), and
  // `Survey.children` changes when the survey structure changes. Editing an
  // unrelated question doesn't touch either, so the preview won't flash.
  const questionNode = useSelector((state) =>
    code ? state.designState[code] : null
  );
  const surveyChildren = useSelector(
    (state) => state.designState.Survey?.children,
    shallowEqual
  );
  const lang =
    useSelector((state) => state.designState.langInfo?.lang) || "en";

  // Run components translate against the "run" namespace.
  useEffect(() => {
    if (!i18n.hasLoadedNamespace("run")) {
      i18n.loadNamespaces("run");
    }
  }, [i18n]);

  // Bring the preview into view once the first compile settles — the wrapper only
  // reaches its real height when the rendered question (or the error box) lands.
  // One-shot: later recomputes (every debounced edit) must never yank the view.
  useEffect(() => {
    if (hasScrolledRef.current || (!response && !error)) return;
    hasScrolledRef.current = true;
    const id = requestAnimationFrame(() => {
      wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [response, error]);

  // Debounced, fully client-side recompute. Reading getState() directly (rather
  // than dispatching a design action) keeps this off the autosave middleware.
  useEffect(() => {
    if (!code) {
      setResponse(null);
      setError(null);
      setComputing(false);
      return;
    }
    let cancelled = false;
    setComputing(true);
    const handle = setTimeout(async () => {
      try {
        const surveyJson = assembleSurveyJson(store.getState().designState);
        const computed = await compileAndNavigate(surveyJson, lang, "offline");
        if (cancelled) return;
        previewStoreRef.current.dispatch(
          stateReceived({
            response: computed,
            preview: true,
            singleQuestion: true,
          })
        );
        setResponse(computed);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setResponse(null);
        }
      } finally {
        if (!cancelled) setComputing(false);
      }
    }, RECOMPUTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [code, questionNode, surveyChildren, lang, reloadNonce, store]);

  const theme = useMemo(
    () =>
      createTheme({
        ...defualtTheme(response?.survey?.theme),
        direction: rtlLanguage.includes(lang) ? "rtl" : "ltr",
      }),
    [response?.survey?.theme, lang]
  );

  const surveyTree = (
    <Provider store={previewStoreRef.current}>
      <ThemeProvider theme={theme}>
        <React.Suspense fallback={<LoadingDots />}>
          <Survey singleQuestion onlyQuestionCode={code} />
        </React.Suspense>
      </ThemeProvider>
    </Provider>
  );

  return (
    <Box
      ref={wrapperRef}
      className={`inline-preview ${styles.wrapper}`}
      // Interaction island: the canvas (GroupDesign) calls preventDefault() on
      // bubbled clicks to drive design selection, which would cancel a checkbox/
      // radio's native toggle (its onChange is the click's default action) and
      // swallow respondent input. Stop the click here so the preview stays live.
      onClick={(e) => e.stopPropagation()}
    >
      <Box className={styles.header}>
        <Box className={styles.titleWrap}>
          <VisibilityOutlinedIcon className={styles.titleIcon} fontSize="small" />
          <Typography className={styles.title} variant="subtitle2" noWrap>
            {t("preview_panel.title")}
            {code ? (
              <Typography
                component="span"
                variant="subtitle2"
                color="text.secondary"
                className={styles.questionCode}
              >
                {`· ${code}`}
              </Typography>
            ) : null}
          </Typography>
        </Box>
        <Box className={styles.headerActions}>
          <CustomTooltip title={t("preview_panel.refresh")} showIcon={false}>
            <IconButton size="small" onClick={() => setReloadNonce((n) => n + 1)}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip title={t("preview_panel.close")} showIcon={false}>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
        </Box>
      </Box>

      {computing && <Box className={styles.savingBar} />}

      <Box className={styles.body}>
        {error ? (
          <Box className={styles.empty}>
            <VisibilityOutlinedIcon className={styles.emptyIcon} fontSize="large" />
            <Typography variant="body2" color="text.secondary">
              {t("preview_panel.error")}
            </Typography>
          </Box>
        ) : response ? (
          <Box className={styles.stage}>{surveyTree}</Box>
        ) : (
          <Box className={styles.empty}>
            <LoadingDots />
          </Box>
        )}
      </Box>

      <Box className={styles.footer}>
        <Typography variant="caption" color="text.secondary">
          {t("preview_panel.isolation_note")}
        </Typography>
      </Box>
    </Box>
  );
}

export default React.memo(InlineQuestionPreview);
