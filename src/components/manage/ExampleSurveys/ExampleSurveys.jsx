import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from "./ExampleSurveys.module.css";
import { Survey } from "../Survey";
import { useTranslation } from "react-i18next";
import { processApiError } from "~/utils/errorsProcessor";
import { useService } from '~/hooks/use-service';
import LoadingDots from '~/components/common/LoadingDots';

const ExampleSurveys = ({ onClone }) => {
  const { t } = useTranslation("manage");
  const [isFetching, setFetching] = useState(false);
  const [exampleSurveys, setExampleSurveys] = useState([]);
  const surveyService = useService("survey");

  useEffect(() => {
    setFetching(true);
    surveyService.getGuestsSurveys()
      .then((data) => {
        setFetching(false);
        if (data) {
          const updatedData = data.map((survey) => ({
            ...survey,
            example: true,
          }));
          setExampleSurveys(updatedData);
        }
      })
      .catch((e) => {
        setFetching(false);
        processApiError(e);
      });
  }, []);

  return (
    <>
      <Typography
        variant="h5"
        marginBottom={2}
        fontWeight={600}
        textTransform="uppercase"
      >
        {t("example_surveys")}
      </Typography>

      {!isFetching ? (
        <Box
          className={styles.exampleSurveysContainer}
          sx={{
            mt: 3,
            columnGap: 4,
            display: "grid",
            rowGap: { xs: 4, md: 5 },
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {exampleSurveys?.map((survey) => {
            return (
              <Survey
                key={survey.id}
                survey={survey}
                onClone={() => onClone(survey)}
                example={true}
              />
            );
          })}
        </Box>
      ) : (
        <LoadingDots />
      )}
    </>
  );
};

export default ExampleSurveys;
