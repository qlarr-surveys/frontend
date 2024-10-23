import {
  BACKEND_BASE_URL,
  CLOUD_URL,
  FRONT_END_HOST,
  PROTOCOL,
} from "~/constants/networking";

export const buildResourceUrl = (fileName, surveyId = null, example = null) => {

  if (!surveyId) {
    surveyId = sessionStorage.getItem("surveyId");
  }
  if (example == null) {
    example = sessionStorage.getItem("isGuest") == 1;
  }
  if(example){
    return `${CLOUD_URL}/survey/${surveyId}/resource/${fileName}`;
  } else {
    return `${BACKEND_BASE_URL}/survey/${surveyId}/resource/${fileName}`;
  }

};


export const sharingUrl = (surveyId, preview, lang) => {
  let segment = "run-survey";
  if (preview) {
    segment = "preview-survey";
  }
  let searchParams = "";
  if (lang) {
    searchParams = `?lang=${lang}`;
  }
  return `${PROTOCOL}://${FRONT_END_HOST}/${segment}/${surveyId}${searchParams}`;
};

export async function getFileFromPath(filePath) {
  const response = await fetch(filePath);
  const blob = await response.blob();
  const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
  return new File([blob], fileName);
}
