import { changeInstruction, conditionalRelevanceEquation } from "./addInstructions";

export const addRelevanceInstructions = (state, code, relevance) => {
  const instruction = conditionalRelevanceEquation(
    relevance.logic,
    relevance.rule,
    state
  );
  changeInstruction(state[code], instruction);
};

export const applyChangeRelevance = (state, { code, value }) => {
  state[code].relevance = value;
  addRelevanceInstructions(state, code, value);
};

export const applyClearRelevanceConfig = (state, { code }) => {
  delete state[code].relevance;
};
