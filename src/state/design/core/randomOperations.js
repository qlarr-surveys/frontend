import { changeInstruction, instructionByCode, removeInstruction } from "./addInstructions";

export const applyUpdateRandom = (state, { code, groups }) => {
  const componentState = state[code];
  if (groups) {
    const instruction = { code: "random_group", groups };
    changeInstruction(componentState, instruction);
  } else {
    removeInstruction(componentState, "random_group");
  }
};

export const applyUpdateRandomByType = (state, { code, groups, type }) => {
  const componentState = state[code];
  const otherChildrenCodes = state[code]?.children
    ?.filter((el) => el.type !== type)
    ?.map((el) => el.code);
  const randomInstruction = instructionByCode(
    componentState,
    "random_group"
  );
  const otherRandomOrders =
    randomInstruction?.groups?.filter(
      (x) => x.length && x.some((elem) => otherChildrenCodes.includes(elem))
    ) || [];
  const mergedGroups = groups.concat(otherRandomOrders);
  if (mergedGroups) {
    const instruction = { code: "random_group", groups: mergedGroups };
    changeInstruction(componentState, instruction);
  } else {
    removeInstruction(componentState, "random_group");
  }
};
