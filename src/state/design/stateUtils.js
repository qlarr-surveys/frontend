import cloneDeep from 'lodash.clonedeep';
import { firstIndexInArray, lastIndexInArray } from '~/utils/design/utils';
import { createGroup } from '~/components/design/NewComponentsPanel';
import { createQuestion, questionDesignError } from '~/components/Questions/utils';
import { setupOptions } from '~/constants/design';
import {
  cleanupRandomRules,
  cleanupValidation,
  addMaskedValuesInstructions,
  addAnswerInstructions,
  addQuestionInstructions,
  cleanupDefaultValue,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
} from './addInstructions';

export const buildValidationDefaultData = (rule) => {
  switch (rule) {
    case "validation_required":
    case "validation_one_response_per_col":
    case "validation_pattern_email":
      return {};
    case "validation_min_char_length":
      return {
        min_length: 2,
      };
    case "validation_max_char_length":
      return {
        max_length: 30,
      };
    case "validation_contains":
      return {
        contains: "",
      };
    case "validation_not_contains":
      return {
        not_contains: "",
      };
    case "validation_pattern":
      return {
        pattern: "",
      };
    case "validation_max_word_count":
      return {
        max_count: 300,
      };
    case "validation_min_word_count":
      return {
        min_count: 300,
      };
    case "validation_between":
      return {
        lower_limit: 20,
        upper_limit: 100,
      };
    case "validation_not_between":
      return {
        lower_limit: 20,
        upper_limit: 100,
      };
    case "validation_lt":
      return {
        number: 20,
      };
    case "validation_lte":
      return {
        number: 20,
      };
    case "validation_gt":
      return {
        number: 20,
      };
    case "validation_gte":
      return {
        number: 20,
      };
    case "validation_equals":
      return {
        number: 20,
      };
    case "validation_not_equal":
      return {
        number: 20,
      };
    case "validation_min_ranking_count":
    case "validation_min_option_count":
      return {
        min_count: 1,
      };
    case "validation_max_ranking_count":
    case "validation_max_option_count":
      return {
        max_count: 1,
      };
    case "validation_ranking_count":
    case "validation_option_count":
      return {
        count: 1,
      };
    case "validation_file_types":
      return {
        fileTypes: ["image"],
      };
    case "validation_max_file_size":
      return {
        max_size: 250,
      };
    default:
      throw "unrecognized rule " + rule;
  }
};

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function collectExistingGroupCodes(groups) {
  const ids = new Set();
  if (Array.isArray(groups)) {
    groups.forEach((g) => {
      if (g && g.code) ids.add(g.code);
    });
  }
  return ids;
}

export const nextGroupId = (groups) => {
  const existing = collectExistingGroupCodes(groups);
  return generateId(existing);
};

function collectExistingIds(state, groups) {
  const ids = new Set();

  groups.forEach((group) => {
    const groupObj = state[group.code];
    if (groupObj && groupObj.children) {
      groupObj.children.forEach((q) => {
        if (q.code) {
          ids.add(q.code);
        }
      });
    }
  });
  return ids;
}

function randChar(chars) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return chars[array[0] % chars.length];
}

function generateId(existing) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  let id = "";

  do {
    const numPart = Array.from({ length: 3 }, () => randChar(numbers)).join("");
    const letPart = Array.from({ length: 3 }, () => randChar(letters)).join("");
    id = numPart + letPart;
  } while (existing.has(id));

  return id;
}

export const nextQuestionId = (state, groups) => {
  const existing = collectExistingIds(state, groups);
  return generateId(existing);
};

export const buildReferenceInstruction = (content, name, key) => {
  const allMatches = getAllMatches(content);
  return allMatches.map((match, index) =>{
    return {
      code: `format_${name}_${key}_${index + 1}`,
      contentPath: ["content", key, name],
      text: match,
      lang: key,
    };
  })
};

const getAllMatches = (inputString) => {
  const regex = /\{\{(.*?)\}\}/g;
  return Array.from(inputString.matchAll(regex), m => m[1].trim());
};

export const splitQuestionCodes = (code) => {
  return code.split(/(A[a-z_0-9]+|Q[a-z_0-9]+)/).filter(Boolean);
};

export const buildIndex = (state) => {
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

export const buildCodeIndex = (state) => {
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
            retrunRestult[answer.qualifiedCode] =
              "Q" + questionCount + answer.code;
          });
        }
      });
    }
  });
  return retrunRestult;
};

export const saveContentResources = (
  component,
  contentValue,
  contentLang,
  contentKey
) => {
  const regex = /data-resource-name="([^"]+)"/g;
  const resources = Array.from(
    contentValue.matchAll(regex),
    (match) => match[1]
  ).filter((name) => name && name.trim());

  if (!component.resources) {
    component.resources = {};
  }
  // Remove existing items with matching keys
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

