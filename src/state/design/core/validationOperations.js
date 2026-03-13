import { buildValidationDefaultData } from "./stateUtils";
import { changeInstruction, processValidation } from "./addInstructions";

export const applyChangeValidationValue = (state, { code, rule, key, value }) => {
  if (!state[code]["validation"]) {
    state[code]["validation"] = {};
  }
  if (!state[code]["validation"][rule]) {
    state[code]["validation"][rule] = buildValidationDefaultData(rule);
  }
  state[code]["validation"][rule][key] = value;
  processValidation(state, code, rule, rule != "content");
};

export const applyAddCustomValidationRule = (state, { code }) => {
  const numbers = (state[code].instructionList || [])
    .map((i) => i.code.match(/^validation_custom_(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number);

  const newRuleCode = `validation_custom_${Math.max(0, ...numbers) + 1}`;

  changeInstruction(state[code], {
    code: newRuleCode,
    text: "",
    returnType: "boolean",
    isActive: true,
  });
};

export const applyUpdateCustomValidationRuleText = (state, { code, ruleCode, text }) => {
  const instruction = state[code].instructionList?.find((i) => i.code === ruleCode);
  if (instruction) {
    instruction.text = text;
  }
};

export const applyRenameCustomValidationRule = (state, { code, ruleCode, newCode }) => {
  const instruction = state[code].instructionList?.find(
    (i) => i.code === ruleCode
  );
  if (!instruction) {
    return;
  }
  instruction.code = newCode;
  const content = state[code].content || {};
  Object.keys(content).forEach((lang) => {
    if (content[lang][ruleCode] !== undefined) {
      content[lang][newCode] = content[lang][ruleCode];
      delete content[lang][ruleCode];
    }
  });
};

export const applyUpdateCustomValidationRuleError = (state, { code, ruleCode, lang, value }) => {
  if (value) {
    state[code].content[lang][ruleCode] = value;
  } else {
    delete state[code].content[lang][ruleCode];
  }
};

export const applyRemoveCustomValidationRule = (state, { code, ruleCode }) => {
  changeInstruction(state[code], { code: ruleCode, remove: true });

  const content = state[code].content || {};
  Object.keys(content).forEach((lang) => {
    delete content[lang][ruleCode];
  });
};
