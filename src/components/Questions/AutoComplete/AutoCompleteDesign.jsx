import React, { useState } from "react";

import { useSelector } from "react-redux";
import {
  Alert,
  Autocomplete,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { changeAttribute, changeResources } from "~/state/design/designState";
import styles from "./AutoComplete.module.css";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import {
  formatlocalDateTime,
  serverDateTimeToLocalDateTime,
} from "~/utils/DateUtils";
import { processError, PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";

function AutoCompleteQuestion({ code, t, onMainLang }) {
  const designService = useService("design");
  const dispatch = useDispatch();
  const { t: tManage } = useTranslation(NAMESPACES.MANAGE);
  const [isUploading, setUploading] = useState(false);
  const [entryMode, setEntryMode] = useState("file");
  const [manualValues, setManualValues] = useState("");
  const [error, setError] = useState(null);

  const state = useSelector((state) => {
    return state.designState[code];
  });
  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  const uploadFile = (file, onSuccess) => {
    setUploading(true);
    setError(null);
    designService
      .uploadAutoCompleteResource(file, code)
      .then((response) => {
        setUploading(false);
        dispatch(
          changeResources({ code, key: "autoComplete", value: response.name })
        );
        dispatch(
          changeAttribute({ code, key: "autoComplete", value: response })
        );
        onSuccess?.();
      })
      .catch((err) => {
        setUploading(false);
        const processed = processError(err) || PROCESSED_ERRORS.UNIDENTIFIED_ERROR;
        setError(tManage(`processed_errors.${processed.name}`));
      });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    uploadFile(e.target.files[0]);
  };

  const handleManualSubmit = () => {
    const lines = manualValues
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const blob = new Blob([JSON.stringify(lines)], { type: "application/json" });
    const file = new File([blob], "manual-entry.json", { type: "application/json" });
    uploadFile(file, () => setManualValues(""));
  };

  return (
    <>
      {!isUploading && state.autoComplete && (
        <>
          <p style={{ fontSize: "larger" }}>
            <strong>{t("data_uploaded")}</strong>
          </p>
          <p>
            <strong>{t("rows_count")}</strong> {state.autoComplete.rowCount}
          </p>
          <p>
            <strong>{t("last_modified")}</strong>
            {formatlocalDateTime(
              serverDateTimeToLocalDateTime(state.autoComplete.lastModified)
            )}
          </p>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Autocomplete
        id="readOnly"
        sx={{ marginTop: "8px" }}
        readOnly
        noOptionsText={t('logic_builder.no_options')}
        options={[]}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ width: "50%" }}
            value=""
            label={state.showHint && (state.content?.[lang]?.hint || "")}
            variant="outlined"
          />
        )}
      />

      {isUploading ? (
        <div className={styles.buttonContainer}>
          <LoadingDots />
          <br />
          <span>{t("uploading_autocomplete")}</span>
        </div>
      ) : onMainLang ? (
        <div className={styles.buttonContainer}>
          <ToggleButtonGroup
            value={entryMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) setEntryMode(newMode);
            }}
            size="small"
            sx={{ marginBottom: "16px" }}
          >
            <ToggleButton value="file">
              <StorageIcon sx={{ mr: 1, fontSize: "1rem" }} />
              {t("upload_file")}
            </ToggleButton>
            <ToggleButton value="manual">
              <EditIcon sx={{ mr: 1, fontSize: "1rem" }} />
              {t("manual_entry")}
            </ToggleButton>
          </ToggleButtonGroup>

          {entryMode === "file" && (
            <div>
              <Button
                variant="outlined"
                component="label"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <StorageIcon className="mr-10" />
                {state.autoComplete
                  ? t("replace_autocomplete")
                  : t("upload_autocomplete")}
                <input
                  hidden
                  accept="application/json,.json"
                  type="file"
                  onChange={handleUpload}
                />
              </Button>
            </div>
          )}

          {entryMode === "manual" && (
            <div>
              <TextField
                multiline
                minRows={4}
                maxRows={12}
                fullWidth
                variant="outlined"
                placeholder={t("manual_entry_placeholder")}
                value={manualValues}
                onChange={(e) => setManualValues(e.target.value)}
                sx={{ marginBottom: "12px" }}
              />
              <Button
                variant="outlined"
                onClick={handleManualSubmit}
                disabled={manualValues.trim().length === 0}
              >
                {t("submit_values")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default React.memo(AutoCompleteQuestion);
