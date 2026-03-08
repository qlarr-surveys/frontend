import React from "react";
import PagesIcon from "@mui/icons-material/Pages";
import FlagIcon from "@mui/icons-material/Flag";
import StartIcon from "@mui/icons-material/Start";
import SurveyIcon from "../common/SurveyIcons/SurveyIcon";
import { QUESTION_TYPE_DATA } from "@qlarr/design-engine";

// Re-export pure logic from @qlarr/design-engine
export {
  colorToThemeMode,
  getContrastColor,
  getMildBorderColor,
  extractRgbaValues,
  isDisplay,
  createQuestion,
  questionDesignError,
} from "@qlarr/design-engine";

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
      return <SurveyIcon name="multipleChoiceArray" size={size} color={color} />;
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
  }
};

// Build QUESTION_TYPES by enriching engine data with icons
export const QUESTION_TYPES = QUESTION_TYPE_DATA.map((category) => ({
  ...category,
  items: category.items.map((item) => ({
    ...item,
    icon: questionIconByType(item.type),
  })),
}));
