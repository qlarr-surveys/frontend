/**
 * Temporary validation layer — expanded behavioral tests for ALL functions
 * that were moved during the designState.js refactoring.
 *
 * Covers the 12 functions NOT tested by stateUtils.test.js.
 * Delete this file once confident the move is faithful.
 */

import {
  buildValidationDefaultData,
  reorder,
  buildReferenceInstruction,
  mapCodeToUserFriendlyOrder,
  creatNewState,
  insertAnswer,
  addAnswer,
  reparentQuestion,
  reorderQuestions,
} from '../stateUtils.js';

import {
  cleanupSkipDestinations,
  cleanupValidation,
  addRelevanceInstructions,
} from '../addInstructions.js';

// ─── buildValidationDefaultData ────────────────────────────────────

describe('buildValidationDefaultData', () => {
  test('validation_required returns empty object', () => {
    expect(buildValidationDefaultData('validation_required')).toEqual({});
  });

  test('validation_pattern_email returns empty object', () => {
    expect(buildValidationDefaultData('validation_pattern_email')).toEqual({});
  });

  test('validation_min_char_length returns {min_length: 2}', () => {
    expect(buildValidationDefaultData('validation_min_char_length')).toEqual({
      min_length: 2,
    });
  });

  test('validation_max_char_length returns {max_length: 30}', () => {
    expect(buildValidationDefaultData('validation_max_char_length')).toEqual({
      max_length: 30,
    });
  });

  test('validation_between returns correct bounds', () => {
    expect(buildValidationDefaultData('validation_between')).toEqual({
      lower_limit: 20,
      upper_limit: 100,
    });
  });

  test('validation_not_between returns correct bounds', () => {
    expect(buildValidationDefaultData('validation_not_between')).toEqual({
      lower_limit: 20,
      upper_limit: 100,
    });
  });

  test('validation_lt returns {number: 20}', () => {
    expect(buildValidationDefaultData('validation_lt')).toEqual({ number: 20 });
  });

  test('validation_file_types returns {fileTypes: ["image"]}', () => {
    expect(buildValidationDefaultData('validation_file_types')).toEqual({
      fileTypes: ['image'],
    });
  });

  test('validation_max_file_size returns {max_size: 250}', () => {
    expect(buildValidationDefaultData('validation_max_file_size')).toEqual({
      max_size: 250,
    });
  });

  test('validation_min_option_count returns {min_count: 1}', () => {
    expect(buildValidationDefaultData('validation_min_option_count')).toEqual({
      min_count: 1,
    });
  });

  test('validation_option_count returns {count: 1}', () => {
    expect(buildValidationDefaultData('validation_option_count')).toEqual({
      count: 1,
    });
  });

  test('validation_contains returns {contains: ""}', () => {
    expect(buildValidationDefaultData('validation_contains')).toEqual({
      contains: '',
    });
  });

  test('validation_pattern returns {pattern: ""}', () => {
    expect(buildValidationDefaultData('validation_pattern')).toEqual({
      pattern: '',
    });
  });

  test('throws for unknown rule', () => {
    expect(() => buildValidationDefaultData('unknown_rule')).toThrow(
      'unrecognized rule unknown_rule'
    );
  });
});

// ─── reorder ───────────────────────────────────────────────────────

