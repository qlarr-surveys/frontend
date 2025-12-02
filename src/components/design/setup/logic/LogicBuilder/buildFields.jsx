import { accessibleDependencies } from "~/utils/design/access/dependencies";
import { isGroup, isQuestion, stripTags } from "~/utils/design/utils";

export const buildFields = (
  componentIndices,
  code,
  state,
  mainLang,
  langList
) => {
  let dependencies = accessibleDependencies(componentIndices, code);
  let returnResult = {
    mode: {
      label: "Mode",
      type: "text",
      valueSources: ["value"],
      defaultOperator: "is_online",
      operators: ["is_offline", "is_online"],
    },
    survey_lang: {
      label: "Language",
      type: "select",
      valueSources: ["value"],
      defaultOperator: "select_any_in",
      operators: ["select_any_in", "select_not_any_in"],
      fieldSettings: {
        listValues: langList,
      },
    },
  };
  dependencies.forEach((el) => {
    if (state[el] && (isQuestion(el) || isGroup(el))) {
      returnResult = {
        ...returnResult,
        ...buildField(el, state[el], state, mainLang),
      };
    }
  });
  return returnResult;
};

const buildField = (code, component, state, mainLang) => {
  const label =
    state.index[code] +
    ". " +
    stripTags(component.content?.[mainLang]?.label || "");
  if (isGroup(code)) {
    return {
      [code]: {
        label: label,
        type: "text",
        valueSources: ["value"],
        defaultOperator: "is_relevant",
        operators: [
          "is_relevant",
          "is_not_relevant",
          "is_valid",
          "is_not_valid",
        ],
      },
    };
  }
  switch (component.type) {
    case "autocomplete":
    case "text":
    case "barcode":
    case "email":
      return {
        [code]: {
          label: label,
          type: "text",
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "paragraph":
      return {
        [code]: {
          label: label,
          type: "text",
          valueSources: ["value"],
          defaultOperator: "like",
          operators: [
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "number":
      return {
        [code]: {
          label: label,
          type: "number",
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "file_upload":
    case "signature":
    case "photo_capture":
    case "video_capture":
      return {
        [code]: {
          label: label,
          type: "text",
          valueSources: ["value"],
          defaultOperator: "is_not_empty",
          operators: [
            "is_empty",
            "is_not_empty",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
          ],
        },
      };
    case "date":
      return {
        [code]: {
          label: label,
          type: "date",
          valueSources: ["value"],
          defaultOperator: "greater_or_equal",
          operators: [
            "greater_or_equal",
            "less_or_equal",
            "between",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "time":
      return {
        [code]: {
          label: label,
          type: "time",
          valueSources: ["value"],
          defaultOperator: "greater_or_equal",
          operators: [
            "greater_or_equal",
            "less_or_equal",
            "between",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "date_time":
      return {
        [code]: {
          label: label,
          type: "datetime",
          valueSources: ["value"],
          defaultOperator: "greater_or_equal",
          operators: [
            "greater_or_equal",
            "less_or_equal",
            "between",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        },
      };
    case "image_scq":
    case "icon_scq":
    case "scq":
      let scqReturnList = {};
      let scqListValues = {};
      component.children?.forEach((element) => {
        const label = stripTags(
          state[element.qualifiedCode].content?.[mainLang]?.label || ""
        );
        scqListValues[element.code] = label
          ? element.code + " - " + label
          : element.code;
      });
      scqReturnList[code] = {
        label: label,
        fieldSettings: {
          listValues: scqListValues,
        },

        type: "select",
        valueSources: ["value"],
        defaultOperator: "select_any_in",
        operators: [
          "select_any_in",
          "select_not_any_in",
          "is_relevant",
          "is_not_relevant",
          "is_valid",
          "is_not_valid",
          "is_empty",
          "is_not_empty",
        ],
      };
      let scqOther = component.children?.find((el) => el.code === "Aother");
      if (
        scqOther &&
        state[scqOther.qualifiedCode].children?.find(
          (el) => el.code === "Atext"
        )
      ) {
        scqReturnList[code + "AotherAtext"] = {
          label: `${label} [${
            state[scqOther.qualifiedCode].content?.[mainLang]?.label || ""
          }]`,
          type: "text",
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        };
      }
      return scqReturnList;
    case "image_mcq":
    case "icon_mcq":
    case "mcq":
      let mcqReturnList = {};
      let mcqListValues = {};
      component.children
        ?.filter((el) => el.type !== "all")
        ?.forEach((element) => {
          const label = stripTags(
            state[element.qualifiedCode].content?.[mainLang]?.label || ""
          );
          mcqListValues[element.code] = label
            ? element.code + " - " + label
            : element.code;
        });
      mcqReturnList[code] = {
        label: label,
        fieldSettings: {
          listValues: mcqListValues,
        },
        type: "multiselect",
        valueSources: ["value"],
        defaultOperator: "multiselect_equals",
        operators: [
          "multiselect_equals",
          "multiselect_not_equals",
          "is_relevant",
          "is_not_relevant",
          "is_valid",
          "is_not_valid",
        ],
      };
      let mcqOther = component.children?.find((el) => el.code === "Aother");
      if (
        mcqOther &&
        state[mcqOther.qualifiedCode].children?.find(
          (el) => el.code === "Atext"
        )
      ) {
        mcqReturnList[code + "AotherAtext"] = {
          label: `${label} [${
            state[mcqOther.qualifiedCode].content?.[mainLang]?.label || ""
          }]`,
          type: "text",
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        };
      }
      return mcqReturnList;
    case "nps":
      let npsReturnList = {};
      component.children?.forEach((element) => {
        const label = stripTags(
          state[element.qualifiedCode].content?.[mainLang]?.label || ""
        );
        mcqListValues[element.code] = label
          ? element.code + " - " + label
          : element.code;
      });
      npsReturnList[code] = {
        label: label,
        fieldSettings: {
          listValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        type: "select",
        valueSources: ["value"],
        operators: [
          "is_empty",
          "is_not_empty",
          "select_any_in",
          "select_not_any_in",
        ],
      };
      return npsReturnList;
    case "scq_icon_array":
    case "scq_array":
    case "mcq_array":
      let arrayReturnList = {};
      let arrayListValues = {};
      component.children
        ?.filter((el) => el.type == "column")
        .forEach((element) => {
          const label = stripTags(
            state[element.qualifiedCode].content?.[mainLang]?.label || ""
          );
          arrayListValues[element.code] = label
            ? element.code + " - " + label
            : element.code;
        });

      arrayReturnList[code] = {
        label: label,
        type: "text",
        valueSources: ["value"],
        defaultOperator: "is_valid",
        operators: [
          "is_relevant",
          "is_not_relevant",
          "is_valid",
          "is_not_valid",
        ],
      };

      component.children
        ?.filter((el) => el.type == "row")
        .forEach((element) => {
          arrayReturnList[code + element.code] = {
            label:
              label +
              " - " +
              stripTags(
                state[element.qualifiedCode].content?.[mainLang]?.label || ""
              ),
            type: component.type == "mcq_array" ? "multiselect" : "select",
            valueSources: ["value"],
            fieldSettings: { listValues: arrayListValues },
            defaultOperator:
              component.type == "mcq_array"
                ? "multiselect_equals"
                : "select_any_in",
            operators:
              component.type == "mcq_array"
                ? ["multiselect_equals", "multiselect_not_equals"]
                : ["select_any_in", "select_not_any_in"],
          };
        });
      return arrayReturnList;
    case "multiple_text":
      let multipleTextReturnList = {};
      component.children.forEach((element) => {
        multipleTextReturnList[code + element.code] = {
          label:
            label +
            " - " +
            stripTags(
              state[element.qualifiedCode].content?.[mainLang]?.label || ""
            ),
          type: "text",
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "like",
            "not_like",
            "starts_with",
            "ends_with",
            "is_relevant",
            "is_not_relevant",
            "is_valid",
            "is_not_valid",
            "is_empty",
            "is_not_empty",
          ],
        };
      });
      return multipleTextReturnList;
    case "ranking":
    case "image_ranking":
      let rankingReturnList = {};
      component.children?.forEach((element) => {
        rankingReturnList[code + element.code] = {
          label:
            label +
            " - " +
            stripTags(
              state[element.qualifiedCode].content?.[mainLang]?.label || ""
            ),
          type: "number",
          fieldSettings: {
            min: 1,
            max: component.children.length,
          },
          valueSources: ["value"],
          defaultOperator: "equal",
          operators: [
            "equal",
            "not_equal",
            "less",
            "less_or_equal",
            "greater",
            "greater_or_equal",
            "between",
            "not_between",
            "is_empty",
            "is_not_empty",
          ],
        };
      });
      return rankingReturnList;
    default:
      return [];
  }
};
