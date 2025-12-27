import React from "react";
import PagesIcon from "@mui/icons-material/Pages";
import FlagIcon from "@mui/icons-material/Flag";
import StartIcon from "@mui/icons-material/Start";
import SurveyIcon from "../common/SurveyIcons/SurveyIcon";
import { alpha, getContrastRatio } from "@mui/material";

export const groupIconByType = (type, size = "medium") => {
  switch (type) {
    case "welcome":
      return <StartIcon fontSize={size} />;
    case "END":
      return <FlagIcon fontSize={size} />;
    default:
      return <PagesIcon fontSize={size} />;
  }
};

export const questionIconByType = (type, size = "1.25em", color) => {
  switch (type) {
    case "text":
      return <SurveyIcon name="shortText" size={size} color={color} />;
    case "multiple_text":
      return <SurveyIcon name="multipleText" size={size} color={color} />;
    case "paragraph":
      return <SurveyIcon name="longText" size={size} color={color} />;
    case "autocomplete":
      return <SurveyIcon name="autocomplete" size={size} color={color} />;
    case "barcode":
      return <SurveyIcon name="qrCode" size={size} color={color} />;
    case "number":
      return <SurveyIcon name="number" size={size} color={color} />;
    case "email":
      return <SurveyIcon name="email" size={size} color={color} />;
    case "scq":
      return <SurveyIcon name="singleChoice" size={size} color={color} />;
    case "icon_scq":
      return <SurveyIcon name="singleIconChoice" size={size} color={color} />;
    case "image_scq":
      return <SurveyIcon name="singleImageChoice" size={size} color={color} />;
    case "scq_icon_array":
    case "scq_array":
      return <SurveyIcon name="singleChoiceArray" size={size} color={color} />;
    case "mcq_array":
      return (
        <SurveyIcon name="multipleChoiceArray" size={size} color={color} />
      );
    case "mcq":
      return <SurveyIcon name="multipleChoice" size={size} color={color} />;
    case "icon_mcq":
      return <SurveyIcon name="multipleIconChoice" size={size} color={color} />;

    case "image_mcq":
      return (
        <SurveyIcon name="multipleImageChoice" size={size} color={color} />
      );
    case "nps":
      return <SurveyIcon name="nps" size={size} color={color} />;
    case "date":
      return <SurveyIcon name="date" size={size} color={color} />;
    case "date_time":
      return <SurveyIcon name="datetime" size={size} color={color} />;
    case "time":
      return <SurveyIcon name="time" size={size} color={color} />;
    case "file_upload":
      return <SurveyIcon name="fileUpload" size={size} color={color} />;
    case "signature":
      return <SurveyIcon name="signature" size={size} color={color} />;
    case "photo_capture":
      return <SurveyIcon name="capturePhoto" size={size} color={color} />;
    case "video_capture":
      return <SurveyIcon name="captureVideo" size={size} color={color} />;
    case "ranking":
      return <SurveyIcon name="ranking" size={size} color={color} />;
    case "image_ranking":
      return <SurveyIcon name="imageRanking" size={size} color={color} />;
    case "text_display":
      return <SurveyIcon name="textDisplay" size={size} color={color} />;
    case "image_display":
      return <SurveyIcon name="imageDisplay" size={size} color={color} />;
    case "video_display":
      return <SurveyIcon name="videoDisplay" size={size} color={color} />;
    case "map":
      return <SurveyIcon name="location" size={size} color={color} />;
  }
};

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function blendColors(color1, color2, opacity) {
  const r = Math.round(color1[0] * (1 - opacity) + color2[0] * opacity);
  const g = Math.round(color1[1] * (1 - opacity) + color2[1] * opacity);
  const b = Math.round(color1[2] * (1 - opacity) + color2[2] * opacity);
  return [r, g, b];
}

export const getContrastColor = (hexColor, opacity = 0.2) => {
  const rgbColor = hexToRgb(hexColor);

  // Calculate luminance
  const luminance =
    (0.299 * rgbColor[0] + 0.587 * rgbColor[1] + 0.114 * rgbColor[2]) / 255;

  // Determine contrast color (black or white)
  const contrastRgb = luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const effectiveOpacity = luminance > 0.5 ? opacity : 1 - opacity;

  // Blend the original color with the contrasting color
  const blendedRgb = blendColors(rgbColor, contrastRgb, effectiveOpacity);

  // Convert the blended RGB color back to hex
  return rgbToHex(...blendedRgb);
};

export const getMildBorderColor = (textColor, opacity = 0.2) => {
  const rgbColor = hexToRgb(textColor);

  // Create a gray color (neutral gray)
  const grayRgb = [120, 120, 120];

  // Blend the text color with gray to create a mild version
  const mildRgb = blendColors(rgbColor, grayRgb, opacity);

  // Convert back to hex
  return rgbToHex(...mildRgb);
};

