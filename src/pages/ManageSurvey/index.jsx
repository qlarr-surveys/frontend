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
  const designState = useSelector((state) => state.designState);
  
  // Watch for custom CSS changes and apply them globally
  const customCSS = useSelector((state) => state.designState?.Survey?.theme?.customCSS);

  const [designAvailable, setDesignAvailable] = useState(false);

  const dispatch = useDispatch();
  
  // Function to apply custom CSS globally (Survey-level and all question-level CSS)
  const applyGlobalCustomCSS = (state) => {
    console.log('[CSS] Applying global custom CSS...');
    
    // Survey-level CSS
    const surveyCSS = state?.Survey?.theme?.customCSS;
    console.log('[CSS] Survey CSS found:', !!surveyCSS);
    
    // Question-level CSS - find all questions with customCSS
    const questionCSSList = [];
    Object.keys(state || {}).forEach(key => {
      if (key !== 'Survey' && key !== 'langInfo' && key !== 'versionDto' && key !== 'componentIndex' && 
          key !== 'latest' && key !== 'lastAddedComponent' && key !== 'index' && key !== 'setup' &&
          key !== 'state' && key !== 'addComponentsVisibility' && key !== 'globalSetup' && key !== 'designMode') {
        const questionState = state[key];
        if (questionState?.customCSS?.trim()) {
          questionCSSList.push({ code: key, css: questionState.customCSS });
        }
      }
    });
    
    console.log('Questions with CSS found:', questionCSSList.length);
    
    // Scope CSS function
    const scopeCSS = (css, questionCode = null) => {
      if (!css.trim()) return '';
      return css.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
        const cleanSelector = selector.trim();
        const cleanProps = props.trim();
        
        // Check if already scoped
        const alreadyScoped = cleanSelector.includes('.content-panel') || 
                             cleanSelector.includes('.muiltr-uwwqev') ||
                             cleanSelector.includes(`[data-code=`) ||
                             cleanSelector.includes('.question-');
        
        if (alreadyScoped) {
          return fullMatch;
        }
        
        if (questionCode) {
          // Question-specific scoping
          return `[data-code="${questionCode}"] ${cleanSelector}, .question-${questionCode} ${cleanSelector} { ${cleanProps} }`;
        } else {
          // Survey-wide scoping
          return `.content-panel ${cleanSelector}, .muiltr-uwwqev ${cleanSelector} { ${cleanProps} }`;
        }
      });
    };
    
    // Remove existing global CSS elements
    const existingElements = document.querySelectorAll('[id^="survey-global-custom-css"]');
    existingElements.forEach(el => document.head.removeChild(el));
    
    // Apply Survey-level CSS
    if (surveyCSS?.trim()) {
      const scopedCSS = scopeCSS(surveyCSS);
      const styleElement = document.createElement('style');
      styleElement.id = 'survey-global-custom-css';
      styleElement.type = 'text/css';
      styleElement.setAttribute('data-source', 'global-survey-css');
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      console.log('[CSS] Global Survey CSS applied');
    }
    
    // Apply question-level CSS
    questionCSSList.forEach(({ code, css }) => {
      const scopedCSS = scopeCSS(css, code);
      const styleElement = document.createElement('style');
      styleElement.id = `survey-global-custom-css-${code}`;
      styleElement.type = 'text/css';
      styleElement.setAttribute('data-source', 'global-question-css');
      styleElement.setAttribute('data-code', code);
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      console.log(`[CSS] Global question CSS applied for ${code}`);
    });
    
    console.log('[CSS] All custom CSS applied globally');
  };
  
  // Apply custom CSS globally whenever it changes
  useEffect(() => {
    if (designState && customCSS) {
      console.log('[CSS] ManageSurvey: Custom CSS changed, applying globally...');
      applyGlobalCustomCSS(designState);
    }
  }, [customCSS, designState]);

  const setState = (state) => {
    console.log('[STATE] ManageSurvey setState called with:');
    console.log('[STATE] State keys:', Object.keys(state || {}));
    console.log('[STATE] Survey theme:', state?.Survey?.theme);
    console.log('[STATE] Custom CSS in theme:', state?.Survey?.theme?.customCSS);
    
    // Apply global custom CSS after state is loaded
    applyGlobalCustomCSS(state);
    
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