export const creatNewState = (
  state,
  toBeCopied,
  newStateCode,
  oldQuestionCode,
  newQuestionCode
) => {
  const newState = cloneDeep(toBeCopied);
  if (newState.relevance) {
    delete newState.relevance;
    const index = newState.instructionList?.findIndex(
      (instruction) => instruction.code == "conditional_relevance"
    );
    if (index) {
      newState.instructionList?.splice(index, 1);
    }
  }
  if (newState.skip_logic) {
    delete newState.skip_logic;
    newState.instructionList = newState.instructionList.filter(
      (eq) => !eq.code.startsWith("skip_to_on_")
    );
  }
  newState.instructionList?.forEach((eq) => {
    eq.text = eq.text?.replaceAll(oldQuestionCode, newQuestionCode);
  });
  state[newStateCode] = newState;
  state[newStateCode]?.children?.forEach((child) => {
    let oldChildCode = child.qualifiedCode;
    let newChildCode = child.qualifiedCode.replaceAll(
      oldQuestionCode,
      newQuestionCode
    );
    child.qualifiedCode = newChildCode;
    creatNewState(
      state,
      state[oldChildCode],
      newChildCode,
      oldQuestionCode,
      newQuestionCode
    );
  });
};

export const mapCodeToUserFriendlyOrder = (code, index) => {
  let newCode = cloneDeep(code);
  // Pattern for G followed by alphanumeric characters
  const gPattern = /G[a-zA-Z0-9]+/g;

  // Pattern for Q followed by alphanumeric characters
  const qPattern = /Q[a-zA-Z0-9]+/g;

  // Find all G matches
  const gMatches = code.match(gPattern);
  if (gMatches) {
    gMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }

  // Find all Q matches
  const qMatches = code.match(qPattern);
  if (qMatches) {
    qMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }
  // Return counts for reference
  return newCode;
};

export const reorderGroups = (survey, payload) => {
  survey.children = reorder(
    survey.children,
    payload.fromIndex,
    payload.toIndex
  );
};

export const reorderAnswers = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  component.children = reorder(
    component.children,
    payload.fromIndex,
    payload.toIndex
  );
};

export const reorderAnswersByType = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  const type = state[payload.id].type;
  const filteredChildren = component.children.filter(
    (child) => child.type == type
  );
  const fromIndex = component.children.indexOf(
    filteredChildren[payload.fromIndex]
  );
  const toIndex = component.children.indexOf(filteredChildren[payload.toIndex]);
  component.children = reorder(component.children, fromIndex, toIndex);
};

export const insertAnswer = (state, answer, parentCode, index) => {
  const component = state[parentCode];
  if (component) {
    if (!component.children) {
      component.children = [];
    }
    const insertIndex =
      typeof index == "number"
        ? typeof answer.type == "string"
          ? index +
            firstIndexInArray(
              component.children,
              (child) => child.type == answer.type
            )
          : index
        : lastIndexInArray(
            component.children,
            (child) => child.type == answer.type || !child.type
          );
    component.children.splice(insertIndex + 1, 0, answer);
    component.designErrors = questionDesignError(component);
    cleanupValidation(state, parentCode);
    addMaskedValuesInstructions(parentCode, component, state);
    cleanupRandomRules(component);
    return true;
  } else {
    return false;
  }
};

export const addAnswer = (state, answer) => {
  const lang = state.langInfo.mainLang;
  const label = answer.label;
  const qualifiedCode = answer.qualifiedCode;
  state[qualifiedCode] = {};
  const codes = splitQuestionCodes(qualifiedCode);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const questionCode = codes[0];
  if (!insertAnswer(state, answer, parentCode, answer.index)) {
    return;
  }
  if (label) {
    state[qualifiedCode].content = { [lang]: { label: label } };
  }
  if (answer.type) {
    state[qualifiedCode].type = answer.type;
  }
  addAnswerInstructions(state, state[qualifiedCode], parentCode, questionCode);
  cleanupDefaultValue(state[questionCode]);
  refreshEnumForSingleChoice(state[questionCode], state);
  refreshListForMultipleChoice(state[questionCode], state);
  if (answer.focus) {
    state.focus = qualifiedCode;
  }
};

export const reparentQuestion = (state, survey, payload) => {
  let index = buildIndex(state);
  const sourceGroup = state[payload.source];
  const destinationGroup = state[payload.destination];
  const sourceQuestionIndex = sourceGroup.children.findIndex(
    (question) => question.code == payload.id
  );
  const destinationQuestionIndex =
    index.indexOf(payload.destination) > index.indexOf(payload.source)
      ? 0
      : destinationGroup.children?.length || 0;
  const question = sourceGroup.children[sourceQuestionIndex];
  if (!question) {
    return;
  }
  sourceGroup.children.splice(sourceQuestionIndex, 1);
  if (!destinationGroup.children) {
    destinationGroup.children = [];
  }
  destinationGroup.children.splice(destinationQuestionIndex, 0, question);
  // cheap trick to notifiy Drop Areas of the update
  state["reorder_refresh_code"] = Math.floor(Math.random() * 1000000);
  cleanupRandomRules(destinationGroup);
  cleanupRandomRules(sourceGroup);
};

