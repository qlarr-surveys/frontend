import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeAttribute } from "~/state/design/designState";
import { Trans } from "react-i18next";
import styles from "./FieldSize.module.css";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function FieldSize({
  label,
  rule,
  t,
  defaultValue,
  code,
  lowerBound,
  upperBound,
}) {
  const dispatch = useDispatch();

  const stateValue = useSelector((state) => {
    return state.designState[code][rule] || defaultValue;
  });

  const [value, setValue] = useState(stateValue);

  const onValueChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (newValue >= lowerBound && newValue <= upperBound) {
      dispatch(
        changeAttribute({
          code,
          key: rule,
          value: Math.max(lowerBound, Math.min(upperBound, newValue)),
        })
      );
    }
  };

  const isError = value != stateValue;

  const lostFocus = (event) => {
    if (isError) {
      setValue(stateValue);
      dispatch(
        changeAttribute({
          code,
          key: rule,
          value: stateValue,
        })
      );
    }
  };

  return (
    <>
      <div className={styles.label}>
        <CustomTooltip title={t(`tooltips.${label}`)} />
        <h4>{t(label)}:</h4>
      </div>
      <TextField
        label={t(label)}
        error={isError}
        variant="outlined"
        type="number"
        helperText={
          isError ? (
            <Trans
              t={t}
              values={{
                lower_bound: lowerBound,
                upper_bound: upperBound,
                setup_value: stateValue,
                label,
              }}
              i18nKey="value_beyond_bounds"
            />
          ) : null
        }
        size="small"
        style={{ maxWidth: "200px" }}
        value={value}
        onBlur={lostFocus}
        onChange={(event) => onValueChange(event)}
      />
    </>
  );
}

export default React.memo(FieldSize);
