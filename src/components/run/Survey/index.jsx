import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CardMedia, useTheme } from "@mui/material";
import { buildResourceUrl } from "~/networking/common";
import { FORM_ID } from "~/constants/run";
import Group from "~/components/Group";
import Navigation from "~/components/run/Navigation";
import styles from "./Survey.module.css";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { TouchBackend } from "react-dnd-touch-backend";
import { isTouchDevice } from "~/utils/isTouchDevice";
import { langChange } from "~/state/runState";
function Survey() {
  const theme = useTheme();
  const dispatch = useDispatch();

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);

  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);

  const surveyState = useSelector((state) => state.runState.data, shallowEqual);

  const { lang: surveyLang, additionalLang } = surveyState || {};
  const languageOptions = [
    { code: surveyLang.code, name: surveyLang.name },
    ...(additionalLang || []),
  ];

  const handleLanguageChange = (selectedLanguage) => {
    dispatch(
      langChange({
        lang: selectedLanguage,
      })
    );
  };

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <form
        id={FORM_ID}
        style={{
          fontFamily: theme.textStyles.text.font,
          color: theme.textStyles.text.color,
          fontSize: theme.textStyles.text.size,
        }}
      >
        <div className={styles.surveyGroups}>
          {survey.resources?.headerImage ? (
            <CardMedia
              className={styles.cardImage}
              component="img"
              image={buildResourceUrl(survey.resources.headerImage)}
            />
          ) : null}
          {survey && survey.groups
            ? survey.groups
                .filter((group) => group.inCurrentNavigation)
                .map((group, index) => (
                  <div
                    key={group.code}
                    id={`group-${index}`}
                    data-index={index}
                    className={styles.groupContianer}
                  >
                    <Group group={group} lang={lang.code} groupIndex={index} />
                  </div>
                ))
            : ""}
          <Navigation navigationIndex={navigationIndex} />
        </div>
      </form>
    </DndProvider>
  );
}

export default Survey;
