export const surveySetup = {
  code: "Survey",
  rules: [
    {
      title: "order_priority",
      key: "random",
      rules: ["randomize_groups"],
    },
  ],
};

export const themeSetup = {
  code: "Survey",
  rules: [{ title: "", rules: ["theme"] }],
};
export const languageSetup = {
  code: "Survey",
  rules: [{ title: "", rules: ["language"] }],
};

export const setupOptions = (type) => {
  switch (type) {
    case "group":
    case "welcome":
    case "end":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "randomize_questions"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
    case "text_display":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "image_display":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "imageWidth",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "video_display":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "audio_only",
            "loop",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "text":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "maxChars",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_max_char_length",
            "validation_min_char_length",
            "validation_pattern",
            "validation_contains",
            "validation_not_contains",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "options":
      return [
        {
          title: "",
          key: "",
          rules: ["changeCode", "disabled", "relevance"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "other_text":
      return [
        {
          title: "general",
          key: "general",
          rules: ["maxChars"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_max_char_length",
            "validation_min_char_length",
            "validation_pattern",
            "validation_contains",
            "validation_not_contains",
            "custom_validation_rules",
          ],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["conditional_relevance"],
        },
      ];

    case "number":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "maxChars",
            "decimal_separator",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_between",
            "validation_not_between",
            "validation_lt",
            "validation_lte",
            "validation_gt",
            "validation_gte",
            "validation_equals",
            "validation_not_equal",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "email":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "maxChars",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_pattern_email",
            "validation_max_char_length",
            "validation_min_char_length",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "autocomplete":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "paragraph":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "minRows",
            "showWordCount",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_max_word_count",
            "validation_min_word_count",
            "validation_contains",
            "validation_not_contains",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "file_upload":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_required",
            "validation_file_types",
            "validation_max_file_size",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "signature":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "photo_capture":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_max_file_size", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "barcode":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "video_capture":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_max_file_size", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "date_time":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "dateFormat",
            "fullDayFormat",
            "maxDate",
            "minDate",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "date":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "dateFormat",
            "maxDate",
            "minDate",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "time":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "fullDayFormat",
            "hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
    case "scq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "scq_default_value",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options", "skip_logic"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "icon_scq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hideText",
            "columns",
            "iconSize",
            "spacing",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options", "skip_logic"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "image_scq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hideText",
            "columns",
            "imageAspectRatio",
            "spacing",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options", "skip_logic"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_min_option_count",
            "validation_max_option_count",
            "validation_option_count",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "multiple_text":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "ranking":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_min_ranking_count",
            "validation_max_ranking_count",
            "validation_ranking_count",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "image_ranking":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hideText",
            "columns",
            "imageAspectRatio",
            "spacing",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_min_ranking_count",
            "validation_max_ranking_count",
            "validation_ranking_count",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "icon_mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hideText",
            "columns",
            "iconSize",
            "spacing",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_min_option_count",
            "validation_max_option_count",
            "validation_option_count",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];

    case "image_mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "hideText",
            "columns",
            "imageAspectRatio",
            "spacing",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: [
            "validation_min_option_count",
            "validation_max_option_count",
            "validation_option_count",
            "custom_validation_rules",
          ],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
    case "scq_icon_array":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "randomize_rows", "randomize_columns"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_one_response_per_col", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
    case "mcq_array":
    case "scq_array":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "showDescription",
            "disabled",
            "minHeaderMobile",
            "minHeaderDesktop",
            "minRowLabelMobile",
            "minRowLabelDesktop",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "randomize_rows", "randomize_columns"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_one_response_per_col", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
    case "nps":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode",
            "disabled",
            "showDescription",
            "lower_bound_hint",
            "higher_bound_hint",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "custom_validation_rules"],
        },
        {
          title: "design",
          key: "design",
          rules: ["customCss"],
        },
        {
          title: "advanced",
          key: "advanced",
          rules: ["order_instructions", "conditional_relevance"],
        },
      ];
  }
};
