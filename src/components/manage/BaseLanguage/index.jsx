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
      </Select>
    </FormControl>
  );
};