describe('reorder', () => {
  test('moves item from index 0 to index 2', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  test('moves item from index 2 to index 0', () => {
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  test('same index returns identical array', () => {
    expect(reorder(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c']);
  });

  test('does not mutate the original array', () => {
    const original = ['a', 'b', 'c'];
    const result = reorder(original, 0, 2);
    expect(original).toEqual(['a', 'b', 'c']);
    expect(result).not.toBe(original);
  });
});

// ─── buildReferenceInstruction ─────────────────────────────────────

describe('buildReferenceInstruction', () => {
  test('single reference {{Q1}}', () => {
    const result = buildReferenceInstruction('Hello {{Q1}}', 'label', 'en');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      code: 'format_label_en_1',
      contentPath: ['content', 'en', 'label'],
      text: 'Q1',
      lang: 'en',
    });
  });

  test('multiple references {{Q1}} and {{Q2}}', () => {
    const result = buildReferenceInstruction(
      '{{Q1}} and {{Q2}}',
      'label',
      'en'
    );
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Q1');
    expect(result[0].code).toBe('format_label_en_1');
    expect(result[1].text).toBe('Q2');
    expect(result[1].code).toBe('format_label_en_2');
  });

  test('no references returns empty array', () => {
    const result = buildReferenceInstruction('plain text', 'label', 'en');
    expect(result).toEqual([]);
  });

  test('trims whitespace inside references', () => {
    const result = buildReferenceInstruction('{{ Q1 }}', 'label', 'en');
    expect(result[0].text).toBe('Q1');
  });

  test('different lang parameter', () => {
    const result = buildReferenceInstruction('{{Q1}}', 'hint', 'ar');
    expect(result[0]).toEqual({
      code: 'format_hint_ar_1',
      contentPath: ['content', 'ar', 'hint'],
      text: 'Q1',
      lang: 'ar',
    });
  });
});

// ─── mapCodeToUserFriendlyOrder ────────────────────────────────────

describe('mapCodeToUserFriendlyOrder', () => {
  test('replaces G code with P index', () => {
    const index = { G123abc: 'P1' };
    expect(mapCodeToUserFriendlyOrder('G123abc', index)).toBe('P1');
  });

  test('replaces Q code with Q index', () => {
    const index = { Q456def: 'Q3' };
    expect(mapCodeToUserFriendlyOrder('Q456def', index)).toBe('Q3');
  });

  test('replaces both G and Q codes in compound expression', () => {
    const index = { G1: 'P1', Q1: 'Q1' };
    const result = mapCodeToUserFriendlyOrder('G1_Q1', index);
    expect(result).toBe('P1_Q1');
  });

  test('returns unchanged if no G or Q pattern found', () => {
    const index = {};
    expect(mapCodeToUserFriendlyOrder('plain', index)).toBe('plain');
  });
});

// ─── creatNewState ─────────────────────────────────────────────────

describe('creatNewState', () => {
  test('deep clones state and replaces question codes', () => {
    const state = {};
    const toBeCopied = {
      type: 'text',
      content: { en: { label: 'Hello Q1' } },
      instructionList: [{ code: 'value', text: 'Q1 ref' }],
    };
    creatNewState(state, toBeCopied, 'Q2', 'Q1', 'Q2');

    expect(state.Q2).toBeDefined();
    expect(state.Q2.type).toBe('text');
    // instruction text should have Q1 replaced with Q2
    expect(state.Q2.instructionList[0].text).toBe('Q2 ref');
    // original should not be modified
    expect(toBeCopied.instructionList[0].text).toBe('Q1 ref');
  });

  test('strips relevance and conditional_relevance instruction', () => {
    const state = {};
    // Note: conditional_relevance must NOT be at index 0 because
    // the original code uses `if (index)` which is falsy for 0.
    const toBeCopied = {
      relevance: { logic: 'AND', rule: [] },
      instructionList: [
        { code: 'value', text: 'hello' },
        { code: 'conditional_relevance', text: 'some expr' },
      ],
    };
    creatNewState(state, toBeCopied, 'Q2', 'Q1', 'Q2');

    expect(state.Q2.relevance).toBeUndefined();
    expect(
      state.Q2.instructionList.find((i) => i.code === 'conditional_relevance')
    ).toBeUndefined();
    expect(state.Q2.instructionList).toHaveLength(1);
    expect(state.Q2.instructionList[0].code).toBe('value');
  });

  test('strips skip_logic and skip_to_on_ instructions', () => {
    const state = {};
    const toBeCopied = {
      skip_logic: [{ condition: [], skipTo: 'G2' }],
      instructionList: [
        { code: 'skip_to_on_A1', text: 'goto G2' },
        { code: 'value', text: 'keep' },
      ],
    };
    creatNewState(state, toBeCopied, 'Q2', 'Q1', 'Q2');

    expect(state.Q2.skip_logic).toBeUndefined();
    expect(
      state.Q2.instructionList.find((i) =>
        i.code.startsWith('skip_to_on_')
      )
    ).toBeUndefined();
    expect(state.Q2.instructionList).toHaveLength(1);
  });

  test('recursively handles children with qualifiedCode replacement', () => {
    const state = {};
    const childState = {
      type: 'answer',
      instructionList: [{ code: 'enum', text: 'Q1A1' }],
    };
    state['Q1A1'] = childState;
    const toBeCopied = {
      type: 'scq',
      children: [{ code: 'A1', qualifiedCode: 'Q1A1' }],
      instructionList: [],
    };
    creatNewState(state, toBeCopied, 'Q2', 'Q1', 'Q2');

    expect(state.Q2.children[0].qualifiedCode).toBe('Q2A1');
    expect(state['Q2A1']).toBeDefined();
    expect(state['Q2A1'].instructionList[0].text).toBe('Q2A1');
  });
});

// ─── cleanupSkipDestinations ───────────────────────────────────────

describe('cleanupSkipDestinations', () => {
  test('removes skip rules pointing to deleted code', () => {
    const state = {
      Q1: {
        type: 'scq',
        skip_logic: [
          { condition: ['A1'], skipTo: 'G2' },
          { condition: ['A1'], skipTo: 'G3' },
        ],
        children: [{ code: 'A1' }],
        instructionList: [
          { code: 'skip_to_on_A1', text: 'goto G2', returnType: 'string', isActive: true },
          { code: 'value', text: '', returnType: 'string', isActive: false },
        ],
      },
    };
    cleanupSkipDestinations(state, 'G2');

    // G2 rule removed, G3 rule remains
    expect(state.Q1.skip_logic).toHaveLength(1);
    expect(state.Q1.skip_logic[0].skipTo).toBe('G3');
  });

  test('does nothing when no skip_logic references deleted code', () => {
    const state = {
      Q1: {
        type: 'scq',
        skip_logic: [{ condition: ['A1'], skipTo: 'G3' }],
        children: [{ code: 'A1' }],
        instructionList: [],
      },
    };
    cleanupSkipDestinations(state, 'G2');

    expect(state.Q1.skip_logic).toHaveLength(1);
    expect(state.Q1.skip_logic[0].skipTo).toBe('G3');
  });

  test('handles components without skip_logic', () => {
    const state = {
      Q1: { type: 'text', instructionList: [] },
    };
    expect(() => cleanupSkipDestinations(state, 'G2')).not.toThrow();
  });
});

// ─── cleanupValidation ─────────────────────────────────────────────

describe('cleanupValidation', () => {
  test('does nothing if component has no validation', () => {
    const state = {
      Q1: { type: 'text', instructionList: [] },
    };
    expect(() => cleanupValidation(state, 'Q1')).not.toThrow();
  });

  test('processes each validation rule', () => {
    // processValidation is called internally — we just verify no crash
    // and that the function is callable with validation present
    const state = {
      Q1: {
        type: 'text',
        maxChars: 100,
        validation: {
          validation_required: {},
        },
        instructionList: [
          {
            code: 'validation_required',
            text: 'true',
            returnType: 'boolean',
            isActive: true,
          },
        ],
      },
    };
    expect(() => cleanupValidation(state, 'Q1')).not.toThrow();
  });
});

// ─── addRelevanceInstructions ──────────────────────────────────────

describe('addRelevanceInstructions', () => {
  test('hide_always adds conditional_relevance with text "false"', () => {
    const state = {
      Q1: { instructionList: [] },
    };
    const relevance = {
      logic: null,
      rule: 'hide_always',
    };
    addRelevanceInstructions(state, 'Q1', relevance);

    const instruction = state.Q1.instructionList.find(
      (i) => i.code === 'conditional_relevance'
    );
    expect(instruction).toBeDefined();
    expect(instruction.text).toBe('false');
    expect(instruction.returnType).toBe('boolean');
  });

  test('show_always removes conditional_relevance instruction', () => {
    const state = {
      Q1: {
        instructionList: [
          { code: 'conditional_relevance', text: 'false', returnType: 'boolean', isActive: false },
        ],
      },
    };
    const relevance = {
      logic: null,
      rule: 'show_always',
    };
    addRelevanceInstructions(state, 'Q1', relevance);

    const instruction = state.Q1.instructionList.find(
      (i) => i.code === 'conditional_relevance'
    );
    expect(instruction).toBeUndefined();
  });
});

// ─── reparentQuestion ──────────────────────────────────────────────

describe('reparentQuestion', () => {
  test('moves question from source group to destination group', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }, { code: 'G2' }] },
      G1: { children: [{ code: 'Q1' }, { code: 'Q2' }] },
      G2: { children: [] },
    };
    reparentQuestion(state, state.Survey, {
      id: 'Q1',
      source: 'G1',
      destination: 'G2',
    });

    expect(state.G1.children.map((c) => c.code)).toEqual(['Q2']);
    expect(state.G2.children.map((c) => c.code)).toEqual(['Q1']);
  });

  test('sets reorder_refresh_code on state', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }, { code: 'G2' }] },
      G1: { children: [{ code: 'Q1' }] },
      G2: { children: [] },
    };
    reparentQuestion(state, state.Survey, {
      id: 'Q1',
      source: 'G1',
      destination: 'G2',
    });

    expect(state.reorder_refresh_code).toBeDefined();
    expect(typeof state.reorder_refresh_code).toBe('number');
  });

  test('does nothing if question not found', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }, { code: 'G2' }] },
      G1: { children: [{ code: 'Q1' }] },
      G2: { children: [] },
    };
    reparentQuestion(state, state.Survey, {
      id: 'Q999',
      source: 'G1',
      destination: 'G2',
    });

    // Q1 should still be in G1
    expect(state.G1.children.map((c) => c.code)).toEqual(['Q1']);
  });
});

