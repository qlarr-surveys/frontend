import { buildCodeIndex, splitQuestionCodes } from "./indexing";
import { cleanupRandomRules, cleanupSkipDestinations, cleanupValidation } from "./cleanup";
import { applySetup, applyResetSetup } from "./setupOperations";
import { creatNewState } from "./cloneOperations";
import { questionDesignError } from "./componentFactory";
import { nextQuestionId } from "./stateUtils";
import { setupOptions } from "~/constants/design";
import {
  addMaskedValuesInstructions,
  addSkipInstructions,
  cleanupDefaultValue,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
} from "./addInstructions";

export const cloneQuestionInState = (state, code) => {
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
  applySetup(state, {
    code: newQuestionId,
    rules: setupOptions(newQuestion.type),
  });
  cleanupRandomRules(group);
  state.index = buildCodeIndex(state);
  state.focus = newQuestionId;
};

export const deleteQuestionFromState = (state, questionCode) => {
  if (state.setup?.code == questionCode) {
    applyResetSetup(state);
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
  cleanupSkipDestinations(state, questionCode);
};

export const deleteGroupFromState = (state, groupCode) => {
  if (state.setup?.code == groupCode) {
    applyResetSetup(state);
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
  cleanupSkipDestinations(state, groupCode);
};

export const removeAnswerFromState = (state, answerQualifiedCode) => {
  const codes = splitQuestionCodes(answerQualifiedCode);
  let question = state[codes[0]];
  question.children = question.children.filter(
    (el) => el.code !== codes[1]
  );
  delete state[answerQualifiedCode];
  // could be otherText
  if (state.setup?.code?.includes(answerQualifiedCode)) {
    applyResetSetup(state);
  }
  state.index = buildCodeIndex(state);
  question.designErrors = questionDesignError(question);
  cleanupValidation(state, codes[0]);
  cleanupDefaultValue(question);
  refreshEnumForSingleChoice(question, state);
  refreshListForMultipleChoice(question, state);
  addMaskedValuesInstructions(codes[0], question, state);
  cleanupRandomRules(question);
  addSkipInstructions(state, codes[0]);
};
