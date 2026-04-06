import React, { useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { convertQuestion } from "~/state/design/designState";
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
import {
  CONVERTIBLE_CHOICE_TYPES,
  CONVERTIBLE_ARRAY_TYPES,
  isArrayType,
} from "~/constants/design";
import {
  computeChoiceLostAttributes,
  computeArrayLostAttributes,
} from "./utils";

export default function ConvertQuestionType({ code, t }) {
  const dispatch = useDispatch();
  const [pendingType, setPendingType] = useState(null);
  const [lostAttributes, setLostAttributes] = useState([]);

  const question = useSelector((s) => s.designState[code]);
  const type = question?.type;
  const isArray = isArrayType(type);

  const answers = useSelector(
    (s) =>
      isArray
        ? []
        : (question?.children || []).map((c) => s.designState[c.qualifiedCode]),
    shallowEqual
  );

  const columns = useSelector(
    (s) =>
      isArray
        ? (question?.children || [])
            .filter((c) => c.type === "column")
            .map((c) => s.designState[c.qualifiedCode])
        : [],
    shallowEqual
  );

  const convertibleTypes = isArray ? CONVERTIBLE_ARRAY_TYPES : CONVERTIBLE_CHOICE_TYPES;

  const handleChange = (e) => {
    const newType = e.target.value;
    if (!type || newType === type) return;
    const lost = isArray
      ? computeArrayLostAttributes(question, columns, newType)
      : computeChoiceLostAttributes(question, answers, newType);
    if (lost.length > 0) {
      setLostAttributes(lost);
      setPendingType(newType);
    } else {
      dispatch(convertQuestion({ questionCode: code, newType }));
    }
  };

  const handleConfirm = () => {
    dispatch(convertQuestion({ questionCode: code, newType: pendingType }));
    setPendingType(null);
    setLostAttributes([]);
  };

  const handleCancel = () => {
    setPendingType(null);
    setLostAttributes([]);
  };

  return (
    <div className={styles.container}>
      <Typography fontWeight={700}>{t("question_type")}</Typography>
      <FormControl size="small">
        <Select value={type} onChange={handleChange}>
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
