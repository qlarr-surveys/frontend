// State utilities
export {
  buildValidationDefaultData,
  reorder,
  nextGroupId,
  nextQuestionId,
  buildReferenceInstruction,
} from "./state/stateUtils.js";

// Instruction DSL
export {
  cleanupDefaultValue,
  addSkipInstructions,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
  addMaskedValuesInstructions,
  changeInstruction,
  removeInstruction,
  addQuestionInstructions,
  addAnswerInstructions,
  updateRandomByRule,
  conditionalRelevanceEquation,
  instructionByCode,
  fileTypesToMimesArray,
  processValidation,
} from "./state/addInstructions.js";

// Constants - design rules
export {
  surveySetup,
  themeSetup,
  languageSetup,
  setupOptions,
} from "./constants/design.js";

// Constants - instruction patterns
export {
  INSTRUCTION_SYNTAX_PATTERN,
  DISPLAY_INDEX_PATTERN,
  QUESTION_CODE_PATTERN,
  GROUP_CODE_PATTERN,
  REFERENCED_CODE_PATTERN,
  INSTRUCTION_CODE_EXTRACTION_PATTERN,
  STRIP_TAGS_PATTERN,
  REGEX_ESCAPE_PATTERN,
  createQuestionCodePattern,
  resolveQuestionCode,
} from "./constants/instruction.js";

// Constants - theme
export {
  BG_COLOR,
  TEXT_COLOR,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ERR_COLOR,
  PAPER_COLOR,
  GROUP_FONT_SIZE,
  QUESTION_FONT_SIZE,
  TEXT_FONT_SIZE,
  FONT_FAMILY,
  defualtTheme,
  defaultSurveyTheme,
} from "./constants/theme.js";

// Constants - language
export { LANGUAGE, LANGUAGE_DEF } from "./constants/language.js";

// Constants - question types (data only, no icons)
export { QUESTION_TYPE_DATA } from "./constants/questionTypes.js";

// Design mode
export { DESIGN_SURVEY_MODE, inDesign, contentEditable } from "./designMode.js";

// Factories
export { createGroup } from "./factories/createGroup.js";
export { createQuestion, isDisplay } from "./factories/createQuestion.js";

// Validation
export { questionDesignError } from "./validation/questionDesignError.js";

// Utilities
export {
  isEquivalent,
  diff,
  nextId,
  stripTags,
  truncateWithEllipsis,
  isQuestion,
  isGroup,
  lastIndexInArray,
  firstIndexInArray,
} from "./utils/utils.js";

export { onDragEnd } from "./utils/dragBehavior.js";

export { accessibleDependencies } from "./utils/access/dependencies.js";
export { jumpDestinations } from "./utils/access/jumpDestinations.js";

// Color utilities
export {
  colorToThemeMode,
  getContrastColor,
  getMildBorderColor,
  extractRgbaValues,
  hexToRgb,
  rgbToHex,
  blendColors,
} from "./utils/color.js";
