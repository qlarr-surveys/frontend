import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import {
  Provider,
  shallowEqual,
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useTranslation } from "react-i18next";

import styles from "./PreviewPanel.module.css";
import {
  assembleSurveyJson,
  resolvePreviewQuestionCode,
} from "~/utils/design/utils";
import { setPreviewPanelOpen } from "~/state/edit/editState";
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
 * Live single-question preview docked beside the design canvas.
 *
 * Renders the currently-selected question through the real survey engine,
 * entirely in the browser (see ~/services/engine/qlarrEngine). It recompiles the
 * live, unsaved design on a short debounce, so edits to the question's label,
 * options or validation rules show up here within ~400ms — no save, no backend.
 */
function PreviewPanel() {
  const { t, i18n } = useTranslation(NAMESPACES.DESIGN_CORE);
  const dispatch = useDispatch();
  const store = useStore(); // the design (manage) store

  const [device, setDevice] = useState("desktop");
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const previewStoreRef = useRef(null);
  if (!previewStoreRef.current) {
    previewStoreRef.current = createPreviewStore();
  }

  const open = useSelector((state) => state.editState.previewPanelOpen);

  // Resolve the current selection to the question that should be previewed.
  const questionCode = useSelector((state) =>
    state.editState.previewPanelOpen
      ? resolvePreviewQuestionCode(
          state.designState,
          state.designState.setup?.code
        )
      : null
  );

  // Cheap, precise change signal: Immer hands back a new object reference for
  // any edit to the selected question's node (label/option/validation/etc.),
  // and `Survey.children` changes when the survey structure changes. Editing an
  // unrelated question doesn't touch either, so the preview won't flash.
  const questionNode = useSelector((state) =>
    questionCode ? state.designState[questionCode] : null
  );
  const surveyChildren = useSelector(
    (state) => state.designState.Survey?.children,
    shallowEqual
  );
  const lang =
    useSelector((state) => state.designState.langInfo?.lang) || "en";

  // Run components translate against the "run" namespace.
  useEffect(() => {
    if (open && !i18n.hasLoadedNamespace("run")) {
      i18n.loadNamespaces("run");
    }
  }, [open, i18n]);

  // Debounced, fully client-side recompute. Reading getState() directly (rather
  // than dispatching a design action) keeps this off the autosave middleware.
  useEffect(() => {
    if (!open || !questionCode) {
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
        const computed = await compileAndNavigate(surveyJson, lang);
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
  }, [open, questionCode, questionNode, surveyChildren, lang, reloadNonce, store]);

  const theme = useMemo(
    () => createTheme(defualtTheme(response?.survey?.theme)),
    [response?.survey?.theme]
  );

  if (!open) return null;

  const surveyTree = (
    <Provider store={previewStoreRef.current}>
      <ThemeProvider theme={theme}>
        <React.Suspense fallback={<LoadingDots />}>
          <Survey singleQuestion onlyQuestionCode={questionCode} />
        </React.Suspense>
      </ThemeProvider>
    </Provider>
  );

  return (
    <Box className={styles.panel} data-tour="question-preview-panel">
      <Box className={styles.header}>
        <Typography className={styles.title} variant="subtitle2" noWrap>
          {t("preview_panel.title")}
          {questionCode ? ` · ${questionCode}` : ""}
        </Typography>
        <Box className={styles.headerActions}>
          <CustomTooltip
            title={t(
              device === "desktop"
                ? "preview_panel.phone_view"
                : "preview_panel.desktop_view"
            )}
            showIcon={false}
          >
            <IconButton
              size="small"
              onClick={() =>
                setDevice((d) => (d === "desktop" ? "phone" : "desktop"))
              }
            >
              {device === "desktop" ? (
                <PhoneIphoneOutlinedIcon fontSize="small" />
              ) : (
                <DesktopWindowsOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </CustomTooltip>
          <CustomTooltip title={t("preview_panel.refresh")} showIcon={false}>
            <IconButton size="small" onClick={() => setReloadNonce((n) => n + 1)}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip title={t("preview_panel.close")} showIcon={false}>
            <IconButton
              size="small"
              onClick={() => dispatch(setPreviewPanelOpen(false))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
        </Box>
      </Box>

      {computing && <Box className={styles.savingBar} />}

      <Box className={styles.body}>
        {!questionCode ? (
          <Box className={styles.empty}>
            <Typography variant="body2" color="text.secondary">
              {t("preview_panel.empty")}
            </Typography>
          </Box>
        ) : error ? (
          <Box className={styles.empty}>
            <Typography variant="body2" color="error">
              {t("preview_panel.error")}
            </Typography>
          </Box>
        ) : response ? (
          device === "phone" ? (
            <Box className={styles.phoneFrame}>
              <Box className={styles.phone}>{surveyTree}</Box>
            </Box>
          ) : (
            <Box className={styles.desktopFrame}>{surveyTree}</Box>
          )
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

export default React.memo(PreviewPanel);
