import { addSkipInstructions, processValidation, updateRandomByRule } from "./addInstructions";

export const RANDOM_KEYS = [
  "randomize_questions",
  "randomize_groups",
  "randomize_options",
  "randomize_rows",
  "randomize_columns",
];

export const cleanupRandomRules = (componentState) => {
  const key = RANDOM_KEYS.find((k) => componentState[k]);
  if (key) updateRandomByRule(componentState, key);
};

// Clean up skip_logic rules that point to a deleted destination
export const cleanupSkipDestinations = (state, deletedCode) => {
  Object.keys(state).forEach((key) => {
    const component = state[key];
    if (Array.isArray(component?.skip_logic)) {
      const hadRules = component.skip_logic.some(
        (rule) => rule.skipTo === deletedCode
      );
      if (hadRules) {
        component.skip_logic = component.skip_logic.filter(
          (rule) => rule.skipTo !== deletedCode
        );
        addSkipInstructions(state, key);
      }
    }
  });
};

export const cleanupValidation = (state, code) => {
  const component = state[code];
  if (!component.validation) {
    return;
  }
  const ruleKeys = Object.keys(component["validation"]);
  ruleKeys.forEach((key) => processValidation(state, code, key, true));
};
