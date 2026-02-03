import { useSelector } from "react-redux";
import { useResponsive } from "~/hooks/use-responsive";
import {
  QUESTION_CODE_PATTERN,
  GROUP_CODE_PATTERN,
  STRIP_TAGS_PATTERN,
} from "~/constants/instruction";

export const isEquivalent = (a, b, visited = new WeakSet()) => {
  if (a === b) return true;

  if (typeof a === "function" || typeof b === "function") {
    return false;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  if (a === null || b === null) {
    return a === b;
  }

  if (visited.has(a) || visited.has(b)) {
    return true;
  }

  visited.add(a);
  visited.add(b);

  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (const prop of aProps) {
    if (prop !== "key" && !isEquivalent(a[prop], b[prop], visited)) {
      return false;
    }
  }

  return true;
};

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

export const nextId = (elements) => {
  if (elements.length) {
    let arrayOfIntCodes = elements
      .filter((el) => el.type != "other")
      .map((el) => el.code.replace(/^\D+/g, ""))
      .filter((el) => el.length > 0);
    if (arrayOfIntCodes.length) {
      let intCodes = arrayOfIntCodes
        .map((el) => parseInt(el, 10))
        .sort(function (a, b) {
          return a - b;
        });
      if (intCodes) {
        return intCodes[intCodes.length - 1] + 1;
      }
    }
  }
  return 1;
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

export const lastIndexInArray = (array, func) => {
  if (!array) {
    return -1;
  }
  let index = array.length - 1;
  for (; index >= 0; index--) {
    if (func(array[index])) {
      return index;
    }
  }
  return -1;
};

export const firstIndexInArray = (array, func) => {
  if (!array) {
    return -1;
  }
  for (let index = 0; index < array.length; index++) {
    if (func(array[index])) {
      return index;
    }
  }
  return -1;
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
