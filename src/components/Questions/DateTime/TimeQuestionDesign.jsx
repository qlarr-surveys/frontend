import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import styles from "./TimeQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";
import { useTheme } from '@emotion/react';
import Iconify from "~/components/iconify";

function TimeQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const { onPaper: hintColor } = useThemeContrast();

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  const sample = state.fullDayFormat ? "HH:mm" : "hh:mm A";

  const fieldSx = useMemo(
    () => ({
      pointerEvents: isEditable ? "auto" : "none",
      input: { color: hintColor },
      "& .MuiInputBase-input::placeholder": {
        color: hintColor,
        opacity: 0.7,
      },
    }),
    [hintColor, isEditable],
  );
  const iconSx = useMemo(() => ({ color: hintColor }), [hintColor]);

  return (
    <div className={styles.questionItem}>
      <TextField
        variant="outlined"
        size="small"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        value={isEditable ? hintText : ""}
        onChange={isEditable ? handleHintChange : undefined}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end">
                <Iconify icon="solar:clock-circle-outline" width={24} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />
    </div>
  );
}

export default React.memo(TimeQuestionDesign);
