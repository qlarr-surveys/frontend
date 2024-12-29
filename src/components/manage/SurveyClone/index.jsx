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

export const SurveyClone = ({
  open,
  onClose,
  survey,
  importSurvey = false,
}) => {
  const surveyService = useService("survey");

  const { t } = useTranslation("manage");
  const [newSurveyName, setNewSurveyName] = useState("");
  const [fileToImport, setFileToImport] = useState(null);
  const [newSurveyNameError, setNewSurveyNameError] = useState("");
  const [fileMissing, setFileMissing] = useState(false);
  const dispatch = useDispatch();

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

    if (importSurvey) {
      surveyService
        .importSurvey(fileToImport, newSurveyName)
        .then(() => {
          onClose(true);
          setNewSurveyName("");
        })
        .catch((processedError) => {
          if (
            processedError.name == PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
          ) {
            setNewSurveyNameError(t(`processed_errors.${processedError.name}`));
          }
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    } else if (survey.example) {
      surveyService
        .cloneGuestSurvey(survey.id, {
          name: newSurveyName,
        })
        .then(() => {
          onClose(true);
          setNewSurveyName("");
        })
        .catch((processedError) => {
          if (
            processedError.name == PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
          ) {
            setNewSurveyNameError(t(`processed_errors.${processedError.name}`));
          }
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    } else {
      surveyService
        .cloneSurvey(survey.id, {
          name: newSurveyName,
        })
        .then(() => {
          onClose(true);
          setNewSurveyName("");
        })
        .catch((processedError) => {
          if (
            processedError.name == PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
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
                  multiple
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
      </Modal>
    </>
  );
};
