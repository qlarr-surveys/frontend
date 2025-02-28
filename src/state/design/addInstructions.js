import { fileTypesToMimesArray } from "~/constants/validation";

export const addSkipInstructions = (state, code) => {
  const component = state[code];
  if (
    component.type != "scq" &&
    component.type != "image_scq" &&
    component.type != "icon_scq"
  ) {
    return;
  }
  const instructions = scqSkipEquations(code, component);
  instructions.forEach((instruction) => {
    changeInstruction(state[code], instruction);
  });
};

export const addMaskedValuesInstructions = (
  qualifiedCode,
  component,
  state
) => {
  if (
    !component.type ||
    ![
      "mcq",
      "image_mcq",
      "icon_mcq",
      "scq",
      "icon_scq",
      "number",
      "image_scq",
      "scq_icon_array",
      "scq_array",
      "date",
      "date_time",
      "time",
    ].includes(component.type)
  ) {
    return;
  }
  switch (component.type) {
    case "date":
      if (component.dateFormat) {
        changeInstruction(component, {
          code: "masked_value",
          isActive: true,
          returnType: "string",
          text: `QlarrScripts.formatSqlDate(${qualifiedCode}.value, "${component.dateFormat}")`,
        });
      } else {
        changeInstruction(component, { code: "masked_value", remove: true });
      }
      break;
    case "time":
      changeInstruction(component, {
        code: "masked_value",
        isActive: true,
        returnType: "string",
        text: `QlarrScripts.formatTime(${qualifiedCode}.value, ${
          component.fullDayFormat || false
        })`,
      });
      break;
    case "number":
      if (component.decimal_separator == ",") {
        changeInstruction(component, {
          code: "masked_value",
          isActive: true,
          returnType: "string",
          text: `${qualifiedCode}.value ? ${qualifiedCode}.value.toString().replace(".",",") : ${qualifiedCode}.value == undefined? "" : ${qualifiedCode}.value`,
        });
      } else {
        changeInstruction(component, { code: "masked_value", remove: true });
      }

      break;
    case "date_time":
      if (component.dateFormat) {
        changeInstruction(component, {
          code: "masked_value",
          isActive: true,
          returnType: "string",
          text: `QlarrScripts.formatSqlDate(${qualifiedCode}.value, "${
            component.dateFormat
          }") + " " + QlarrScripts.formatTime(${qualifiedCode}.value, ${
            component.fullDayFormat || false
          })`,
        });
      } else {
        changeInstruction(component, { code: "masked_value", remove: true });
      }
      break;
    case "image_scq":
    case "icon_scq":
    case "scq":
      if (component.children && component.children.length) {
        let objText =
          "{" +
          component.children
            .map((el) =>
              el.type == "other"
                ? `"${el.code}": ${el.qualifiedCode}Atext.value`
                : `"${el.code}": ${el.qualifiedCode}.label`
            )
            .join(",") +
          "}";
        const instruction = {
          code: "masked_value",
          isActive: true,
          returnType: "string",
          text: `${qualifiedCode}.value ? QlarrScripts.safeAccess(${objText},${qualifiedCode}.value) : ''`,
        };
        changeInstruction(component, instruction);
      } else {
        changeInstruction(component, { code: "masked_value", remove: true });
      }
      break;
    case "image_mcq":
    case "icon_mcq":
    case "mcq":
      if (component.children && component.children.length) {
        let text =
          "[" +
          component.children
            .map((answer) => {
              return (
                `{ "value":${answer.qualifiedCode}.value,` +
                ` "label":${
                  answer.type == "other"
                    ? answer.qualifiedCode + "Atext.value"
                    : answer.qualifiedCode + ".label"
                } }`
              );
            })
            .join(", ") +
          "]";
        const instruction = {
          code: "masked_value",
          isActive: true,
          returnType: "string",
          text: `QlarrScripts.listStrings(${text}.filter(function(elem){return QlarrScripts.safeAccess(elem,"value")}).map(function(elem){return QlarrScripts.safeAccess(elem,"label")}), Survey.lang)`,
        };
        changeInstruction(component, instruction);
      } else {
        changeInstruction(component, { code: "masked_value", remove: true });
      }
      break;
    case "scq_icon_array":
    case "scq_array":
      if (
        component.children &&
        component.children.length &&
        component.children.filter((el) => el.type == "column").length &&
        component.children.filter((el) => el.type === "row").length
      ) {
        let objText =
          "{" +
          component.children
            .filter((el) => el.type == "column")
            .map((el) => `"${el.code}": ${el.qualifiedCode}.label`)
            .join(",") +
          "}";

        component.children
          .filter((el) => el.type === "row")
          .forEach((el) => {
            const instruction = {
              code: "masked_value",
              isActive: true,
              returnType: "string",
              text: `${el.qualifiedCode}.value ? QlarrScripts.safeAccess(${objText},${el.qualifiedCode}.value) : ''`,
            };
            changeInstruction(state[el.qualifiedCode], instruction);
          });
      } else if (
        component.children &&
        component.children.filter((el) => el.type === "row").length
      ) {
        component.children
          .filter((el) => el.type === "row")
          .forEach((el) => {
            changeInstruction(state[el.qualifiedCode], {
              code: "masked_value",
              remove: true,
            });
          });
      }
  }
  return component;
};

