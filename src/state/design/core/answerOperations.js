import { firstIndexInArray, lastIndexInArray, nextId } from "~/utils/design/utils";
import { splitQuestionCodes } from "./indexing";
import { cleanupRandomRules, cleanupValidation } from "./cleanup";
import { questionDesignError } from "./componentFactory";
import { reorder } from "./stateUtils";
import {
  addAnswerInstructions,
  addMaskedValuesInstructions,
  cleanupDefaultValue,
  refreshEnumForSingleChoice,
  refreshListForMultipleChoice,
} from "./addInstructions";
import { applyChangeContent } from "./contentOperations";

export const insertAnswer = (state, answer, parentCode, index) => {
  const component = state[parentCode];
  if (component) {
    if (!component.children) {
      component.children = [];
    }
    const insertIndex =
      typeof index == "number"
        ? typeof answer.type == "string"
          ? index +
            firstIndexInArray(
              component.children,
              (child) => child.type == answer.type
            )
          : index
        : lastIndexInArray(
            component.children,
            (child) => child.type == answer.type || !child.type
          );
    component.children.splice(insertIndex + 1, 0, answer);
    component.designErrors = questionDesignError(component);
    cleanupValidation(state, parentCode);
    addMaskedValuesInstructions(parentCode, component, state);
    cleanupRandomRules(component);
    return true;
  } else {
    return false;
  }
};

export const addAnswer = (state, answer) => {
  const lang = state.langInfo.mainLang;
  const label = answer.label;
  const qualifiedCode = answer.qualifiedCode;
  const codes = splitQuestionCodes(qualifiedCode);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const questionCode = codes[0];
  if (!insertAnswer(state, answer, parentCode, answer.index)) {
    return;
  }
  state[qualifiedCode] = {};
  if (label) {
    state[qualifiedCode].content = { [lang]: { label: label } };
  }
  if (answer.type) {
    state[qualifiedCode].type = answer.type;
  }
  addAnswerInstructions(state, state[qualifiedCode], parentCode, questionCode);
  cleanupDefaultValue(state[questionCode]);
  refreshEnumForSingleChoice(state[questionCode], state);
  refreshListForMultipleChoice(state[questionCode], state);
  if (answer.focus) {
    state.focus = qualifiedCode;
  }
};

export const reorderAnswers = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  component.children = reorder(
    component.children,
    payload.fromIndex,
    payload.toIndex
  );
};

export const reorderAnswersByType = (state, payload) => {
  const codes = splitQuestionCodes(payload.id);
  const parentCode = codes.slice(0, codes.length - 1).join("");
  const component = state[parentCode];
  const type = state[payload.id].type;
  const filteredChildren = component.children.filter(
    (child) => child.type == type
  );
  const fromIndex = component.children.indexOf(
    filteredChildren[payload.fromIndex]
  );
  const toIndex = component.children.indexOf(filteredChildren[payload.toIndex]);
  component.children = reorder(component.children, fromIndex, toIndex);
};

export const addNewAnswerToState = (state, { questionCode, type, index, focus, label }) => {
  const answers = state[questionCode].children || [];
  let nextAnswerIndex = 1;
  let code = "";
  let qualifiedCode = "";
  const shouldFocus = focus ?? true;
  switch (type) {
    case "column":
      nextAnswerIndex = nextId(
        answers.filter((el) => el.type === "column")
      );

      code = "Ac" + nextAnswerIndex;
      qualifiedCode = questionCode + code;
      addAnswer(state, { code, qualifiedCode, type, label, index });
      break;
    case "row":
      nextAnswerIndex = nextId(answers.filter((el) => el.type === "row"));
      code = "A" + nextAnswerIndex;
      qualifiedCode = questionCode + code;

      addAnswer(state, {
        code,
        qualifiedCode,
        type,
        label,
        index,
        focus: shouldFocus,
      });
      break;
    case "other":
      code = "Aother";
      label = "Other";
      qualifiedCode = questionCode + code;
      addAnswer(state, {
        code,
        qualifiedCode,
        type,
        label,
        index,
        focus: shouldFocus,
      });
      addAnswer(state, {
        code: "Atext",
        qualifiedCode: qualifiedCode + "Atext",
        type: "other_text",
        index,
      });
      break;

    case "all":
      code = "Aall";
      label = "All of the above";
      qualifiedCode = questionCode + code;
      addAnswer(state, {
        code,
        qualifiedCode,
        type,
        label,
        index,
        focus: shouldFocus,
      });
      break;

    case "none":
      code = "Anone";
      label = "None of the above";
      qualifiedCode = questionCode + code;
      addAnswer(state, {
        code,
        qualifiedCode,
        type,
        label,
        index,
        focus: shouldFocus,
      });
      break;
    default:
      nextAnswerIndex = nextId(answers);
      code = "A" + nextAnswerIndex;
      qualifiedCode = questionCode + code;
      addAnswer(state, {
        code,
        qualifiedCode,
        label,
        index,
        focus: shouldFocus,
      });
      break;
  }
};

export const addNewAnswersToState = (state, { questionCode, data, type, index: startIndex }) => {
  const question = state[questionCode];
  const children =
    question.children?.filter(
      (it) => state[it.qualifiedCode].type == type
    ) || [];
  let index = startIndex;
  data.forEach((item, itemIndex) => {
    if (item) {
      const nextAnswer = children[index + 1];
      if (
        nextAnswer &&
        nextAnswer.qualifiedCode &&
        state[nextAnswer.qualifiedCode] &&
        (!state[nextAnswer.qualifiedCode].content ||
          !state[nextAnswer.qualifiedCode].content[state.langInfo.lang])
      ) {
        applyChangeContent(state, {
          code: nextAnswer.qualifiedCode,
          key: "label",
          value: item,
          lang: state.langInfo.lang,
        });
      } else {
        addNewAnswerToState(state, {
          questionCode,
          label: item,
          type,
          index,
          focus: itemIndex == data.length - 1,
        });
      }

      index++;
    }
  });
};

export const onNewLineHandler = (state, { questionCode, index, type }) => {
  const answers = state[questionCode].children || [];
  const nextAnswerOfSameType = answers.filter(
    (answer) => answer.type == type
  )[index + 1];
  if (nextAnswerOfSameType && nextAnswerOfSameType.qualifiedCode) {
    state.focus = nextAnswerOfSameType.qualifiedCode;
  } else {
    addNewAnswerToState(state, {
      questionCode,
      type,
      index,
    });
  }
};
