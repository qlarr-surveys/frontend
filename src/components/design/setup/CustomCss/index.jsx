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
      <div>
        <div>
          <CustomTooltip body={t("tooltips.show_question_hint")} />
          <Typography fontWeight={700}>{t("show_question_hint")}</Typography>
        </div>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={25}
          value={inputValue}
          onChange={setCss}
          placeholder={`/* Enter your CSS code here... */
.button {
  background-color: #007bff;
  color: white;
  border-radius: 4px;
}

p {
  font-size: 16px;
  line-height: 1.5;
}`}
          variant="outlined"
        />
      </div>
    </>
  );
}

export default CustomCSS;