export const reorderQuestions = (state, survey, payload) => {
  const sourceGroup = state[payload.source];
  const destinationGroup = state[payload.destination];
  const sourceQuestionIndex = sourceGroup.children.findIndex(
    (question) => question.code == payload.id
  );
  const destinationQuestionIndex = payload.toIndex - 1;
  const question = sourceGroup.children[sourceQuestionIndex];
  sourceGroup.children.splice(sourceQuestionIndex, 1);
  if (!destinationGroup.children) {
    destinationGroup.children = [];
  }
  destinationGroup.children.splice(destinationQuestionIndex, 0, question);
  // cheap trick to notifiy Drop Areas of the update
  state["reorder_refresh_code"] = Math.floor(Math.random() * 1000000);
  cleanupRandomRules(destinationGroup);
  cleanupRandomRules(sourceGroup);
};

export const newQuestion = (state, payload) => {
  const survey = state.Survey;
  let questionId = nextQuestionId(state, survey.children);
  const questionObject = createQuestion(
    payload.questionType,
    questionId,
    state.langInfo.mainLang
  );
  const destinationGroup = state[payload.destination];
  const destinationQuestionIndex = payload.toIndex;
  if (!destinationGroup.children) {
    destinationGroup.children = [];
  }

  Object.keys(questionObject)
    .filter((key) => key != "question")
    .forEach((key) => {
      state[key] = questionObject[key];
    });
  const newCode = `Q${questionId}`;
  addQuestionInstructions(state[newCode]);
  state[newCode].children?.forEach((element) => {
    addAnswerInstructions(
      state,
      state[element.qualifiedCode],
      newCode,
      newCode
    );
  });
  cleanupValidation(state, newCode);
  cleanupDefaultValue(questionObject[newCode]);
  refreshEnumForSingleChoice(questionObject[newCode], state);
  refreshListForMultipleChoice(questionObject[newCode], state);
  addMaskedValuesInstructions(newCode, questionObject[newCode], state);
  destinationGroup.children.splice(
    destinationQuestionIndex,
    0,
    questionObject.question
  );

  const groupIndex = survey.children.findIndex(
    (group) => group.code === payload.destination
  );
  state.lastAddedComponent = {
    type: "question",
    groupIndex: groupIndex,
    questionIndex: destinationQuestionIndex,
  };
  cleanupRandomRules(destinationGroup);
  state.focus = newCode;
  state.setup = { code: newCode, rules: setupOptions(payload.questionType) };
};

export const newGroup = (state, payload) => {
  const survey = state.Survey;
  const group = createGroup("GROUP", nextGroupId(survey.children));
  if (!survey.children) {
    survey.children = [];
  }
  if (payload.toIndex == -1) {
    survey.children.push(group.newGroup);
  } else {
    survey.children.splice(payload.toIndex, 0, group.newGroup);
  }
  state[group.newGroup.code] = group.state;

  const lastGroupIndex = survey.children.findIndex(
    (child) => child.code === group.newGroup.code
  );
  state.lastAddedComponent = {
    type: "group",
    index: lastGroupIndex,
  };
  cleanupRandomRules(survey);
  state.focus = group.newGroup.code;
  state.setup = { code: group.newGroup.code, rules: setupOptions(group.newGroup.type) };
};

export const specialGroup = (state, payload) => {
  const survey = state.Survey;
  if (!survey.children) {
    survey.children = [];
  }
  const index = survey.children.findIndex(
    (group) => state[group.code].groupType?.toLowerCase() === payload.groupType
  );
  if (index !== -1) {
    state.error = {
      message:
        "cannot have duplicate " +
        (payload.groupType == "welcome" ? "Welcome groups" : "End groups"),
    };
    return;
  }
  if (payload.groupType == "welcome") {
    const group = createGroup("WELCOME", nextGroupId(survey.children));
    survey.children.splice(0, 0, group.newGroup);
    state[group.newGroup.code] = group.state;
    state.setup = { code: group.newGroup.code, rules: setupOptions(group.newGroup.type) };
  } else if (payload.groupType == "end") {
    const group = createGroup("END", nextGroupId(survey.children));
    survey.children.push(group.newGroup);
    state[group.newGroup.code] = group.state;
    state.setup = { code: group.newGroup.code, rules: setupOptions(group.newGroup.type) };
  }
};
