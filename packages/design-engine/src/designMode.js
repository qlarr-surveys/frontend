export const DESIGN_SURVEY_MODE = {
  DESIGN: "design",
  THEME: "theme",
  LANGUAGES: "languages",
};

export const inDesign = (mode) => {
  return DESIGN_SURVEY_MODE.DESIGN == mode;
};

export const contentEditable = (mode) => {
  return DESIGN_SURVEY_MODE.DESIGN == mode || DESIGN_SURVEY_MODE.LANGUAGES == mode;
};
