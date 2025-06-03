import React from "react";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { changeAttribute } from "~/state/design/designState";
import { InputAdornment } from "@mui/material";

const LABEL_MAP = {
  minHeaderMobile: "Min Header Column Width (Mobile)",
  minHeaderDesktop: "Min Header Column Width (Desktop)",
  minOptionMobile: "Min Option Column Width (Mobile)",
  minOptionDesktop: "Min Option Column Width (Desktop)",
};

function NumericValue({ code, rule, t, step = 1 }) {
  const dispatch = useDispatch();

  const value = useSelector((state) => {
    const storedValue = state.designState?.[code]?.[rule];
    return typeof storedValue === "number" ? storedValue : "";
  });

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      dispatch(changeAttribute({ code, key: rule, value: newValue }));
    }
  };

  return (
    <TextField
      key={code + rule}
      label={t(LABEL_MAP[rule] || rule)}
      type="number"
      sx={{ mb: 1 }}
      inputProps={{ step }}
      value={value}
      InputProps={{
        endAdornment: <InputAdornment position="end">px</InputAdornment>,
      }}
      onChange={handleChange}
    />
  );
}

export default NumericValue;
