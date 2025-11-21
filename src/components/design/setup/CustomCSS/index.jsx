import React, { useState, useEffect, useCallback } from "react";
import { 
  Typography, 
  TextField, 
  Box
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { updateInstruction, updateRootNode, changeAttribute } from "../../../../state/design/designState";
import { useService } from "../../../../hooks/use-service";
import { manageStore } from "../../../../store";

function CustomCSS({ code }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const designService = useService("design");
  
  console.log('[CSS] CustomCSS component mounted with code:', code);
  console.log('[CSS] Component mount - current URL:', window.location.href);
  console.log('[CSS] Component mount - performance navigation type:', performance.navigation?.type);
  console.log('[CSS] Component mount - is page refresh?:', performance.navigation?.type === 1);
  
  // Get current custom CSS (Survey-level or question-level)
  const currentCSS = useSelector((state) => {
    const isQuestionLevel = code !== "Survey";
    console.log('[CSS] Redux state check for CSS persistence:');
    console.log('Component code:', code);
    console.log('Is question level CSS:', isQuestionLevel);
    
    if (isQuestionLevel) {
      // Question-level CSS stored as customCSS node in question object
      const questionState = state.designState?.[code];
      console.log('Question state:', questionState);
      const css = questionState?.customCSS || "";
      console.log('Question CSS:', css);
      return css;
    } else {
      // Survey-level CSS stored in Survey.theme.customCSS
      const surveyTheme = state.designState?.Survey?.theme;
      console.log('Survey theme:', surveyTheme);
      const css = surveyTheme?.customCSS || "";
      console.log('Survey CSS:', css);
      return css;
    }
  });

  const [cssValue, setCssValue] = useState(currentCSS);

  // Update local state when Redux state changes
  useEffect(() => {
    setCssValue(currentCSS);
  }, [currentCSS]);

  // Apply existing CSS on component mount (when navigating back to theme page or page refresh)
  useEffect(() => {
    console.log('[CSS] CSS Restoration Effect Triggered');
    console.log('[CSS] Trigger reason - currentCSS changed to:', currentCSS);
    console.log('[CSS] CSS length:', currentCSS.length);
    console.log('[CSS] CSS trimmed length:', currentCSS.trim().length);
    console.log('[CSS] Component code:', code);
    console.log('[CSS] Is page refresh?:', performance.navigation?.type === 1);
    
    if (currentCSS.trim()) {
      console.log('[CSS] Found existing CSS in Redux, applying...');
      console.log('[CSS] CSS content preview:', currentCSS.substring(0, 100) + '...');
      
      const persistentStyleId = `survey-custom-css-persistent-${code}`;
      console.log('[CSS] Persistent style ID:', persistentStyleId);
      
      // Always recreate persistent CSS on mount to ensure it's applied
      let persistentElement = document.getElementById(persistentStyleId);
      if (persistentElement) {
        console.log('🧹 Removing existing persistent element');
        document.head.removeChild(persistentElement);
      }
      
      // Create fresh persistent CSS from Redux state
      const scopedCSS = scopeCSS(currentCSS);
      console.log('[CSS] Scoped CSS generated:', scopedCSS.substring(0, 150) + '...');
      
      persistentElement = document.createElement('style');
      persistentElement.id = persistentStyleId;
      persistentElement.type = 'text/css';
      persistentElement.setAttribute('data-persistent', 'true');
      persistentElement.setAttribute('data-source', 'redux-restore');
      persistentElement.setAttribute('data-timestamp', new Date().toISOString());
      persistentElement.textContent = scopedCSS;
      document.head.appendChild(persistentElement);
      
      // Verify element was added
      const verifyElement = document.getElementById(persistentStyleId);
      console.log('[CSS] Persistent CSS element added to DOM:', !!verifyElement);
      console.log('[CSS] Element content length:', verifyElement?.textContent?.length || 0);
      
      console.log('[CSS] Persistent CSS restored from Redux on mount');
    } else {
      console.log('[CSS] No existing CSS found in Redux');
      console.log('[CSS] This could mean:');
      console.log('   - CSS was never saved');
      console.log('   - Backend didn\'t return the CSS');
      console.log('   - Redux state wasn\'t restored from backend');
    }
  }, [currentCSS]); // Depend on currentCSS so it updates when Redux state changes

  // Get the full design state for backend saving
  const designState = useSelector((state) => state.designState);

  // Auto-save function - saves to Redux AND triggers backend save
  const autoSave = async () => {
    console.log('[CSS] Auto-save triggered!');
    console.log('CSS Value:', cssValue);
    console.log('CSS trimmed:', cssValue.trim());
    console.log('CSS is valid:', isValidCSS(cssValue));
    
    if (cssValue.trim() && isValidCSS(cssValue)) {
      console.log('[CSS] Step 1: Saving CSS to Redux (guaranteed)...');
      
      // Step 1: Update Redux state first - save in Survey.theme.customCSS
      try {
        const isQuestionLevel = code !== "Survey";
        
        if (isQuestionLevel) {
          console.log('Saving question-level CSS:', cssValue);
          
          // Save CSS as customCSS node in question object
          dispatch(changeAttribute({
            code: code,
            key: "customCSS",
            value: cssValue
          }));
          
          console.log('[CSS] Question CSS saved to Redux:', code);
        } else {
          console.log('[CSS] Saving Survey-level CSS:', cssValue);
          
          // Get current theme from Redux state
          const currentDesignState = manageStore.getState().designState;
          const currentTheme = currentDesignState?.Survey?.theme || {};
          console.log('Current theme before update:', currentTheme);
          
          // Create updated theme with customCSS
          const updatedTheme = {
            ...currentTheme,
            customCSS: cssValue
          };
          
          console.log('Updated theme with customCSS:', updatedTheme);
          
          // Use changeAttribute to update Survey theme (same as Theming component)
          dispatch(changeAttribute({
            code: "Survey",
            key: "theme", 
            value: updatedTheme
          }));
          
          console.log('[CSS] Survey CSS saved to Redux');
        }
        
        // Verify the dispatch worked
        setTimeout(() => {
          const freshState = manageStore.getState().designState;
          console.log('[CSS] Redux state after dispatch - custom_css node:', freshState.custom_css);
        }, 50);
        
        console.log('[CSS] CSS saved to Redux successfully - will persist on page refresh');
      } catch (reduxError) {
        console.error('[ERROR] Redux save failed:', reduxError);
        return; // Don't proceed to backend if Redux fails
      }
      
      // Step 2: Attempt backend auto-save (optional - doesn't affect Redux persistence)
      setTimeout(async () => {
        try {
          console.log('[CSS] Step 2: Attempting backend auto-save...');
          
          // Get fresh design state after Redux update
          const currentDesignState = manageStore.getState().designState;
          
          // Create a deep copy to avoid mutation issues
          const updatedState = JSON.parse(JSON.stringify(currentDesignState || designState));
          
          const isQuestionLevel = code !== "Survey";
          
          if (isQuestionLevel) {
            // Save question-level CSS as customCSS node in question object
            if (!updatedState[code]) {
              updatedState[code] = {};
            }
            updatedState[code].customCSS = cssValue;
            console.log('[CSS] Updated question with customCSS:', code, updatedState[code]);
          } else {
            // Save Survey-level CSS in theme
            if (!updatedState.Survey) {
              updatedState.Survey = {};
            }
            if (!updatedState.Survey.theme) {
              updatedState.Survey.theme = {};
            }
            updatedState.Survey.theme.customCSS = cssValue;
            console.log('[CSS] Updated Survey theme with customCSS:', updatedState.Survey.theme);
          }
          
          // Get version info from current state
          const versionInfo = currentDesignState.versionDto || designState.versionDto;
          const params = new URLSearchParams([
            ["version", versionInfo?.version || 1],
            ["sub_version", versionInfo?.subVersion || 0],
          ]);
          
          // Save to backend with detailed logging
          console.log('[CSS] Saving to backend with params:', params.toString());
          console.log('[CSS] Updated state structure:', {
            keys: Object.keys(updatedState),
            custom_css_exists: !!updatedState.custom_css,
            custom_css_content: updatedState.custom_css
          });
          
          const backendResponse = await designService.setSurveyDesign(updatedState, params);
          console.log('[CSS] Backend auto-save successful!');
          console.log('[CSS] Backend response structure:', {
            hasDesignerInput: !!backendResponse?.designerInput,
            hasState: !!backendResponse?.designerInput?.state,
            stateKeys: Object.keys(backendResponse?.designerInput?.state || {}),
            hasCustomCSS: !!backendResponse?.designerInput?.state?.custom_css
          });
          console.log('[CSS] Full backend response:', backendResponse);
          
          // Verify the save by checking if we can read it back
          setTimeout(async () => {
            try {
              console.log('[CSS] Verifying backend save by fetching design state...');
              const verificationState = await designService.getSurveyDesign();
              const isQuestionLevel = code !== "Survey";
              let savedCSS;
              
              if (isQuestionLevel) {
                const questionState = verificationState?.designerInput?.state?.[code];
                savedCSS = questionState?.customCSS;
                console.log('[CSS] Verification - Question state exists:', !!questionState);
                console.log('[CSS] Verification - Question CSS exists:', !!savedCSS);
                console.log('[CSS] Verification - Question state:', questionState);
              } else {
                const savedTheme = verificationState?.designerInput?.state?.Survey?.theme;
                savedCSS = savedTheme?.customCSS;
                console.log('[CSS] Verification - Survey theme exists:', !!savedTheme);
                console.log('[CSS] Verification - CSS exists in theme:', !!savedCSS);
                console.log('[CSS] Verification - Full theme:', savedTheme);
              }
              
              console.log('[CSS] Verification - Saved CSS content:', savedCSS);
              
              if (!savedCSS || savedCSS !== cssValue) {
                console.error('[ERROR] Backend save verification failed!');
                console.error('[ERROR] Expected CSS:', cssValue);
                console.error('[ERROR] Actual CSS in backend:', savedCSS);
              } else {
                console.log('[CSS] Backend save verification successful!');
              }
            } catch (verifyError) {
              console.error('[ERROR] Backend save verification error:', verifyError);
            }
          }, 1000);
          
        } catch (backendError) {
          console.error('[ERROR] Backend auto-save failed, but CSS is still saved in Redux:', backendError);
          console.log('💡 CSS will be restored from Redux on page refresh');
        }
      }, 200);
      
    } else {
      console.log('[CSS] CSS not saved - invalid or empty');
      if (!cssValue.trim()) {
        console.log('Reason: Empty CSS');
      }
      if (!isValidCSS(cssValue)) {
        console.log('Reason: Invalid CSS (unbalanced braces or no rules)');
      }
    }
  };

  // CSS validation function
  const isValidCSS = (css) => {
    try {
      console.log('🔍 Validating CSS:', css);
      // Check if braces are balanced
      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;
      
      console.log('Open braces:', openBraces);
      console.log('Close braces:', closeBraces);
      
      // Must have balanced braces and at least one complete rule
      const isValid = openBraces === closeBraces && openBraces > 0;
      console.log('CSS is valid:', isValid);
      return isValid;
    } catch (error) {
      console.log('CSS validation error:', error);
      return false;
    }
  };

  // Function to scope CSS appropriately (Survey-wide or question-specific)
  const scopeCSS = (css) => {
    const isQuestionLevel = code !== "Survey";
    console.log('==========================================');
    console.log('scopeCSS called with:', JSON.stringify(css));
    console.log('CSS length:', css.length);
    console.log('CSS trimmed:', css.trim());
    console.log('Component code:', code);
    console.log('Is question level:', isQuestionLevel);
    
    if (!css.trim()) {
      console.log('Empty CSS, returning empty string');
      return '';
    }
    
    // Test the regex with your exact input
    const regex = /([^{}]*)\{([^{}]*)\}/g;
    console.log('Testing regex:', regex);
    
    let matches = [];
    let match;
    while ((match = regex.exec(css)) !== null) {
      matches.push(match);
      console.log('Regex match found:', match);
    }
    console.log('Total matches found:', matches.length);
    
    // Reset regex for actual replacement
    const result = css.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
      console.log('Processing match:', fullMatch);
      console.log('Raw selector:', JSON.stringify(selector));
      console.log('Raw props:', JSON.stringify(props));
      
      const cleanSelector = selector.trim();
      const cleanProps = props.trim();
      
      console.log('Clean selector:', JSON.stringify(cleanSelector));
      console.log('Clean props:', JSON.stringify(cleanProps));
      
      // Check if already scoped
      const alreadyScoped = cleanSelector.includes('.content-panel') || 
                           cleanSelector.includes('.muiltr-uwwqev') ||
                           cleanSelector.includes(`[data-code="${code}"]`) ||
                           cleanSelector.includes(`.question-${code}`);
      
      if (alreadyScoped) {
        console.log('Already scoped, returning as-is');
        return fullMatch;
      }
      
      let scoped;
      if (isQuestionLevel) {
        // Question-level CSS: scope to specific question container
        scoped = `[data-code="${code}"] ${cleanSelector}, .question-${code} ${cleanSelector} { ${cleanProps} }`;
        console.log('Question-scoped result:', scoped);
      } else {
        // Survey-level CSS: scope to survey containers
        scoped = `.content-panel ${cleanSelector}, .muiltr-uwwqev ${cleanSelector} { ${cleanProps} }`;
        console.log('Survey-scoped result:', scoped);
      }
      
      return scoped;
    });
    
    console.log('Final CSS result:', result);
    console.log('==========================================');
    return result;
  };

  // Inject CSS into document head (live preview) - persists across navigation
  useEffect(() => {
    const isQuestionLevel = code !== "Survey";
    console.log('[CSS] CSS EFFECT STARTING');
    console.log('cssValue:', JSON.stringify(cssValue));
    console.log('code:', code);
    console.log('isQuestionLevel:', isQuestionLevel);
    
    const styleId = `survey-custom-css-${code}`;
    const persistentStyleId = `survey-custom-css-persistent-${code}`;
    console.log('Style ID will be:', styleId);
    console.log('Persistent Style ID will be:', persistentStyleId);
    
    // Remove existing temporary style element
    const existingElement = document.getElementById(styleId);
    console.log('Existing element found:', existingElement);
    if (existingElement) {
      console.log('Removing existing element');
      document.head.removeChild(existingElement);
    }

    if (cssValue.trim()) {
      console.log('CSS is not empty, processing...');
      
      // Create new style element
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.type = 'text/css';
      
      // Scope and apply CSS
      const scopedCSS = scopeCSS(cssValue);
      console.log('Scoped CSS result:', JSON.stringify(scopedCSS));
      
      styleElement.textContent = scopedCSS;
      document.head.appendChild(styleElement);
      
      // Also create/update persistent style element that won't be removed on unmount
      let persistentElement = document.getElementById(persistentStyleId);
      if (persistentElement) {
        document.head.removeChild(persistentElement);
      }
      
      persistentElement = document.createElement('style');
      persistentElement.id = persistentStyleId;
      persistentElement.type = 'text/css';
      persistentElement.setAttribute('data-persistent', 'true');
      persistentElement.textContent = scopedCSS;
      document.head.appendChild(persistentElement);
      
      console.log('Created persistent CSS element for cross-page navigation');
      
      // Verify it's in the DOM
      const verifyElement = document.getElementById(styleId);
      console.log('Element added to DOM:', verifyElement);
      console.log('Element content:', verifyElement?.textContent);
      
      // Check if content-panel or muiltr-uwwqev exists
      const contentPanel = document.querySelector('.content-panel');
      const muiBoxRoot = document.querySelector('.muiltr-uwwqev');
      console.log('Content panel exists:', !!contentPanel);
      console.log('muiltr-uwwqev exists:', !!muiBoxRoot);
      console.log('Content panel element:', contentPanel);
      console.log('muiltr-uwwqev element:', muiBoxRoot);
      
      // Debug: Look for any survey-related elements
      const allSurveyElements = document.querySelectorAll('[class*="survey"], [id*="survey"], form');
      console.log('Survey-related elements found:', allSurveyElements.length);
      console.log('Survey-related elements:', allSurveyElements);
      
      // Look for design preview area or other containers
      const previewArea = document.querySelector('[class*="preview"]') || 
                         document.querySelector('[class*="Preview"]') ||
                         document.querySelector('[class*="design"]') ||
                         document.querySelector('[class*="Design"]');
      console.log('Preview/Design area found:', !!previewArea);
      console.log('Preview/Design area element:', previewArea);
      
      // Check current page URL/path to understand context
      console.log('Current URL:', window.location.href);
      console.log('Current pathname:', window.location.pathname);
      
      // Try to find the actual preview container or add CSS that works in design mode too
      // Add fallback CSS that works without .content-panel or .muiltr-uwwqev for design preview
      if (!contentPanel && !muiBoxRoot && cssValue.trim()) {
        console.log('Adding fallback CSS for design mode...');
        
        // Create additional CSS that works in design preview without .survey-container
        const fallbackCSS = cssValue.replace(/([^{}]*)\{([^{}]*)\}/g, (match, selector, props) => {
          const cleanSelector = selector.trim();
          const cleanProps = props.trim();
          return `${cleanSelector} { ${cleanProps} }`;
        });
        
        console.log('Fallback CSS:', fallbackCSS);
        
        // Add fallback style element for design mode
        const fallbackStyleId = `survey-fallback-css-${code}`;
        let fallbackStyleElement = document.getElementById(fallbackStyleId);
        
        if (fallbackStyleElement) {
          document.head.removeChild(fallbackStyleElement);
        }
        
        fallbackStyleElement = document.createElement('style');
        fallbackStyleElement.id = fallbackStyleId;
        fallbackStyleElement.type = 'text/css';
        fallbackStyleElement.textContent = fallbackCSS;
        document.head.appendChild(fallbackStyleElement);
        
        console.log('Fallback CSS injected for design mode');
      }
      
      // Check for preview iframe (design mode might have survey in iframe)
      const previewIframe = document.querySelector('iframe');
      console.log('Preview iframe found:', !!previewIframe);
      
      if (previewIframe) {
        try {
          const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
          const iframeContentPanel = iframeDoc.querySelector('.content-panel');
          const iframeMuiBoxRoot = iframeDoc.querySelector('.muiltr-uwwqev');
          console.log('Content panel in iframe:', !!iframeContentPanel);
          console.log('muiltr-uwwqev in iframe:', !!iframeMuiBoxRoot);
          
          if (iframeContentPanel || iframeMuiBoxRoot) {
            // Inject CSS into iframe
            let iframeStyleElement = iframeDoc.getElementById(styleId);
            if (iframeStyleElement) {
              iframeDoc.head.removeChild(iframeStyleElement);
            }
            
            iframeStyleElement = iframeDoc.createElement('style');
            iframeStyleElement.id = styleId;
            iframeStyleElement.type = 'text/css';
            iframeStyleElement.textContent = scopedCSS;
            iframeDoc.head.appendChild(iframeStyleElement);
            
            console.log('CSS injected into iframe!');
          }
        } catch (e) {
          console.log('Cannot access iframe (cross-origin):', e.message);
        }
      }
      
      // Check if our CSS rule would match any elements
      if (scopedCSS.includes('.content-panel p') || scopedCSS.includes('.muiltr-uwwqev p')) {
        const contentPanelPs = document.querySelectorAll('.content-panel p');
        const muiBoxPs = document.querySelectorAll('.muiltr-uwwqev p');
        console.log('Matching <p> in content-panel:', contentPanelPs.length);
        console.log('Matching <p> in muiltr-uwwqev:', muiBoxPs.length);
        console.log('Content panel elements:', contentPanelPs);
        console.log('muiltr-uwwqev elements:', muiBoxPs);
      }
    } else {
      console.log('CSS is empty, skipping');
    }

    console.log('[CSS] CSS EFFECT COMPLETE');

    // Cleanup on unmount - only remove temporary elements, keep persistent ones
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        document.head.removeChild(element);
      }
      
      // Also cleanup fallback CSS
      const fallbackElement = document.getElementById(`survey-fallback-css-${code}`);
      if (fallbackElement) {
        document.head.removeChild(fallbackElement);
      }
      
      // Note: We DON'T remove the persistent element here so CSS works across pages
    };
  }, [cssValue, code]);

  const handleCSSChange = (event) => {
    const newCSS = event.target.value;
    setCssValue(newCSS);
    // Auto-save will be handled by the debounced useEffect above
  };

  // Handle tab key for proper indentation
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert 2 spaces for tab
      const newValue = cssValue.substring(0, start) + '  ' + cssValue.substring(end);
      setCssValue(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      
      // Update Redux with the new value
      const isQuestionLevel = code !== "Survey";
      
      if (isQuestionLevel) {
        // Question-level CSS
        dispatch(changeAttribute({
          code: code,
          key: "customCSS",
          value: newValue
        }));
      } else {
        // Survey-level CSS in theme
        const currentState = manageStore.getState().designState;
        const currentTheme = currentState?.Survey?.theme || {};
        
        const updatedTheme = {
          ...currentTheme,
          customCSS: newValue
        };
        
        dispatch(changeAttribute({
          code: "Survey",
          key: "theme",
          value: updatedTheme
        }));
      }
    }
  };




  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {t("Custom CSS")}
      </Typography>
      



      
      <TextField
        fullWidth
        multiline
        minRows={4}
        maxRows={25}
        value={cssValue}
        onChange={handleCSSChange}
        onKeyDown={handleKeyDown}
        onBlur={autoSave}
        placeholder={`/* Enter your CSS code here... */
.button {
  background-color: #007bff;
  color: white;
  border-radius: 4px;
}

p {
  font-size: 16px;
  line-height: 1.5;
}`}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiInputBase-root': {
            fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", "Courier New", monospace',
            fontSize: '14px',
            lineHeight: 1.6,
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '12px',
          },
          '& .MuiInputBase-input': {
            padding: '0 !important',
            color: '#212529',
            '&::placeholder': {
              color: '#6c757d',
              fontSize: '13px',
              lineHeight: 1.5,
              fontStyle: 'italic',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '2px solid #007bff',
            borderRadius: '8px',
          },
          '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #adb5bd',
          },
        }}
      />
      

    </Box>
  );
}

export default CustomCSS;