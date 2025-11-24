/**
 * CSS Scoping Utility
 * Provides consistent CSS scoping functionality across design and runtime components
 */

/**
 * Validates and fixes CSS syntax by balancing braces
 */
export const validateAndFixCSS = (css) => {
  if (!css.trim()) return '';
  
  let fixedCSS = css;
  
  // Count opening and closing braces
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;
  
  // If there are more opening braces than closing, add missing closing braces
  if (openBraces > closeBraces) {
    const missingBraces = openBraces - closeBraces;
    fixedCSS += '}'.repeat(missingBraces);
  }
  
  return fixedCSS;
};

/**
 * Scopes CSS to a specific selector scope
 * @param {string} css - The CSS to scope
 * @param {string|string[]} scopes - The scope selector(s) to apply
 * @returns {string} - The scoped CSS
 */
export const scopeCSS = (css, scopes) => {
  if (!css.trim()) return '';
  
  // Normalize scopes to array
  const scopeArray = Array.isArray(scopes) ? scopes : [scopes];
  
  // First, validate and fix the CSS
  const fixedCSS = validateAndFixCSS(css);
  
  return fixedCSS.replace(/([^{}]*)\{([^{}]*)\}/g, (fullMatch, selector, props) => {
    const cleanSelector = selector.trim();
    const cleanProps = props.trim();
    
    if (!cleanSelector) return fullMatch;
    
    // Check if already scoped to any of the provided scopes
    const alreadyScoped = scopeArray.some(scope => cleanSelector.includes(scope));
    if (alreadyScoped) {
      return fullMatch;
    }
    
    // Handle comma-separated selectors (e.g., "p, div, span")
    const selectors = cleanSelector.split(',').map(s => s.trim()).filter(s => s);
    
    // Apply all scopes to each selector
    const scopedSelectors = selectors.flatMap(individualSelector => 
      scopeArray.map(scope => `${scope} ${individualSelector}`)
    );
    
    return `${scopedSelectors.join(', ')} { ${cleanProps} }`;
  });
};

/**
 * Creates and applies CSS to the document head
 * @param {string} styleId - Unique ID for the style element
 * @param {string} css - The CSS content to apply
 * @param {Object} attributes - Additional attributes for the style element
 */
export const applyCSS = (styleId, css, attributes = {}) => {
  // Remove existing style element
  const existingElement = document.getElementById(styleId);
  if (existingElement) {
    document.head.removeChild(existingElement);
  }
  
  if (css?.trim()) {
    // Create and apply new style element
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.type = 'text/css';
    styleElement.textContent = css;
    
    // Add any additional attributes
    Object.entries(attributes).forEach(([key, value]) => {
      styleElement.setAttribute(key, value);
    });
    
    document.head.appendChild(styleElement);
  }
};

/**
 * Removes CSS from the document head
 * @param {string} styleId - ID of the style element to remove
 */
export const removeCSS = (styleId) => {
  const existingElement = document.getElementById(styleId);
  if (existingElement) {
    document.head.removeChild(existingElement);
  }
};

/**
 * Complete CSS management for questions
 * @param {string} questionCode - The question code
 * @param {string} customCSS - The custom CSS to apply
 */
export const applyQuestionCSS = (questionCode, customCSS) => {
  const styleId = `question-css-${questionCode}`;
  const scope = `.question-${questionCode}`;
  
  if (customCSS?.trim()) {
    const scopedCSS = scopeCSS(customCSS, scope);
    applyCSS(styleId, scopedCSS, {
      'data-source': 'question-css',
      'data-code': questionCode
    });
  } else {
    removeCSS(styleId);
  }
};

/**
 * Complete CSS management for survey-level CSS
 * @param {string} surveyCSS - The survey CSS to apply
 * @param {string} mode - The mode ('design' or 'preview')
 */
export const applySurveyCSS = (surveyCSS, mode = 'design') => {
  const styleId = mode === 'design' ? 'survey-design-css' : 'survey-preview-css';
  
  // Different scopes for different modes
  const scopes = mode === 'design' 
    ? ['.content-panel', '.muiltr-uwwqev']
    : ['.survey-container', '.content-panel', '.muiltr-uwwqev'];
  
  if (surveyCSS?.trim()) {
    const scopedCSS = scopeCSS(surveyCSS, scopes);
    applyCSS(styleId, scopedCSS, {
      'data-source': `${mode}-survey-css`
    });
  } else {
    removeCSS(styleId);
  }
};