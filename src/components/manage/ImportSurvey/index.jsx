import { Box, Modal, Typography, Button } from "@mui/material";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImportSurvey.module.css";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import { useDispatch } from "react-redux";
import { setLoading } from "~/state/edit/editState";
import { useService } from "~/hooks/use-service";
import { FileUpload } from "@mui/icons-material";
import { useTheme } from "@emotion/react";

export const ImportSurvey = ({ open, onResult }) => {
  const surveyService = useService("survey");

  const { t } = useTranslation("manage");
  const dispatch = useDispatch();
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileToImport, setFileToImport] = useState(null);

  const handleFileUpload = (event) => {
    dispatch(setLoading(true));
    let file = event.target.files[0];
    setFileToImport(file);
    surveyService
      .importSurvey(file, (percent) => {
        setProgress(percent);
      })
      .then((response) => {
        onResult(response.name);
      })
      .catch((processedError) => {
        if (
          processedError.name ===
          PROCESSED_ERRORS.DESIGN_NOT_AVAILABLE_EXCEPTION.name
        ) {
          setError(t(`processed_errors.${processedError.name}`));
        }
      })
      .finally(() => {
        setFileToImport(null);
        setProgress(0);
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
      onClose={() => onResult(false)}
    >
      <Box className={styles.wrapper}>
        <Typography fontWeight={600} variant="h5">
          {t("import_survey")}
        </Typography>

        <div className={styles.upload}>
          <Button variant="outlined" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {t("upload_zip_folder")}
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

          {fileToImport && (
            <Typography sx={{ margin: "4px" }}>{fileToImport.name}</Typography>
          )}

          {error ? (
            <Typography
              sx={{
                margin: "4px",
                color: theme.palette.error.main,
              }}
              variant="body2"
            >
              {error}
            </Typography>
          ) : fileToImport && (
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
              <Typography variant="body2">
                {Math.min(Math.round(progress), 100)}%
              </Typography>
            </Box>
          )}
        </div>
      </Box>
    </Modal>
  );
};
