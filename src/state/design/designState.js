import { createSlice } from "@reduxjs/toolkit";
import { isEquivalent } from "~/utils/design/utils";
import { createGroup } from "~/components/design/NewComponentsPanel";

import {  lastIndexInArray } from "~/utils/design/utils";
import cloneDeep from "lodash.clonedeep";
import {
  buildValidationDefaultData,
  nextGroupId,
  nextQuestionId,
  reorder,
  buildReferenceInstruction,
} from "./stateUtils";
import {
  languageSetup,
  reorderSetup,
  setupOptions,
  themeSetup,
} from "~/constants/design";
import {
  createQuestion,
  questionDesignError,
} from "~/components/Questions/utils";
import { DESIGN_SURVEY_MODE } from "~/routes";
import {
  addAnswerInstructions,
  addMaskedValuesInstructions,
  addQuestionInstructions,
  addSkipInstructions,
  changeInstruction,
  conditionalRelevanceEquation,
  instructionByCode,
  processValidation,
  removeInstruction,
  updateRandomByRule,
} from "./addInstructions";

const reservedKeys = ["setup", "reorder_refresh_code"];

export const designState = createSlice({
  name: "designState",
  initialState: { state: {} },
  reducers: {
    designStateReceived: (state, action) => {
      let keys = Object.keys(state).filter((el) => !reservedKeys.includes(el));
      let newState = action.payload;
      keys = Object.keys(newState);
      keys.forEach((key) => {
        if (!isEquivalent(state[key], newState[key])) {
          state[key] = newState[key];
        }
      });
      state["latest"] = structuredClone(newState);
      state.lastAddedComponent = null;
    },
    setup(state, action) {
      const payload = action.payload;
      // we want to ignore multiple clicks on the same setup button
      // but acknowledge when we highlight or expand a specific section
      if (
        payload.code != state.setup?.code ||
        !isEquivalent(payload.rules, state.setup?.rules) ||
        payload.expanded ||
        payload.highlighted
      ) {
        state.setup = action.payload;
      }
    },
    newVersionReceived(state, action) {
      const payload = action.payload;
      state.versionDto = payload;
    },
    setupToggleExpand(state, action) {
      const key = action.payload;
      if (!state.setup.expanded) {
        state.setup.expanded = [];
      }
      if (!state.setup.expanded.includes(key)) {
        state.setup.expanded.push(key);
      } else {
        state.setup.expanded.splice(state.setup.expanded.indexOf(key), 1);
      }
    },
    changeValidationValue(state, action) {
      let payload = action.payload;
      if (!state[payload.code]["validation"]) {
        state[payload.code]["validation"] = {};
      }
      if (!state[payload.code]["validation"][payload.rule]) {
        state[payload.code]["validation"][payload.rule] =
          buildValidationDefaultData(payload.rule);
      }
      state[payload.code]["validation"][payload.rule][payload.key] =
        payload.value;
      processValidation(
        state,
        payload.code,
        payload.rule,
        payload.rule != "content"
      );
    },
    resetSetup(state) {
      if (state.langInfo) {
        state.langInfo.lang = state.langInfo.mainLang;
        state.langInfo.onMainLang = true;
      }
      if (!state.globalSetup) {
        state.globalSetup = {};
      }
      state.globalSetup.reorder_setup = undefined;
      delete state["setup"];
      state.designMode = DESIGN_SURVEY_MODE.DESIGN;
    },
    setDesignModeToLang(state) {
      designState.caseReducers.resetSetup(state);
      designState.caseReducers.setup(state, { payload: languageSetup });
      state.designMode = DESIGN_SURVEY_MODE.LANGUAGES;
    },
    setDesignModeToTheme(state) {
      designState.caseReducers.resetSetup(state);
      designState.caseReducers.setup(state, { payload: themeSetup });
      state.designMode = DESIGN_SURVEY_MODE.THEME;
    },
    setDesignModeToReorder(state) {
      designState.caseReducers.resetSetup(state);
      designState.caseReducers.setup(state, { payload: reorderSetup });
      if (!state.globalSetup) {
        state.globalSetup = {};
      }
      state.globalSetup.reorder_setup = "collapse_questions";
      state.designMode = DESIGN_SURVEY_MODE.REORDER;
    },
    changeAttribute: (state, action) => {
      let payload = action.payload;
      if (
        action.payload.key == "content" ||
        action.payload.key == "instructionList" ||
        action.payload.key == "relevance" ||
        action.payload.key == "resources"
      ) {
        throw "We are changing attributes way too much than we should";
      }
      if (!state[payload.code]) {
        state[payload.code] = {};
      }

      state[payload.code][payload.key] = payload.value;
      if (action.payload.key == "maxChars") {
        cleanupValidation(state, payload.code);
      } else if (action.payload.key == "dateFormat") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (action.payload.key == "fullDayFormat") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (action.payload.key == "decimal_separator") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (
        [
          "randomize_questions",
          "randomize_groups",
          "randomize_options",
          "randomize_rows",
          "randomize_columns",
        ].indexOf(action.payload.key) > -1
      ) {
        updateRandomByRule(state[payload.code], action.payload.key);
      } else if (
        [
          "prioritize_questions",
          "prioritize_groups",
          "prioritize_options",
          "prioritize_rows",
          "prioritize_columns",
        ].indexOf(action.payload.key) > -1
      ) {
        if (!payload.value) {
          removeInstruction(state[payload.code], "priority_groups");
        }
      }
    },
    changeRelevance: (state, action) => {
      let payload = action.payload;
      state[payload.code].relevance = payload.value;
      addRelevanceInstructions(state, payload.code, payload.value);
    },
    cloneQuestion: (state, action) => {
      const code = action.payload;
      const survey = state.Survey;
      const group = survey.children
        ?.map((group) => state[group.code])
        ?.filter(
          (group) =>
            group.children &&
            group.children.findIndex((child) => child.code == code) !== -1
        )?.[0];
      if (!group) {
        return;
      }
      const newQuestionId = "Q" + nextQuestionId(state, survey.children);
      const questionChild = group.children.find((el) => el.code == code);
      const newQuestion = {
        type: questionChild.type,
        code: newQuestionId,
        qualifiedCode: newQuestionId,
      };
      creatNewState(state, state[code], newQuestionId, code, newQuestionId);
      group.children.splice(
        group.children.indexOf(questionChild) + 1,
        0,
        newQuestion
      );
      designState.caseReducers.setup(state, {
        payload: { code: newQuestionId, rules: setupOptions(newQuestion.type) },
      });
      cleanupRandomRules(group);
    },
    removeAnswer: (state, action) => {
      const answerQualifiedCode = action.payload;
      const codes = splitQuestionCodes(answerQualifiedCode);
      let question = state[codes[0]];
      question.children = question.children.filter(
        (el) => el.code !== codes[1]
      );
      delete state[answerQualifiedCode];
      // could be otherText
      if (state.setup?.code?.includes(answerQualifiedCode)) {
        designState.caseReducers.resetSetup(state);
      }
      question.designErrors = questionDesignError(question);
      cleanupValidation(state, codes[0]);
      addMaskedValuesInstructions(codes[0], question, state);
      cleanupRandomRules(question);
    },
    addNewAnswer: (state, action) => {
      const lang = state.langInfo.mainLang;
      const payload = action.payload;
      const answer = payload.answer;
      const label = payload.label;
      const qualifiedCode = answer.qualifiedCode;
      state[qualifiedCode] = {};
      const codes = splitQuestionCodes(qualifiedCode);
      const parentCode = codes.slice(0, codes.length - 1).join("");
      const questionCode = codes[0];
      if (!insertAnswer(state, answer, parentCode)) {
        return;
      }
      if (label) {
        state[qualifiedCode].content = { [lang]: { label: label } };
      }
      if (answer.type) {
        state[qualifiedCode].type = answer.type;
      }
      addAnswerInstructions(state, state[qualifiedCode], parentCode, questionCode);
    },
    deleteGroup: (state, action) => {
      const groupCode = action.payload;
      if (state.setup?.code == groupCode) {
        designState.caseReducers.resetSetup(state);
      }
      if (state[groupCode].groupType == "END") {
        state.error = {
          message: "There must always be an end group. for an end message ",
        };
        return;
      }
      const survey = state.Survey;
      const index = survey.children?.findIndex((x) => x.code === groupCode);
      survey.children.splice(index, 1);
      delete state[groupCode];
      cleanupRandomRules(survey);
    },
    deleteQuestion: (state, action) => {
      const questionCode = action.payload;
      if (state.setup?.code == questionCode) {
        designState.caseReducers.resetSetup(state);
      }
      const survey = state.Survey;
      const group = survey.children
        ?.map((group) => state[group.code])
        ?.filter(
          (group) =>
            group.children &&
            group.children.findIndex((child) => child.code == questionCode) !==
              -1
        )?.[0];
      if (!group) {
        return;
      }
      const questionIndex = group.children.findIndex(
        (x) => x.code === questionCode
      );
      let children = [...group.children];
      if (children.length === 1) {
        group.children = [];
      } else {
        group.children.splice(questionIndex, 1);
      }
      delete state[questionCode];
      cleanupRandomRules(group);
    },
    onAddComponentsVisibilityChange: (state, action) => {
      state.addComponentsVisibility = action.payload;
    },
    changeContent: (state, action) => {
      let payload = action.payload;
      if (!state[payload.code].content) {
        state[payload.code].content = {};
        state[payload.code].content[payload.lang] = {};
      } else if (!state[payload.code].content[payload.lang]) {
        state[payload.code].content[payload.lang] = {};
      }
      const referenceInstruction = buildReferenceInstruction(
        payload.value,
        payload.key,
        payload.lang
      );
      changeInstruction(state[payload.code], referenceInstruction);
      state[payload.code].content[payload.lang][payload.key] = payload.value;
    },
    changeResources: (state, action) => {
      let payload = action.payload;
      if (!state[payload.code].resources) {
        state[payload.code].resources = {};
      }
      state[payload.code].resources[payload.key] = payload.value;
    },
    updateRandom: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      if (payload.groups) {
        const instruction = { code: "random_group", groups: payload.groups };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "random_group");
      }
    },
    updatePriority: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      if (payload.priorities) {
        const instruction = {
          code: "priority_groups",
          priorities: payload.priorities,
        };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "priority_groups");
      }
    },
    updateRandomByType: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      const otherChildrenCodes = state[payload.code]?.children
        ?.filter((el) => el.type !== payload.type)
        ?.map((el) => el.code);
      const randomInstruction = instructionByCode(
        componentState,
        "random_group"
      );
      const otherRandomOrders =
        randomInstruction?.groups?.filter(
          (x) => x.length && x.some((elem) => otherChildrenCodes.includes(elem))
        ) || [];
      const groups = payload.groups.concat(otherRandomOrders);
      if (groups) {
        const instruction = { code: "random_group", groups };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "random_group");
      }
    },
    updatePriorityByType: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      const otherChildrenCodes = state[payload.code]?.children
        ?.filter((el) => el.type !== payload.type)
        ?.map((el) => el.code);
      const priorityInstruction = instructionByCode(
        componentState,
        "priority_groups"
      );
      const otherPriorities =
        priorityInstruction?.priorities?.filter(
          (x) =>
            x && x.weights.some((el) => otherChildrenCodes.includes(el.code))
        ) || [];
      const priorities = payload.priorities.concat(otherPriorities);
      if (priorities) {
        const instruction = { code: "priority_groups", priorities };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "priority_groups");
      }
    },
    removeSkipDestination: (state, action) => {
      const payload = action.payload;
      delete state[payload.code].skip_logic[payload.answerCode];
      addSkipInstructions(state, payload.code);
    },
    editSkipDestination: (state, action) => {
      const payload = action.payload;
      if (!state[payload.code].skip_logic) {
        state[payload.code].skip_logic = {};
      }
      if (!state[payload.code].skip_logic[payload.answerCode]) {
        state[payload.code].skip_logic[payload.answerCode] = {};
      }
      if (
        state[payload.code].skip_logic?.[payload.answerCode].skipTo !==
        payload.skipTo
      ) {
        state[payload.code].skip_logic[payload.answerCode] = {
          skipTo: payload.skipTo,
        };
        addSkipInstructions(state, payload.code);
      }
    },
    editSkipToEnd: (state, action) => {
      const payload = action.payload;
      state[payload.code].skip_logic[payload.answerCode].toEnd = payload.toEnd;
      addSkipInstructions(state, payload.code);
    },
    onBaseLangChanged: (state, action) => {
      state.langInfo.mainLang = action.payload.code;
      state.Survey.defaultLang = action.payload;
      state.Survey.additionalLang = state.Survey.additionalLang?.filter(
        (language) => language.code !== action.payload.code
      );
      state.langInfo.lang = action.payload.code;
      state.langInfo.onMainLang = true;
      state.langInfo.languagesList = [action.payload].concat(
        state.Survey.additionalLang || []
      );
    },
    onAdditionalLangAdded: (state, action) => {
      state.Survey.additionalLang = (state.Survey.additionalLang || []).concat(
        action.payload
      );
      state.langInfo.languagesList = [state.Survey.defaultLang].concat(
        state.Survey.additionalLang || []
      );
    },
    onAdditionalLangRemoved: (state, action) => {
      state.Survey.additionalLang = state.Survey.additionalLang.filter(
        (language) => language.code !== action.payload.code
      );
      state.langInfo.languagesList = [state.Survey.defaultLang].concat(
        state.Survey.additionalLang || []
      );
    },
    changeLang: (state, action) => {
      state.langInfo.lang = action.payload;
      state.langInfo.onMainLang =
        state.langInfo.lang == state.langInfo.mainLang;
    },

    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    setUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },
    onDrag: (state, action) => {
      state.skipScroll = true;

      const payload = action.payload;
      switch (payload.type) {
        case "reorder_questions":
          reorderQuestions(state, state.Survey, payload);
          break;
        case "reparent_question":
          reparentQuestion(state, state.Survey, payload);
          break;
        case "reorder_groups":
          reorderGroups(state.Survey, payload);
          break;
        case "reorder_answers":
          reorderAnswers(state, payload);
          break;
        case "reorder_answers_by_type":
          reorderAnswersByType(state, payload);
          break;
        case "new_question":
          newQuestion(state, payload);
          break;
        case "new_group":
          if (payload.groupType == "group") {
            newGroup(state, payload);
          } else if (
            payload.groupType == "end" ||
            payload.groupType == "welcome"
          ) {
            specialGroup(state, payload);
          }
          break;
          // do nothing
          deafult: break;
      }
    },
    collapseAllGroups: (state) => {
      state.Survey.children.forEach(
        (group) => (state[group.code].collapsed = true)
      );
    },

    addComponent: (state, action) => {
      const { type, questionType } = action.payload;
      const survey = state.Survey;
      state.skipScroll = false;

      if (type === "group") {
        const lastGroupIndex = Math.max(0, survey.children.length - 1);
        newGroup(state, { toIndex: lastGroupIndex });
      } else if (type === "question") {
        if (state.Survey.children.length == 1) {
          newGroup(state, { toIndex: 0 });
        }
        const lastGroupIndex = Math.max(0, survey.children.length - 2);
        const destinationGroupCode = survey.children[lastGroupIndex].code;
        const destinationGroup = state[destinationGroupCode];
        const toIndex = destinationGroup.children?.length || 0;
        newQuestion(state, {
          destination: destinationGroupCode,
          questionType,
          toIndex,
        });
      }
    },
  },
});

