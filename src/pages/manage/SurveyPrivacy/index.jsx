import React from "react";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography } from "@mui/material";
import { surveyAttributeChanged } from "~/state/edit/editState";
import { SURVEY, SURVEY_STATUS } from "~/constants/survey";
import styles from "./SurveyPrivacy.module.css";
import { isSurveyAdmin } from "~/constants/roles";
import { RHFSwitch } from "~/components/hook-form";

function SurveyPrivacy() {
  const dispatch = useDispatch();
  const { t: tManageCloud } = useTranslation(NAMESPACES.MANAGE_CLOUD);
  const survey = useSelector((state) => state.editState.survey);
  const isDisabled = !isSurveyAdmin() || survey.status == SURVEY_STATUS.CLOSED;

  const onChangeCheckbox = (e) => {
    dispatch(
      surveyAttributeChanged({
        key: e.target.name,
        value: e.target.checked,
      })
    );
  };

  return (
    <Box className={styles.mainContainer}>
      <Box className={styles.flexContainer}>
        <Typography color="#1a2052" fontWeight="500">
          {tManageCloud("edit_survey.save_ip")}
        </Typography>

        <RHFSwitch
          disabled={isDisabled}
          name={SURVEY.SAVE_IP}
          checked={survey.saveIp}
          onChange={onChangeCheckbox}
        />
      </Box>
      <Box className={styles.flexContainer}>
        <Typography color="#1a2052" fontWeight="500">
          {tManageCloud("edit_survey.save_timings")}
        </Typography>

        <RHFSwitch
          disabled={isDisabled}
          name={SURVEY.SAVE_TIMINGS}
          checked={survey.saveTimings}
          onChange={onChangeCheckbox}
        />
      </Box>
    </Box>
  );
}

export default React.memo(SurveyPrivacy);
