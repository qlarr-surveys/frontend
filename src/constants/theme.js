export const BG_COLOR = '#dfe2ef';
export const TEXT_COLOR = '#091133';
export const PRIMARY_COLOR = '#091133';
export const SECONDARY_COLOR = '#672ebf';
export const ERR_COLOR = '#d13e17';
export const PAPER_COLOR = "#ffffff"

export const defualtTheme = (theme) => {
  return {
    textStyles: {
      group: {
        font: theme?.textStyles?.group?.font || "Google Sans",
        size: theme?.textStyles?.group?.size || 26,
        color: theme?.textStyles?.group?.color || TEXT_COLOR,
      },
      question: {
        font: theme?.textStyles?.question?.font || "Google Sans",
        size: theme?.textStyles?.question?.size || 18,
        color: theme?.textStyles?.question?.color || TEXT_COLOR,
      },
      text: {
        font: theme?.textStyles?.text?.font || "Google Sans",
        size: theme?.textStyles?.text?.size || 14,
        color: theme?.textStyles?.text?.color || TEXT_COLOR,
      },
    },
    palette: {
      type: "light",
      primary: {
        main: theme?.primaryColor || PRIMARY_COLOR,
      },
      secondary: {
        main: SECONDARY_COLOR,
      },
      error: {
        main: ERR_COLOR,
      },
      background: {
        default: theme?.bgColor || BG_COLOR,
        paper: theme?.paperColor || PAPER_COLOR,
      },
    },
  };
};

export const defaultSurveyTheme = {
  textStyles: {
    group: {
      font: "Google Sans",
      size: 26,
      color: TEXT_COLOR,
    },
    question: {
      font: "Google Sans",
      size: 18,
      color: TEXT_COLOR,
    },
    text: {
      font: "Google Sans",
      size: 14,
      color: TEXT_COLOR,
    },
  },
  primaryColor: '#2d3cb1',
  bgColor: '#dfe2ef',
  paperColor: "#fafafa",
};

