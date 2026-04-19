import { isSingleSelect, mediaGroup } from "../../constants/design.js";
import {
  addAnswerInstructions,
  addMaskedValuesInstructions,
  addQuestionInstructions,
  addSkipInstructions,
  changeInstruction,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
  removeInstruction,
} from "./addInstructions.js";

export function convertChoiceQuestion(
  state,
  questionCode,
  currentQuestion,
  currentType,
  newType
) {
  const srcGroup = mediaGroup(currentType);
  const dstGroup = mediaGroup(newType);
  const srcSingle = isSingleSelect(currentType);
  const dstSingle = isSingleSelect(newType);

  // Remove skip_logic when converting from single-select to multi-select
  if (srcSingle && !dstSingle) {
    delete currentQuestion.skip_logic;
  }

  // Remove validation rules incompatible with the target selection model
  if (currentQuestion.validation) {
    const rulesNotSupportedInMulti = ["validation_required"];
    const rulesNotSupportedInSingle = [
      "validation_min_option_count",
      "validation_max_option_count",
      "validation_option_count",
    ];
    const rulesToRemove = dstSingle
      ? rulesNotSupportedInSingle
      : rulesNotSupportedInMulti;
    rulesToRemove.forEach((rule) => {
      if (rule in currentQuestion.validation) {
        delete currentQuestion.validation[rule];
        removeInstruction(currentQuestion, rule);
      }
    });
  }

  // Answer-level resource cleanup — remove resources irrelevant to target type
  if (srcGroup === "icon" && dstGroup !== "icon") {
    (currentQuestion.children || []).forEach((child) => {
      const answer = state[child.qualifiedCode];
      if (answer?.resources) delete answer.resources.icon;
    });
  }
  if (srcGroup === "image" && dstGroup !== "image") {
    (currentQuestion.children || []).forEach((child) => {
      const answer = state[child.qualifiedCode];
      if (answer?.resources) delete answer.resources.image;
    });
  }

  // Visual property transitions
  if (dstGroup === "plain") {
    delete currentQuestion.columns;
    delete currentQuestion.iconSize;
    delete currentQuestion.imageAspectRatio;
    delete currentQuestion.spacing;
    delete currentQuestion.hideText;
  } else if (dstGroup === "icon") {
    if (srcGroup === "image") {
      delete currentQuestion.imageAspectRatio;
      if (!currentQuestion.iconSize) currentQuestion.iconSize = "150";
    } else if (srcGroup === "plain") {
      if (currentQuestion.columns == null) currentQuestion.columns = 3;
      if (currentQuestion.iconSize == null) currentQuestion.iconSize = "150";
      if (currentQuestion.spacing == null) currentQuestion.spacing = 8;
    }
  } else if (dstGroup === "image") {
    if (srcGroup === "icon") {
      delete currentQuestion.iconSize;
      if (currentQuestion.imageAspectRatio == null)
        currentQuestion.imageAspectRatio = 1;
    } else if (srcGroup === "plain") {
      if (currentQuestion.columns == null) currentQuestion.columns = 3;
      if (currentQuestion.imageAspectRatio == null)
        currentQuestion.imageAspectRatio = 1;
      if (currentQuestion.spacing == null) currentQuestion.spacing = 8;
    }
  }

  // Preserve conditional_relevance — it lives only in instructionList with no
  // backing data property, so it must be saved before the list is wiped
  const conditionalRelevanceInstruction = currentQuestion.instructionList?.find(
    (i) => i.code === "conditional_relevance"
  );

  // Re-initialize question instructions for the new type
  addQuestionInstructions(currentQuestion);
  addSkipInstructions(state, questionCode);

  // Restore conditional_relevance if it was set before conversion
  if (conditionalRelevanceInstruction) {
    changeInstruction(currentQuestion, conditionalRelevanceInstruction);
  }

  // Re-initialize answer instructions for each child and grandchild
  // (grandchildren cover other_text, which is nested inside Aother)
  (currentQuestion.children || []).forEach((child) => {
    addAnswerInstructions(
      state,
      state[child.qualifiedCode],
      questionCode,
      questionCode
    );
    (state[child.qualifiedCode]?.children || []).forEach((grandchild) => {
      addAnswerInstructions(
        state,
        state[grandchild.qualifiedCode],
        child.qualifiedCode,
        questionCode
      );
    });
  });

  // Refresh return type (enum for single-select, list for multi-select)
  refreshEnumForSingleChoice(currentQuestion, state);
  refreshListForMultipleChoice(currentQuestion, state);

  // Re-apply masked value instructions
  addMaskedValuesInstructions(questionCode, currentQuestion, state);
}
