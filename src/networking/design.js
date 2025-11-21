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

export async function SetData(state, setState, setError, version, subVersion) {
  try {
    const params = new URLSearchParams([
      ["version", version],
      ["sub_version", subVersion],
    ]);
    const response = await importedService.setSurveyDesign(state, params);
    processResponse(response, setState, state.langInfo);
  } catch (err) {
    setError(err);
  }
}

const processResponse = (response, setState, langInfo) => {
  let state = response.designerInput.state;

  // Debug: Check if custom_css exists in the backend response
  console.log('🔍 Processing backend response...');
  console.log('🔍 Response structure:', {
    hasDesignerInput: !!response.designerInput,
    hasState: !!response.designerInput?.state,
    stateKeys: Object.keys(response.designerInput?.state || {}),
    hasCustomCSS: !!response.designerInput?.state?.custom_css
  });
  
  if (response.designerInput?.state?.custom_css) {
    console.log('✅ custom_css found in backend response:', response.designerInput.state.custom_css);
  } else {
    console.log('❌ custom_css NOT found in backend response');
    console.log('❌ Available root-level keys:', Object.keys(response.designerInput?.state || {}));
  }

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
  
  // Debug: Verify custom_css is preserved in final state
  console.log('🔍 Final state before setState:', {
    stateKeys: Object.keys(state),
    hasCustomCSS: !!state.custom_css,
    customCSSContent: state.custom_css
  });
  
  if (state.custom_css) {
    console.log('✅ custom_css preserved in final state:', state.custom_css);
  } else {
    console.log('❌ custom_css lost during state processing');
  }
  
  setState(state);
  return state;
};
