import React, { useMemo, useState } from "react";
import styles from "./NavigationSettings.module.css";
import { Box, MenuItem, Typography } from "@mui/material";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { useTranslation } from "react-i18next";
import { RHFSelect, RHFSwitch } from "~/components/hook-form";
import { isSurveyAdmin } from "~/constants/roles";
import { useDispatch, useSelector } from "react-redux";
import { NAVIGATION_MODE, SURVEY_STATUS } from "~/constants/survey";
import { surveyAttributeChanged, surveyAttributeChangedImmediate } from "~/state/edit/editState";
const NavigationSettings = () => {
  const dispatch = useDispatch();
  const survey = useSelector((state) => state.editState.survey);

  const { t } = useTranslation("design");
  const isDisabled = !isSurveyAdmin() || survey?.status == SURVEY_STATUS.CLOSED;

  const mode =
    survey?.surveyNavigationData?.navigationMode ??
    NAVIGATION_MODE.GROUP_BY_GROUP;

  const toggleDefs = useMemo(
    () => [
      {
        key: "allowPrevious",
        labelKey: "allow_previous",
        tooltipKey: "tooltips.allow_previous",
      },
      {
        key: "allowIncomplete",
        labelKey: "allow_incomplete",
        tooltipKey: "tooltips.allow_incomplete",
      },
      {
        key: "allowJump",
        labelKey: "allow_jump",
        tooltipKey: "tooltips.allow_jump",
      },
      {
        key: "skipInvalid",
        labelKey: "skip_invalid",
        tooltipKey: "tooltips.skip_invalid",
      },
    ],
    []
  );

  const [toggles, setToggles] = useState({
    allowPrevious: Boolean(survey?.surveyNavigationData?.allowPrevious),
    allowIncomplete: Boolean(survey?.surveyNavigationData?.allowIncomplete),
    allowJump: Boolean(survey?.surveyNavigationData?.allowJump),
    skipInvalid: Boolean(survey?.surveyNavigationData?.skipInvalid),
  });

  const handleToggleChange = (key) => (e) => {
    const next = e.target.checked;
    setToggles((prev) => ({ ...prev, [key]: next }));

    dispatch(surveyAttributeChanged({ key, value: next }));
  };

  const onNavigationModeChanged = (event) => {
    dispatch(
      surveyAttributeChangedImmediate({
        key: "navigationMode",
        value: event.target.value,
      })
    );
  };

  return (
    <Box className={styles.mainContainer}>
      <RHFSelect
        labelId="navigation-mode-label"
        value={mode}
        disabled={isDisabled}
        label={t("navigation_mode")}
        onChange={onNavigationModeChanged}
      >
        <MenuItem value={NAVIGATION_MODE.GROUP_BY_GROUP}>
          {t("group_by_group")}
        </MenuItem>
        <MenuItem value={NAVIGATION_MODE.QUESTION_BY_QUESTION}>
          {t("question_by_question")}
        </MenuItem>
        <MenuItem value={NAVIGATION_MODE.ALL_IN_ONE}>
          {t("all_in_one")}
        </MenuItem>
      </RHFSelect>
      {toggleDefs.map(({ key, labelKey, tooltipKey }) => (
        <Box key={key} className={styles.boxContainer}>
          <Box display="flex" alignItems="center" gap=".5rem">
            <CustomTooltip body={t(tooltipKey)} />
            <Typography color="#1a2052" fontWeight="500">
              {t(labelKey)}
            </Typography>
          </Box>

          <RHFSwitch
            disabled={isDisabled}
            checked={Boolean(toggles[key])}
            onChange={handleToggleChange(key)}
          />
        </Box>
      ))}
    </Box>
  );
};

export default NavigationSettings;
