import { isEquivalent } from "~/utils/design/utils";
import { DESIGN_SURVEY_MODE } from "~/routes";

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
