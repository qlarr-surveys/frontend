import { createSlice } from "@reduxjs/toolkit";
import { buildCodeIndex } from "./core/indexing";
import { cleanupValidation } from "./core/cleanup";
import { applyChangeContent } from "./core/contentOperations";
import { applySetup, applyResetSetup } from "./core/setupOperations";
import { addRelevanceInstructions } from "./core/relevanceOperations";
import {
  applyDragOperation,
  applyAddComponent,
} from "./core/treeOperations";
import {
  addNewAnswerToState,
  addNewAnswersToState,
  onNewLineHandler,
} from "./core/answerOperations";
import {
  cloneQuestionInState,
  deleteQuestionFromState,
  deleteGroupFromState,
  removeAnswerFromState,
} from "./core/questionOperations";

import {
  buildValidationDefaultData,
  buildReferenceInstruction,
} from "./core/stateUtils";
import { languageSetup, themeSetup } from "~/constants/design";
import { DESIGN_SURVEY_MODE } from "~/routes";
import {
  addMaskedValuesInstructions,
  addSkipInstructions,
  changeInstruction,
  instructionByCode,
  processValidation,
  removeInstruction,
  updateRandomByRule,
} from "./core/addInstructions";
import { defaultSurveyTheme } from "~/constants/theme";

const reservedKeys = [
  "setup",
  "langInfo",
  "reorder_refresh_code",
  "state",
  "globalSetup",
  "designMode",
  "isSaving",
  "isUpdating",
  "latest",
  "lastAddedComponent",
  "index",
  "skipScroll",
];

