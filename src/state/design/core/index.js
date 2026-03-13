// Component factory
export { createGroup, createQuestion, questionDesignError } from "./componentFactory";

// Indexing
export { buildCodeIndex, buildIndex, splitQuestionCodes, mapCodeToUserFriendlyOrder } from "./indexing";

// Cleanup
export { cleanupRandomRules, cleanupSkipDestinations, cleanupValidation } from "./cleanup";

// Content operations
export { saveContentResources, applyChangeContent } from "./contentOperations";

// Setup operations
export { applySetup, applyResetSetup } from "./setupOperations";

// Relevance operations
export { addRelevanceInstructions } from "./relevanceOperations";

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
