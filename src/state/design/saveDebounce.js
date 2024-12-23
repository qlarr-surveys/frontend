import { SetData } from "~/networking/design";
import {
  designStateReceived,
  setSaving,
  setUpdating,
} from "./designState";
import { onError } from '../edit/editState';
import { onApiError } from '~/utils/errorsProcessor';

let saveTimer;
let buffer = [];
let debounceTime = 3000;

const saveDebounce = (store) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    store.dispatch(setUpdating(true));
    const state = store.getState();
    SetData(
      state.designState,
      (state) => {
        setState(store, state);
      },
      (error) => {
        setError(store, error);
      },
      false
    );
  }, debounceTime);
};

export const dataSaver = (store) => (next) => (action) => {
  if(!action || !action.type){
    return
  }
  if (
    !NONE_MUTATING.includes(action.type) &&
    !action.type.startsWith("editState/")
  ) {
    if (!store.getState().designState.isUpdating) {
      store.dispatch(setSaving(true));
      saveDebounce(store);
    } else {
      buffer.push(action);
    }
  }
  return next(action);
};

const NONE_MUTATING = [
  "templateState/setFetching",
  "designState/setUpdating",
  "designState/setupToggleExpand",
  "designState/collapseAllGroups",
  "designState/resetSetup",
  "designState/onAddComponentsVisibilityChange",
  "designState/setSaving",
  "designState/changeLang",
  "designState/setup",
  "designState/designStateReceived",
  "designState/newVersionReceived",
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
