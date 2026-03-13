import { changeInstruction, conditionalRelevanceEquation } from "./addInstructions";

export const addRelevanceInstructions = (state, code, relevance) => {
  const instruction = conditionalRelevanceEquation(
    relevance.logic,
    relevance.rule,
    state
  );
  changeInstruction(state[code], instruction);
};