export const changeInstruction = (componentState, instruction) => {
  if (typeof componentState.instructionList === "undefined") {
    componentState.instructionList = [];
  }
  if (instruction.remove) {
    removeInstruction(componentState, instruction.code);
  } else {
    editInstruction(componentState, instruction);
  }
};

// there is always an assumption that instructionList exists!!!
export const removeInstruction = (componentState, code) => {
  if (componentState.instructionList.length) {
    const index = componentState.instructionList.findIndex(
      (el) => el.code === code
    );
    if (index < 0) {
      return;
    } else if (componentState.instructionList.length == 1) {
      componentState.instructionList = [];
    } else {
      componentState.instructionList.splice(index, 1);
    }
  }
};

export const addQuestionInstructions = (question) => {
  let type = question.type;
  switch (type) {
    case "text":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "number":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "double",
          text: "",
        },
      ];
      break;
    case "email":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "paragraph":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "barcode":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
        {
          code: "mode",
          isActive: false,
          returnType: "string",
          text: "offline",
        },
      ];
      break;
    case "scq":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "icon_scq":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "image_scq":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "string",
          text: "",
        },
      ];
      break;
    case "nps":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "int",
          text: "",
        },
      ];
      break;
    case "file_upload":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "file",
          text: "",
        },
      ];
      break;
    case "signature":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "file",
          text: "",
        },
      ];
      break;
    case "photo_capture":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "file",
          text: "",
        },
        {
          code: "mode",
          isActive: false,
          returnType: "string",
          text: "offline",
        },
      ];
      break;
    case "video_capture":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "file",
          text: "",
        },
        {
          code: "mode",
          isActive: false,
          returnType: "string",
          text: "offline",
        },
      ];
      break;
    case "date":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "date",
          text: "",
        },
      ];
      break;
    case "date_time":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "date",
          text: "",
        },
      ];
      break;
    case "time":
      question.instructionList = [
        {
          code: "value",
          isActive: false,
          returnType: "date",
          text: "",
        },
      ];
      break;
    case "text_display":
    case "video_display":
    case "image_display":
    case "scq_icon_array":
    case "scq_array":
    case "icon_mcq":
    case "image_mcq":
    case "mcq":
    case "image_ranking":
    case "ranking":
    default:
      break;
  }
};

export const addAnswerInstructions = (state, answer, parentCode) => {
  const questionType = state[parentCode].type;
  const type = answer.type;
  const valueInstruction = {
    code: "value",
    isActive: false,
    returnType:
      questionType == "ranking" ||
      questionType == "nps" ||
      questionType == "image_ranking"
        ? "Int"
        : questionType == "scq_array" || questionType == "scq_icon_array"
        ? "string"
        : "boolean",
    text: "",
  };

  switch (type) {
    case "column":
      return;
    case "row":
      changeInstruction(answer, valueInstruction);
      return;
    case "other":
      if (questionType !== "scq") {
        changeInstruction(answer, valueInstruction);
      }
      return;
    case "other_text":
      changeInstruction(answer, {
        code: "value",
        isActive: false,
        returnType: "string",
        text: "",
      });

      changeInstruction(answer, {
        code: "conditional_relevance",
        isActive: true,
        returnType: "boolean",
        text:
          questionType === "scq"
            ? `${parentCode}.value === 'Aother'`
            : `${parentCode}Aother.value === true`,
      });
      return;
    default:
      if (questionType !== "scq") {
        console.log("change instruction");
        changeInstruction(answer, valueInstruction);
      }
      return;
  }
};

export const addValidationEquation = (state, qualifiedCode, rule) => {
  const component = state[qualifiedCode];
  const validationInstruction = validationEquation(
    qualifiedCode,
    component,
    rule,
    component["validation"][rule]
  );
  changeInstruction(component, validationInstruction);
};

// there is always an assumption that instructionList exists!!!
const editInstruction = (componentState, instruction) => {
  const index = componentState.instructionList.findIndex(
    (el) => el.code === instruction.code
  );
  if (index < 0) {
    componentState.instructionList.push(instruction);
  } else {
    componentState.instructionList[index] = instruction;
  }
};

