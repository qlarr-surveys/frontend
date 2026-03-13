// Component factory
export { createGroup, createQuestion, questionDesignError } from "./componentFactory";

// Indexing
export { buildCodeIndex, buildIndex, splitQuestionCodes, mapCodeToUserFriendlyOrder } from "./indexing";

// Cleanup
export { cleanupRandomRules, cleanupSkipDestinations, cleanupValidation } from "./cleanup";

// Content operations
export { saveContentResources, applyChangeContent, applyChangeCustomCss, applyChangeResources } from "./contentOperations";

// Setup operations
export { applySetup, applyResetSetup, applySetDesignModeToDesign, applySetDesignModeToLang, applySetDesignModeToTheme, applySetDefaultValue, applyUpdateInstruction } from "./setupOperations";

// Relevance operations
export { addRelevanceInstructions, applyChangeRelevance, applyClearRelevanceConfig } from "./relevanceOperations";

// Attribute operations
export { applyChangeAttribute } from "./attributeOperations";

// Validation operations
export { applyChangeValidationValue, applyAddCustomValidationRule, applyUpdateCustomValidationRuleText, applyRenameCustomValidationRule, applyUpdateCustomValidationRuleError, applyRemoveCustomValidationRule } from "./validationOperations";

// Skip logic operations
export { applyAddSkipRule, applyUpdateSkipRule, applyRemoveSkipRule } from "./skipLogicOperations";

// Random operations
export { applyUpdateRandom, applyUpdateRandomByType } from "./randomOperations";

// Language operations
export { applyBaseLangChanged, applyAdditionalLangAdded, applyAdditionalLangRemoved, applyChangeLang } from "./languageOperations";

// State initialization
export { applyDesignStateReceived } from "./stateInitialization";

// Tree operations
export {
  reparentQuestion,
  reorderQuestions,
  reorderGroups,
  newQuestion,
  newGroup,
  specialGroup,
  applyDragOperation,
  applyAddComponent,
} from "./treeOperations";

// Answer operations
export {
  insertAnswer,
  addAnswer,
  reorderAnswers,
  reorderAnswersByType,
  addNewAnswerToState,
  addNewAnswersToState,
  onNewLineHandler,
} from "./answerOperations";

// Clone operations
export { creatNewState } from "./cloneOperations";

// Question operations
export {
  cloneQuestionInState,
  deleteQuestionFromState,
  deleteGroupFromState,
  removeAnswerFromState,
} from "./questionOperations";
