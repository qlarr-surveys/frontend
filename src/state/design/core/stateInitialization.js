import { buildCodeIndex } from "./indexing";
import { defaultSurveyTheme } from "~/constants/theme";
import { LANGUAGE_DEF } from "~/constants/language";

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

export const applyDesignStateReceived = (state, response) => {
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
};
