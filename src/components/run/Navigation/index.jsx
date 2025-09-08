import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch, shallowEqual } from "react-redux";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import { navigateNext, navigatePrevious } from "~/state/runState";
import { rtlLanguage } from "~/utils/common";
import styles from "./Navigation.module.css";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

function Navigation(props) {
  const state = useSelector((state) => {
    return {
      has_previous:
        state.runState.values.Survey.has_previous &&
        state.runState.data.survey.allowPrevious,
      has_next: state.runState.values.Survey.has_next,
      can_save: state.runState.data.survey.allowIncomplete,
      has_errors: state.runState.values.Survey.show_errors,
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation("run");

  const isRtl = rtlLanguage.includes(i18n.language);

  const previous = () => {
    dispatch(navigatePrevious());
  };

  useEffect(() => {
    if (state.has_errors) return;
    const id = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
    return () => clearTimeout(id);
  }, [props.navigationIndex?.groupId, state.has_errors]);

  useEffect(() => {
    if (state.has_errors) {
      setTimeout(() => {
        const invalidQuestion = document.querySelector(".invalidQuestion");
        if (invalidQuestion) {
          const scrollContainer = getClosestScrollableParent(invalidQuestion);
          scrollContainer.scrollTo({
            top: invalidQuestion.offsetTop - scrollContainer.offsetTop,
            behavior: "smooth",
          });
        }
      }, 500);
    }
  }, [state.has_errors]);

  const next = () => {
    dispatch(navigateNext());
  };

  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSaveLater = async () => {
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 2000));
      setSaveOpen(false);
      setSnackbarOpen(true);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return props.navigationIndex.name == "end" ? (
    ""
  ) : (
    <>
      <div className={styles.buttonContainer}>
        {state.has_previous ? (
          <Button
            variant="contained"
            className={isRtl ? "ml-14" : "mr-14"}
            onClick={() => {
              previous();
            }}
          >
            {t("previous")}
          </Button>
        ) : (
          ""
        )}
        <Button
          variant="contained"
          onClick={() => {
            next();
          }}
        >
          {state.has_next ? t("next") : t("finish")}
        </Button>

        <Button variant="contained" onClick={() => setSaveOpen(true)}>
          {t("save")}
        </Button>
      </div>
      <Dialog
        open={saveOpen}
        onClose={(_, reason) => {
          if (saving) return;
          setSaveOpen(false);
        }}
        disableEscapeKeyDown={saving}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("saveAndContinueLaterTitle", "Save and continue later")}
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>
            {t(
              "saveAndContinueLaterDesc",
              "We’ll save your current progress. You can return to this survey anytime using this link:"
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)} disabled={saving}>
            {t("cancel", "Cancel")}
          </Button>
          <LoadingButton
            onClick={handleSaveLater}
            variant="contained"
            loading={saving}
          >
            {t("saveForLater", "Save for later")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {t("linkCopied", "Link copied to clipboard!")}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Navigation;

function getClosestScrollableParent(element) {
  if (!element) return null;

  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight;

    if (isScrollable) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.documentElement; // Default to <html> if no scrollable parent is found
}
