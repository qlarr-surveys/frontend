import React from "react";
import { useTranslation } from "react-i18next";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LANGUAGE_DEF } from '~/constants/language';

export const BaseLanguage = ({
  baseLanguage,
  onBaseLanguageChanged,
  disabled,
}) => {
  const { t } = useTranslation("manage");

  return (
    <FormControl fullWidth>
      <InputLabel id="label-base-language">
        {t("label.base_language")}
      </InputLabel>
      <Select
        disabled={disabled}
        labelId="label-base-language"
        value={baseLanguage}
        label={t("label.base_language")}
        onChange={onBaseLanguageChanged}
      >
        <MenuItem value={"en"}>{LANGUAGE_DEF["en"].name}</MenuItem>
        <MenuItem value={"de"}>{LANGUAGE_DEF["de"].name}</MenuItem>
        <MenuItem value={"ar"}>{LANGUAGE_DEF["ar"].name}</MenuItem>
        <MenuItem value={"es"}>{LANGUAGE_DEF["es"].name}</MenuItem>
        <MenuItem value={"pt"}>{LANGUAGE_DEF["pt"].name}</MenuItem>
        <MenuItem value={"fr"}>{LANGUAGE_DEF["fr"].name}</MenuItem>
        <MenuItem value={"nl"}>{LANGUAGE_DEF["nl"].name}</MenuItem>
      </Select>
    </FormControl>
  );
};