// ─── reorderQuestions ──────────────────────────────────────────────

describe('reorderQuestions', () => {
  test('moves question to a different position within same group', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }] },
      G1: { children: [{ code: 'Q1' }, { code: 'Q2' }, { code: 'Q3' }] },
    };
    reorderQuestions(state, state.Survey, {
      id: 'Q1',
      source: 'G1',
      destination: 'G1',
      toIndex: 3, // after Q3 (toIndex - 1 = 2)
    });

    expect(state.G1.children.map((c) => c.code)).toEqual(['Q2', 'Q3', 'Q1']);
  });

  test('moves question across groups', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }, { code: 'G2' }] },
      G1: { children: [{ code: 'Q1' }, { code: 'Q2' }] },
      G2: { children: [{ code: 'Q3' }] },
    };
    reorderQuestions(state, state.Survey, {
      id: 'Q1',
      source: 'G1',
      destination: 'G2',
      toIndex: 1, // insert at index 0
    });

    expect(state.G1.children.map((c) => c.code)).toEqual(['Q2']);
    expect(state.G2.children.map((c) => c.code)).toEqual(['Q1', 'Q3']);
  });
});

// ─── insertAnswer ──────────────────────────────────────────────────

describe('insertAnswer', () => {
  test('inserts answer into existing component children', () => {
    const state = {
      Q1: {
        type: 'scq',
        children: [
          { code: 'A1', qualifiedCode: 'Q1A1' },
        ],
        instructionList: [
          { code: 'enum', text: 'A1', returnType: 'string', isActive: false },
        ],
      },
    };
    const answer = { code: 'A2', qualifiedCode: 'Q1A2' };
    const result = insertAnswer(state, answer, 'Q1');

    expect(result).toBe(true);
    expect(state.Q1.children).toHaveLength(2);
    expect(state.Q1.children[1].code).toBe('A2');
  });

  test('returns false if parent component not found', () => {
    const state = {};
    const answer = { code: 'A1', qualifiedCode: 'Q1A1' };
    const result = insertAnswer(state, answer, 'Q1');

    expect(result).toBe(false);
  });

  test('creates children array if it does not exist', () => {
    const state = {
      Q1: {
        type: 'scq',
        instructionList: [],
      },
    };
    const answer = { code: 'A1', qualifiedCode: 'Q1A1' };
    const result = insertAnswer(state, answer, 'Q1');

    expect(result).toBe(true);
    expect(state.Q1.children).toHaveLength(1);
    expect(state.Q1.children[0].code).toBe('A1');
  });
});

