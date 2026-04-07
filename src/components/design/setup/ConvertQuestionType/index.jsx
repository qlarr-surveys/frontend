import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import styles from "./ConvertQuestionType.module.css";
import { useConvertQuestionType } from "./useConvertQuestionType";

export default function ConvertQuestionType({ code, t }) {
  const {
    type,
    convertibleTypes,
    pendingType,
    lostAttributes,
    handleChange,
    handleConfirm,
    handleCancel,
  } = useConvertQuestionType(code);

  return (
    <div className={styles.container}>
      <Typography fontWeight={700}>{t("question_type")}</Typography>
      <FormControl size="small">
        <Select value={type} onChange={(e) => handleChange(e.target.value)}>
          {convertibleTypes.map((qt) => (
            <MenuItem key={qt} value={qt}>
              {t(qt)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Dialog open={!!pendingType} onClose={handleCancel}>
        <DialogTitle>{t("convert_warning_title")}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{t("convert_warning_body")}</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {lostAttributes.map((attr) => (
              <li key={attr}>
                <Typography variant="body2">{t(attr)}</Typography>
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>{t("cancel")}</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            {t("convert_anyway")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
