import React, { Suspense, useCallback, useEffect, useState } from "react";

import TopBanner from "~/components/design/TopBanner";
import { useDispatch } from "react-redux";
import {
  designStateReceived,
  onAddComponentsVisibilityChange,
  resetSetup,
  setup,
} from "~/state/design/designState";
import { GetData } from "~/networking/design";
import { setLoading, surveyReceived } from "~/state/edit/editState";
import SavingSurvey from "~/components/design/SavingSurvey";
import { isAnalyst, isSurveyAdmin } from "~/constants/roles";
import TokenService from "~/services/TokenService";
import { useParams } from "react-router-dom";
import { MANAGE_SURVEY_LANDING_PAGES } from "~/routes";
import { Box } from "@mui/material";
import styles from "./ManageSurvey.module.css";
import ManageTranslations from "../manage/ManageTranslations";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import { languageSetup, reorderSetup, themeSetup } from "~/constants/design";
const ResponsesSurvey = React.lazy(() => import("../manage/ResponsesSurvey"));
const EditSurvey = React.lazy(() => import("../manage/EditSurvey"));
const DesignSurvey = React.lazy(() => import("../DesignSurvey"));

function ManageSurvey({ landingPage }) {
  const surveyService = useService("survey");
  const designService = useService("design");

  const params = useParams();
  const user = TokenService.getUser();
  const [selectedTab, setSelectedTab] = useState(landingTab(landingPage, user));
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
      if (mode == "theme") {
        dispatch(setup(themeSetup));
      } else if (mode == "languages") {
        dispatch(setup(languageSetup));
      } else if (mode == "reorder") {
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
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.DESIGN && designAvailable;

  const shouldShowResponses = () =>
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.RESPONSES;

  const shouldShowEditSurvey = () =>
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.SETTINGS;

  const changeTabs = useCallback((tab) => {
    setSelectedTab(tab);
  }, []);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <TopBanner
          availableTabs={availableTabs(user)}
          selectedTab={selectedTab}
          surveyId={params.surveyId}
          onTabChange={changeTabs}
        />
        <Suspense fallback={<LoadingDots />}>
          <Box className={styles.wrapper}>
            {shouldShowResponses() ? (
              <ResponsesSurvey />
            ) : shouldShowEditSurvey() ? (
              <EditSurvey onPublish={() => loadSurvey()} />
            ) : shouldShowDesign() ? (
              <DesignSurvey />
            ) : (
              <></>
            )}
          </Box>
        </Suspense>

        <SavingSurvey />
      </Box>
      {designAvailable &&
        selectedTab == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE && (
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

const availableTabs = (user) => {
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
