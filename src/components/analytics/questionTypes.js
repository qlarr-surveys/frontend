// Single source of truth for question type display labels.
// Used by both QuestionCard (component mapping) and AnalyticsSurvey (header labels).
const QUESTION_TYPE_KEYS = {
  SCQ: 'analytics.question_type_scq',
  MCQ: 'analytics.question_type_mcq',
  NPS: 'analytics.question_type_nps',
  RANKING: 'analytics.question_type_ranking',
  NUMBER: 'analytics.question_type_number',
  DATE: 'analytics.question_type_date',
  TIME: 'analytics.question_type_time',
  DATE_TIME: 'analytics.question_type_date_time',
  TEXT: 'analytics.question_type_text',
  PARAGRAPH: 'analytics.question_type_paragraph',
  EMAIL: 'analytics.question_type_email',
  MULTIPLE_TEXT: 'analytics.question_type_multiple_text',
  AUTOCOMPLETE: 'analytics.question_type_autocomplete',
  ICON_SCQ: 'analytics.question_type_icon_scq',
  ICON_MCQ: 'analytics.question_type_icon_mcq',
  SCQ_ARRAY: 'analytics.question_type_scq_array',
  MCQ_ARRAY: 'analytics.question_type_mcq_array',
  SCQ_ICON_ARRAY: 'analytics.question_type_scq_icon_array',
  MCQ_ICON_ARRAY: 'analytics.question_type_mcq_icon_array',
  IMAGE_RANKING: 'analytics.question_type_image_ranking',
  IMAGE_SCQ: 'analytics.question_type_image_scq',
  IMAGE_MCQ: 'analytics.question_type_image_mcq',
  FILE_UPLOAD: 'analytics.question_type_file_upload',
  SIGNATURE: 'analytics.question_type_signature',
  PHOTO_CAPTURE: 'analytics.question_type_photo_capture',
  BARCODE: 'analytics.question_type_barcode',
};

export const getQuestionTypeLabel = (type, t) => {
  const key = QUESTION_TYPE_KEYS[type];
  return key ? t(key) : type;
};
