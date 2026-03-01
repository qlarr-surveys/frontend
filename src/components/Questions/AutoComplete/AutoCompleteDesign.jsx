import React, { useState } from "react";

import { useSelector } from "react-redux";
import { Alert, Autocomplete, Button, TextField } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import { useDispatch } from "react-redux";
import { changeAttribute, changeResources } from "~/state/design/designState";
import styles from "./AutoComplete.module.css";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import {
  formatlocalDateTime,
  serverDateTimeToLocalDateTime,
} from "~/utils/DateUtils";

function AutoCompleteQuestion({ code, t, onMainLang }) {
  const designService = useService("design");
  const dispatch = useDispatch();
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const state = useSelector((state) => {
    return state.designState[code];
  });
  const lang = useSelector((state) => {
    return state.designState.langInfo.lang;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    let file = e.target.files[0];
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
      })
      .catch((err) => {
        setUploading(false);
        const errorType = err?.response?.data?.error;
        if (errorType === "AutoCompleteMalformedInputException") {
          setError(t("autocomplete_malformed_input"));
        } else {
          setError(t("autocomplete_upload_error"));
        }
      });
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
      ) : (
        <></>
      )}
    </>
  );
}

export default React.memo(AutoCompleteQuestion);
