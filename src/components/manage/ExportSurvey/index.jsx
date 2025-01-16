import { FileDownload } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useService } from '~/hooks/use-service';

function ExportSurvey() {
  const { t } = useTranslation("manage");
  const survey = useSelector((state) => state.editState.survey);

  const surveyService = useService("survey");
  const onClick = () => {
    surveyService.exportSurvey(survey.id);
  };

  return (
    <Button variant="outlined" component="label" onClick={onClick}>
      {t("edit_survey.export")}
      <FileDownload />
    </Button>
  );
}

export default React.memo(ExportSurvey);