export const {
  newVersionReceived,
  designStateReceived,
  onBaseLangChanged,
  onAdditionalLangAdded,
  onAdditionalLangRemoved,
  changeLang,
  onAddComponentsVisibilityChange,
  changeAttribute,
  resetCollapse,
  changeTimeFormats,
  changeContent,
  changeResources,
  deleteQuestion,
  cloneQuestion,
  deleteGroup,
  addNewAnswer,
  setDesignModeToLang,
  setDesignModeToReorder,
  setDesignModeToTheme,
  removeAnswer,
  setup,
  setupToggleExpand,
  resetSetup,
  changeValidationValue,
  updateRandom,
  updatePriority,
  updateRandomByType,
  updatePriorityByType,
  removeSkipDestination,
  editSkipDestination,
  editSkipToEnd,
  changeRelevance,
  onDrag,
  addComponent,
  collapseAllGroups,
  setSaving,
  setUpdating,
} = designState.actions;

export default designState.reducer;

const cleanupRandomRules = (componentState) => {
  if (componentState["randomize_questions"]) {
    updateRandomByRule(componentState, "randomize_questions");
  } else if (componentState["randomize_groups"]) {
    updateRandomByRule(componentState, "randomize_groups");
  } else if (componentState["randomize_options"]) {
    updateRandomByRule(componentState, "randomize_options");
  } else if (componentState["randomize_rows"]) {
    updateRandomByRule(componentState, "randomize_rows");
  } else if (componentState["randomize_columns"]) {
    updateRandomByRule(componentState, "randomize_columns");
  }
};



