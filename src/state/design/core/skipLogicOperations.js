import { addSkipInstructions } from "./addInstructions";

export const applyAddSkipRule = (state, { code }) => {
  if (!state[code].skip_logic) {
    state[code].skip_logic = [];
  }
  state[code].skip_logic.push({ condition: [], skipTo: null });
};

export const applyUpdateSkipRule = (state, { code, ruleIndex, updates }) => {
  const rule = state[code].skip_logic?.[ruleIndex];
  if (!rule) {
    return;
  }
  Object.assign(rule, updates);
  // Reset toEnd/disqualify if destination is not a group
  if (updates.skipTo && !updates.skipTo.startsWith("G")) {
    rule.toEnd = false;
    rule.disqualify = false;
  }
  addSkipInstructions(state, code);
};

export const applyRemoveSkipRule = (state, { code, ruleIndex }) => {
  state[code].skip_logic.splice(ruleIndex, 1);
  addSkipInstructions(state, code);
};
