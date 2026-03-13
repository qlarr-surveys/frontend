import cloneDeep from "lodash.clonedeep";

export const createNewState = (
  state,
  toBeCopied,
  newStateCode,
  oldQuestionCode,
  newQuestionCode
) => {
  const newState = cloneDeep(toBeCopied);
  if (newState.relevance) {
    delete newState.relevance;
    const index = newState.instructionList?.findIndex(
      (instruction) => instruction.code == "conditional_relevance"
    );
    if (index !== -1) {
      newState.instructionList?.splice(index, 1);
    }
  }
  if (newState.skip_logic) {
    delete newState.skip_logic;
    newState.instructionList = newState.instructionList.filter(
      (eq) => !eq.code.startsWith("skip_to_on_")
    );
  }
  newState.instructionList?.forEach((eq) => {
    eq.text = eq.text?.replaceAll(oldQuestionCode, newQuestionCode);
  });
  state[newStateCode] = newState;
  state[newStateCode]?.children?.forEach((child) => {
    let oldChildCode = child.qualifiedCode;
    let newChildCode = child.qualifiedCode.replaceAll(
      oldQuestionCode,
      newQuestionCode
    );
    child.qualifiedCode = newChildCode;
    createNewState(
      state,
      state[oldChildCode],
      newChildCode,
      oldQuestionCode,
      newQuestionCode
    );
  });
};
