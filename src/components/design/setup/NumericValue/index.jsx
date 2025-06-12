import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeAttribute } from "~/state/design/designState";
import { MenuItem } from "@mui/material";
import { RHFSelect } from "~/components/hook-form";

const LABEL_MAP = {
  minHeaderMobile: "Min Header Column Width (Mobile)",
  minHeaderDesktop: "Min Header Column Width (Desktop)",
  minOptionMobile: "Min Option Column Width (Mobile)",
  minOptionDesktop: "Min Option Column Width (Desktop)",
};

const WIDTH_OPTIONS = [60, 90, 120, 150, 180];

function NumericValue({ code, rule, t }) {
  const dispatch = useDispatch();

  const value = useSelector((state) => {
    const storedValue = state.designState?.[code]?.[rule];
    return typeof storedValue === "number" ? storedValue : "";
  });

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      dispatch(changeAttribute({ code, key: rule, value: newValue }));
    }
  };

  return (
    <RHFSelect
      key={code + rule}
      name={`${code}.${rule}`}
      label={t(LABEL_MAP[rule] || rule)}
      value={value}
      onChange={handleChange}
      sx={{ mb: 1 }}
    >
      {WIDTH_OPTIONS.map((option) => (
        <MenuItem key={option} value={option}>
          {option}px
        </MenuItem>
      ))}
    </RHFSelect>
  );
}

export default NumericValue;
