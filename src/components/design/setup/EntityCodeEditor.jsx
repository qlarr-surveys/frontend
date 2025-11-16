import React from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { changeEntityCode, setSaving } from "~/state/design/designState";
import { useService } from "~/hooks/use-service";
import { useTranslation } from "react-i18next";

const ALLOWED_CODE_CHARS_REGEX = /[^a-zA-Z0-9_]/g;

const computePrefixAndSuffix = (fullCode) => {
  if (!fullCode) {
    return { prefix: "", suffix: "" };
  }

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

function EntityCodeEditor() {
  const dispatch = useDispatch();
  const designService = useService("design");
  const { t } = useTranslation("design");

  const { code, entityCodeFromState, saving } = useSelector(
    (state) => ({
      code: state.designState.setup?.code,
      entityCodeFromState: state.designState.setup?.code
        ? state.designState[state.designState.setup.code]?.entityCode ||
          state.designState.setup.code
        : "",
      saving: state.designState.saving,
    }),
    shallowEqual
  );

  const [{ prefix, suffix }, setParts] = React.useState(() =>
    computePrefixAndSuffix(entityCodeFromState)
  );

  React.useEffect(() => {
    setParts(computePrefixAndSuffix(entityCodeFromState));
  }, [entityCodeFromState]);

  const handleEntityCodeChange = React.useCallback((value) => {
    const sanitized = (value || "").replace(ALLOWED_CODE_CHARS_REGEX, "");
    setParts((prev) => ({ ...prev, suffix: sanitized }));
  }, []);

  const fullCode = `${prefix || ""}${suffix || ""}`.trim();
  const originalFullCode = (entityCodeFromState || "").trim();
  const isDirty = fullCode !== originalFullCode;

  const handleEntityCodeSave = React.useCallback(() => {
    if (!code || !isDirty) return;

    dispatch(setSaving(true));

    designService
      .changeCode(code, fullCode)
      .then(() => {
        dispatch(
          changeEntityCode({
            code,
            value: fullCode,
          })
        );
      })
      .catch((e) => {
        console.error("Failed to change element code", e);
      })
      .finally(() => {
        dispatch(setSaving(false));
      });
  }, [code, dispatch, designService, fullCode, isDirty]);

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
        InputProps={{
          startAdornment: prefix && (
            <InputAdornment position="start">
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
