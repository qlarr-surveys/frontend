import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { SurveyActiveFromTo } from "../SurveyActiveFromTo";
import { isSurveyAdmin } from "~/constants/roles";
import styles from "./EditSurveyGeneral.module.css";
import { SURVEY_STATUS } from "~/constants/survey";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { surveyAttributeChanged } from "~/state/edit/editState";
import { localDateToServerDateTime } from "~/utils/DateUtils";
import { RHFSelect } from "~/components/hook-form";
import { SURVEY_MODE } from "~/constants/survey";
import { useEffect } from "react";
import { HelpOutline } from "@mui/icons-material";

const surveyMode_options = [
  { value: SURVEY_MODE.WEB, label: `mode.${SURVEY_MODE.WEB}` },
  { value: SURVEY_MODE.OFFLINE, label: `mode.${SURVEY_MODE.OFFLINE}` },
  { value: SURVEY_MODE.MIXED, label: `mode.${SURVEY_MODE.MIXED}` },
];

function EditSurveyGeneral() {
  const { t } = useTranslation("manage");
  const survey = useSelector((state) => state.editState.survey);
  const [surveyMode, setSurveyMode] = useState("");

  const [surveyDateError, setSurveyDateError] = useState("");

  useEffect(() => {
    const newSurveyMode = survey?.usage || "";
    setSurveyMode(newSurveyMode);
  }, [survey]);

  const dispatch = useDispatch();

  const isDisabled = !isSurveyAdmin() || survey?.status == SURVEY_STATUS.CLOSED;


  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };


  const onSurveyActiveFromChanged = (value) => {
    setSurveyDateError("");

    const dateValue = value instanceof Date ? value : value.toDate();

    dispatch(
      surveyAttributeChanged({
        key: "startDate",
        value: dateValue ? localDateToServerDateTime(dateValue) : null,
      })
    );
  };

  const onSurveyActiveToChanged = (value) => {
    setSurveyDateError("");
    const dateValue = value instanceof Date ? value : value.toDate();

    dispatch(
      surveyAttributeChanged({
        key: "endDate",
        value: dateValue ? localDateToServerDateTime(dateValue) : null,
      })
    );
  };
  const onSurveyModeChanged = (e) => {
    setSurveyMode(e.target.value);
    dispatch(
      surveyAttributeChanged({
        key: "usage",
        value: e.target.value,
      })
    );
  };

  return (

    <div
      className={styles.generalContainer}
    >
      <RHFSelect
        value={surveyMode}
        onChange={onSurveyModeChanged}
        label={t("label.survey_mode")}
      >
        {surveyMode_options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </RHFSelect>
      <Typography ml={1} variant="caption" color="error" display="flex" alignItems="center">
        {t("timezone_info")}        <Tooltip
          title={`${t("timezone_tooltip")} (${getUserTimezone()}).`}
          arrow
        >
          <IconButton size="small" aria-label="help" style={{ marginLeft: 4 }}>
            <HelpOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <Box className={styles.blockItem}>
        <SurveyActiveFromTo
          error={surveyDateError}
          disabled={isDisabled}
          surveyActiveFrom={survey?.startDate}
          surveyActiveTo={survey?.endDate}
          onSurveyActiveFromChanged={onSurveyActiveFromChanged}
          onSurveyActiveToChanged={onSurveyActiveToChanged}
        />
      </Box>
    </div>
  );
}

export default React.memo(EditSurveyGeneral);
