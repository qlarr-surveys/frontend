import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import styles from "./DateTimeQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";
import { useTheme } from '@emotion/react';
import Iconify from "~/components/iconify";

function DateTimeQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const theme = useTheme();

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  return (
    <div className={styles.questionItem}>
      <TextField
        size="small"
        variant="outlined"
        required={
          state.validation?.validation_required?.isActive ? true : false
        }
        value={isEditable ? hintText : ""}
        onChange={isEditable ? handleHintChange : undefined}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end">
                <Iconify icon="solar:calendar-minimalistic-linear" width={24} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          pointerEvents: isEditable ? "auto" : "none",
          input: { color: theme.palette.text.disabled },
        }}
      />
    </div>
  );
}

export default React.memo(DateTimeQuestionDesign);
