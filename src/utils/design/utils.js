import { useSelector } from "react-redux";
import { useResponsive } from "~/hooks/use-responsive";
import {
  QUESTION_CODE_PATTERN,
  GROUP_CODE_PATTERN,
  STRIP_TAGS_PATTERN,
} from "~/constants/instruction";

export {
  isEquivalent,
  nextId,
  firstIndexInArray,
  lastIndexInArray,
} from "./pureUtils";
import { isEquivalent } from "./pureUtils";

export const diff = (obj1, obj2) => {
  if (!obj2 || Object.prototype.toString.call(obj2) !== "[object Object]") {
    return obj1;
  }

  let diffs = {};
  let key;

  let arraysMatch = function (arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (var i = 0; i < arr1.length; i++) {
      if (!isEquivalent(arr1[i], arr2[i])) {
        return false;
      }
    }

    return true;
  };

  const compare = function (item1, item2, key) {
    let type1 = Object.prototype.toString.call(item1);
    let type2 = Object.prototype.toString.call(item2);

    if (type2 === "[object Undefined]") {
      diffs[key] = null;
      return;
    }

    if (type1 !== type2) {
      diffs[key] = item2;
      return;
    }

    if (type1 === "[object Object]") {
      let objDiff = diff(item1, item2);
      if (Object.keys(objDiff).length > 0) {
        diffs[key] = objDiff;
      }
      return;
    }

    if (type1 === "[object Array]") {
      if (!arraysMatch(item1, item2)) {
        diffs[key] = item2;
      }
      return;
    }

    if (type1 === "[object Function]") {
      if (item1.toString() !== item2.toString()) {
        diffs[key] = item2;
      }
    } else {
      if (item1 !== item2) {
        diffs[key] = item2;
      }
    }
  };

  for (key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      compare(obj1[key], obj2[key], key);
    }
  }

  for (key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!(key in obj1)) {
        diffs[key] = obj2[key];
      } else if (obj1[key] !== obj2[key]) {
        diffs[key] = obj2[key];
      }
    }
  }

  return diffs;
};

export const stripTags = (string) => {
  if (typeof string !== "string") return string;
  return string
    .replace(STRIP_TAGS_PATTERN, "")
    .replace(/\{\{.*?\}\}/g, "{{ ... }}");
};

export function truncateWithEllipsis(text, maxLength) {
  if (text?.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  } else {
    return text;
  }
}

export const isQuestion = (code) => QUESTION_CODE_PATTERN.test(code);
export const isGroup = (code) => GROUP_CODE_PATTERN.test(code);

// Key used for a component's nested children at each tree depth, mirroring the
// engine's design DSL (Survey -> groups -> questions -> answers -> answers...).
const CHILDREN_KEY_BY_LEVEL = ["groups", "questions", "answers"];
const childrenKeyForLevel = (level) =>
  CHILDREN_KEY_BY_LEVEL[level] || "answers";

// Instructions the survey engine *derives* during validation (and references when
// composing a component's effective relevance) but does NOT accept back as design
// input. The backend persists `mode_relevance` into the saved design of offline
// questions (barcode / photo_capture / video_capture); the vendored client engine
// generates it internally yet rejects it on input ("Invalid JSON for instruction"),
// which broke the single-question preview for any survey containing an offline
// question. We drop it here so the live design re-validates cleanly — the engine
// recomputes offline relevance from the question's own `mode` instruction.
const ENGINE_DERIVED_INSTRUCTION_CODES = new Set(["mode_relevance"]);

// In the flat design tree, a node holds only its body (content, instructionList,
// children, ...); its identity (code / qualifiedCode / type / groupType) lives on
// the parent's child ref. We merge the ref with the node body so the assembled
// DSL carries a code on every component. `children` is a storage artifact and is
// replaced by the level-appropriate nested array.
const assembleNode = (designState, ref, level) => {
  const node = designState[ref.qualifiedCode ?? ref.code];
  if (!node) return null;
  const { children, ...body } = node;
  const assembled = { ...ref, ...body };
  if (Array.isArray(assembled.instructionList)) {
    assembled.instructionList = assembled.instructionList.filter(
      (instruction) =>
        instruction && !ENGINE_DERIVED_INSTRUCTION_CODES.has(instruction.code)
    );
  }
  if (Array.isArray(children) && children.length) {
    assembled[childrenKeyForLevel(level)] = children
      .map((child) => assembleNode(designState, child, level + 1))
      .filter(Boolean);
  }
  return assembled;
};

/**
 * Rebuild the nested survey design DSL (a JSON string) from the live, flat
 * designState — including unsaved edits and added/removed components. This is
 * the exact shape the survey engine's ValidationUseCaseWrapper.create() expects.
 * The engine ignores unknown keys, so UI-only node props pass through harmlessly.
 */
export const assembleSurveyJson = (designState) => {
  if (!designState?.Survey) return null;
  const root = assembleNode(
    designState,
    { code: "Survey", qualifiedCode: "Survey" },
    0
  );
  return root ? JSON.stringify(root) : null;
};

export const isNotEmptyHtml = (value) => {
  if (!value) return false;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = value;

  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  const hasImages = tempDiv.querySelectorAll("img").length > 0;

  return textContent.trim().length > 0 || hasImages;
};

export const useColumnMinWidth = (code, runComponent) => {
  const isDesktop = useResponsive("up", "lg");
  const isTablet = useResponsive("between", "md", "lg");

  const designStateWidths = useSelector((state) => state?.designState?.[code]);
  const widthSetups = {
    minHeaderDesktop: 90,
    minHeaderMobile: 60,
    minRowLabelDesktop: 90,
    minRowLabelMobile: 60,
    ...(runComponent || {}),
    ...(designStateWidths || {}),
  };
  const {
    minHeaderDesktop,
    minHeaderMobile,
    minRowLabelDesktop,
    minRowLabelMobile,
  } = widthSetups;

  if (isDesktop || isTablet) {
    return {
      header: `${minHeaderDesktop}`,
      rowLabel: `${minRowLabelDesktop}`,
    };
  }

  return {
    header: `${minHeaderMobile}`,
    rowLabel: `${minRowLabelMobile}`,
  };
};
