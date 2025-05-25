/**
 * Utility functions for building template context from survey state
 */
import type { 
  TemplateContext, 
  ResponseData, 
  QuestionData, 
  RunState as BaseRunState, 
  DesignState as BaseDesignState,
  CurrentQuestionContext,
  QuestionType,
  ChoiceOption
} from '~/types/template';

/**
 * Build template context for Nunjucks rendering from survey state
 */
export const buildTemplateContext = (
  runState: BaseRunState | null,
  designState: BaseDesignState | null,
  currentQuestionCode: string | null = null,
  lang: string = 'en'
): TemplateContext => {
  // Initialize responses and questions collections
  const responses: Record<string, ResponseData> = {};
  const questions: Record<string, QuestionData> = {};
  
  // Build current question context
  const current: CurrentQuestionContext = {
    code: currentQuestionCode || '',
    type: 'text' as QuestionType,
    title: '',
    description: '',
    order: 0
  };
  
  // Build responses object from runState
  if (runState?.values) {
    Object.keys(runState.values).forEach(questionCode => {
      const questionValue = runState.values![questionCode];
      const questionDesign = getQuestionFromDesignState(designState, questionCode);
      
      if (questionValue) {
        const responseData: ResponseData = {
          value: questionValue.value,
          masked_value: questionValue.masked_value || String(questionValue.value || ''),
          type: (questionDesign?.type as QuestionType) || 'text',
          title: getQuestionTitle(questionDesign, lang, questionCode),
          description: getQuestionDescription(questionDesign, lang),
          choices: getQuestionChoices(questionDesign),
          selected_choices: getSelectedChoices(questionValue, questionDesign),
          is_answered: isAnswered(questionValue.value),
          answer_timestamp: questionValue.timestamp || null
        };
        
        responses[questionCode] = responseData;
      }
    });
  }
  
  // Build questions object from designState
  if (designState) {
    const componentIndex = (designState as any).componentIndex || {};
    Object.keys(componentIndex).forEach(questionCode => {
      const questionDesign = getQuestionFromDesignState(designState, questionCode);
      if (questionDesign) {
        questions[questionCode] = {
          type: (questionDesign.type as QuestionType) || 'text',
          content: questionDesign.content || {},
          choices: getQuestionChoices(questionDesign),
          required: questionDesign.required || false
        };
      }
    });
  }
  
  // Update current question context if available
  if (currentQuestionCode) {
    const questionDesign = getQuestionFromDesignState(designState, currentQuestionCode);
    const componentIndex = (designState as any)?.componentIndex || {};
    
    if (questionDesign) {
      (current as any).code = currentQuestionCode;
      (current as any).type = (questionDesign.type as QuestionType) || 'text';
      (current as any).title = getQuestionTitle(questionDesign, lang, currentQuestionCode);
      (current as any).description = getQuestionDescription(questionDesign, lang);
      (current as any).order = componentIndex[currentQuestionCode] || 0;
    }
  }
  
  // Count questions and answered questions
  const question_count = Object.keys(questions).length;
  const answered_count = Object.values(responses).filter(r => r.is_answered).length;
  
  // Build final context
  const context: TemplateContext = {
    responses,
    questions,
    current,
    user: runState?.user || { id: '', name: '', email: '' },
    survey: {
      title: (designState as any)?.survey?.title || '',
      description: (designState as any)?.survey?.description || '',
      ...(designState as any)?.survey
    },
    lang,
    timestamp: new Date().toISOString(),
    question_count,
    answered_count,
    
    // Add direct question access (for legacy templates)
    ...Object.fromEntries(
      Object.entries(responses).map(([code, data]) => [code, data])
    )
  };
  
  return context;
};

/**
 * Build sample context for design-time preview
 */
