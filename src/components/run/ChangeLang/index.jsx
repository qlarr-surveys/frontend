import React from "react";
import { useSelector } from "react-redux";
import { shallowEqual, useDispatch } from "react-redux";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { langChange } from "~/state/runState";
import { useTranslation } from "react-i18next";

function ChangeLang(props) {
  const state = useSelector((state) => {
    return {
      navigate: state.runState.navigate,
      lang: state.runState.lang,
    };
  }, shallowEqual);
  const dispatch = useDispatch();

  const { t } = useTranslation("run");

  return (
    <FormControl variant="standard">
      <InputLabel id="change-lang-label">{t("lang")}</InputLabel>
      <Select
        labelId="change-lang-label"
        sx={{ backgroundColor: "background.paper", color: "primary.main" }}
        id="ChangeLang"
        label={t("lang")}
        value={props.lang.code}
        onChange={(event) => {
          dispatch(
            langChange({
              lang: event.target.value,
            })
          );
        }}
      >
        <MenuItem value={props.lang.code}>{props.lang.name}</MenuItem>
        {props.additionalLang
          ? props.additionalLang.map((lang, index) => {
              return (
                <MenuItem key={index} value={lang.code}>
                  {lang.name}
                </MenuItem>
              );
            })
          : ""}
      </Select>
    </FormControl>
  );
}

export default ChangeLang;