const extractRgbaValues = (colorString) => {
  // Handle hex colors
  if (colorString.startsWith("#")) {
    const rgb = hexToRgb(colorString);
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
  }

  // Handle rgba colors: rgba(r, g, b, a)
  const rgbaMatch = colorString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?\.?\d+)?\)/
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Handle rgb colors: rgb(r, g, b)
  const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 1,
    };
  }

  // Default fallback
  return { r: 0, g: 0, b: 0, a: 1 };
};

export const colorToThemeMode = (color) => {
  const whiteContrast = getContrastRatio(color, "#ffffff");
  const blackContrast = getContrastRatio(color, "#000000");

  // If white text has better contrast, use dark theme
  return whiteContrast > blackContrast ? "light" : "dark";
};

export const QUESTION_TYPES = [
  {
    name: "section_text_based",
    type: "text",
    items: [
      {
        type: "text",
        icon: questionIconByType("text"),
      },
      {
        type: "paragraph",
        icon: questionIconByType("paragraph"),
      },
      {
        type: "number",
        icon: questionIconByType("number"),
      },
      {
        type: "email",
        icon: questionIconByType("email"),
      },
      {
        type: "multiple_text",
        icon: questionIconByType("multiple_text"),
      },
    ],
  },
  {
    name: "section_choice_based",
    type: "choice",
    items: [
      {
        type: "scq",
        icon: questionIconByType("scq"),
      },
      {
        type: "mcq",
        icon: questionIconByType("mcq"),
      },
      {
        type: "autocomplete",
        icon: questionIconByType("autocomplete"),
      },
      {
        type: "scq_array",
        icon: questionIconByType("scq_array"),
      },
      {
        type: "mcq_array",
        icon: questionIconByType("mcq_array"),
      },

      {
        type: "nps",
        icon: questionIconByType("nps"),
      },
    ],
  },
  ,
  {
    name: "section_image_choice_based",
    type: "choice",
    items: [
      {
        type: "icon_scq",
        icon: questionIconByType("icon_scq"),
      },
      {
        type: "image_scq",
        icon: questionIconByType("image_scq"),
      },
      {
        type: "scq_icon_array",
        icon: questionIconByType("scq_icon_array"),
      },
      {
        type: "icon_mcq",
        icon: questionIconByType("icon_mcq"),
      },
      {
        type: "image_mcq",
        icon: questionIconByType("image_mcq"),
      },
    ],
  },
  {
    name: "section_date_time",
    type: "date-time",
    items: [
      {
        type: "date",
        icon: questionIconByType("date"),
      },

      {
        type: "time",
        icon: questionIconByType("time"),
      },
      {
        type: "date_time",
        icon: questionIconByType("date_time"),
      },
    ],
  },
  {
    name: "section_info",
    type: "info",
    items: [
      {
        type: "text_display",
        icon: questionIconByType("text_display"),
      },
      {
        type: "image_display",
        icon: questionIconByType("image_display"),
      },
      {
        type: "video_display",
        icon: questionIconByType("video_display"),
      },
    ],
  },
  {
    name: "offline_only",
    type: "other",
    items: [
      {
        type: "barcode",
        offlineOnly: true,
        icon: questionIconByType("barcode"),
      },
      {
        type: "photo_capture",
        offlineOnly: true,
        icon: questionIconByType("photo_capture"),
      },
      {
        type: "video_capture",
        offlineOnly: true,
        icon: questionIconByType("video_capture"),
      },
    ],
  },
  {
    name: "section_other",
    type: "other",
    items: [
      {
        type: "ranking",
        icon: questionIconByType("ranking"),
      },
      {
        type: "image_ranking",
        icon: questionIconByType("image_ranking"),
      },
      {
        type: "file_upload",
        icon: questionIconByType("file_upload"),
      },
      {
        type: "signature",
        icon: questionIconByType("signature"),
      },
      {
        type: "map",
        icon: questionIconByType("map"),
      },
    ],
  },
];

export const isDisplay = (type) => {
  return ["text_display", "image_display", "video_display"].indexOf(type) > -1;
};

