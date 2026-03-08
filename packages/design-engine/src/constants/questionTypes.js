export const QUESTION_TYPE_DATA = [
  {
    name: "section_text_based",
    type: "text",
    items: [
      { type: "text" },
      { type: "paragraph" },
      { type: "number" },
      { type: "email" },
      { type: "multiple_text" },
    ],
  },
  {
    name: "section_choice_based",
    type: "choice",
    items: [
      { type: "scq" },
      { type: "mcq" },
      { type: "autocomplete" },
      { type: "scq_array" },
      { type: "mcq_array" },
      { type: "nps" },
    ],
  },
  {
    name: "section_image_choice_based",
    type: "choice",
    items: [
      { type: "icon_scq" },
      { type: "image_scq" },
      { type: "scq_icon_array" },
      { type: "icon_mcq" },
      { type: "image_mcq" },
    ],
  },
  {
    name: "section_date_time",
    type: "date-time",
    items: [
      { type: "date" },
      { type: "time" },
      { type: "date_time" },
    ],
  },
  {
    name: "section_info",
    type: "info",
    items: [
      { type: "text_display" },
      { type: "image_display" },
      { type: "video_display" },
    ],
  },
  {
    name: "offline_only",
    type: "other",
    items: [
      { type: "barcode", offlineOnly: true },
      { type: "photo_capture", offlineOnly: true },
      { type: "video_capture", offlineOnly: true },
    ],
  },
  {
    name: "section_other",
    type: "other",
    items: [
      { type: "ranking" },
      { type: "image_ranking" },
      { type: "file_upload" },
      { type: "signature" },
    ],
  },
];
