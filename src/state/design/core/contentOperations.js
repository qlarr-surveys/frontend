import { changeInstruction } from "./addInstructions";
import { buildReferenceInstruction } from "./stateUtils";

export const saveContentResources = (
  component,
  contentValue,
  contentLang,
  contentKey
) => {
  const regex = /data-resource-name="([^"]+)"/g;
  const resources = Array.from(
    contentValue.matchAll(regex),
    (match) => match[1]
  ).filter((name) => name && name.trim());

  if (!component.resources) {
    component.resources = {};
  }
  // Remove existing items with matching keys
  const prefix = `content_${contentLang}_${contentKey}`;
  Object.keys(component.resources).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete component.resources[key];
    }
  });
  resources.forEach((elem, index) => {
    component.resources[`${prefix}_${index + 1}`] = elem;
  });
};

export const applyChangeContent = (state, { code, key, value, lang }) => {
  if (!state[code].content) {
    state[code].content = {};
    state[code].content[lang] = {};
  } else if (!state[code].content[lang]) {
    state[code].content[lang] = {};
  }
  const prefixToRemove = `format_${key}_${lang}`;
  const toRemove = state[code].instructionList?.filter(
    (instruction) => instruction.code.startsWith(prefixToRemove)
  );
  toRemove?.forEach((instruction) => {
    console.log(instruction.code);
    changeInstruction(state[code], {
      code: instruction.code,
      remove: true,
    });
  });

  state[code].instructionList = state[code].instructionList?.filter(
    (instruction) => !instruction.code.startsWith(prefixToRemove)
  );
  const referenceInstructions = buildReferenceInstruction(
    value,
    key,
    lang,
    [value, key, lang]
  );
  referenceInstructions?.forEach((instruction) =>
    changeInstruction(state[code], instruction)
  );

  saveContentResources(
    state[code],
    value,
    lang,
    key
  );

  state[code].content[lang][key] = value;
};

export const applyChangeCustomCss = (state, { code, value }) => {
  const referenceInstructions = buildReferenceInstruction(
    value,
    "custom",
    "css",
    ["customCss"]
  );
  state[code].customCss = value;
  referenceInstructions?.forEach((instruction) =>
    changeInstruction(state[code], instruction)
  );
};

export const applyChangeResources = (state, { code, key, value }) => {
  if (!state[code].resources) {
    state[code].resources = {};
  }
  state[code].resources[key] = value;
};
