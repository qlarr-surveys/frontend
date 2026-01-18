import React from "react";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import { Box, Card } from "@mui/material";
import * as Yup from "yup";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import styles from "./CreateSurvey.module.css";
import { localDateToServerDateTime } from "~/utils/DateUtils";
import { SURVEY_MODE } from "~/constants/survey";
import { setLoading } from "~/state/edit/editState";
import { useDispatch } from "react-redux";
import FormProvider, { RHFSelect, RHFTextField } from "~/components/hook-form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingButton from "@mui/lab/LoadingButton";
import { useService } from "~/hooks/use-service";
import { useNavigate } from "react-router-dom";

const surveyMode_options = [
  { value: SURVEY_MODE.WEB, label: `mode.${SURVEY_MODE.WEB}` },
  { value: SURVEY_MODE.OFFLINE, label: `mode.${SURVEY_MODE.OFFLINE}` },
  { value: SURVEY_MODE.MIXED, label: `mode.${SURVEY_MODE.MIXED}` },
];
function CreateSurvey({ onSurveyCreated }) {
  const surveyService = useService("survey");
  const navigate = useNavigate();

  const { t } = useTranslation(NAMESPACES.MANAGE);
  const dispatch = useDispatch();

  const defaultValues = {
    surveyName: "",
    surveyMode: SURVEY_MODE.MIXED,
    surveyActiveFrom: "",
    surveyActiveTo: "",
  };
  const CreateSurveySchema = Yup.object().shape({
    surveyName: Yup.string()
      .required(t("survey_required"))
      .max(50, t("survey_too_long")),
  });
  const methods = useForm({
    resolver: yupResolver(CreateSurveySchema),
    defaultValues,
  });

  const {
    setError,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    dispatch(setLoading(true));
    const model = {
      name: data.surveyName,
      usage: data.surveyMode,
    };

    if (data.surveyActiveFrom) {
      model.startDate = localDateToServerDateTime(surveyActiveFrom);
    }

    if (data.surveyActiveTo) {
      model.endDate = localDateToServerDateTime(surveyActiveTo);
    }

    surveyService
      .createSurvey(model)
      .then((res) => {
        navigate("/design-survey/" + res.id);
      })
      .catch((processedError) => {
        if (
          processedError.name == PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
        ) {
          setError("surveyName", {
            type: "manual",
            message: t(`processed_errors.${processedError.name}`),
          });
        } else if (
          processedError.name == PROCESSED_ERRORS.INVALID_SURVEY_DATES.name
        ) {
          setError("surveyActiveFrom", {
            type: "manual",
            message: t(`processed_errors.${processedError.name}`),
          });
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  });
  return (
    <Card className={styles.createUserCard}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box
          rowGap={2.5}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
        >
          <RHFTextField name="surveyName" label={t("label.survey_name")} />

          <RHFSelect name="surveyMode" label={t("label.survey_mode")}>
            {surveyMode_options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </RHFSelect>

          <LoadingButton
            fullWidth
            size="large"
            color="primary"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {t("action_btn.create")}
          </LoadingButton>
        </Box>
      </FormProvider>
    </Card>
  );
}

export default CreateSurvey;
