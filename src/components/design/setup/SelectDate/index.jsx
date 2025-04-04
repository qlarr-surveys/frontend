import { TextField } from "@mui/material";
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
        <CustomTooltip title={t(`tooltips.${label}`)} />
        <h4>{t(label)}</h4>
      </div>
      <TextField
        className={styles.selectDateField}
        variant="standard"
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
