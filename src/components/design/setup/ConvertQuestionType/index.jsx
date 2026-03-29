import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  CONVERTIBLE_QUESTION_TYPES,
  isSingleSelect,
  mediaGroup,
} from "~/constants/design";

function computeLostAttributes(question, answers, currentType, newType) {
  const lost = [];
  const srcSingle = isSingleSelect(currentType);
  const dstSingle = isSingleSelect(newType);
  const srcGroup = mediaGroup(currentType);
  const dstGroup = mediaGroup(newType);

  if (srcSingle && !dstSingle) {
    if (question?.skip_logic?.length > 0) {
      lost.push("lost_skip_logic");
    }
    if (question?.validation?.validation_required?.isActive) {
      lost.push("lost_validation_required");
    }
    const defaultValueInstruction = question?.instructionList?.find(
      (i) => i.code === "value" && i.text
    );
    if (defaultValueInstruction) {
      lost.push("lost_default_value");
    }
  }

  if (!srcSingle && dstSingle) {
    const hasActiveCountValidation = [
      "validation_min_option_count",
      "validation_max_option_count",
      "validation_option_count",
    ].some((r) => question?.validation?.[r]?.isActive);
    if (hasActiveCountValidation) {
      lost.push("lost_validation_option_count");
    }
  }

  if (srcGroup === "icon" && dstGroup !== "icon") {
    if (answers.some((a) => a?.resources?.icon)) {
      lost.push("lost_answer_icons");
    }
  }

  if (srcGroup === "image" && dstGroup !== "image") {
    if (answers.some((a) => a?.resources?.image)) {
      lost.push("lost_answer_images");
    }
  }

  return lost;
}

export default function ConvertQuestionType({ code, t }) {
  const dispatch = useDispatch();
  const [pendingType, setPendingType] = useState(null);
  const [lostAttributes, setLostAttributes] = useState([]);

  const question = useSelector((s) => s.designState[code]);
  const type = question?.type;
  const answers = useSelector((s) => {
    const q = s.designState[code];
    return (q?.children || []).map((c) => s.designState[c.qualifiedCode]);
  });

  const handleChange = (e) => {
    const newType = e.target.value;
    if (!newType || newType === type) return;
    const lost = computeLostAttributes(question, answers, type, newType);
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
          {CONVERTIBLE_QUESTION_TYPES.map((qt) => (
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
