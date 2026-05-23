import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import styles from "./DateTimeQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";
import { useTheme } from "@mui/material/styles";
import Iconify from "~/components/iconify";
import { getForegroundColor } from "~/components/Questions/utils";

function DateTimeQuestionDesign({ code, designMode }) {
  const state = useSelector((state) => {
    return state.designState[code];
  });

  const theme = useTheme();

  const { hintText, isEditable, handleHintChange } = useEditableHint(code, designMode);

  const dateFormat = state.dateFormat || "YYYY/MM/DD";
  const isDateTime = state.type === "date_time";
  const sample = isDateTime
    ? `${dateFormat} ${state.fullDayFormat ? "HH:mm" : "hh:mm A"}`
    : dateFormat;

  const hintColor = useMemo(
    () =>
      theme.contrast?.onPaper ||
      getForegroundColor(theme.palette.background.paper),
    [theme]
  );

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
        placeholder={sample}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Iconify
                icon="solar:calendar-minimalistic-linear"
                width={20}
                sx={{ color: hintColor }}
              />
            </InputAdornment>
          ),
        }}
        sx={{
          pointerEvents: isEditable ? "auto" : "none",
          input: { color: hintColor },
          "& .MuiInputBase-input::placeholder": {
            color: hintColor,
            opacity: 0.7,
          },
        }}
      />
    </div>
  );
}

export default React.memo(DateTimeQuestionDesign);
