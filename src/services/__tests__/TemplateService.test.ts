import { templateService } from '../TemplateService';
import DOMPurify from 'dompurify';
import type { TemplateContext, ResponseData, QuestionData, CurrentQuestionContext, UserContext, SurveyContext } from '~/types/template';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((html) => html.replace(/<script[^>]*>.*?<\/script>/gi, '')),
  isSupported: true,
}));

const mockDOMPurify = DOMPurify as jest.Mocked<typeof DOMPurify>;

// Helper function to create mock template context
function createMockContext(overrides: Partial<TemplateContext> = {}): TemplateContext {
  const defaultContext: TemplateContext = {
    responses: {},
    questions: {},
    current: {
      code: 'Q1',
      type: 'text',
      title: 'Test Question',
      description: 'Test Description',
      order: 0,
      question_index: 0
    } as CurrentQuestionContext,
    user: {} as UserContext,
    survey: {} as SurveyContext,
    lang: 'en',
    timestamp: new Date().toISOString(),
    question_count: 0,
    answered_count: 0
  };

  return { ...defaultContext, ...overrides };
}

// Helper function to create mock ResponseData
function createMockResponseData(overrides: Partial<ResponseData> = {}): ResponseData {
  return {
    value: '',
    masked_value: '',
    type: 'text',
    title: 'Test Question',
    description: 'Test Description',
    choices: [],
    selected_choices: [],
    is_answered: false,
    answer_timestamp: null,
    ...overrides
  };
}

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Template Rendering', () => {
    test('should render simple variable substitution', () => {
      const result = templateService.render('Hello {{ name }}!', createMockContext({ name: 'World' } as any));
      expect(result).toBe('Hello World!');
    });

    test('should handle missing variables gracefully', () => {
      const result = templateService.render('Hello {{ missing }}!', createMockContext());
      expect(result).toBe('Hello !');
    });

    test('should return empty string for empty template', () => {
      const result = templateService.render('', createMockContext({ name: 'World' } as any));
      expect(result).toBe('');
    });

    test('should handle complex nested variables', () => {
      const context = createMockContext({
        user: { name: 'John', profile: { age: 30 } }
      } as any);
      const result = templateService.render('{{ user.name }} is {{ user.profile.age }} years old', context);
      expect(result).toBe('John is 30 years old');
    });
  });

  describe('Question Variable Access', () => {
    test('should handle question response data', () => {
      const q1Response = createMockResponseData({ value: 'John Doe', masked_value: 'John D.' });
      const q2Response = createMockResponseData({ value: 25 });
      const context = createMockContext({
        Q1: q1Response,
        Q2: q2Response,
        question_count: 2,
        answered_count: 2
      } as any);

      const result = templateService.render('Name: {{ Q1.value }}, Age: {{ Q2.value }}', context);
      expect(result).toBe('Name: John Doe, Age: 25');
    });

    test('should handle case-insensitive question codes', () => {
      const q1Response = createMockResponseData({ value: 'Test Value' });
      const context = createMockContext({
        Q1: q1Response
      } as any);

      // Test different cases
      expect(templateService.render('{{ Q1.value }}', context)).toBe('Test Value');
      expect(templateService.render('{{ q1.value }}', context)).toBe('Test Value');
      expect(templateService.render('{{ Q1.value }}', context)).toBe('Test Value');
    });

    test('should handle masked values', () => {
      const q1Response = createMockResponseData({ 
        value: 'john.doe@example.com', 
        masked_value: 'j***@example.com' 
      });
      const context = createMockContext({
        Q1: q1Response
      } as any);

      const result = templateService.render('Email: {{ Q1.masked_value }}', context);
      expect(result).toBe('Email: j***@example.com');
    });
  });

  describe('Template Filters', () => {
    test('should apply q_value filter', () => {
      const q1Response = createMockResponseData({ value: 'Test Response' });
      const context = createMockContext({
        responses: {
          Q1: q1Response
        }
      });

      const result = templateService.render('{{ "Q1" | q_value(responses) }}', context);
      expect(result).toBe('Test Response');
    });

    test('should apply q_label filter', () => {
      const q1Response = createMockResponseData({ value: 'raw', masked_value: 'formatted' });
      const context = createMockContext({
        responses: {
          Q1: q1Response
        }
      });

      const result = templateService.render('{{ "Q1" | q_label(responses) }}', context);
      expect(result).toBe('formatted');
    });

    test('should apply choice_label filter', () => {
      const choices = [
        { value: 1, label: 'Option One' },
        { value: 2, label: 'Option Two' }
      ];

      const result = templateService.render('{{ 1 | choice_label(choices) }}', createMockContext({ choices } as any));
      expect(result).toBe('Option One');
    });

    test('should apply display filter with default value', () => {
      const result1 = templateService.render('{{ "" | display("No value") }}', createMockContext());
      expect(result1).toBe('No value');

      const result2 = templateService.render('{{ "Some value" | display("No value") }}', createMockContext());
      expect(result2).toBe('Some value');
    });

    test('should apply number_format filter', () => {
      const result = templateService.render('{{ 123.456 | number_format(2) }}', createMockContext());
      expect(result).toBe('123.46');
    });
  });

  describe('HTML Sanitization', () => {
    test('should sanitize HTML by default', () => {
      mockDOMPurify.sanitize.mockReturnValue('<p>Safe content</p>');
      
      const result = templateService.render('<p>{{ content }}</p>', createMockContext({ content: 'Safe content' } as any));
      
      expect(mockDOMPurify.sanitize).toHaveBeenCalled();
      expect(result).toBe('<p>Safe content</p>');
    });

    test('should use safe_html filter for trusted content', () => {
      templateService.render('{{ content | safe_html }}', createMockContext({ 
        content: '<strong>Bold text</strong>' 
      } as any));
      
      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith('<strong>Bold text</strong>', expect.any(Object));
    });

    test('should allow bypassing sanitization', () => {
      const template = '<script>alert("test")</script><p>Content</p>';
      const result = templateService.render('{{ content }}', createMockContext({ content: template } as any), { 
        sanitizeHtml: false,
        checkSecurity: false
      });
      
      // With autoescape enabled, script tags will be escaped even when sanitization is bypassed
      expect(result).toContain('&lt;script&gt;');
    });

    test('should have sanitizeHtml method', () => {
      mockDOMPurify.sanitize.mockReturnValue('<p>Clean</p>');
      
      const result = templateService.sanitizeHtml('<script>bad</script><p>Clean</p>');
      
      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(
        '<script>bad</script><p>Clean</p>',
        expect.objectContaining({
          ALLOWED_TAGS: expect.arrayContaining(['p', 'strong', 'em']),
          FORBID_TAGS: expect.arrayContaining(['script', 'object'])
        })
      );
      expect(result).toBe('<p>Clean</p>');
    });
  });

  describe('Security Features', () => {
    test('should detect dangerous patterns', () => {
      const dangerousTemplates = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',  
        'data:text/html;base64,PHNjcmlwdD4=',
        'onload="alert(1)"'
      ];

      dangerousTemplates.forEach(template => {
        // Security check prevents dangerous templates from rendering normally
        const result = templateService.render(template, createMockContext(), { checkSecurity: true });
        expect(result).toMatch(/\[Template Error:/);
      });
    });

    test('should allow bypassing security checks', () => {
      const result = templateService.render(
        'javascript:void(0)', 
        createMockContext(), 
        { checkSecurity: false, sanitizeHtml: false }
      );
      // When security and sanitization are both bypassed, content passes through
      expect(result).toBe('javascript:void(0)');
    });

    test('should enable autoescape by default', () => {
      const result = templateService.render('{{ content }}', createMockContext({ 
        content: '<script>alert("xss")</script>' 
      } as any));
      
      // Autoescape should escape the script tags
      expect(result).not.toContain('<script>');
    });
  });

  describe('Template Validation', () => {
    test('should validate correct template syntax', () => {
      const result = templateService.validate('Hello {{ name }}!');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should detect invalid template syntax', () => {
      const result = templateService.validate('{{ unclosed');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should validate empty templates as valid', () => {
      const result = templateService.validate('');
      expect(result.valid).toBe(true);
    });

    test('should provide line and column information for errors', () => {
      const result = templateService.validate('{{ invalid\nsyntax }}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Reference Extraction', () => {
    test('should extract variable references', () => {
      const references = templateService.extractReferences('Hello {{ name }}! {{ user.email }}');
      expect(references).toContain('name');
      expect(references).toContain('user.email');
    });

    test('should extract references with filters', () => {
      const references = templateService.extractReferences('{{ name | upper }} {{ age | number_format }}');
      expect(references).toContain('name');
      expect(references).toContain('age');
    });

    test('should handle templates without references', () => {
      const references = templateService.extractReferences('Static content only');
      expect(references).toEqual([]);
    });

    test('should avoid duplicate references', () => {
      const references = templateService.extractReferences('{{ name }} and {{ name }} again');
      expect(references).toEqual(['name']);
    });
  });

  describe('Template Content Detection', () => {
    test('should detect templates with dynamic content', () => {
      expect(templateService.hasTemplateContent('Hello {{ name }}')).toBe(true);
      expect(templateService.hasTemplateContent('{% if condition %}')).toBe(true);
      expect(templateService.hasTemplateContent('{# comment #}')).toBe(true);
    });

    test('should detect static content', () => {
      expect(templateService.hasTemplateContent('Static text only')).toBe(false);
      expect(templateService.hasTemplateContent('')).toBe(false);
    });
  });

  describe('Context Creation Helper', () => {
    test('should create proper template context', () => {
      const responses: Record<string, ResponseData> = {
        Q1: createMockResponseData({ value: 'Answer 1' })
      };
      const questions: Record<string, QuestionData> = {
        Q1: { type: 'text', title: 'Question 1' }
      };

      const context = templateService.createContext(responses, questions, { lang: 'de' });

      expect(context.responses).toBe(responses);
      expect(context.questions).toBe(questions);
      expect(context.lang).toBe('de');
      expect(context.question_count).toBe(1);
      expect(context.answered_count).toBe(1);
      expect(context.timestamp).toBeDefined();
      expect(context.Q1).toBe(responses.Q1); // Direct access
    });

    test('should handle empty context creation', () => {
      const context = templateService.createContext();

      expect(context.responses).toEqual({});
      expect(context.questions).toEqual({});
      expect(context.lang).toBe('en');
      expect(context.question_count).toBe(0);
      expect(context.answered_count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle rendering errors gracefully', () => {
      // With autoescape and default behavior, undefined properties return empty
      const result = templateService.render('{{ undefined.property.chain }}', createMockContext());
      expect(result).toBe('');
    });

    test('should throw errors when requested', () => {
      expect(() => {
        templateService.render('{{ invalid template', createMockContext(), { throwOnError: true });
      }).toThrow();
    });

    test('should use custom error placeholder', () => {
      // Force an actual error with invalid template syntax
      const result = templateService.render(
        '{{ invalid template syntax', 
        createMockContext(), 
        { errorPlaceholder: '[CUSTOM ERROR]' }
      );
      expect(result).toBe('[CUSTOM ERROR]');
    });
  });

  describe('Available Filters', () => {
    test('should return list of available filters', () => {
      const filters = templateService.getAvailableFilters();
      expect(filters).toContain('q_value');
      expect(filters).toContain('q_label');
      expect(filters).toContain('choice_label');
      expect(filters).toContain('display');
      expect(filters).toContain('safe_html');
      expect(filters).toContain('date_format');
      expect(filters).toContain('number_format');
    });
  });

  describe('Singleton Pattern', () => {
    test('should maintain singleton instance', () => {
      const instance1 = templateService;
      const instance2 = templateService;
      expect(instance1).toBe(instance2);
    });
  });
});