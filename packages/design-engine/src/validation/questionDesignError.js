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
