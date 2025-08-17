import { TextField, Typography } from "@mui/material";
import { changeAttribute } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import styles from "./SelectDate.module.css";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function SelectDate({ label, rule, code, t }) {
  const dispatch = useDispatch();

  const value = useSelector((state) => {
    return state.designState[code][rule] || "";
  });

  return (
    <div className={styles.selectDate}>
      <div className={styles.label}>
        <CustomTooltip body={t(`tooltips.${label}`)} />
        <Typography fontWeight={700}>{t(label)}</Typography>
      </div>
      <TextField
        className={styles.selectDateField}
        variant="standard"
        size="small"
        value={value}
        type="date"
        onChange={(event) => {
          dispatch(
            changeAttribute({ code, key: rule, value: event.target.value })
          );
        }}
      />
    </div>
  );
}

export default SelectDate;
