import { Box, Typography } from "@mui/material";
import React from "react";
import styles from "./TemplateSlider.module.css";
import "./TemplateSlider.css";
import { Survey } from "../Survey";

const TemplateSlider = ({ surveys, onClone }) => {
  return (
    <Box className={styles.sliderContainer}>
      <Typography
        variant="h5"
        marginBottom={2}
        fontWeight={600}
        color="#181735"
      >
        Surveys Forms
      </Typography>

      <div
        style={{
          width: "100%",
          overflow: "auto",
          display: "flex",
          gap: "40px",
        }}
      >
        {surveys.map((survey, index) => (
          <Box key={index} sx={{ minWidth: "21rem", margin: "1rem 0rem" }}>
            <Survey
              key={survey.id}
              survey={survey}
              onClone={() => onClone(survey)}
              example={true}
            />
          </Box>
        ))}
      </div>
    </Box>
  );
};

export default TemplateSlider;
