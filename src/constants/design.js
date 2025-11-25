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
            "questionActions",
            "disabled",
            "showDescription",
          ],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "randomize_questions"],
        },
      ];
    case "text_display":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
      ];

    case "image_display":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
      ];

    case "video_display":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
      ];

    case "text":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "options":
      return [
        {
          title: "",
          key: "",
          rules: ["changeCode", "disabled", "relevance"],
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
          ],
        },
      ];

    case "number":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "email":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "autocomplete":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          rules: [
            "validation_required",
          ],
        },
      ];

    case "paragraph":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "file_upload":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
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
          ],
        },
      ];

    case "signature":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required"],
        },
      ];

    case "photo_capture":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription", "hint"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_max_file_size"],
        },
      ];

    case "barcode":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription", "hint"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required"],
        },
      ];

    case "video_capture":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription", "hint"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_max_file_size"],
        },
      ];

    case "date_time":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
            "disabled",
            "showDescription",
            "dateFormat",
            "fullDayFormat",
            "maxDate",
            "minDate",
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
          rules: ["validation_required"],
        },
      ];

    case "date":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
            "disabled",
            "showDescription",
            "dateFormat",
            "maxDate",
            "minDate",
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
          rules: ["validation_required"],
        },
      ];

    case "time":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
            "disabled",
            "showDescription",
            "fullDayFormat",
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
          rules: ["validation_required"],
        },
      ];

    case "select":
    case "scq":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options", "skip_logic"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required"],
        },
      ];

    case "icon_scq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          rules: ["validation_required"],
        },
      ];

    case "image_scq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          rules: ["validation_required"],
        },
      ];

    case "mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
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
          ],
        },
      ];

    case "multiple_text":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "prefill", "randomize_options"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required"],
        },
      ];

    case "ranking":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
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
          ],
        },
      ];

    case "image_ranking":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "icon_mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];

    case "image_mcq":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          ],
        },
      ];
    case "scq_icon_array":
      return [
        {
          title: "general",
          key: "general",
          rules: ["changeCode", "questionActions", "disabled", "showDescription"],
        },
        {
          title: "logic",
          key: "logic",
          rules: ["relevance", "randomize_rows", "randomize_columns"],
        },
        {
          title: "validation",
          key: "validation",
          rules: ["validation_required", "validation_one_response_per_col"],
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
            "questionActions",
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
          rules: ["validation_required", "validation_one_response_per_col"],
        },
      ];
    case "nps":
      return [
        {
          title: "general",
          key: "general",
          rules: [
            "changeCode", 
            "questionActions",
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
          rules: ["validation_required"],
        },
      ];
  }
};
