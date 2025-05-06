import { SetData } from "~/networking/design";
import { designStateReceived, setSaving, setUpdating } from "./designState";
import { onError } from "../edit/editState";
import { onApiError } from "~/utils/errorsProcessor";
import { isEquivalent } from "~/utils/design/utils";

let saveTimer;
let buffer = [];
let debounceTime = 500;

const saveDebounce = (store) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    store.dispatch(setUpdating(true));
    const state = store.getState();
    const diff = getDiff(state.designState, state.designState.latest);
    SetData(
      diff,
      (state) => {
        setState(store, state);
      },
      (error) => {
        setError(store, error);
      },
      state.designState.versionDto.version,
      state.designState.versionDto.subVersion
    );
  }, debounceTime);
};

export const dataSaver = (store) => (next) => (action) => {
  if (!action || !action.type) {
    return;
  }
  if (MUTATING.includes(action.type) && !action.type.startsWith("editState/")) {
    if (!store.getState().designState.isUpdating) {
      store.dispatch(setSaving(true));
      saveDebounce(store);
    } else {
      buffer.push(action);
    }
  }
  return next(action);
};

const MUTATING = [
  "templateState/onBaseLangChanged",
  "designState/onAdditionalLangAdded",
  "designState/onAdditionalLangRemoved",
  "designState/changeAttribute",
  "designState/changeTimeFormats",
  "designState/changeContent",
  "designState/changeResources",
  "designState/deleteQuestion",
  "designState/cloneQuestion",
  "designState/deleteGroup",
  "designState/addNewAnswer",
  "designState/removeAnswer",
  "designState/changeValidationValue",
  "designState/updateRandom",
  "designState/updatePriority",
  "designState/updateRandomByType",
  "designState/updatePriorityByType",
  "designState/removeSkipDestination",
  "designState/editSkipDestination",
  "designState/editSkipToEnd",
  "designState/changeRelevance",
  "designState/addComponent",
  "designState/onDrag",
];

const setState = (store, state) => {
  store.dispatch(setUpdating(false));
  store.dispatch(designStateReceived(state));
  store.dispatch(setSaving(false));
  buffer.forEach((action) => {
    store.dispatch(action);
  });
  buffer = [];
};

const setError = (store, error) => {
  onApiError({
    error: error,
    globalErrorHandler: (processedError) => {
      store.dispatch(onError(processedError));
      store.dispatch(setSaving(false));
      store.dispatch(setUpdating(false));
    },
    locallErrorHandler: (processedError) => {
      store.dispatch(onError(processedError));
      store.dispatch(setSaving(false));
      store.dispatch(setUpdating(false));
    },
  });
};

const reservedKeys = [
  "skipScroll",
  "reorder_refresh_code",
  "setup",
  "latest",
  "lastAddedComponent",
  "isUpdating",
  "isSaving",
  "state",
  "addComponentsVisibility",
  "designMode",
  "globalSetup",
];
function getDiff(currentState, latestState) {
  const changes = {};

  // Get all keys from both objects and filter out reserved keys
  const allKeys = new Set([
    ...Object.keys(currentState).filter((key) => !reservedKeys.includes(key)),
    ...Object.keys(latestState).filter((key) => !reservedKeys.includes(key)),
  ]);

  for (const key of allKeys) {
    if (!isEquivalent(currentState[key], latestState[key])) {
      changes[key] = currentState[key];
    }
  }

  return changes;
}
