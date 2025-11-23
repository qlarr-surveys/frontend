import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  designStateReceived,
  resetSetup,
} from "~/state/design/designState";
import { GetData } from "~/networking/design";
import { setLoading, surveyReceived } from "~/state/edit/editState";
import SavingSurvey from "~/components/design/SavingSurvey";
import { availablePages, isAnalyst, isSurveyAdmin } from "~/constants/roles";
import TokenService from "~/services/TokenService";
import { useParams } from "react-router-dom";
import { MANAGE_SURVEY_LANDING_PAGES } from "~/routes";
import { Box } from "@mui/material";
import styles from "./ManageSurvey.module.css";

import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import SideTabs from "~/components/design/SideTabs";

const ManageTranslations = React.lazy(() =>
  import("../manage/ManageTranslations")
);
const ResponsesSurvey = React.lazy(() => import("../manage/ResponsesSurvey"));
const EditSurvey = React.lazy(() => import("../manage/EditSurvey"));
const DesignSurvey = React.lazy(() => import("../DesignSurvey"));

function ManageSurvey({ landingPage }) {
  const surveyService = useService("survey");
  const designService = useService("design");
  const params = useParams();
  const user = TokenService.getUser();
  const [selectedPage, setSelectedTab] = useState(
    landingTab(landingPage, user)
  );
  const refetchError = useSelector((state) => state.editState.error);
  const langInfo = useSelector((state) => state.designState.langInfo);
  // Helper function to identify valid components (questions/groups) vs system metadata
  const isValidComponent = (key, obj) => {
    return obj && 
           typeof obj === 'object' && 
           key !== 'Survey' && // Survey is special case
           (obj.type || obj.children || obj.instructionList || obj.content);
  };

  const designState = useSelector((state) => state.designState);
  


  const [designAvailable, setDesignAvailable] = useState(false);

  const dispatch = useDispatch();
  

  


  const setState = (state) => {
    console.log('[STATE] ManageSurvey setState called with:');
    console.log('[STATE] State keys:', Object.keys(state || {}));
    console.log('[STATE] Survey theme:', state?.Survey?.theme);
    console.log('[STATE] Custom CSS in theme:', state?.Survey?.theme?.customCSS);
    

    
    dispatch(designStateReceived(state));
  };

  const processApirror = (e) => {
    dispatch(setLoading(false));
  };

  useEffect(() => {
    dispatch(resetSetup());
    if (!isSurveyAdmin(user)) {
      return;
    }
    dispatch(setLoading(true));
    console.log('[DATA] ManageSurvey: Starting GetData call...');
    GetData(designService, setState, processApirror, langInfo)
      .then((data) => {
        console.log('[DATA] ManageSurvey: GetData completed successfully');
        console.log('[DATA] Received data keys:', Object.keys(data || {}));
        console.log('[DATA] Has custom_css in received data:', !!data?.custom_css);
        if (data?.custom_css) {
          console.log('[DATA] custom_css content:', data.custom_css);
        }
        if (data) {
          setDesignAvailable(true);
          dispatch(setLoading(false));
        }
      })
      .catch((err) => {
        console.error('[ERROR] ManageSurvey: GetData failed:', err);
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

  const availablePagesMemo = useMemo(() => {
    return availablePages(user);
  }, [user]);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        {availablePagesMemo.length > 0 && (
          <SideTabs
            availablePages={availablePagesMemo}
            selectedPage={selectedPage}
            surveyId={params.surveyId}
            onPageChange={changePage}
          />
        )}
        <Suspense fallback={<LoadingDots fullHeight />}>
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
        selectedPage == MANAGE_SURVEY_LANDING_PAGES.LANGUAGE && (
          <Suspense fallback={<LoadingDots fullHeight />}>
            <ManageTranslations
              onManageTranslationsClose={() => {
                setSelectedTab(MANAGE_SURVEY_LANDING_PAGES.DESIGN);
              }}
              permissionsLoadingpermissionsLoading
              onStartTranslation={() => {}}
            />
          </Suspense>
        )}
    </>
  );
}
export default React.memo(ManageSurvey);

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