// ─── addAnswer ─────────────────────────────────────────────────────

describe('addAnswer', () => {
  test('adds answer to state and inserts into parent', () => {
    const state = {
      langInfo: { mainLang: 'en' },
      Q1: {
        type: 'scq',
        children: [],
        instructionList: [
          { code: 'value', text: '', returnType: 'string', isActive: false },
        ],
      },
    };
    const answer = {
      code: 'A1',
      qualifiedCode: 'Q1A1',
      label: 'Option 1',
    };
    addAnswer(state, answer);

    expect(state['Q1A1']).toBeDefined();
    expect(state['Q1A1'].content).toEqual({ en: { label: 'Option 1' } });
    expect(state.Q1.children.some((c) => c.code === 'A1')).toBe(true);
  });

  test('sets focus when answer.focus is true', () => {
    const state = {
      langInfo: { mainLang: 'en' },
      Q1: {
        type: 'scq',
        children: [],
        instructionList: [
          { code: 'value', text: '', returnType: 'string', isActive: false },
        ],
      },
    };
    addAnswer(state, {
      code: 'A1',
      qualifiedCode: 'Q1A1',
      focus: true,
    });

    expect(state.focus).toBe('Q1A1');
  });

  test('sets type on answer state when provided', () => {
    const state = {
      langInfo: { mainLang: 'en' },
      Q1: {
        type: 'scq',
        children: [],
        instructionList: [
          { code: 'value', text: '', returnType: 'string', isActive: false },
        ],
      },
    };
    addAnswer(state, {
      code: 'A1',
      qualifiedCode: 'Q1A1',
      type: 'row',
    });

    expect(state['Q1A1'].type).toBe('row');
  });
});
