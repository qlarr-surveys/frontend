import { createGroup, createQuestion } from "./componentFactory";
import { buildIndex, buildCodeIndex } from "./indexing";
import { cleanupRandomRules, cleanupValidation } from "./cleanup";
import { applySetup } from "./setupOperations";
import { reorderAnswers, reorderAnswersByType } from "./answerOperations";
import { nextGroupId, nextQuestionId, reorder } from "./stateUtils";
import { setupOptions } from "~/constants/design";
import {
  addAnswerInstructions,
  addMaskedValuesInstructions,
  addQuestionInstructions,
  cleanupDefaultValue,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
} from "./addInstructions";

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

export const reorderGroups = (survey, payload) => {
  survey.children = reorder(
    survey.children,
    payload.fromIndex,
    payload.toIndex
  );
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
  applySetup(state, {
    code: newCode,
    rules: setupOptions(payload.questionType),
  });
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
  applySetup(state, {
    code: group.newGroup.code,
    rules: setupOptions(group.newGroup.type),
  });
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
    applySetup(state, {
      code: group.newGroup.code,
      rules: setupOptions(group.newGroup.type),
    });
  } else if (payload.groupType == "end") {
    const group = createGroup("END", nextGroupId(survey.children));
    survey.children.push(group.newGroup);
    state[group.newGroup.code] = group.state;
    applySetup(state, {
      code: group.newGroup.code,
      rules: setupOptions(group.newGroup.type),
    });
  }
};

export const applyDragOperation = (state, payload) => {
  state.skipScroll = true;
  switch (payload.type) {
    case "reorder_questions":
      reorderQuestions(state, state.Survey, payload);
      state.index = buildCodeIndex(state);
      break;
    case "reparent_question":
      reparentQuestion(state, state.Survey, payload);
      state.index = buildCodeIndex(state);
      break;
    case "reorder_groups":
      reorderGroups(state.Survey, payload);
      state.index = buildCodeIndex(state);
      break;
    case "reorder_answers":
      reorderAnswers(state, payload);
      break;
    case "reorder_answers_by_type":
      reorderAnswersByType(state, payload);
      break;
    case "new_question":
      newQuestion(state, payload);
      state.index = buildCodeIndex(state);
      break;
    case "new_group":
      if (payload.groupType == "group") {
        newGroup(state, payload);
        state.index = buildCodeIndex(state);
      } else if (
        payload.groupType == "end" ||
        payload.groupType == "welcome"
      ) {
        specialGroup(state, payload);
      }
      break;
  }
};

export const applyAddComponent = (state, { type, questionType }) => {
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
  state.index = buildCodeIndex(state);
};