const reparentQuestion = (state, survey, payload) => {
  let index = buildIndex(state, survey.children);
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

  const rand = Math.floor(Math.random() * 1000000);
  state["reorder_refresh_code"] = rand;
  cleanupRandomRules(destinationGroup);
  cleanupRandomRules(sourceGroup);
};

const reorderQuestions = (state, survey, payload) => {
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
  const rand = Math.floor(Math.random() * 1000000);
  state["reorder_refresh_code"] = rand;
  cleanupRandomRules(destinationGroup);
  cleanupRandomRules(sourceGroup);
};

const newQuestion = (state, payload) => {
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
    addAnswerInstructions(state, state[element.qualifiedCode], newCode, newCode);
  });
  cleanupValidation(state, newCode);
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
};

const newGroup = (state, payload) => {
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
};

const specialGroup = (state, payload) => {
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
    designState.caseReducers.setup(state, {
      payload: {
        code: group.newGroup.code,
        rules: setupOptions(group.newGroup.type),
      },
    });
  } else if (payload.groupType == "end") {
    const group = createGroup("END", nextGroupId(survey.children));
    survey.children.push(group.newGroup);
    state[group.newGroup.code] = group.state;
    designState.caseReducers.setup(state, {
      payload: {
        code: group.newGroup.code,
        rules: setupOptions(group.newGroup.type),
      },
    });
  }
};

