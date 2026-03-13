import { addSkipInstructions, processValidation, updateRandomByRule } from "./addInstructions";

export const cleanupRandomRules = (componentState) => {
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
