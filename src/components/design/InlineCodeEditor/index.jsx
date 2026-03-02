import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextField, Tooltip } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { designStateReceived, setup } from "~/state/design/designState";
import { useService } from "~/hooks/use-service";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { inDesign } from "~/routes";
import {
  ALLOWED_CODE_CHARS_REGEX,
  computePrefixAndSuffix,
  getErrorMessage,
} from "~/utils/design/codeUtils";
import styles from "./InlineCodeEditor.module.css";

const SPECIAL_TYPES = ["other", "all", "none", "other_text"];
const MAX_CODE_LENGTH = 10;

function InlineCodeEditor({ qualifiedCode, code, designMode }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const designService = useService("design");
  const { t } = useTranslation(NAMESPACES.DESIGN_CORE);
  const inputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { answerType, currentSetup } = useSelector(
    (state) => ({
      answerType: state.designState[qualifiedCode]?.type,
      currentSetup: state.designState.setup,
    }),
    shallowEqual
  );

  const isSpecial = SPECIAL_TYPES.includes(answerType);
  const isEditable = inDesign(designMode) && !isSpecial;

  const { prefix, suffix } = computePrefixAndSuffix(qualifiedCode);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = useCallback(
    (e) => {
      if (!isEditable || isEditing) return;
      e.stopPropagation();
      setEditValue(suffix);
      setError(null);
      setIsEditing(true);
    },
    [isEditable, isEditing, suffix]
  );

  const handleChange = useCallback((e) => {
    const sanitized = (e.target.value || "").replace(
      ALLOWED_CODE_CHARS_REGEX,
      ""
    );
    setEditValue(sanitized);
    setError(null);
  }, []);

  const handleSave = useCallback(() => {
    if (isSaving) return;

    const newFullCode = prefix + editValue;
    if (!editValue.trim() || newFullCode === qualifiedCode) {
      setIsEditing(false);
      setError(null);
      return;
    }

    setIsSaving(true);
    setError(null);

    designService
      .changeCode(qualifiedCode, newFullCode)
      .then((response) => {
        dispatch(designStateReceived(response));
        if (currentSetup?.code === qualifiedCode) {
          dispatch(setup({ ...currentSetup, code: newFullCode }));
        }
        setIsEditing(false);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [
    isSaving,
    prefix,
    editValue,
    qualifiedCode,
    designService,
    dispatch,
    currentSetup,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsEditing(false);
        setError(null);
      }
    },
    [handleSave]
  );

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  if (isEditing) {
    return (
      <Tooltip
        open={!!error}
        title={getErrorMessage(error, t)}
        placement="bottom"
        arrow
      >
        <TextField
          inputRef={inputRef}
          variant="standard"
          size="small"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          error={!!error}
          disabled={isSaving}
          className={styles.codeInput}
          onClick={(e) => e.stopPropagation()}
          inputProps={{ maxLength: MAX_CODE_LENGTH }}
          InputProps={{
            sx: { fontFamily: "monospace", fontSize: 11 },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <span
      className={`${styles.codeLabel} ${!isEditable ? styles.codeLabelReadOnly : ""}`}
      style={{
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.text.secondary,
      }}
      onClick={handleClick}
    >
      {suffix}
    </span>
  );
}

export default InlineCodeEditor;
