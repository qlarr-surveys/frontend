import React, { Suspense, useCallback, useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import {
  designStateReceived,
  onAddComponentsVisibilityChange,
  resetLang,
  resetSetup,
  setup,
} from "~/state/design/designState";
import { GetData } from "~/networking/design";
import { setLoading, surveyReceived } from "~/state/edit/editState";
import SavingSurvey from "~/components/design/SavingSurvey";
import { isAnalyst, isSurveyAdmin } from "~/constants/roles";
import TokenService from "~/services/TokenService";
import { useParams } from "react-router-dom";
import { DESIGN_SURVEY_MODE, MANAGE_SURVEY_LANDING_PAGES } from "~/routes";
import { Box } from "@mui/material";
import styles from "./ManageSurvey.module.css";
import ManageTranslations from "../manage/ManageTranslations";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
import SideTabs from "~/components/design/SideTabs";
const ResponsesSurvey = React.lazy(() => import("../manage/ResponsesSurvey"));
const EditSurvey = React.lazy(() => import("../manage/EditSurvey"));
const DesignSurvey = React.lazy(() => import("../DesignSurvey"));

function ManageSurvey({ landingPage }) {
  const surveyService = useService("survey");
  const designService = useService("design");

  const searchParams = new URLSearchParams(window.location.search);
  const designMode = resolveDesignMode(searchParams.get("mode"));
  console.log(designMode)
  const params = useParams();
  const user = TokenService.getUser();
  const [selectedPage, setSelectedTab] = useState(
    landingTab(landingPage, user)
  );
  const [designAvailable, setDesignAvailable] = useState(false);

  const dispatch = useDispatch();

  const setState = (state) => {
    dispatch(designStateReceived(state));
  };

  const processApirror = (e) => {
    dispatch(setLoading(false));
  };

  useEffect(() => {
    dispatch(onAddComponentsVisibilityChange(true));
    dispatch(resetSetup());
    if (!isSurveyAdmin(user)) {
      return;
    }
    dispatch(setLoading(true));
    GetData(designService, setState, processApirror)
      .then((data) => {
        if (data) {
          setDesignAvailable(true);
          dispatch(setLoading(false));
        }
      })
      .catch((err) => {
        dispatch(setLoading(false));
      });
    loadSurvey();
  }, []);

  const loadSurvey = () => {
    surveyService
      .getSurvey()
      .then((data) => {
        if (data) {
          dispatch(surveyReceived(data));
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const currentTab = currentPath.split("/")[1];
      setSelectedTab(currentTab);
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode");
      if (mode == DESIGN_SURVEY_MODE.THEME) {
        dispatch(resetLang());
        dispatch(setup(themeSetup));
      } else if (mode == DESIGN_SURVEY_MODE.LANGUAGES) {
        dispatch(setup(languageSetup));
      } else if (mode == DESIGN_SURVEY_MODE.REORDER) {
        dispatch(resetLang());
        dispatch(setup(reorderSetup));
      } else {
        dispatch(resetSetup());
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const shouldShowDesign = () =>
    selectedPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN && designAvailable;

  const shouldShowResponses = () =>
    selectedPage == MANAGE_SURVEY_LANDING_PAGES.RESPONSES;

  const shouldShowEditSurvey = () =>
    selectedPage == MANAGE_SURVEY_LANDING_PAGES.SETTINGS;

  const changePage = useCallback((tab) => {
    setSelectedTab(tab);
  }, []);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <SideTabs
          designMode={designMode}
          availablePages={availablePages(user)}
          selectedPage={selectedPage}
          surveyId={params.surveyId}
          onPageChange={changePage}
        />
        <Suspense fallback={<LoadingDots />}>
          <Box className={styles.wrapper}>
            {shouldShowResponses() ? (
              <ResponsesSurvey />
            ) : shouldShowEditSurvey() ? (
              <EditSurvey onPublish={() => loadSurvey()} />
            ) : shouldShowDesign() ? (
              <DesignSurvey designMode={designMode} />
            ) : (
              <></>
            )}
          </Box>
        </Suspense>

        <SavingSurvey />
      </Box>
      {designAvailable &&
        selectedPage == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE && (
          <ManageTranslations
            onManageTranslationsClose={() => {
              setSelectedTab(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
            }}
            permissionsLoadingpermissionsLoading
            onStartTranslation={() => {}}
          />
        )}
    </>
  );
}
export default React.memo(ManageSurvey);

const availablePages = (user) => {
  if (isSurveyAdmin(user)) {
    return [
      MANAGE_SURVEY_LANDING_PAGES.DESIGN,
      MANAGE_SURVEY_LANDING_PAGES.PREVIEW,
      MANAGE_SURVEY_LANDING_PAGES.SETTINGS,
      MANAGE_SURVEY_LANDING_PAGES.RESPONSES,
    ];
  } else if (isAnalyst(user)) {
    return [
      MANAGE_SURVEY_LANDING_PAGES.PREVIEW,
      MANAGE_SURVEY_LANDING_PAGES.RESPONSES,
    ];
  } else {
    return [MANAGE_SURVEY_LANDING_PAGES.PREVIEW];
  }
};

export const landingTab = (landingPage, user) => {
  if (isAnalyst(user) && landingPage == MANAGE_SURVEY_LANDING_PAGES.RESPONSES) {
    return MANAGE_SURVEY_LANDING_PAGES.RESPONSES;
  } else if (
    isSurveyAdmin(user) &&
    (landingPage == MANAGE_SURVEY_LANDING_PAGES.DESIGN ||
      landingPage == MANAGE_SURVEY_LANDING_PAGES.SETTINGS)
  ) {
    return landingPage;
  } else {
    return "";
  }
};

export const resolveDesignMode = (mode)=>{
  return Object.values(DESIGN_SURVEY_MODE).indexOf(mode) > -1 ? mode : DESIGN_SURVEY_MODE.DESIGN;
}
