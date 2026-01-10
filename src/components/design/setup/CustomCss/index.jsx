import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeAttribute } from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { TextField, Typography } from "@mui/material";

function CustomCSS({ code, t }) {
  const dispatch = useDispatch();

  const inputValue = useSelector((state) => {
    return state.designState[code].customCss;
  });

  const setCss = (event) => {
    console.log("value", event.target.value);
    dispatch(
      changeAttribute({ code, key: "customCss", value: event.target.value })
    );
  };

  return (
    <>
      <div style={{display:'flex'}}>
        <CustomTooltip body={t("tooltips.custom_css")} />
        <Typography fontWeight={700}>{t("custom_css")}</Typography>
      </div>
      <TextField
        fullWidth
        multiline
        minRows={4}
        maxRows={25}
        value={inputValue}
        onChange={setCss}
        placeholder={`/* Enter your CSS code here... */
  background-color: #007bff;
  color: white;
`}
        variant="outlined"
      />
    </>
  );
}

export default CustomCSS;