export const buildSampleContext = (
  designState: BaseDesignState | undefined,
  lang: string = 'en'
): TemplateContext => {
  const responses: Record<string, ResponseData> = {};
  const questions: Record<string, QuestionData> = {};
  
  if (designState) {
    const componentIndex = (designState as any).componentIndex || {};
    Object.keys(componentIndex).forEach(questionCode => {
      const questionDesign = getQuestionFromDesignState(designState, questionCode);
      if (questionDesign) {
        // Generate sample response data
        const sampleValue = generateSampleValue(questionDesign);
        
        const responseData: ResponseData = {
          value: sampleValue,
          masked_value: String(sampleValue),
          type: (questionDesign.type as QuestionType) || 'text',
          title: getQuestionTitle(questionDesign, lang, questionCode),
          description: getQuestionDescription(questionDesign, lang),
          choices: getQuestionChoices(questionDesign),
          selected_choices: getSelectedChoices({ value: sampleValue }, questionDesign),
          is_answered: true,
          answer_timestamp: new Date().toISOString()
        };
        
        responses[questionCode] = responseData;
        
        questions[questionCode] = {
          type: (questionDesign.type as QuestionType) || 'text',
          content: questionDesign.content || {},
          choices: getQuestionChoices(questionDesign),
          required: questionDesign.required || false
        };
      }
    });
  }
  
  const context: TemplateContext = {
    responses,
    questions,
    current: {
      code: '',
      type: 'text',
      title: '',
      description: '',
      order: 0
    },
    user: { id: 'user123', name: 'Sample User', email: 'user@example.com' },
    survey: { title: 'Sample Survey', description: 'Sample description' },
    lang,
    timestamp: new Date().toISOString(),
    question_count: Object.keys(questions).length,
    answered_count: Object.keys(responses).length,
    
    // Add direct question access
    ...Object.fromEntries(
      Object.entries(responses).map(([code, data]) => [code, data])
    )
  };
  
  return context;
};

// Helper functions

function getQuestionFromDesignState(designState: BaseDesignState | null, questionCode: string): any {
  if (!designState) return null;
  return (designState as any)[questionCode];
}

function getQuestionTitle(questionDesign: any, lang: string, fallback: string): string {
  if (!questionDesign?.content) return fallback;
  return questionDesign.content[lang]?.title || 
         questionDesign.content.en?.title || 
         fallback;
}

function getQuestionDescription(questionDesign: any, lang: string): string {
  if (!questionDesign?.content) return '';
  return questionDesign.content[lang]?.description || 
         questionDesign.content.en?.description || 
         '';
}

function getQuestionChoices(questionDesign: any): readonly ChoiceOption[] {
  if (!questionDesign?.choices) return [];
  return questionDesign.choices.map((choice: any) => ({
    value: String(choice.value || choice.id || ''),
    label: String(choice.label || choice.value || ''),
    code: String(choice.code || '')
  }));
}

function getSelectedChoices(valueData: any, questionDesign: any): readonly ChoiceOption[] {
  if (!valueData?.value || !questionDesign?.choices) return [];
  
  const choices = getQuestionChoices(questionDesign);
  const value = valueData.value;
  
  if (Array.isArray(value)) {
    return choices.filter(choice => 
      value.some(v => String(v) === String(choice.value))
    );
  } else {
    return choices.filter(choice => String(choice.value) === String(value));
  }
}

function isAnswered(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function generateSampleValue(questionDesign: any): string | number | boolean | string[] {
  const type = questionDesign?.type || 'text';
  
  switch (type) {
    case 'mcq':
    case 'imagemcq':
    case 'iconmcq':
      if (questionDesign.choices && questionDesign.choices.length > 0) {
        return [String(questionDesign.choices[0].value || questionDesign.choices[0].id || 'option1')];
      }
      return ['option1'];
      
    case 'scq':
    case 'imagescq':
    case 'iconscq':
      if (questionDesign.choices && questionDesign.choices.length > 0) {
        return String(questionDesign.choices[0].value || questionDesign.choices[0].id || 'option1');
      }
      return 'option1';
      
    case 'number':
      return 42;
      
    case 'date':
      return new Date().toISOString().split('T')[0];
      
    case 'datetime':
      return new Date().toISOString();
      
    case 'email':
      return 'user@example.com';
      
    case 'nps':
      return 8;
      
    case 'ranking':
      if (questionDesign.choices && questionDesign.choices.length > 0) {
        return questionDesign.choices.map((choice: any) => 
          String(choice.value || choice.id || 'option')
        );
      }
      return ['option1', 'option2'];
      
    default:
      return 'Sample response';
  }
}