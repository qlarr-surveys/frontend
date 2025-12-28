import React, { useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  designStateReceived,
  setSaving,
  setup,
} from "~/state/design/designState";
import { useService } from "~/hooks/use-service";
import { useTranslation } from "react-i18next";

const ALLOWED_CODE_CHARS_REGEX = /[^a-zA-Z0-9_]/g;

const computePrefixAndSuffix = (fullCode) => {
  if (fullCode.startsWith("Q") && fullCode.includes("A")) {
    const lastAIndex = fullCode.lastIndexOf("A");
    if (lastAIndex > 0 && lastAIndex < fullCode.length) {
      return {
        prefix: fullCode.slice(0, lastAIndex + 1),
        suffix: fullCode.slice(lastAIndex + 1),
      };
    }
  }

  if (fullCode.startsWith("G")) {
    return {
      prefix: "G",
      suffix: fullCode.slice(1),
    };
  }

  if (fullCode.startsWith("Q")) {
    return {
      prefix: "Q",
      suffix: fullCode.slice(1),
    };
  }

  return {
    prefix: "",
    suffix: fullCode,
  };
};

const getErrorMessage = (error, t) => {
  const translationKey = `processed_errors.${error.name}`;
  const message = t(translationKey, { ns: "manage" });

  if (message === translationKey) {
    return t("processed_errors.unidentified_error", { ns: "manage" });
  }

  return message;
};

function EntityCodeEditor({ code }) {
  const dispatch = useDispatch();
  const designService = useService("design");
  const { t } = useTranslation(["design", "manage"]);

  const { currentSetup, saving } = useSelector(
    (state) => ({
      currentSetup: state.designState.setup,
      saving: state.designState.saving,
    }),
    shallowEqual
  );

  const [{ prefix, suffix }, setParts] = React.useState(() =>
    computePrefixAndSuffix(code)
  );

  const [error, setError] = React.useState(null);

  useEffect(() => {
    setParts(computePrefixAndSuffix(code));
    setError(null);
  }, [code]);

  const handleEntityCodeChange = React.useCallback((value) => {
    const sanitized = (value || "").replace(ALLOWED_CODE_CHARS_REGEX, "");
    setParts((prev) => ({ ...prev, suffix: sanitized }));
    setError(null);
  }, []);

  const fullCode = `${prefix || ""}${suffix || ""}`.trim();
  const isDirty = fullCode !== code;

  const handleEntityCodeSave = React.useCallback(() => {
    if (!code || !isDirty) return;

    dispatch(setSaving(true));
    setError(null);

    designService
      .changeCode(code, fullCode)
      .then((response) => {
        dispatch(designStateReceived(response));
        dispatch(setup({ ...currentSetup, code: fullCode }));
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        dispatch(setSaving(false));
      });
  }, [code, dispatch, designService, fullCode, isDirty, currentSetup]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEntityCodeSave();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        mb: 1,
      }}
    >
      <TextField
        fullWidth
        size="small"
        label={t("entity_code")}
        value={suffix}
        onChange={(e) => handleEntityCodeChange(e.target.value)}
        onKeyDown={handleKeyDown}
        error={!!error}
        helperText={getErrorMessage(error, t)}
        InputProps={{
          startAdornment: prefix && (
            <InputAdornment position="start" sx={{ mr: 0.2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {prefix}
              </Typography>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleEntityCodeSave}
        disabled={!code || !isDirty || saving || !suffix}
      >
        {t("submit")}
      </Button>
    </Box>
  );
}

export default EntityCodeEditor;
