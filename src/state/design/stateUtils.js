
import { jsonToJs } from "~/utils/design/logicUtils";


export const cleanupValidationData = (component, key, validation) => {
  switch (key) {
    case "validation_required":
    case "validation_one_response_per_col":
    case "validation_pattern_email":
    case "validation_contains":
    case "validation_not_contains":
    case "validation_pattern":
    case "validation_max_word_count":
    case "validation_min_word_count":
    case "validation_between":
    case "validation_not_between":
    case "validation_lt":
    case "validation_lte":
    case "validation_gt":
    case "validation_gte":
    case "validation_equals":
    case "validation_not_equal":
      return validation;
    case "validation_min_char_length":
      return {
        ...validation,
        min_length: Math.min(component.maxChars || 30, validation.min_length),
      };
    case "validation_max_char_length":
      return {
        ...validation,
        max_length: Math.min(component.maxChars || 30, validation.max_length),
      };
    case "validation_min_ranking_count":
    case "validation_min_option_count":
      return {
        ...validation,
        min_count: Math.min(component.children.length, validation.min_count),
      };
    case "validation_max_ranking_count":
    case "validation_max_option_count":
      return {
        ...validation,
        max_count: Math.min(component.children.length, validation.max_count),
      };
    case "validation_ranking_count":
    case "validation_option_count":
      return {
        ...validation,
        count: Math.min(component.children.length, validation.count),
      };
    default:
      return validation;
  }
};

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


export const conditionalRelevanceEquation = (logic, rule, state) => {
  const code = "conditional_relevance";
  if (rule == "show_always") {
    return { code, remove: true };
  } else if (rule == "hide_always") {
    return {
      code,
      text: "false",
      isActive: false,
      returnType: "boolean",
    };
  }
  const text = jsonToJs(logic, false, (code) => state[code].type);
  if (rule == "show_if") {
    return { code, text, isActive: true, returnType: "boolean" };
  } else if (rule == "hide_if") {
    return {
      code,
      text: `!(${text})`,
      isActive: true,
      returnType: "boolean",
    };
  } else {
    throw "WTF";
  }
};

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const nextGroupId = (groups) => {
  if (groups && groups.length) {
    return (
      groups
        .map((group) => parseInt(group.code.replace("G", "")))
        .sort(function (a, b) {
          return a - b;
        })[groups.length - 1] + 1
    );
  }
  return 1;
};

export const nextQuestionId = (state, groups) => {
  if (groups.length) {
    let questions = [];
    groups.forEach((group) => {
      let groupObj = state[group.code];
      if (groupObj.children) {
        groupObj.children.forEach((question) => {
          questions.push(parseInt(question.code.replace("Q", "")));
        });
      }
    });
    if (questions.length) {
      return (
        questions.sort(function (a, b) {
          return a - b;
        })[questions.length - 1] + 1
      );
    }
  }
  return 1;
};

export const buildReferenceInstruction = (content, name, key) => {
  const allMatches = getAllMatches(content);
  if (allMatches.length) {
    return {
      code: `reference_${name}_${key}`,
      references: allMatches,
      lang: key,
    };
  } else {
    return {
      code: `reference_${name}_${key}`,
      remove: true,
    };
  }
};

const getAllMatches = (inputString) => {
  const regex = /data-instruction=(\"|\')([\w\.!\"!\']+)(\"|\')/g;
  var m;
  var returnList = [];

  do {
    m = regex.exec(inputString);
    if (m) {
      returnList.push(m[2]);
    }
  } while (m);
  return returnList;
};
