// Self-contained baseline tests - functions copied from designState.js
// These establish the expected behavior BEFORE the refactoring move

import { reorder } from '../stateUtils.js';

// Copy of splitQuestionCodes from designState.js
const splitQuestionCodes = (code) => {
  return code.split(/(A[a-z_0-9]+|Q[a-z_0-9]+)/).filter(Boolean);
};

// Copy of buildIndex from designState.js
const buildIndex = (state) => {
  let retrunRestult = [];
  state.Survey.children?.forEach((group) => {
    retrunRestult.push(group.code);
    let groupObj = state[group.code];
    if (groupObj.children && !groupObj.collapsed) {
      groupObj.children.forEach((question) => {
        if (question?.code) {
          retrunRestult.push(question.code);
        }
      });
    }
  });
  return retrunRestult;
};

// Copy of buildCodeIndex from designState.js
const buildCodeIndex = (state) => {
  let retrunRestult = {};
  let groupCount = 0;
  let questionCount = 0;
  state.Survey.children?.forEach((group) => {
    groupCount++;
    retrunRestult[group.code] = "P" + groupCount;
    let groupObj = state[group.code];
    if (groupObj.children) {
      groupObj.children.forEach((question) => {
        questionCount++;
        retrunRestult[question.code] = "Q" + questionCount;
        let questionObj = state[question.code];
        if (questionObj.children) {
          questionObj.children.forEach((answer) => {
            retrunRestult[answer.qualifiedCode] = "Q" + questionCount + answer.code;
          });
        }
      });
    }
  });
  return retrunRestult;
};

// Copy of saveContentResources from designState.js
const saveContentResources = (component, contentValue, contentLang, contentKey) => {
  const regex = /data-resource-name="([^"]+)"/g;
  const resources = Array.from(
    contentValue.matchAll(regex),
    (match) => match[1]
  ).filter((name) => name && name.trim());
  if (!component.resources) {
    component.resources = {};
  }
  const prefix = `content_${contentLang}_${contentKey}`;
  Object.keys(component.resources).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete component.resources[key];
    }
  });
  resources.forEach((elem, index) => {
    component.resources[`${prefix}_${index + 1}`] = elem;
  });
};

// Copy of reorderGroups from designState.js
const reorderGroups = (survey, payload) => {
  survey.children = reorder(survey.children, payload.fromIndex, payload.toIndex);
};

// Copy of reorderAnswers from designState.js
const reorderAnswers = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  component.children = reorder(component.children, payload.fromIndex, payload.toIndex);
};

// Copy of reorderAnswersByType from designState.js
const reorderAnswersByType = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  const type = state[payload.id].type;
  const filteredChildren = component.children.filter((child) => child.type == type);
  const fromIndex = component.children.indexOf(filteredChildren[payload.fromIndex]);
  const toIndex = component.children.indexOf(filteredChildren[payload.toIndex]);
  component.children = reorder(component.children, fromIndex, toIndex);
};

describe('splitQuestionCodes', () => {
  test('splits Q1A1', () => {
    expect(splitQuestionCodes('Q1A1')).toEqual(['Q1', 'A1']);
  });
  test('handles nested Q1AotherAtext', () => {
    expect(splitQuestionCodes('Q1AotherAtext')).toEqual(['Q1', 'Aother', 'Atext']);
  });
});

describe('buildIndex', () => {
  test('returns ordered codes, skips collapsed group children', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }, { code: 'G2' }] },
      G1: { children: [{ code: 'Q1' }, { code: 'Q2' }] },
      G2: { children: [{ code: 'Q3' }], collapsed: true },
    };
    expect(buildIndex(state)).toEqual(['G1', 'Q1', 'Q2', 'G2']);
  });
});

describe('buildCodeIndex', () => {
  test('maps group codes to P1, question codes to Q1, answer codes to Q1A1', () => {
    const state = {
      Survey: { children: [{ code: 'G1' }] },
      G1: { children: [{ code: 'Q1' }] },
      Q1: { children: [{ code: 'A1', qualifiedCode: 'Q1A1' }] },
    };
    const result = buildCodeIndex(state);
    expect(result['G1']).toBe('P1');
    expect(result['Q1']).toBe('Q1');
    expect(result['Q1A1']).toBe('Q1A1');
  });
});

describe('saveContentResources', () => {
  test('extracts data-resource-name values', () => {
    const component = {};
    saveContentResources(component, '<img data-resource-name="logo.png"/>', 'en', 'label');
    expect(component.resources['content_en_label_1']).toBe('logo.png');
  });
  test('clears old resources with same prefix', () => {
    const component = { resources: { 'content_en_label_1': 'old.png' } };
    saveContentResources(component, '<img data-resource-name="new.png"/>', 'en', 'label');
    expect(component.resources['content_en_label_1']).toBe('new.png');
  });
});

describe('reorderGroups', () => {
  test('reorders survey children array', () => {
    const survey = { children: [{ code: 'G1' }, { code: 'G2' }, { code: 'G3' }] };
    reorderGroups(survey, { fromIndex: 0, toIndex: 2 });
    expect(survey.children.map(c => c.code)).toEqual(['G2', 'G3', 'G1']);
  });
});

describe('reorderAnswers', () => {
  test('reorders within parent question children', () => {
    const state = {
      Q1: { children: [{ code: 'A1', qualifiedCode: 'Q1A1' }, { code: 'A2', qualifiedCode: 'Q1A2' }] },
    };
    reorderAnswers(state, { id: 'Q1A1', fromIndex: 0, toIndex: 1 });
    expect(state.Q1.children.map(c => c.code)).toEqual(['A2', 'A1']);
  });
});

describe('reorderAnswersByType', () => {
  test('reorders only within same-type children using relative indices', () => {
    const state = {
      Q1: {
        children: [
          { code: 'Ac1', qualifiedCode: 'Q1Ac1', type: 'column' },
          { code: 'A1', qualifiedCode: 'Q1A1', type: 'row' },
          { code: 'A2', qualifiedCode: 'Q1A2', type: 'row' },
        ],
      },
      'Q1Ac1': { type: 'column' },
      'Q1A1': { type: 'row' },
      'Q1A2': { type: 'row' },
    };
    reorderAnswersByType(state, { id: 'Q1A1', fromIndex: 0, toIndex: 1 });
    expect(state.Q1.children.map(c => c.code)).toEqual(['Ac1', 'A2', 'A1']);
  });
});
