import { colorToThemeMode } from "~/components/Questions/utils";

export const BG_COLOR = "#dfe2ef";
export const TEXT_COLOR = "#091133";
export const PRIMARY_COLOR = "#2d3cb1";
export const SECONDARY_COLOR = "#672ebf";
export const ERR_COLOR = "#d13e17";
export const PAPER_COLOR = "#ffffff";
export const GROUP_FONT_SIZE = 32;
export const QUESTION_FONT_SIZE = 18;
export const TEXT_FONT_SIZE = 14;
export const FONT_FAMILY = "Rubik";

export const defualtTheme = (theme) => {
  return {
    textStyles: {
      group: {
        font: theme?.textStyles?.group?.font || FONT_FAMILY,
        size: theme?.textStyles?.group?.size || GROUP_FONT_SIZE,
        color: theme?.textStyles?.group?.color || TEXT_COLOR,
      },
      question: {
        font: theme?.textStyles?.question?.font || FONT_FAMILY,
        size: theme?.textStyles?.question?.size || QUESTION_FONT_SIZE,
        color: theme?.textStyles?.question?.color || TEXT_COLOR,
      },
      text: {
        font: theme?.textStyles?.text?.font || FONT_FAMILY,
        size: theme?.textStyles?.text?.size || TEXT_FONT_SIZE,
        color: theme?.textStyles?.text?.color || TEXT_COLOR,
      },
    },
    typography: {
      fontFamily: theme?.textStyles?.text?.font || FONT_FAMILY,
      fontSize: theme?.textStyles?.text?.size || TEXT_FONT_SIZE,
      // This will apply to most MUI components including TextField
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
      font: FONT_FAMILY,
      size: GROUP_FONT_SIZE,
      color: TEXT_COLOR,
    },
    question: {
      font: FONT_FAMILY,
      size: QUESTION_FONT_SIZE,
      color: TEXT_COLOR,
    },
    text: {
      font: FONT_FAMILY,
      size: TEXT_FONT_SIZE,
      color: TEXT_COLOR,
    },
  },
  primaryColor: PRIMARY_COLOR,
  bgColor: BG_COLOR,
  paperColor: PAPER_COLOR,
};
