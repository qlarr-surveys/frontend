/**
 * TypeScript definitions for the Qlarr template system
 */

// Core question types
export type QuestionType = 
  | 'text' 
  | 'paragraph' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'time' 
  | 'datetime'
  | 'scq' 
  | 'mcq' 
  | 'iconscq' 
  | 'iconmcq' 
  | 'imagescq' 
  | 'imagemcq'
  | 'nps' 
  | 'ranking' 
  | 'barcode' 
  | 'signature' 
  | 'photo' 
  | 'video' 
  | 'file'
  | 'group'
  | 'unknown';

// Template validation results
export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly line?: number;
  readonly column?: number;
}

// Question value from survey responses
export interface QuestionValue {
  readonly value: string | number | string[] | boolean | null;
  readonly masked_value?: string;
  readonly timestamp?: string;
  readonly relevance?: boolean;
  readonly validity?: boolean;
  readonly is_answered?: boolean;
}

// Choice option for MCQ/SCQ questions
export interface ChoiceOption {
  readonly value: string | number;
  readonly label: string;
  readonly code?: string;
}

// Question metadata from design state
export interface QuestionData {
  readonly type: QuestionType;
  readonly content?: {
    readonly [lang: string]: {
      readonly title?: string;
      readonly description?: string;
    };
  };
  readonly choices?: readonly ChoiceOption[];
  readonly required?: boolean;
  readonly validation?: Record<string, unknown>;
  readonly title?: string; // Legacy support for tests
}

// Processed response data for templates
export interface ResponseData {
  readonly value: string | number | string[] | boolean | null;
  readonly masked_value: string;
  readonly type: QuestionType;
  readonly title: string;
  readonly description: string;
  readonly choices: readonly ChoiceOption[];
  readonly selected_choices: readonly ChoiceOption[];
  readonly is_answered: boolean;
  readonly answer_timestamp: string | null;
}

// Current question context
export interface CurrentQuestionContext {
  readonly code: string;
  readonly type: QuestionType;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly question_index?: number; // Legacy support for tests
}

// User context data
export interface UserContext {
  readonly id?: string;
  readonly name?: string;
  readonly email?: string;
  readonly [key: string]: unknown;
}

// Survey metadata
export interface SurveyContext {
  readonly title?: string;
  readonly description?: string;
  readonly code?: string;
  readonly [key: string]: unknown;
}

// Complete template context
export interface TemplateContext {
  readonly [questionCode: string]: ResponseData | unknown;
  readonly responses: Record<string, ResponseData>;
  readonly questions: Record<string, QuestionData>;
  readonly current: CurrentQuestionContext;
  readonly user: UserContext;
  readonly survey: SurveyContext;
  readonly lang: string;
  readonly timestamp: string;
  readonly question_count: number;
  readonly answered_count: number;
}

// Runtime state structure
export interface RunState {
  readonly values?: Record<string, QuestionValue>;
  readonly data?: {
    readonly survey?: SurveyContext;
    readonly lang?: string;
    readonly responseId?: string;
  };
  readonly user?: UserContext;
  readonly navigation?: Record<string, unknown>;
}

// Design state structure
export interface DesignState {
  readonly [questionCode: string]: QuestionData | unknown;
  readonly componentIndex?: Record<string, number>;
  readonly langInfo?: {
    readonly lang: string;
    readonly mainLang: string;
    readonly onMainLang: boolean;
  };
  readonly survey?: SurveyContext;
}

// Template rendering options
export interface TemplateRenderOptions {
  readonly sanitize?: boolean;
  readonly sanitizeHtml?: boolean;
  readonly sanitizeOptions?: Record<string, unknown>;
  readonly allowedTags?: readonly string[];
  readonly allowedAttributes?: readonly string[];
  readonly debug?: boolean;
  readonly validate?: boolean;
  readonly checkSecurity?: boolean;
  readonly throwOnError?: boolean;
  readonly errorPlaceholder?: string;
}

// Error context for debugging
export interface TemplateError extends Error {
  readonly template?: string;
  readonly context?: Partial<TemplateContext>;
  readonly lineNumber?: number;
  readonly columnNumber?: number;
}

// Template service interface
export interface ITemplateService {
  render(template: string, context?: Partial<TemplateContext>, options?: TemplateRenderOptions): string;
  validate(template: string): ValidationResult;
  extractReferences(template: string): readonly string[];
  hasTemplateContent(template: string): boolean;
  createContext(responses?: Record<string, ResponseData>, questions?: Record<string, QuestionData>, metadata?: Partial<TemplateContext>): TemplateContext;
  sanitizeHtml(html: string, options?: Record<string, unknown>): string;
  getAvailableFilters(): readonly string[];
}

// Filter function type for Nunjucks
export type TemplateFilter = (value: unknown, ...args: unknown[]) => unknown;

// Template context builder function types
export type ContextBuilder = (
  runState: RunState,
  designState: DesignState,
  currentQuestionCode?: string | null,
  lang?: string
) => TemplateContext;

export type SampleContextBuilder = (
  designState?: DesignState,
  lang?: string
) => TemplateContext;