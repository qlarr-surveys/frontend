import { Box, Typography } from "@mui/material";
import React from "react";
import styles from "./TemplateSlider.module.css";
import { Survey } from "../Survey";
import { useTranslation } from "react-i18next";

const TemplateSlider = ({ surveys, onClone }) => {
  const { t } = useTranslation("manage");
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
        {surveys?.map((survey) => {
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
    </>
  );
};

export default TemplateSlider;
