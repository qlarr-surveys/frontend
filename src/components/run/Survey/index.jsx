import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTheme } from "@mui/material";
import { FORM_ID } from "~/constants/run";
import Group from "~/components/Group";
import Navigation from "~/components/run/Navigation";
import styles from "./Survey.module.css";
import { shallowEqual, useSelector } from "react-redux";
import { TouchBackend } from "react-dnd-touch-backend";
import { isTouchDevice } from "~/utils/isTouchDevice";
function Survey() {
  const theme = useTheme();

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);

  const lang = useSelector((state) => {
    return state.runState.data?.lang;
  }, shallowEqual);

  // Apply survey-level custom CSS in preview mode
  useEffect(() => {
    const surveyCSS = survey?.theme?.customCSS;
    
    if (surveyCSS?.trim()) {
      const styleId = 'survey-preview-css';
      
      // Remove existing style element
      const existingElement = document.getElementById(styleId);
      if (existingElement) {
        document.head.removeChild(existingElement);
      }
      
      // Scope CSS function - use same scoping as design mode for consistency
      const scopeCSS = (css) => {
        return css.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
          const cleanSelector = selector.trim();
          const cleanProps = props.trim();
          
          if (!cleanSelector) return fullMatch;
          
          // Check if already scoped
          if (cleanSelector.includes('.survey-container') || 
              cleanSelector.includes('.content-panel') ||
              cleanSelector.includes('.muiltr-uwwqev')) {
            return fullMatch;
          }
          
          // Handle comma-separated selectors
          const selectors = cleanSelector.split(',').map(s => s.trim()).filter(s => s);
          const scopedSelectors = selectors.map(individualSelector => 
            `.survey-container ${individualSelector}, .content-panel ${individualSelector}, .muiltr-uwwqev ${individualSelector}`
          );
          
          return `${scopedSelectors.join(', ')} { ${cleanProps} }`;
        });
      };
      
      // Create and apply scoped CSS
      const scopedCSS = scopeCSS(surveyCSS);
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.type = 'text/css';
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
    } else {
      // Remove CSS if none exists
      const existingElement = document.getElementById('survey-preview-css');
      if (existingElement) {
        document.head.removeChild(existingElement);
      }
    }
  }, [survey?.theme?.customCSS]);


  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <form
        id={FORM_ID}
        className="survey-container"
        style={{
          fontFamily: theme.textStyles.text.font,
          color: theme.textStyles.text.color,
          fontSize: theme.textStyles.text.size,
          marginTop: "4rem",
        }}
      >
        <div className={styles.surveyGroups}>
          {survey && survey.groups
            ? survey.groups
                .filter((group) => group.inCurrentNavigation)
                .map((group, index) => (
                  <div
                    key={group.code}
                    id={`group-${index}`}
                    data-index={index}
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
