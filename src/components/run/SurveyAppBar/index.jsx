import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChangeLang from "../ChangeLang";
import { shallowEqual, useSelector } from "react-redux";
import styles from "./SurveyAppBar.module.css";
import { useTheme } from "@emotion/react";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function SurveyAppBar({ toggleDrawer, onSaveForLater }) {
  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);
  const { t } = useTranslation("run");

  const additionalLang = useSelector((state) => {
    return state.runState.data?.additionalLang;
  }, shallowEqual);

  const canSave = useSelector((state) => {
    return state.runState.data.navigationData.allowIncomplete;
  }, shallowEqual);

  const theme = useTheme();

  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSaveLater = async () => {
    setSaving(true);
    try {
      onSaveForLater();
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

  return (
    <>
      <Toolbar className={styles.toolbar}>
        <IconButton
          color="primary"
          size="large"
          edge="start"
          aria-label="menu"
          sx={{
            backgroundColor: theme.palette.background.paper,
          }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Box display="flex" gap={2}>
          {canSave && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setSaveOpen(true)}
            >
              {t("save")}
            </Button>
          )}
          <ChangeLang lang={lang} additionalLang={additionalLang} />
        </Box>
      </Toolbar>

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
        <DialogTitle>{t("saveAndContinueLaterTitle")}</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>
            {t("saveAndContinueLaterDesc")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)} disabled={saving}>
            {t("cancel")}
          </Button>
          <LoadingButton
            onClick={handleSaveLater}
            variant="contained"
            loading={saving}
          >
            {t("saveForLater")}
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
          {t("linkCopied")}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SurveyAppBar;
