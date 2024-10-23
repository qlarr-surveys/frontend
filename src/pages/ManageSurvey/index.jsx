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
import { themeSetup } from "~/constants/design";
import { isAnalyst, isSurveyAdmin } from "~/constants/roles";
import TokenService from "~/services/TokenService";
import { useParams } from "react-router-dom";
import { MANAGE_SURVEY_LANDING_PAGES } from "~/routes";
import { Box } from "@mui/material";
import styles from "./ManageSurvey.module.css";
import ManageTranslations from "../manage/ManageTranslations";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
const ResponsesSurvey = React.lazy(() => import("../manage/ResponsesSurvey"));
const EditSurvey = React.lazy(() => import("../manage/EditSurvey"));
const DesignSurvey = React.lazy(() => import("../DesignSurvey"));
const PreviewSurvey = React.lazy(() => import("../PreviewSurvey"));

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

  useEffect(() => {
    if (selectedTab == MANAGE_SURVEY_LANDING_PAGES.THEME) {
      dispatch(onAddComponentsVisibilityChange(false));
      dispatch(setup(themeSetup));
    } else if (selectedTab == MANAGE_SURVEY_LANDING_PAGES.DESIGN) {
      dispatch(resetSetup());
    } else if (selectedTab == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE) {
      dispatch(onAddComponentsVisibilityChange(false));
      dispatch(resetSetup());
    }
  }, [selectedTab]);

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

  const shouldShowDesign = () =>
    (selectedTab == MANAGE_SURVEY_LANDING_PAGES.DESIGN ||
      selectedTab == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE ||
      selectedTab == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE ||
      selectedTab == MANAGE_SURVEY_LANDING_PAGES.THEME) &&
    designAvailable;

  const shouldShowResponses = () =>
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.RESPONSES;

  const shouldShowEditSurvey = () =>
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.SETTINGS;

  const shouldShowPreview = () =>
    selectedTab == MANAGE_SURVEY_LANDING_PAGES.PREVIEW;
  
  const changeTabs = useCallback((tab) => {
    setSelectedTab(tab);
    window.history.replaceState(null, "", `/${tab}/${params.surveyId}`);
  }, []);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <TopBanner
          availableTabs={availableTabs(user)}
          selectedTab={selectedTab}
          surveyId={params.surveyId}
          onTabChange={changeTabs}
          onClick={(tab) => {
            if (tab == MANAGE_SURVEY_LANDING_PAGES.DESIGN) {
              dispatch(resetSetup());
            }
          }}
        />
        <Suspense fallback={<LoadingDots />}>
          <Box className={styles.wrapper}>
            {shouldShowResponses() ? (
              <ResponsesSurvey />
            ) : shouldShowEditSurvey() ? (
              <EditSurvey onPublish={() => loadSurvey()} />
            ) : shouldShowPreview() ? (
              <PreviewSurvey />
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
    return MANAGE_SURVEY_LANDING_PAGES.PREVIEW;
  }
};
