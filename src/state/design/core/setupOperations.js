import { isEquivalent } from "~/utils/design/utils";
import { DESIGN_SURVEY_MODE } from "~/routes";
import { languageSetup, themeSetup } from "~/constants/design";
import { changeInstruction } from "./addInstructions";

export const applySetup = (state, payload) => {
  if (
    payload.code != state.setup?.code ||
    !isEquivalent(payload.rules, state.setup?.rules) ||
    payload.highlighted
  ) {
    state.setup = payload;
  }
};

export const applyResetSetup = (state) => {
  const isInTranslationMode =
    state.designMode === DESIGN_SURVEY_MODE.LANGUAGES;

  if (state.langInfo && !isInTranslationMode) {
    state.langInfo.lang = state.langInfo.mainLang;
    state.langInfo.onMainLang = true;
  }
  if (!state.globalSetup) {
    state.globalSetup = {};
  }
  delete state["setup"];

  if (!isInTranslationMode) {
    state.designMode = DESIGN_SURVEY_MODE.DESIGN;
  }
};

export const applySetDesignModeToDesign = (state) => {
  applyResetSetup(state);
  state.designMode = DESIGN_SURVEY_MODE.DESIGN;
};

export const applySetDesignModeToLang = (state) => {
  applyResetSetup(state);
  applySetup(state, languageSetup);
  state.designMode = DESIGN_SURVEY_MODE.LANGUAGES;
};

export const applySetDesignModeToTheme = (state) => {
  applyResetSetup(state);
  applySetup(state, themeSetup);
  state.designMode = DESIGN_SURVEY_MODE.THEME;
};

export const applySetDefaultValue = (state, { code, selectedValue }) => {
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
};

export const applyUpdateInstruction = (state, { code, instruction }) => {
  if (!state[code]) {
    return;
  }
  changeInstruction(state[code], instruction);
};
