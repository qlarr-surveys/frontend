import React from "react";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { LANGUAGE_DEF } from "~/constants/language";

export const AdditionalLanguages = ({
  baseLanguage,
  onAdditionalLanguagesChanged,
  additionalLanguages,
  disabled,
}) => {
  const { t } = useTranslation("manage");

  return (
    <FormControl sx={{ marginTop: "16px" }}>
      <FormLabel id="additional-languages-label">
        {t("label.additional_languages")}
      </FormLabel>
      {Object.keys(LANGUAGE_DEF).map((key) => {
        const el = LANGUAGE_DEF[key];
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                disabled={baseLanguage == el.code || disabled}
                checked={additionalLanguages.indexOf(el.code) > -1}
                onChange={onAdditionalLanguagesChanged}
                name={el.code}
              />
            }
            label={el.name}
          />
        );
      })}
    </FormControl>
  );
};
