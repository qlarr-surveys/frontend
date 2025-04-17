import { Box, Modal, Typography, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLoading } from "~/state/edit/editState";
import { useService } from "~/hooks/use-service";
import styles from "./CreateAISurvey.module.css";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const CreateAISurvey = ({
  open,
  onClose,
  onSurveyCreated,
}) => {
  const surveyService = useService("survey");
  const { t } = useTranslation("manage");
  const [promptText, setPromptText] = useState("");
  const [promptError, setPromptError] = useState("");
  const dispatch = useDispatch();

  const onPromptChanged = (e) => {
    setPromptText(e.target.value);
    setPromptError("");
  };

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
    
    surveyService
      .createSurveyWithAI(promptText)
      .then((response) => {
        onClose(true);
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
      });
  };

  return (
    <Modal
      sx={{
        ".MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      }}
      open={open}
      onClose={() => onClose(false)}
    >
      <Box className={styles.wrapper}>
        <Box className={styles.titleContainer}>
          <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
          <Typography fontWeight={600} variant="h5">
            {t("create_survey_with_ai")}
          </Typography>
        </Box>
        
        <TextField
          error={promptError.length > 0}
          sx={{ width: "100%", mb: 2, mt: 2 }}
          required={true}
          value={promptText}
          label={t("ai_prompt")}
          placeholder={t("ai_prompt_placeholder")}
          onChange={onPromptChanged}
          helperText={promptError || t("ai_prompt_helper")}
          multiline
          rows={6}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
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
      </Box>
    </Modal>
  );
};

export default CreateAISurvey; 