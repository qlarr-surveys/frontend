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
  onAddComponentsVisibilityChange,
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
  const designState = useSelector((state) => state.designState);
  
  // Watch for custom CSS changes and apply them globally
  const customCSS = useSelector((state) => state.designState?.Survey?.theme?.customCSS);

  const [designAvailable, setDesignAvailable] = useState(false);

  const dispatch = useDispatch();
  
  // Function to apply custom CSS globally
  const applyGlobalCustomCSS = (state) => {
    const customCSS = state?.Survey?.theme?.customCSS;
    console.log('🎨 Applying global custom CSS:', customCSS);
    
    if (customCSS?.trim()) {
      // Scope CSS function (same as in CustomCSS component)
      const scopeCSS = (css) => {
        if (!css.trim()) return '';
        return css.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
          const cleanSelector = selector.trim();
          const cleanProps = props.trim();
          
          if (cleanSelector.includes('.content-panel') || cleanSelector.includes('.muiltr-uwwqev')) {
            return fullMatch;
          }
          
          return `.content-panel ${cleanSelector}, .muiltr-uwwqev ${cleanSelector} { ${cleanProps} }`;
        });
      };
      
      const globalStyleId = 'survey-global-custom-css';
      
      // Remove existing global CSS
      const existingElement = document.getElementById(globalStyleId);
      if (existingElement) {
        document.head.removeChild(existingElement);
      }
      
      // Apply new global CSS
      const scopedCSS = scopeCSS(customCSS);
      const styleElement = document.createElement('style');
      styleElement.id = globalStyleId;
      styleElement.type = 'text/css';
      styleElement.setAttribute('data-source', 'global-manager');
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      console.log('✅ Global custom CSS applied successfully');
      console.log('✅ Scoped CSS:', scopedCSS.substring(0, 150) + '...');
    } else {
      console.log('💭 No custom CSS to apply globally');
    }
  };
  
  // Apply custom CSS globally whenever it changes
  useEffect(() => {
    if (designState && customCSS) {
      console.log('🎨 ManageSurvey: Custom CSS changed, applying globally...');
      applyGlobalCustomCSS(designState);
    }
  }, [customCSS, designState]);

  const setState = (state) => {
    console.log('🎯 ManageSurvey setState called with:');
    console.log('🎯 State keys:', Object.keys(state || {}));
    console.log('🎯 Survey theme:', state?.Survey?.theme);
    console.log('🎯 Custom CSS in theme:', state?.Survey?.theme?.customCSS);
    
    // Apply global custom CSS after state is loaded
    applyGlobalCustomCSS(state);
    
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
    console.log('🔄 ManageSurvey: Starting GetData call...');
    GetData(designService, setState, processApirror, langInfo)
      .then((data) => {
        console.log('✅ ManageSurvey: GetData completed successfully');
        console.log('✅ Received data keys:', Object.keys(data || {}));
        console.log('✅ Has custom_css in received data:', !!data?.custom_css);
        if (data?.custom_css) {
          console.log('✅ custom_css content:', data.custom_css);
        }
        if (data) {
          setDesignAvailable(true);
          dispatch(setLoading(false));
        }
      })
      .catch((err) => {
        console.error('❌ ManageSurvey: GetData failed:', err);
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

  const refetchAll = useCallback(() => {
    if (isSurveyAdmin(user)) {
      dispatch(setLoading(true));
      GetData(designService, setState, processApirror, langInfo)
        .then((data) => {
          if (data) setDesignAvailable(true);
        })
        .finally(() => dispatch(setLoading(false)));
    }
    loadSurvey();
  }, [user, designService, dispatch, setState, processApirror, loadSurvey, langInfo]);

  useEffect(() => {
    if (refetchError?.name === "component_deleted" && refetchError?.seen) {
      refetchAll();
    }
  }, [refetchError?.name, refetchError?.seen, refetchAll]);

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
