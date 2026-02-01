import { createSelector } from "reselect";
import { resolveQuestionCode } from "~/constants/instruction";

const makeSelectRelevantInstructionData = () => {
  return createSelector(
    [
      (state) => state.designState,
      (_state, referencedCodes) => referencedCodes,
      (_state, _referencedCodes, reverseIndex) => reverseIndex,
      (_state, _referencedCodes, _reverseIndex, mainLang) => mainLang,
    ],
    (designState, referencedCodes, reverseIndex, mainLang) => {
      const data = {
        index: {},
        questions: {},
        reverseIndex,
        mainLang,
      };

      referencedCodes.forEach((refCode) => {
        const questionCode = resolveQuestionCode(refCode, reverseIndex);

        if (designState[questionCode] && designState.index[questionCode]) {
          data.index[questionCode] = designState.index[questionCode];
          data.questions[questionCode] = {
            code: questionCode,
            content: designState[questionCode].content,
          };
        }
      });

      return data;
    }
  );
};

export { makeSelectRelevantInstructionData };
