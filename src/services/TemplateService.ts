import nunjucks from 'nunjucks';
import DOMPurify from 'dompurify';
import type { 
  ValidationResult, 
  TemplateContext, 
  TemplateRenderOptions, 
  TemplateError, 
  ITemplateService,
  QuestionData,
  ResponseData 
} from '~/types/template';

/**
 * Custom error class for template-related errors
 */
class TemplateErrorImpl extends Error implements TemplateError {
  public readonly line?: number;
  public readonly column?: number;
  public readonly templateName?: string;

  constructor(message: string, line?: number, column?: number, templateName?: string) {
    super(message);
    this.name = 'TemplateError';
    this.line = line;
    this.column = column;
    this.templateName = templateName;
  }
}

/**
 * Enterprise-grade template service for the Qlarr Survey System
 * Provides secure Nunjucks-based templating with HTML sanitization
 */
class SurveyTemplateService implements ITemplateService {
  private static instance: SurveyTemplateService;
  private readonly env: nunjucks.Environment;
  private readonly templateCache = new Map<string, nunjucks.Template>();
  
  // Default sanitization configuration
  private static readonly DEFAULT_SANITIZE_OPTIONS: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  };

  // Patterns that should trigger security warnings
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/i,
    /data:.*base64/i,
    /on\w+\s*=/i,
    /<script/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];

  private constructor() {
    // Configure nunjucks environment with security settings
    this.env = nunjucks.configure({ 
      autoescape: true, // Enable autoescape for security
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true
    });
    
    // Add survey-specific filters
    this.addSurveyFilters();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SurveyTemplateService {
    if (!SurveyTemplateService.instance) {
      SurveyTemplateService.instance = new SurveyTemplateService();
    }
    return SurveyTemplateService.instance;
  }
  
  /**
   * Add survey-specific Nunjucks filters
   */
  private addSurveyFilters(): void {
    // Get question value (raw answer)
    this.env.addFilter('q_value', (questionCode: string, responses: Record<string, ResponseData>) => {
      if (!responses || !questionCode) return '';
      const response = responses[questionCode];
      return response?.value ?? '';
    });
    
    // Get question label (formatted display value)
    this.env.addFilter('q_label', (questionCode: string, responses: Record<string, ResponseData>) => {
      if (!responses || !questionCode) return '';
      const response = responses[questionCode];
      return response?.masked_value ?? response?.value ?? '';
    });
    
    // Get choice label from value
    this.env.addFilter('choice_label', (value: unknown, choices: Array<{value: unknown, label: string}>) => {
      if (!choices || !Array.isArray(choices)) return String(value ?? '');
      const choice = choices.find(c => c.value === value);
      return choice?.label ?? String(value ?? '');
    });
    
    // Format for display (adds default empty string handling)
    this.env.addFilter('display', (value: unknown, defaultValue: string = '') => {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      return String(value);
    });
    
    // Safe HTML rendering with sanitization
    this.env.addFilter('safe_html', (value: string, options?: DOMPurify.Config) => {
      if (!value) return '';
      const sanitized = this.sanitizeHtml(value, options);
      return new nunjucks.runtime.SafeString(sanitized);
    });

    // Date formatting filter
    this.env.addFilter('date_format', (value: string | Date) => {
      if (!value) return '';
      try {
        const date = typeof value === 'string' ? new Date(value) : value;
        return date.toLocaleDateString();
      } catch {
        return String(value);
      }
    });

    // Number formatting filter
    this.env.addFilter('number_format', (value: number | string, decimals: number = 2) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(num) ? String(value) : num.toFixed(decimals);
    });
  }
  
  /**
   * Render a template with given context
   */
  public render(template: string, context: Partial<TemplateContext> = {}, options: TemplateRenderOptions = {}): string {
    try {
      if (!template) return '';
      
      // Validate template if requested (skip for cached templates)
      if (options.validate !== false && !this.templateCache.has(template)) {
        const validation = this.validate(template);
        if (!validation.valid) {
          throw new TemplateErrorImpl(
            `Template validation failed: ${validation.error}`,
            validation.line,
            validation.column
          );
        }
      }

      // Check for dangerous patterns (skip for cached templates)
      if (options.checkSecurity !== false && !this.templateCache.has(template)) {
        this.checkSecurityPatterns(template);
      }
      
      // Get or create compiled template
      let compiledTemplate = this.templateCache.get(template);
      if (!compiledTemplate) {
        try {
          compiledTemplate = nunjucks.compile(template, this.env);
          this.templateCache.set(template, compiledTemplate);
          this.maintainCacheSize(); // Manage cache size
        } catch (compileError) {
          const errorMessage = compileError instanceof Error ? compileError.message : String(compileError);
          throw new TemplateErrorImpl(`Template compilation failed: ${errorMessage}`);
        }
      }
      
      // Enhance context with case-insensitive access for question codes
      const enhancedContext = this.enhanceContextWithCaseInsensitiveAccess(context);
      
      // Render using compiled template
      let result = compiledTemplate.render(enhancedContext);

      // Sanitize HTML output if requested
      if (options.sanitizeHtml !== false) {
        result = this.sanitizeHtml(result, options.sanitizeOptions);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const templateError = error instanceof TemplateErrorImpl ? error : 
        new TemplateErrorImpl(`Template rendering error: ${errorMessage}`);
      
      if (options.throwOnError) {
        throw templateError;
      }

      console.warn('Template rendering error:', templateError);
      return options.errorPlaceholder ?? `[Template Error: ${templateError.message}]`;
    }
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  public sanitizeHtml(html: string, options?: DOMPurify.Config): string {
    if (!html) return '';
    
    const config = {
      ...SurveyTemplateService.DEFAULT_SANITIZE_OPTIONS,
      ...options
    };

    return DOMPurify.sanitize(html, config);
  }

  /**
   * Check for dangerous patterns in template
   */
  private checkSecurityPatterns(template: string): void {
    for (const pattern of SurveyTemplateService.DANGEROUS_PATTERNS) {
      if (pattern.test(template)) {
        throw new TemplateErrorImpl(
          `Template contains potentially dangerous pattern: ${pattern.toString()}`
        );
      }
    }
  }
  
  /**
   * Enhance context to provide case-insensitive access to question variables
   * Creates explicit case variants for compatibility with Nunjucks
   */
  private enhanceContextWithCaseInsensitiveAccess(context: Partial<TemplateContext>): Partial<TemplateContext> {
    const enhancedContext = { ...context };
    
    // Find question properties and add case variations
    Object.keys(context).forEach(key => {
      // Skip built-in context properties
      if (['responses', 'questions', 'current', 'user', 'survey', 'lang', 'timestamp', 'question_count', 'answered_count'].includes(key)) {
        return;
      }
      
      const value = (context as any)[key];
      
      // If this looks like a question code and has response data structure
      if (key.match(/^[QG]/i) && value && typeof value === 'object' && 
          'value' in value && value.value !== undefined) {
        
        // Only add case variations if they don't already exist to avoid conflicts
        const lowerKey = key.toLowerCase();
        const upperKey = key.toUpperCase();
        
        if (!(lowerKey in enhancedContext)) {
          enhancedContext[lowerKey] = value;
        }
        if (!(upperKey in enhancedContext)) {
          enhancedContext[upperKey] = value;
        }
      }
    });
    
    return enhancedContext;
  }
  
  /**
   * Validate template syntax
   */
  public validate(template: string): ValidationResult {
    try {
      if (!template) return { valid: true };
      
      // Try to compile the template with empty context
      this.env.renderString(template, {});
      return { valid: true };
    } catch (error: any) {
      return { 
        valid: false, 
        error: error.message || 'Unknown template error',
        line: error.lineno,
        column: error.colno
      };
    }
  }
  
  /**
   * Extract variable references from template
   */
  public extractReferences(template: string): string[] {
    const references: string[] = [];
    
    try {
      // Parse template to extract variable references
      const variableRegex = /\{\{\s*([^}|]+)(?:\|[^}]*)?\s*\}\}/g;
      let match;
      
      while ((match = variableRegex.exec(template)) !== null) {
        const variable = match[1].trim();
        if (variable && !references.includes(variable)) {
          references.push(variable);
        }
      }
      
      return references;
    } catch (error) {
      console.warn('Error extracting references:', error);
      return [];
    }
  }
  
  /**
   * Check if template has any dynamic content
   */
  public hasTemplateContent(template: string): boolean {
    if (!template) return false;
    
    // Check for Nunjucks syntax
    return /\{\{|\{%|\{#/.test(template);
  }

  /**
   * Get available filters for documentation/IDE support
   */
  public getAvailableFilters(): string[] {
    return [
      'q_value',
      'q_label', 
      'choice_label',
      'display',
      'safe_html',
      'date_format',
      'number_format'
    ];
  }

  /**
   * Create template context from survey state (helper method)
   */
  public createContext(
    responses: Record<string, ResponseData> = {},
    questions: Record<string, QuestionData> = {},
    metadata: Partial<TemplateContext> = {}
  ): TemplateContext {
    const now = new Date();
    
    return {
      responses,
      questions,
      current: metadata.current ?? {
        code: '',
        type: 'text',
        title: '',
        description: '',
        order: 0,
        question_index: 0
      },
      user: metadata.user ?? {},
      survey: metadata.survey ?? {},
      lang: metadata.lang ?? 'en',
      timestamp: now.toISOString(),
      question_count: Object.keys(questions).length,
      answered_count: Object.keys(responses).length,
      ...responses, // Add direct access to question responses
      ...metadata
    };
  }

  /**
   * Clear template cache (useful for memory management)
   */
  public clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.templateCache.size,
      maxSize: 100 // Could be configurable
    };
  }

  /**
   * Clear old cache entries if limit exceeded (LRU-style cleanup)
   */
  private maintainCacheSize(): void {
    const MAX_CACHE_SIZE = 100;
    if (this.templateCache.size > MAX_CACHE_SIZE) {
      // Simple cleanup - remove first 20 entries
      const entries = Array.from(this.templateCache.keys());
      for (let i = 0; i < 20 && entries.length > 0; i++) {
        this.templateCache.delete(entries[i]);
      }
    }
  }
}

// Export singleton instance
export const templateService = SurveyTemplateService.getInstance();
export default templateService;

// Re-export types for convenience
export type { 
  ValidationResult, 
  TemplateContext, 
  TemplateRenderOptions, 
  TemplateError, 
  ITemplateService,
  QuestionData,
  ResponseData
} from '~/types/template';