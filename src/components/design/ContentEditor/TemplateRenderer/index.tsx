import { useMemo, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import templateService from '~/services/TemplateService';
import { buildTemplateContext, buildSampleContext } from '~/utils/templateContext';
import type { DesignState, RunState } from '~/types/template';

// Redux root state interface
interface RootState {
  designState?: DesignState;
  runState?: RunState;
}

// Component prop types
interface TemplateRendererProps {
  content?: string | null;
  className?: string;
  useSampleData?: boolean;
  currentQuestionCode?: string | null;
  lang?: string;
}

interface InlineTemplateRendererProps extends TemplateRendererProps {
  fallback?: ReactNode;
}

/**
 * Component for rendering template content with Nunjucks
 * Handles both design-time preview and runtime rendering
 */
function TemplateRenderer({ 
  content, 
  className = '', 
  useSampleData = false,
  currentQuestionCode = null,
  lang = 'en'
}: TemplateRendererProps): JSX.Element {
  const designState = useSelector((state: RootState) => state.designState);
  const runState = useSelector((state: RootState) => state.runState);
  const langInfo = useSelector((state: RootState) => state.designState?.langInfo);
  
  const currentLang = lang || langInfo?.lang || 'en';
  
  const renderedContent = useMemo(() => {
    if (!content) return '';
    
    try {
      // Check if content has template syntax
      if (!templateService.hasTemplateContent(content)) {
        return content;
      }
      
      // Build appropriate context
      const context = useSampleData 
        ? buildSampleContext(designState || undefined, currentLang)
        : buildTemplateContext(runState || null, designState || null, currentQuestionCode, currentLang);
      
      // Render template with security options
      const rendered = templateService.render(content, context as any, {
        sanitize: true,
        checkSecurity: true
      });
      
      return rendered;
    } catch (error) {
      console.warn('Template rendering error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `[Template Error: ${errorMessage}]`;
    }
  }, [content, designState, runState, currentQuestionCode, currentLang, useSampleData]);
  
  return (
    <div 
      className={`template-renderer ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

/**
 * Hook for rendering template strings (without component wrapper)
 */
export function useTemplateRenderer(
  content?: string | null, 
  useSampleData: boolean = false, 
  currentQuestionCode: string | null = null, 
  lang: string = 'en'
): string {
  const designState = useSelector((state: RootState) => state.designState);
  const runState = useSelector((state: RootState) => state.runState);
  const langInfo = useSelector((state: RootState) => state.designState?.langInfo);
  
  const currentLang = lang || langInfo?.lang || 'en';
  
  return useMemo(() => {
    if (!content) return '';
    
    try {
      // Check if content has template syntax
      if (!templateService.hasTemplateContent(content)) {
        return content;
      }
      
      // Build appropriate context
      const context = useSampleData 
        ? buildSampleContext(designState || undefined, currentLang)
        : buildTemplateContext(runState || null, designState || null, currentQuestionCode, currentLang);
      
      // Render template with security options
      return templateService.render(content, context as any, {
        sanitize: true,
        checkSecurity: true
      });
    } catch (error) {
      console.warn('Template rendering error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `[Template Error: ${errorMessage}]`;
    }
  }, [content, designState, runState, currentQuestionCode, currentLang, useSampleData]);
}

/**
 * Component for inline template rendering (preserves existing styling)
 */
export function InlineTemplateRenderer({ 
  content, 
  className = '', 
  useSampleData = false,
  currentQuestionCode = null,
  lang = 'en',
  fallback = null
}: InlineTemplateRendererProps): JSX.Element {
  const renderedContent = useTemplateRenderer(content, useSampleData, currentQuestionCode, lang);
  
  if (!content && fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <span 
      className={`inline-template-renderer ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

export default TemplateRenderer;