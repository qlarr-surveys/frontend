import { buildTemplateContext, buildSampleContext } from '../templateContext';

describe('Template Context Utilities', () => {
  describe('buildTemplateContext', () => {
    test('should build basic template context from states', () => {
      const runState = {
        values: {
          Q1: { value: 'John Doe' },
          Q2: { value: 25 }
        },
        current_question: 0,
        survey_id: 'test-survey'
      };

      const designState = {
        Q1: { type: 'text', content: { en: { title: 'Name' } } },
        Q2: { type: 'number', content: { en: { title: 'Age' } } },
        survey: {
          questions: {
            Q1: { type: 'text', content: { en: { title: 'Name' } } },
            Q2: { type: 'number', content: { en: { title: 'Age' } } }
          }
        }
      };

      const context = buildTemplateContext(runState, designState);

      expect(context.responses).toBeDefined();
      expect(context.questions).toBeDefined();
      expect(context.current).toBeDefined();
      expect(context.survey).toBeDefined();
      expect(context.lang).toBe('en');
      expect(context.timestamp).toBeDefined();
    });

    test('should handle missing states gracefully', () => {
      const context = buildTemplateContext(null, null);

      expect(context.responses).toEqual({});
      expect(context.questions).toEqual({});
      expect(context.current).toBeDefined();
      expect(context.survey).toBeDefined();
      expect(context.lang).toBe('en');
    });

    test('should include timestamp and language', () => {
      const context = buildTemplateContext({}, {});

      expect(context.timestamp).toBeDefined();
      expect(new Date(context.timestamp)).toBeInstanceOf(Date);
      expect(context.lang).toBe('en');
    });

    test('should maintain type safety', () => {
      const context = buildTemplateContext({}, {});

      // TypeScript should enforce these properties exist
      expect(typeof context.lang).toBe('string');
      expect(typeof context.timestamp).toBe('string');
      expect(typeof context.question_count).toBe('number');
      expect(typeof context.answered_count).toBe('number');
      expect(typeof context.responses).toBe('object');
      expect(typeof context.questions).toBe('object');
    });
  });

  describe('buildSampleContext', () => {
    test('should build sample context for basic question types', () => {
      const designState = {
        componentIndex: {
          Q1: 0,
          Q2: 1
        },
        Q1: { type: 'text', content: { en: { title: 'Name' } } },
        Q2: { type: 'email', content: { en: { title: 'Email' } } }
      };

      const context = buildSampleContext(designState, 'en');

      expect(context.responses).toBeDefined();
      expect(context.questions).toBeDefined();
      expect(context.current).toBeDefined();
      expect(context.survey).toBeDefined();
      expect(context.lang).toBe('en');
      expect(context.timestamp).toBeDefined();
    });

    test('should handle empty design state', () => {
      const context = buildSampleContext(undefined);
      
      expect(context.responses).toEqual({});
      expect(context.questions).toEqual({});
      expect(context.lang).toBe('en');
    });

    test('should generate consistent sample context', () => {
      const designState = {
        componentIndex: { Q1: 0 },
        Q1: { type: 'text', content: { en: { title: 'Name' } } }
      };

      const context1 = buildSampleContext(designState);
      const context2 = buildSampleContext(designState);

      // Should be consistent for the same input
      expect(context1.lang).toBe(context2.lang);
      expect(context1.user).toEqual(context2.user);
      expect(context1.survey).toEqual(context2.survey);
    });
  });
});