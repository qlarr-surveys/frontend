export const MANAGE_SURVEY_LANDING_PAGES = {
  DESIGN: "design-survey",
  PREVIEW: "preview",
  RESPONSES: "responses",
  SETTINGS: "edit-survey",
  RESPONSE: "response",
};

export const DESIGN_SURVEY_MODE = {
  DESIGN: "design",
  THEME: "theme",
  LANGUAGES: "languages",
  REORDER: "reorder",
};

export const inDesign = (mode) => {
  return DESIGN_SURVEY_MODE.DESIGN == mode;
};

export const contentEditable = (mode) => {
  return DESIGN_SURVEY_MODE.DESIGN == mode || DESIGN_SURVEY_MODE.LANGUAGES == mode;
};

export const PREVIEW_MODE = {
  ONLINE: "online",
  ONLINE_PHONE: "online-phone",
  OFFLINE: "offline",
};

export const routes = {
  designSurvey: `/${MANAGE_SURVEY_LANDING_PAGES.DESIGN}/:surveyId`,
  editSurvey: `/${MANAGE_SURVEY_LANDING_PAGES.SETTINGS}/:surveyId`,
  responses: `/${MANAGE_SURVEY_LANDING_PAGES.RESPONSES}/:surveyId`,
  runSurvey: "/run-survey/:surveyId",
  resumeSurvey: "/resume-survey/:surveyId/:responseId",
  iframePreviewSurvey: "/preview-survey/:surveyId",
  iframePreviewGuestSurvey: "/preview-guest-survey/:surveyId",
  guestPreview: "/guest/preview/:surveyId",
  preview: "/preview/:surveyId",
  login: "/login",
  confirmNewUser: "/confirm-new-user/:token",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/",
  manageUsers: "/manage-users",
  addUser: "/add-user",
  editUser: "/edit-user/:userId",
  profile: "/profile",
  createSurvey: "/create-survey",
  dashboard1: "",
  page404: "*",
};
