const buildLanguagesList = (state) =>
  [state.Survey.defaultLang].concat(state.Survey.additionalLang || []);

export const applyBaseLangChanged = (state, langPayload) => {
  state.langInfo.mainLang = langPayload.code;
  state.Survey.defaultLang = langPayload;
  state.Survey.additionalLang = state.Survey.additionalLang?.filter(
    (language) => language.code !== langPayload.code
  );
  state.langInfo.lang = langPayload.code;
  state.langInfo.onMainLang = true;
  state.langInfo.languagesList = buildLanguagesList(state);
};

export const applyAdditionalLangAdded = (state, langPayload) => {
  state.Survey.additionalLang = (state.Survey.additionalLang || []).concat(
    langPayload
  );
  state.langInfo.languagesList = buildLanguagesList(state);
};

export const applyAdditionalLangRemoved = (state, langPayload) => {
  state.Survey.additionalLang = state.Survey.additionalLang.filter(
    (language) => language.code !== langPayload.code
  );
  state.langInfo.languagesList = buildLanguagesList(state);
};

export const applyChangeLang = (state, langCode) => {
  state.langInfo.lang = langCode;
  state.langInfo.onMainLang = state.langInfo.lang == state.langInfo.mainLang;
};
