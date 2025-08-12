import React from "react";
import Switch from "@mui/material/Switch";
import styles from "./Disabled.module.css";
import { useDispatch, useSelector } from "react-redux";
import { changeRelevance } from "~/state/design/designState";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

export default function DisabledToggle({ code, t }) {
  const dispatch = useDispatch();
  const rule = useSelector((s) => s.designState[code]?.relevance?.rule) ?? "show_always";
  const checked = rule === "hide_always";

  const onChange = (nextChecked) => {
    dispatch(
      changeRelevance({
        code,
        key: "relevance",
        value: {
          rule: nextChecked ? "hide_always" : "show_always",
          logic: undefined, 
        },
      })
    );
  };
  return (
    <div className={styles.toggleValue}>
      <div className={styles.label}>
        <CustomTooltip body={t("tooltips.disabled")} />
        <h4>{t("disabled")}</h4>
      </div>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        inputProps={{ "aria-label": "disabled-switch" }}
      />
    </div>
  );
}