const reorderGroups = (survey, payload) => {
  survey.children = reorder(
    survey.children,
    payload.fromIndex,
    payload.toIndex
  );
};
const reorderAnswers = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  component.children = reorder(
    component.children,
    payload.fromIndex,
    payload.toIndex
  );
};
const reorderAnswersByType = (state, payload) => {
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

const insertAnswer = (state, answer, parentCode) => {
  const component = state[parentCode];
  if (component) {
    if (!component.children) {
      component.children = [];
    }
    const insertIndex = lastIndexInArray(
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

export const buildIndex = (state, groups) => {
  let retrunRestult = [];
  groups?.forEach((group) => {
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

const splitQuestionCodes = (code) => {
  return code.split(/(A[a-z_0-9]+|Q[a-z_0-9]+)/).filter(Boolean);
};



const cleanupValidation = (state, code) => {
  const component = state[code];
  if (!component.validation) {
    return;
  }
  const ruleKeys = Object.keys(component["validation"]);
  ruleKeys.forEach((key) => processValidation(state, code, key, true));
};

const addRelevanceInstructions = (state, code, relevance) => {
  const instruction = conditionalRelevanceEquation(
    relevance.logic,
    relevance.rule,
    state
  );
  changeInstruction(state[code], instruction);
};

const creatNewState = (
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