const scqSkipEquations = (qualifiedCode, component) => {
  const skipLogic = component.skip_logic;
  const instructionList = [];
  component.children.forEach((el) => {
    const key = el.code;
    const skipObj = skipLogic[key];
    const instructionCode = "skip_to_on_" + key;
    if (!skipObj || !skipObj.skipTo || skipObj.skipTo == "proceed") {
      instructionList.push({ code: instructionCode, remove: true });
    } else {
      const instruction = {
        code: instructionCode,
        condition: qualifiedCode + '.value == "' + key + '"',
        isActive: true,
        toEnd: skipObj.toEnd || false,
        skipToComponent: skipObj.skipTo,
      };
      instructionList.push(instruction);
    }
  });
  return instructionList;
};

const validationEquation = (qualifiedCode, component, key, validation) => {
  if (
    !validation.isActive ||
    (key == "validation_not_contains" && !validation.not_contains)
  ) {
    return { code: key, remove: true };
  }
  let instructionText = "";
  switch (key) {
    case "validation_required":
      instructionText = requiredText(qualifiedCode, component);
      return booleanActiveInstruction(key, instructionText);
    case "validation_min_char_length":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value.length < ${validation.min_length || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_one_response_per_col":
      instructionText = `QlarrScripts.hasDuplicates([${component.children
        .filter((el) => el.type == "row")
        .map((el) => el.qualifiedCode + ".value")}].filter(x=>x))`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_max_char_length":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value.length > ${validation.max_length || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_contains":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& !${qualifiedCode}.value.includes("${validation.contains || ""}")`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_not_contains":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value.includes("${validation.not_contains}")`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_file_types":
      const mimes = fileTypesToMimesArray(validation.fileTypes);
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ![${mimes
          .map((el) => '"' + el + '"')
          .join(",")}].includes(${qualifiedCode}.value.type)`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_max_file_size":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value.size / 1024 > ${validation.max_size}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_pattern":
      if (!isValidRegex(validation.pattern)) {
        return { code: key, remove: true };
      }
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& !(new RegExp("${validation.pattern}").test(${qualifiedCode}.value))`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_pattern_email":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&&  !/^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$/.test(${qualifiedCode}.value)`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_max_word_count":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&&  QlarrScripts.wordCount(${qualifiedCode}.value) > ${
          validation.max_count || 0
        }`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_min_word_count":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&&  QlarrScripts.wordCount(${qualifiedCode}.value) < ${
          validation.min_count || 0
        }`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_between":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& (${qualifiedCode}.value < ${validation.lower_limit || 0} ` +
        `|| ${qualifiedCode}.value > ${validation.upper_limit || 0})`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_not_between":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& (${qualifiedCode}.value >= ${validation.lower_limit || 0} ` +
        `&& ${qualifiedCode}.value <= ${validation.upper_limit || 0})`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_lt":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value >= ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_lte":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value > ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_gt":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value <= ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_gte":
      instructionText =
        `QlarrScripts.isNotVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value < ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_equals":
      instructionText =
        `QlarrScripts.isVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value != ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_not_equal":
      instructionText =
        `QlarrScripts.isVoid(${qualifiedCode}.value) ` +
        `&& ${qualifiedCode}.value == ${validation.number || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_min_option_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `< ${validation.min_count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_max_option_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `> ${validation.max_count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_option_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `!== ${validation.count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_min_ranking_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `< ${validation.min_count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_max_ranking_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `> ${validation.max_count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    case "validation_ranking_count":
      instructionText =
        `[${component.children.map(
          (answer) => answer.qualifiedCode + ".value"
        )}].filter(x=>x).length ` + `!== ${validation.count || 0}`;
      return booleanActiveInstruction(key, instructionText);
    default:
      break;
  }
};

const booleanActiveInstruction = (key, instructionText) => {
  return {
    code: key,
    text: instructionText,
    isActive: true,
    returnType: "boolean",
  };
};

const requiredText = (qualifiedCode, component) => {
  if (
    component.type == "file_upload" ||
    component.type == "signature" ||
    component.type == "photo_capture" ||
    component.type == "video_capture"
  ) {
    return `QlarrScripts.isVoid(${qualifiedCode}.value) || !${qualifiedCode}.value.size || !${qualifiedCode}.value.stored_filename`;
  } else if (
    component.type == "scq_array" ||
    component.type == "scq_icon_array"
  ) {
    const rows = component.children.filter((child) => child.type == "row");
    return (
      `[${rows.map(
        (answer) => answer.qualifiedCode + ".value"
      )}].filter(x=>x).length ` +
      ` < ` +
      rows.length
    );
  } else {
    return `QlarrScripts.isVoid(${qualifiedCode}.value)`;
  }
};

const isValidRegex = (regex) => {
  if (!regex) {
    return false;
  }
  try {
    new RegExp(regex);
  } catch (e) {
    return false;
  }
  return true;
};
