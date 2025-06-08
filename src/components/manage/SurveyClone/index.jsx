import { Box, Modal, Typography, Button, IconButton } from "@mui/material";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SurveyClone.module.css";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import { useDispatch } from "react-redux";
import { setLoading } from "~/state/edit/editState";
import { RHFTextField } from "~/components/hook-form";
import { useService } from "~/hooks/use-service";
import { FileUpload, PhotoCamera } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTheme } from "@emotion/react";

export const SurveyClone = ({
  open,
  onClose,
  survey,
  importSurvey = false,
  onSurveyCloned,
}) => {
  const surveyService = useService("survey");

  const { t } = useTranslation("manage");
  const [newSurveyName, setNewSurveyName] = useState("");
  const [fileToImport, setFileToImport] = useState(null);
  const [newSurveyNameError, setNewSurveyNameError] = useState("");
  const [fileMissing, setFileMissing] = useState(true);
  const dispatch = useDispatch();
  const [isImporting, setIsImporting] = useState(false);
  const theme = useTheme();

  const [progress, setProgress] = useState(0);
  const loadingMessages = [
    "Uploading your survey file...",
    "Checking your survey structure...",
    "Verifying questions and responses...",
    "Just a moment more...",
    "Finalizing import...",
  ];

  const displayMessage =
    progress > 90
      ? "Wrapping up import..."
      : loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  const onSurveyNameChanged = (e) => {
    setNewSurveyName(e.target.value);
    setNewSurveyNameError("");
    setFileMissing(false);
  };

  const validate = () => {
    setNewSurveyNameError("");

    if (newSurveyName.length == 0) {
      setNewSurveyNameError(t("survey_required"));
      return false;
    }

    if (importSurvey && !fileToImport) {
      setFileMissing(true);
      return false;
    }
    return true;
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files) {
      let file = event.target.files[0];
      setFileToImport(file);
      setFileMissing("");
    }
  };

  const cloneSurvey = () => {
    if (!validate()) {
      return;
    }
    dispatch(setLoading(true));

    const handleSuccess = (surveyName) => {
      onClose(true);
      setNewSurveyName("");
      if (onSurveyCloned) {
        onSurveyCloned(surveyName);
      }
    };

    if (importSurvey) {
      setIsImporting(true);
      surveyService
        .importSurvey(fileToImport, newSurveyName, (percent) => {
          setProgress(percent);
        })
        .then(() => {
          handleSuccess(newSurveyName);
        })
        .catch((processedError) => {
          if (
            processedError.name === PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
          ) {
            setNewSurveyNameError(t(`processed_errors.${processedError.name}`));
          }
        })
        .finally(() => {
          setIsImporting(false);
          setProgress(0);
          dispatch(setLoading(false));
        });
    } else {
      surveyService
        .cloneSurvey(survey.id, { name: newSurveyName })
        .then(() => {
          handleSuccess(newSurveyName);
        })
        .catch((processedError) => {
          if (
            processedError.name === PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
          ) {
            setNewSurveyNameError(t(`processed_errors.${processedError.name}`));
          }
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  };

  return (
    <>
      <Modal
        sx={{
          ".MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
        open={open}
        onClose={() => onClose(false)}
      >
        <>
          {isImporting ? (
            <Box className={styles.wrapper}>
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
            </Box>
          ) : (
            <>
              <Box className={styles.wrapper}>
                <Typography fontWeight={600} variant="h5">
                  {t("edit_survey.clone_survey")}
                </Typography>
                <RHFTextField
                  error={newSurveyNameError.length > 0}
                  sx={{ minWidth: "400px", mt: 2 }}
                  required={true}
                  value={newSurveyName}
                  label={t("label.new_survey_name")}
                  onChange={onSurveyNameChanged}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      cloneSurvey();
                    }
                  }}
                  helperText={newSurveyNameError}
                />
                {importSurvey && (
                  <div className={styles.upload}>
                    <Button variant="outlined" component="label">
                      Upload Zip Folder
                      <FileUpload />
                      <input
                        hidden
                        id="zip-upload"
                        accept=".zip"
                        multiple={false}
                        type="file"
                        onChange={(event) => handleFileUpload(event)}
                      />
                    </Button>

                    {fileMissing && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ margin: "4px" }}
                      >
                        {t("file_required")}
                      </Typography>
                    )}

                    {fileToImport && (
                      <Typography sx={{ margin: "4px" }}>
                        {fileToImport.name}
                      </Typography>
                    )}
                  </div>
                )}

                <Box className={styles.action}>
                  <Button
                    size="medium"
                    color="primary"
                    variant="secondary"
                    onClick={() => onClose(false)} // Pass false when just closing without cloning
                  >
                    {t("action_btn.cancel")}
                  </Button>
                  <Button
                    size="medium"
                    color="primary"
                    variant="contained"
                    type="submit"
                    onClick={cloneSurvey}
                    sx={{ ml: 1 }}
                  >
                    {t("action_btn.save")}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </>
      </Modal>
    </>
  );
};
