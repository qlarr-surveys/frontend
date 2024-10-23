import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch, shallowEqual } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import { navigateNext, navigatePrevious } from "~/state/runState";
import { rtlLanguage } from "~/utils/common";
import styles from "./Navigation.module.css";
function Navigation(props) {
  const state = useSelector((state) => {
    return {
      has_previous:
        state.runState.values.Survey.has_previous &&
        state.runState.data.survey.allowPrevious,
      has_next: state.runState.values.Survey.has_next,
      can_save: state.runState.data.survey.allowIncomplete,
      has_errors: state.runState.values.Survey.show_errors,
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation("run");

  const isRtl = rtlLanguage.includes(i18n.language);

  const previous = () => {
    dispatch(navigatePrevious());
  };

  useEffect(() => {
    if (state.has_errors) {
      setTimeout(() => {
        const invalidQuestion = document.querySelector(".invalidQuestion");
        if (invalidQuestion) {
          invalidQuestion.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
  }, [state.has_errors]);

  const next = () => {
    dispatch(navigateNext());
  };

  return props.navigationIndex.name == "end" ? (
    ""
  ) : (
    <div className={styles.buttonContainer}>
      {state.has_previous ? (
        <Button
          variant="contained"
          className={isRtl ? "ml-14" : "mr-14"}
          onClick={() => {
            previous();
          }}
        >
          {t("previous")}
        </Button>
      ) : (
        ""
      )}
      <Button
        variant="contained"
        onClick={() => {
          next();
        }}
      >
        {state.has_next ? t("next") : t("finish")}
      </Button>
    </div>
  );
}

export default Navigation;
