import { Box, Modal, Typography, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLoading } from "~/state/edit/editState";
import { useService } from "~/hooks/use-service";
import styles from "./CreateAISurvey.module.css";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTheme } from "@emotion/react";
import { useFakeProgress } from "~/hooks/use-fake-progress";
import { useRotatingText } from "~/hooks/use-rotating-text";

export const CreateAISurvey = ({ open, onClose, onSurveyCreated }) => {
  const surveyService = useService("survey");
  const { t } = useTranslation("manage");
  const [promptText, setPromptText] = useState("");
  const [promptError, setPromptError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch();
  const { progress, start, stop } = useFakeProgress({
    onDone: () => handleClose(true),
  });

  const loadingMessages = [
    "Crafting the perfect questions for you...",
    "Asking my AI friends for inspiration...",
    "Double-checking the spelling on every question...",
    "Almost ready to amaze you!",
    "Summoning the survey gods...",
  ];

  const currentMessage = useRotatingText(loadingMessages, 3000);
  const displayMessage =
    progress > 90 ? "Finalizing your survey..." : currentMessage;

  const validate = () => {
    let isValid = true;

    if (promptText.trim().length < 10) {
      setPromptError(t("ai_prompt_required"));
      isValid = false;
    }

    return isValid;
  };

  const createSurveyWithAI = () => {
    if (!validate()) {
      return;
    }

    dispatch(setLoading(true));
    setIsCreating(true);
    start();

    surveyService
      .createSurveyWithAI(promptText)
      .then((response) => {
        if (onSurveyCreated) {
          onSurveyCreated(response.name);
        }
        setPromptText("");
      })
      .catch((error) => {
        console.error("Error creating survey with AI:", error);
      })
      .finally(() => {
        dispatch(setLoading(false));
        stop();
      });
  };

  const handleClose = (success = false) => {
    setIsCreating(false);
    onClose(success);
  };

  return (
    <Modal
      sx={{
        ".MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      open={open}
      onClose={() => handleClose(false)}
    >
      <Box className={styles.wrapper}>
        {isCreating ? (
          <Box className={styles.loadingContainer}>
            <AutoAwesomeIcon
              color="primary"
              sx={{
                fontSize: 40,
              }}
              className={styles.spinIcon}
            />
            <Typography variant="h6" sx={{ mb: 2 }}>
              {displayMessage}
            </Typography>
            <Box className={styles.progressBarContainer}>
              <Box className={styles.progressBarBackground}>
                <Box
                  className={styles.progressBarFill}
                  sx={{
                    width: `${progress}%`,
                    backgroundColor: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {Math.min(Math.round(progress), 100)}%
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box className={styles.titleContainer}>
              <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
              <Typography fontWeight={600} variant="h5">
                {t("create_survey_with_ai")}
              </Typography>
            </Box>

            <TextField
              error={promptError.length > 0}
              sx={{ width: "100%", mb: 2, mt: 2 }}
              required
              value={promptText}
              label={t("ai_prompt")}
              placeholder={t("ai_prompt_placeholder")}
              onChange={(e) => {
                setPromptText(e.target.value);
                setPromptError("");
              }}
              helperText={promptError || t("ai_prompt_helper")}
              multiline
              rows={6}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  createSurveyWithAI();
                }
              }}
            />
            <Box className={styles.action}>
              <Button
                size="medium"
                color="primary"
                variant="secondary"
                onClick={() => onClose(false)}
              >
                {t("action_btn.cancel")}
              </Button>
              <Button
                size="medium"
                color="primary"
                variant="contained"
                type="submit"
                onClick={createSurveyWithAI}
                sx={{ ml: 1 }}
              >
                {t("action_btn.create")}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default CreateAISurvey;
