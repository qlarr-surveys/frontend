import { createSlice } from "@reduxjs/toolkit";
import { applyDesignStateReceived } from "./core/stateInitialization";
import { applySetup, applyResetSetup, applySetDesignModeToDesign, applySetDesignModeToLang, applySetDesignModeToTheme, applySetDefaultValue, applyUpdateInstruction } from "./core/setupOperations";
import { applyChangeContent, applyChangeCustomCss, applyChangeResources } from "./core/contentOperations";
import { applyChangeRelevance, applyClearRelevanceConfig } from "./core/relevanceOperations";
import { applyChangeAttribute } from "./core/attributeOperations";
import { applyChangeValidationValue, applyAddCustomValidationRule, applyUpdateCustomValidationRuleText, applyRenameCustomValidationRule, applyUpdateCustomValidationRuleError, applyRemoveCustomValidationRule } from "./core/validationOperations";
import { applyAddSkipRule, applyUpdateSkipRule, applyRemoveSkipRule } from "./core/skipLogicOperations";
import { applyUpdateRandom, applyUpdateRandomByType } from "./core/randomOperations";
import { applyBaseLangChanged, applyAdditionalLangAdded, applyAdditionalLangRemoved, applyChangeLang } from "./core/languageOperations";
import { applyDragOperation, applyAddComponent } from "./core/treeOperations";
import { addNewAnswerToState, addNewAnswersToState, onNewLineHandler } from "./core/answerOperations";
import { cloneQuestionInState, deleteQuestionFromState, deleteGroupFromState, removeAnswerFromState } from "./core/questionOperations";

export const designState = createSlice({
  name: "designState",
  initialState: { state: {} },
  reducers: {
    designStateReceived: (state, action) => {
      applyDesignStateReceived(state, action.payload);
    },
    setup(state, action) {
      applySetup(state, action.payload);
    },
    newVersionReceived(state, action) {
      state.versionDto = action.payload;
    },
    changeValidationValue(state, action) {
      applyChangeValidationValue(state, action.payload);
    },
    resetSetup(state) {
      applyResetSetup(state);
    },
    setDesignModeToDesign(state) {
      applySetDesignModeToDesign(state);
    },
    setDesignModeToLang(state) {
      applySetDesignModeToLang(state);
    },
    setDesignModeToTheme(state) {
      applySetDesignModeToTheme(state);
    },
    changeAttribute: (state, action) => {
      applyChangeAttribute(state, action.payload);
    },
    changeRelevance: (state, action) => {
      applyChangeRelevance(state, action.payload);
    },
    clearRelevanceConfig: (state, action) => {
      applyClearRelevanceConfig(state, action.payload);
    },
    setDefaultValue: (state, action) => {
      applySetDefaultValue(state, action.payload);
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
      applyChangeCustomCss(state, action.payload);
    },
    changeResources: (state, action) => {
      applyChangeResources(state, action.payload);
    },
    updateRandom: (state, action) => {
      applyUpdateRandom(state, action.payload);
    },
    updateRandomByType: (state, action) => {
      applyUpdateRandomByType(state, action.payload);
    },
    addSkipRule: (state, action) => {
      applyAddSkipRule(state, action.payload);
    },
    updateSkipRule: (state, action) => {
      applyUpdateSkipRule(state, action.payload);
    },
    removeSkipRule: (state, action) => {
      applyRemoveSkipRule(state, action.payload);
    },
    addCustomValidationRule: (state, action) => {
      applyAddCustomValidationRule(state, action.payload);
    },
    updateCustomValidationRuleText: (state, action) => {
      applyUpdateCustomValidationRuleText(state, action.payload);
    },
    renameCustomValidationRule: (state, action) => {
      applyRenameCustomValidationRule(state, action.payload);
    },
    updateCustomValidationRuleError: (state, action) => {
      applyUpdateCustomValidationRuleError(state, action.payload);
    },
    removeCustomValidationRule: (state, action) => {
      applyRemoveCustomValidationRule(state, action.payload);
    },
    updateInstruction: (state, action) => {
      applyUpdateInstruction(state, action.payload);
    },
    onBaseLangChanged: (state, action) => {
      applyBaseLangChanged(state, action.payload);
    },
    onAdditionalLangAdded: (state, action) => {
      applyAdditionalLangAdded(state, action.payload);
    },
    onAdditionalLangRemoved: (state, action) => {
      applyAdditionalLangRemoved(state, action.payload);
    },
    changeLang: (state, action) => {
      applyChangeLang(state, action.payload);
    },
    resetFocus: (state) => {
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