export const designState = createSlice({
  name: "designState",
  initialState: { state: {} },
  reducers: {
    designStateReceived: (state, action) => {
      const response = action.payload;
      let newState = response.designerInput.state;

      if (!newState.Survey.theme) {
        newState.Survey.theme = defaultSurveyTheme;
      }

      const newKeys = Object.keys(newState).filter(
        (el) => !reservedKeys.includes(el)
      );
      const toBeRemoved = Object.keys(state).filter(
        (el) => !reservedKeys.includes(el) && !newKeys.includes(el)
      );

      if (!state.langInfo || response.overWriteLang) {
        const defaultLang = newState.Survey.defaultLang || LANGUAGE_DEF.en;
        const mainLang = defaultLang.code;
        const lang = defaultLang.code;
        const languagesList = [defaultLang].concat(
          newState.Survey.additionalLang || []
        );
        state.langInfo = {
          languagesList,
          mainLang,
          lang,
          onMainLang: lang == mainLang,
        };
      }

      toBeRemoved.forEach((key) => {
        delete state[key];
      });
      const inCurrentSetup = state["setup"]?.code;
      if (!newKeys.includes(inCurrentSetup)) {
        delete state["setup"];
      }

      newKeys.forEach((key) => {
        state[key] = newState[key];
      });
      state.versionDto = response.versionDto;
      state.componentIndex = response.designerInput.componentIndexList;
      state["latest"] = structuredClone(newState);
      state.lastAddedComponent = null;
      state.index = buildCodeIndex(state);
    },
    setup(state, action) {
      applySetup(state, action.payload);
    },
    newVersionReceived(state, action) {
      state.versionDto = action.payload;
    },
    changeValidationValue(state, action) {
      let payload = action.payload;
      if (!state[payload.code]["validation"]) {
        state[payload.code]["validation"] = {};
      }
      if (!state[payload.code]["validation"][payload.rule]) {
        state[payload.code]["validation"][payload.rule] =
          buildValidationDefaultData(payload.rule);
      }
      state[payload.code]["validation"][payload.rule][payload.key] =
        payload.value;
      processValidation(
        state,
        payload.code,
        payload.rule,
        payload.rule != "content"
      );
    },
    resetSetup(state) {
      applyResetSetup(state);
    },
    setDesignModeToDesign(state) {
      applyResetSetup(state);
      state.designMode = DESIGN_SURVEY_MODE.DESIGN;
    },
    setDesignModeToLang(state) {
      applyResetSetup(state);
      applySetup(state, languageSetup);
      state.designMode = DESIGN_SURVEY_MODE.LANGUAGES;
    },
    setDesignModeToTheme(state) {
      applyResetSetup(state);
      applySetup(state, themeSetup);
      state.designMode = DESIGN_SURVEY_MODE.THEME;
    },
    changeAttribute: (state, action) => {
      let payload = action.payload;
      if (
        action.payload.key == "content" ||
        action.payload.key == "instructionList" ||
        action.payload.key == "relevance" ||
        action.payload.key == "resources"
      ) {
        throw "We are changing attributes way too much than we should";
      }
      if (!state[payload.code]) {
        state[payload.code] = {};
      }
      const originalValue = state[payload.code][payload.key];

      state[payload.code][payload.key] = payload.value;
      if (action.payload.key == "maxChars") {
        cleanupValidation(state, payload.code);
      } else if (action.payload.key == "dateFormat") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (action.payload.key == "fullDayFormat") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (action.payload.key == "decimal_separator") {
        addMaskedValuesInstructions(payload.code, state[payload.code], state);
      } else if (
        [
          "randomize_questions",
          "randomize_groups",
          "randomize_options",
          "randomize_rows",
          "randomize_columns",
        ].indexOf(action.payload.key) > -1
      ) {
        updateRandomByRule(
          state[payload.code],
          action.payload.key,
          !originalValue || originalValue == "NONE"
        );
      }
    },
    changeRelevance: (state, action) => {
      let payload = action.payload;
      state[payload.code].relevance = payload.value;
      addRelevanceInstructions(state, payload.code, payload.value);
    },
    clearRelevanceConfig: (state, action) => {
      delete state[action.payload.code].relevance;
    },
    setDefaultValue: (state, action) => {
      const { code, selectedValue } = action.payload;
      const component = state[code];
      const valueInstruction = component.instructionList?.find(
        (instruction) => instruction.code == "value"
      );
      if (valueInstruction) {
        changeInstruction(component, {
          ...valueInstruction,
          text: selectedValue,
          isActive: false,
        });
      }
    },
    cloneQuestion: (state, action) => {
      cloneQuestionInState(state, action.payload);
    },
    removeAnswer: (state, action) => {
      removeAnswerFromState(state, action.payload);
    },
    addNewAnswers: (state, action) => {
      addNewAnswersToState(state, action.payload);
    },
    onNewLine: (state, action) => {
      onNewLineHandler(state, action.payload);
    },
    addNewAnswer: (state, action) => {
      addNewAnswerToState(state, action.payload);
    },
    deleteGroup: (state, action) => {
      deleteGroupFromState(state, action.payload);
    },
    deleteQuestion: (state, action) => {
      deleteQuestionFromState(state, action.payload);
    },
    changeContent: (state, action) => {
      applyChangeContent(state, action.payload);
    },
    changeCustomCss: (state, action) => {
      let payload = action.payload;
      const referenceInstructions = buildReferenceInstruction(
        payload.value,
        "custom",
        "css",
        ["customCss"]
      );
      state[payload.code].customCss = payload.value;
      referenceInstructions?.forEach((instruction) =>
        changeInstruction(state[payload.code], instruction)
      );
    },
    changeResources: (state, action) => {
      let payload = action.payload;
      if (!state[payload.code].resources) {
        state[payload.code].resources = {};
      }
      state[payload.code].resources[payload.key] = payload.value;
    },
    updateRandom: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      if (payload.groups) {
        const instruction = { code: "random_group", groups: payload.groups };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "random_group");
      }
    },
    updateRandomByType: (state, action) => {
      const payload = action.payload;
      const componentState = state[payload.code];
      const otherChildrenCodes = state[payload.code]?.children
        ?.filter((el) => el.type !== payload.type)
        ?.map((el) => el.code);
      const randomInstruction = instructionByCode(
        componentState,
        "random_group"
      );
      const otherRandomOrders =
        randomInstruction?.groups?.filter(
          (x) => x.length && x.some((elem) => otherChildrenCodes.includes(elem))
        ) || [];
      const groups = payload.groups.concat(otherRandomOrders);
      if (groups) {
        const instruction = { code: "random_group", groups };
        changeInstruction(componentState, instruction);
      } else {
        removeInstruction(componentState, "random_group");
      }
    },

    // === SKIP LOGIC REDUCERS ===
    addSkipRule: (state, action) => {
      const { code } = action.payload;
      if (!state[code].skip_logic) {
        state[code].skip_logic = [];
      }
      state[code].skip_logic.push({ condition: [], skipTo: null });
    },
    updateSkipRule: (state, action) => {
      const { code, ruleIndex, updates } = action.payload;
      const rule = state[code].skip_logic[ruleIndex];
      Object.assign(rule, updates);
      // Reset toEnd/disqualify if destination is not a group
      if (updates.skipTo && !updates.skipTo.startsWith("G")) {
        rule.toEnd = false;
        rule.disqualify = false;
      }
      addSkipInstructions(state, code);
    },
    removeSkipRule: (state, action) => {
      const { code, ruleIndex } = action.payload;
      state[code].skip_logic.splice(ruleIndex, 1);
      addSkipInstructions(state, code);
    },

    addCustomValidationRule: (state, action) => {
      const { code } = action.payload;

      const numbers = (state[code].instructionList || [])
        .map((i) => i.code.match(/^validation_custom_(\d+)$/)?.[1])
        .filter(Boolean)
        .map(Number);

      const newRuleCode = `validation_custom_${Math.max(0, ...numbers) + 1}`;

      changeInstruction(state[code], {
        code: newRuleCode,
        text: "",
        returnType: "boolean",
        isActive: true,
      });
    },

    updateCustomValidationRuleText: (state, action) => {
      const { code, ruleCode, text } = action.payload;
      state[code].instructionList.find((i) => i.code === ruleCode).text = text;
    },

    renameCustomValidationRule: (state, action) => {
      const { code, ruleCode, newCode } = action.payload;
      const instruction = state[code].instructionList.find(
        (i) => i.code === ruleCode
      );
      instruction.code = newCode;
      const content = state[code].content || {};
      Object.keys(content).forEach((lang) => {
        if (content[lang][ruleCode] !== undefined) {
          content[lang][newCode] = content[lang][ruleCode];
          delete content[lang][ruleCode];
        }
      });
    },

    updateCustomValidationRuleError: (state, action) => {
      const { code, ruleCode, lang, value } = action.payload;
      if (value) {
        state[code].content[lang][ruleCode] = value;
      } else {
        delete state[code].content[lang][ruleCode];
      }
    },

    removeCustomValidationRule: (state, action) => {
      const { code, ruleCode } = action.payload;

      changeInstruction(state[code], { code: ruleCode, remove: true });

      const content = state[code].content || {};
      Object.keys(content).forEach((lang) => {
        delete content[lang][ruleCode];
      });
    },

    updateInstruction: (state, action) => {
      const { code, instruction } = action.payload;

      if (!state[code]) {
        return;
      }

      changeInstruction(state[code], instruction);
    },

    onBaseLangChanged: (state, action) => {
      state.langInfo.mainLang = action.payload.code;
      state.Survey.defaultLang = action.payload;
      state.Survey.additionalLang = state.Survey.additionalLang?.filter(
        (language) => language.code !== action.payload.code
      );
      state.langInfo.lang = action.payload.code;
      state.langInfo.onMainLang = true;
      state.langInfo.languagesList = [action.payload].concat(
        state.Survey.additionalLang || []
      );
    },
    onAdditionalLangAdded: (state, action) => {
      state.Survey.additionalLang = (state.Survey.additionalLang || []).concat(
        action.payload
      );
      state.langInfo.languagesList = [state.Survey.defaultLang].concat(
        state.Survey.additionalLang || []
      );
    },
    onAdditionalLangRemoved: (state, action) => {
      state.Survey.additionalLang = state.Survey.additionalLang.filter(
        (language) => language.code !== action.payload.code
      );
      state.langInfo.languagesList = [state.Survey.defaultLang].concat(
        state.Survey.additionalLang || []
      );
    },
    changeLang: (state, action) => {
      state.langInfo.lang = action.payload;
      state.langInfo.onMainLang =
        state.langInfo.lang == state.langInfo.mainLang;
    },
    resetFocus: (state, action) => {
      state.focus = null;
    },
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    setUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },
    onDrag: (state, action) => {
      applyDragOperation(state, action.payload);
    },
    addComponent: (state, action) => {
      applyAddComponent(state, action.payload);
    },
  },
});

export const {
  newVersionReceived,
  designStateReceived,
  onBaseLangChanged,
  onAdditionalLangAdded,
  onAdditionalLangRemoved,
  changeLang,
  changeCustomCss,
  changeAttribute,
  changeTimeFormats,
  changeContent,
  changeResources,
  deleteQuestion,
  cloneQuestion,
  deleteGroup,
  onNewLine,
  resetFocus,
  addNewAnswer,
  addNewAnswers,
  setDesignModeToDesign,
  setDesignModeToLang,
  setDesignModeToTheme,
  removeAnswer,
  setup,
  resetSetup,
  changeValidationValue,
  updateRandom,
  updateRandomByType,
  addSkipRule,
  updateSkipRule,
  removeSkipRule,
  addCustomValidationRule,
  updateCustomValidationRuleText,
  renameCustomValidationRule,
  updateCustomValidationRuleError,
  removeCustomValidationRule,
  updateInstruction,
  changeRelevance,
  clearRelevanceConfig,
  setDefaultValue,
  onDrag,
  addComponent,
  setSaving,
  setUpdating,
} = designState.actions;

export default designState.reducer;

export { mapCodeToUserFriendlyOrder } from "./core/indexing";
