export const MANAGE_SURVEY_LANDING_PAGES = {
  DESIGN: "design-survey",
  LAUNCH: "launch",
  RESPONSES: "responses",
  SETTINGS: "edit-survey",
  RESPONSE: "response",
};


export const routes = {
  designSurvey: `/${MANAGE_SURVEY_LANDING_PAGES.DESIGN}/:surveyId`,
  editSurvey: `/${MANAGE_SURVEY_LANDING_PAGES.SETTINGS}/:surveyId`,
  responses: `/${MANAGE_SURVEY_LANDING_PAGES.RESPONSES}/:surveyId`,
  launch: `/${MANAGE_SURVEY_LANDING_PAGES.LAUNCH}/:surveyId/`,
  runSurvey: "/run-survey/:surveyId",
  resumeSurvey: "/resume-survey/:surveyId/:responseId",
  previewSurvey: "/preview-survey/:surveyId",
  previewGuestSurvey: "/preview-guest-survey/:surveyId",
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
