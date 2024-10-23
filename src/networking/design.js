import { LANGUAGE_DEF } from "~/constants/language";
import { defaultSurveyTheme } from "~/constants/theme";
import DesignService from "~/services/DesignService";

const importedService = new DesignService();

export async function GetData(designService, setState, setError, langInfo) {
  try {
    const response = await designService.getSurveyDesign();
    return processResponse(response, setState, langInfo);
  } catch (err) {
    setError(err);
  }
}

export async function SetData(state, setState, setError) {
  try {
    const params = new URLSearchParams([
      ["version", state.versionDto.version],
      ["sub_version", state.versionDto.subVersion],
    ]);
    const response = await importedService.setSurveyDesign(state, params);
    processResponse(response, setState, state.langInfo);
  } catch (err) {
    setError(err);
  }
}

const processResponse = (response, setState, langInfo) => {
  let state = response.designerInput.state;

  if (!state.Survey.theme) {
    state.Survey.theme = defaultSurveyTheme;
  }
  const defaultLang =
    response.designerInput.state.Survey.defaultLang || LANGUAGE_DEF.en;
  const mainLang = defaultLang.code;
  const lang = langInfo?.lang || defaultLang.code;
  const languagesList = [defaultLang].concat(
    response.designerInput.state.Survey.additionalLang || []
  );
  state.langInfo = {
    languagesList,
    mainLang,
    lang,
    onMainLang: lang == mainLang,
  };
  state.versionDto = response.versionDto;
  state.componentIndex = response.designerInput.componentIndexList;
  setState(state);
  return state;
};
