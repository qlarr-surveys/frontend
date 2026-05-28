import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import styles from "./TimeQuestionDesign.module.css";
import { useSelector } from "react-redux";
import { useEditableHint } from "~/hooks/useEditableHint";
import Iconify from "~/components/iconify";
import { useThemeContrast } from "~/components/Questions/useThemeContrast";

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
        placeholder={sample}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Iconify
                icon="solar:clock-circle-outline"
                width={20}
                sx={iconSx}
              />
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />
    </div>
  );
}

export default React.memo(TimeQuestionDesign);
