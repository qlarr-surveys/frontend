
import { defaultSurveyTheme } from "~/constants/theme";
import DesignService from "~/services/DesignService";

const importedService = new DesignService();

export async function GetData(designService, setState, setError) {
  try {
    const response = await designService.getSurveyDesign();
    return processResponse(response, setState);
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
    processResponse(response, setState);
  } catch (err) {
    setError(err);
  }
}

const processResponse = (response, setState) => {
  let state = response.designerInput.state;

  if (!state.Survey.theme) {
    state.Survey.theme = defaultSurveyTheme;
  }

  state.versionDto = response.versionDto;
  state.componentIndex = response.designerInput.componentIndexList;
  setState(state);
  return state;
};
