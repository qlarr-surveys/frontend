import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeAttribute, changeContent } from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { Typography } from "@mui/material";

function CustomCSS({ code, t }) {
  const dispatch = useDispatch();

  const inputValue = useSelector((state) => {
    return state.designState[code].customCss;
  });

  const setCss = (value) => {
    dispatch(changeAttribute({ code, key: "customCss", value }));
  };

  return (
    <>
      <div >
        <div >
          <CustomTooltip body={t("tooltips.show_question_hint")} />
          <Typography fontWeight={700}>{t("show_question_hint")}</Typography>
        </div>
        <textarea
        value={inputValue}
          onChange={(event) => setCss(event.target.value)}
        />
      </div>
    </>
  );
}

export default CustomCSS;