export const createQuestion = (type, qId, lang) => {
  let code = `Q${qId}`;
  let returnObj = {};
  let state = { type };
  let newQuestion = { code: `Q${qId}`, qualifiedCode: `Q${qId}`, type };
  returnObj[code] = state;
  returnObj.question = newQuestion;
  switch (type) {
    case "text":
      state.maxChars = 30;
      state.showHint = true;
      break;
    case "number":
      state.maxChars = 30;
      state.showHint = true;
      break;
    case "email":
      state.maxChars = 30;
      state.showHint = true;
      state.validation = {
        validation_pattern_email: {
          isActive: true,
        },
      };

      break;
    case "paragraph":
      state.showHint = true;

      break;
    case "barcode":
      state.showHint = true;

      break;
    case "scq":
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "icon_scq":
      state.columns = 3;
      state.iconSize = "150";
      state.spacing = 8;
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "image_scq":
      state.columns = 3;
      state.imageAspectRatio = 1;
      state.spacing = 8;
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "map":
      returnObj[`Q${qId}A1`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
      ];
      break;
    case "multiple_text":
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;

    case "mcq":
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "image_ranking":
      state.columns = 3;
      state.imageAspectRatio = 1;
      state.spacing = 8;
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "ranking":
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "nps":
      break;
    case "icon_mcq":
      state.columns = 3;
      state.columns = 3;
      state.iconSize = "150";
      state.spacing = 8;
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "image_mcq":
      state.columns = 3;
      state.imageAspectRatio = 1;
      state.spacing = 8;
      returnObj[`Q${qId}A1`] = {};
      returnObj[`Q${qId}A2`] = {};
      returnObj[`Q${qId}A3`] = {};
      state.children = [
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
        },
      ];

      break;
    case "scq_icon_array":
      returnObj[`Q${qId}Ac1`] = {
        type: "column",
      };
      returnObj[`Q${qId}Ac2`] = {
        type: "column",
      };
      returnObj[`Q${qId}Ac3`] = {
        type: "column",
      };
      returnObj[`Q${qId}A1`] = {
        type: "row",
      };
      returnObj[`Q${qId}A2`] = {
        type: "row",
      };
      returnObj[`Q${qId}A3`] = {
        type: "row",
      };
      state.children = [
        {
          code: "Ac1",
          qualifiedCode: `Q${qId}Ac1`,
          type: "column",
        },
        {
          code: "Ac2",
          qualifiedCode: `Q${qId}Ac2`,
          type: "column",
        },
        {
          code: "Ac3",
          qualifiedCode: `Q${qId}Ac3`,
          type: "column",
        },
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
          type: "row",
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
          type: "row",
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
          type: "row",
        },
      ];

      break;
    case "scq_array":
    case "mcq_array":
      returnObj[`Q${qId}Ac1`] = {
        type: "column",
      };
      returnObj[`Q${qId}Ac2`] = {
        type: "column",
      };
      returnObj[`Q${qId}Ac3`] = {
        type: "column",
      };
      returnObj[`Q${qId}A1`] = {
        type: "row",
      };
      returnObj[`Q${qId}A2`] = {
        type: "row",
      };
      returnObj[`Q${qId}A3`] = {
        type: "row",
      };
      state.children = [
        {
          code: "Ac1",
          qualifiedCode: `Q${qId}Ac1`,
          type: "column",
        },
        {
          code: "Ac2",
          qualifiedCode: `Q${qId}Ac2`,
          type: "column",
        },
        {
          code: "Ac3",
          qualifiedCode: `Q${qId}Ac3`,
          type: "column",
        },
        {
          code: "A1",
          qualifiedCode: `Q${qId}A1`,
          type: "row",
        },
        {
          code: "A2",
          qualifiedCode: `Q${qId}A2`,
          type: "row",
        },
        {
          code: "A3",
          qualifiedCode: `Q${qId}A3`,
          type: "row",
        },
      ];

      break;
    case "file_upload":
      break;
    case "signature":
      break;
    case "photo_capture":
      state.showHint = true;

      break;
    case "video_capture":
      state.showHint = true;

      break;
    case "date":
      state.type = "date";
      state.dateFormat = "YYYY/MM/DD";
      state.maxDate = "";
      state.minDate = "";

      break;
    case "date_time":
      state.dateFormat = "YYYY/MM/DD";
      state.fullDayFormat = false;
      state.maxDate = "";
      state.minDate = "";

      break;
    case "time":
      state.fullDayFormat = false;
      break;
    case "autocomplete":
    case "text_display":
    case "video_display":
    case "image_display":
      break;
    default:
      break;
  }
  return returnObj;
};

export const questionDesignError = (question) => {
  let errors = [];
  switch (question.type) {
    case "scq_icon_array":
    case "scq_array":
    case "mcq_array":
      if (
        !question.children ||
        question.children.filter((child) => child.type == "row").length === 0
      ) {
        errors.push({
          code: "insufficient_rows_min_1",
          message: "must have at least 1 row",
        });
      }
      if (
        !question.children ||
        question.children.filter((child) => child.type == "column").length < 2
      ) {
        errors.push({
          code: "insufficient_cols_min_2",
          message: "must have at least 2 columns",
        });
      }
      break;
    case "image_ranking":
    case "ranking":
    case "image_scq":
    case "scq":
    case "icon_scq":
      if (!question.children || question.children.length < 2) {
        errors.push({
          code: "insufficient_options_min_2",
          message: "must have at least 2 options",
        });
      }
      break;

    case "icon_mcq":
    case "image_mcq":
    case "multiple_text":
    case "mcq":
      if (!question.children || question.children.length < 1) {
        errors.push({
          code: "insufficient_options_min_1",
          message: "must have at least 1 option",
        });
      }
      break;
  }
  return errors;
};
