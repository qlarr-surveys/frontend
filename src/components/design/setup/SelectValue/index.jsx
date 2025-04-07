import { FormControl, MenuItem, Select } from "@mui/material";
import { changeAttribute } from "~/state/design/designState";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import styles from "./SelectValue.module.css";
import { useTranslation } from "react-i18next";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function SelectValue({ label, rule, defaultValue, code, values, labels }) {
  const dispatch = useDispatch();
  const { t } = useTranslation("design");
  const value = useSelector((state) => {
    return state.designState[code]?.[rule] || defaultValue;
  });

  const onChange = (value) => {
    dispatch(changeAttribute({ code, key: rule, value }));
  };

  return (
    <div className={styles.selectDate}>
      <div className={styles.label}>
        <CustomTooltip body={t(`tooltips.${label}`)} />

        <h4>{t(label)}</h4>
      </div>
      <FormControl variant="standard" fullWidth>
        <Select
          id="select-value"
          value={value}
          label="Select Value"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        >
          {values.map((element, index) => {
            return (
              <MenuItem key={element} value={element}>
                {labels ? labels[index] : element}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
}

export default SelectValue;
