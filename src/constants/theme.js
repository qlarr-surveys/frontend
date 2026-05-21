import {
  colorToThemeMode,
  getContrastColor,
  getMildBorderColor,
} from "~/components/Questions/utils";
export {
  BG_COLOR, TEXT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ERR_COLOR,
  PAPER_COLOR, GROUP_FONT_SIZE, QUESTION_FONT_SIZE, TEXT_FONT_SIZE, FONT_FAMILY,
  defaultSurveyTheme,
} from "./surveyTheme";
import {
  BG_COLOR, TEXT_COLOR, PRIMARY_COLOR, SECONDARY_COLOR, ERR_COLOR,
  PAPER_COLOR, GROUP_FONT_SIZE, QUESTION_FONT_SIZE, TEXT_FONT_SIZE, FONT_FAMILY,
} from "./surveyTheme";

export const defualtTheme = (theme) => {
  const paperColor = theme?.paperColor || PAPER_COLOR;
  const bgColor = theme?.bgColor || BG_COLOR;
  const primaryColor = theme?.primaryColor || PRIMARY_COLOR;
  const textColor = theme?.textColor || TEXT_COLOR;

  const onPaper = getContrastColor(paperColor);
  const onDefault = getContrastColor(bgColor);
  const onPrimary = getContrastColor(primaryColor);

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
    },
    palette: {
      mode: colorToThemeMode(textColor),
      contrastThreshold: 3,
      primary: {
        main: primaryColor,
        contrastText: onPrimary,
      },
      secondary: {
        main: SECONDARY_COLOR,
      },
      error: {
        main: ERR_COLOR,
      },
      background: {
        default: bgColor,
        paper: paperColor,
      },
      text: {
        primary: textColor,
        secondary: getContrastColor(paperColor, 0.7),
        disabled: getContrastColor(paperColor, 0.5),
      },
    },
    contrast: {
      onPaper,
      onDefault,
      onPrimary,
      mildPaperBorder: getMildBorderColor(onPaper, 0.4),
      mildDefaultBorder: getMildBorderColor(onDefault, 0.4),
    },
    components: {
      // Survey inputs sit on the survey background, so their outline and
      // label must derive from that background's contrast color. The MUI
      // default highlights focus with `primary.main`, which can clash badly
      // with a custom background (e.g. an indigo outline on a red survey).
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: getMildBorderColor(onDefault, 0.4),
          },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: onDefault,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: onDefault,
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: ERR_COLOR,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: getContrastColor(bgColor, 0.65),
            "&.Mui-focused": {
              color: onDefault,
            },
            "&.Mui-error": {
              color: ERR_COLOR,
            },
          },
        },
      },
    },
  };
};
