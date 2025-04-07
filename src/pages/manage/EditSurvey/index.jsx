import React from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styles from "./EditSurvey.module.css";
import { useTranslation } from "react-i18next";
import LaunchPage from "../Launch/launch";
import SurveyQuota from "~/components/manage/SurveyQuota";
import ExportSurvey from "~/components/manage/ExportSurvey";
import { useSelector } from "react-redux";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

function EditSurvey({ onPublish }) {
  const { t } = useTranslation("manage");
  const survey = useSelector((state) => state.editState.survey);

  const sections = [
    {
      id: "quotas",
      title: t("edit_survey.quotas"),
      component: <SurveyQuota />,
    },
    {
      id: "export",
      title: t("edit_survey.export"),
      component: <ExportSurvey />,
    },
  ];

  return (
    survey && (
      <Box className={styles.mainContainer}>
        <Accordion className={styles.accordionContainer} defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Box display="flex" alignItems="center" gap=".5rem">
              <CustomTooltip body={t(`tooltips.launch`)} />
              <Typography fontWeight="600" color="#1a2052" variant="h5">
                {t("edit_survey.launch")}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            <LaunchPage onPublish={onPublish} />
          </AccordionDetails>
        </Accordion>

        {sections.map((section) => {
          return (
            <Accordion
              className={styles.accordionContainer}
              key={section.id}
              defaultExpanded={true}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Box display="flex" alignItems="center" gap=".5rem">
                  <CustomTooltip body={t(`tooltips.${section.id}`)} />
                  <Typography fontWeight="600" color="#1a2052" variant="h5">
                    {section.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                {section.component}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    )
  );
}

export default React.memo(EditSurvey);
