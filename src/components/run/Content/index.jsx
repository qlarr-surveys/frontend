import React from "react";
import { useSelector } from "react-redux";
import "./content.css";
import { rtlLanguage } from "~/utils/common";
import templateService from "~/services/TemplateService";
import { buildTemplateContext } from "~/utils/templateContext";

function Content(props) {
  // Get full state for template context building
  const runState = useSelector((state) => state.runState);
  // In runtime mode, design data is stored in runState.data.survey
  const designState = useSelector((state) => state.designState || state.runState.data?.survey);

  // Check if content has Nunjucks template format
  const hasNunjucksFormat = props.content && templateService.hasTemplateContent(props.content);

  // Get language info
  const lang = useSelector((state) => {
    return state.runState.values?.["Survey"]?.lang || props.lang || "en";
  });
  const isRtl = rtlLanguage.includes(lang);


  if (!props.content) {
    return "";
  }

  // Handle Nunjucks templates
  if (hasNunjucksFormat) {
    try {
      // Use props if provided, otherwise fall back to useSelector values
      const finalRunState = props.runState || runState;
      const finalDesignState = props.designState || designState;
      // Build template context
      const context = buildTemplateContext(finalRunState, finalDesignState, props.elementCode, lang);
      // Render with Nunjucks
      const processedContent = templateService.render(props.content, context);
      
      return (
        <div
          className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      );
    } catch (error) {
      console.warn('Template rendering error in Content component:', error);
      // Fall back to original content if template rendering fails
    }
  }

  // Simple content without templates
  return (
    <div
      className={`${isRtl ? "rtl" : "ltr"} ql-editor no-padding`}
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
}

export default React.memo(Content);

