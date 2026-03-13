import { cleanupValidation } from "./cleanup";
import { addMaskedValuesInstructions, updateRandomByRule } from "./addInstructions";

export const applyChangeAttribute = (state, { code, key, value }) => {
  if (
    key == "content" ||
    key == "instructionList" ||
    key == "relevance" ||
    key == "resources"
  ) {
    throw "We are changing attributes way too much than we should";
  }
  if (!state[code]) {
    state[code] = {};
  }
  const originalValue = state[code][key];

  state[code][key] = value;
  if (key == "maxChars") {
    cleanupValidation(state, code);
  } else if (key == "dateFormat") {
    addMaskedValuesInstructions(code, state[code], state);
  } else if (key == "fullDayFormat") {
    addMaskedValuesInstructions(code, state[code], state);
  } else if (key == "decimal_separator") {
    addMaskedValuesInstructions(code, state[code], state);
  } else if (
    [
      "randomize_questions",
      "randomize_groups",
      "randomize_options",
      "randomize_rows",
      "randomize_columns",
    ].indexOf(key) > -1
  ) {
    updateRandomByRule(
      state[code],
      key,
      !originalValue || originalValue == "NONE"
    );
  }
};
