import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeAttribute } from "~/state/design/designState";
import { Trans } from "react-i18next";

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
    setValue(event.target.value);
    if (value >= lowerBound && value <= upperBound) {
      dispatch(
        changeAttribute({
          code,
          key: rule,
          value: Math.max(lowerBound, Math.min(upperBound, event.target.value)),
        })
      );
    }
  };

  const isError = value != stateValue;

  return (
    <>
      <h4>{label}:</h4>
      <TextField
        label={label}
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
        onChange={(event) => onValueChange(event)}
      />
    </>
  );
}

export default React.memo(FieldSize);
