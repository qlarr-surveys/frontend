
import { colorToThemeMode } from '~/components/Questions/utils';

export const BG_COLOR = '#dfe2ef';
export const TEXT_COLOR = '#091133';
export const PRIMARY_COLOR = '#2d3cb1';
export const SECONDARY_COLOR = '#672ebf';
export const ERR_COLOR = '#d13e17';
export const PAPER_COLOR = "#ffffff"

export const defualtTheme = (theme) => {
  return {
    textStyles: {
      group: {
        font: theme?.textStyles?.group?.font || "Rubik",
        size: theme?.textStyles?.group?.size || 32,
        color: theme?.textStyles?.group?.color || TEXT_COLOR,
      },
      question: {
        font: theme?.textStyles?.question?.font || "Rubik",
        size: theme?.textStyles?.question?.size || 18,
        color: theme?.textStyles?.question?.color || TEXT_COLOR,
      },
      text: {
        font: theme?.textStyles?.text?.font || "Rubik",
        size: theme?.textStyles?.text?.size || 14,
        color: theme?.textStyles?.text?.color || TEXT_COLOR,
      },
    },
    palette: {
      mode: colorToThemeMode(theme?.textColor || TEXT_COLOR),
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
      text: {
        primary: theme?.textColor || TEXT_COLOR, // Main text color
      },
    },
  };
};

export const defaultSurveyTheme = {
  textStyles: {
    group: {
      font: "Rubik",
      size: 32,
      color: TEXT_COLOR,
    },
    question: {
      font: "Rubik",
      size: 18,
      color: TEXT_COLOR,
    },
    text: {
      font: "Rubik",
      size: 14,
      color: TEXT_COLOR,
    },
  },
  primaryColor: PRIMARY_COLOR,
  bgColor: BG_COLOR,
  paperColor: PAPER_COLOR,
};

