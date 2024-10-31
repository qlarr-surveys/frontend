import { createSlice, current } from "@reduxjs/toolkit";

let qlarrDependents = {};

export const runState = createSlice({
  name: "runState",
  initialState: { state: {} },
  reducers: {
    valueChange: (state, action) => {
      setValueInState(state, action.payload);
    },
    orderChange: (state, action) => {
      let keys = Object.keys(action.payload);
      if (!state.order) {
        state.order = {};
      }
      keys.forEach((key) => (state.order[key] = action.payload[key]));
    },
    stateReceived: (state, action) => {
      let keys = Object.keys(state);
      keys.forEach((key) => delete state[key]);
      state.preview = action.payload.preview
      let response = action.payload.response
      qlarrDependents = response.state.qlarrDependents;
      state.navigation = undefined;
      state.data = {
        survey: response.survey,
        navigationIndex: response.navigationIndex,
        additionalLang: response.additionalLang,
        lang: response.lang,
        responseId: response.responseId,
      };
      state.values = response.state.qlarrVariables;
    },
    langChange: (state, action) => {
      state.navigation = {
        values: getValues(state.values),
        lang: action.payload.lang,
        navigationDirection: { name: "CHANGE_LANGE" },
      };
    },
    navigateNext: (state) => {
      next(state);
    },
    navigatePrevious: (state) => {
      state.navigation = {
        navigationDirection: { name: "PREV" },
      };
    },
    jump: (state, action) => {
      state.navigation = {
        values: getValues(state.values),
        navigationDirection: { name: "JUMP", navigationIndex: action.payload },
      };
    },
  },
});

export const {
  valueChange,
  orderChange,
  stateReceived,
  langChange,
  navigateNext,
  navigatePrevious,
  jump,
} = runState.actions;

export default runState.reducer;


function setValueInState(state, payload) {
  let componentCode = payload.componentCode;
  logTimes(state, componentCode);
  let value = payload.value;
  let element = state.values[componentCode];
  if (typeof element !== "undefined" && element["value"] !== value) {
    let time = Date.now();
    window.qlarrStateMachine(
      state.values,
      qlarrDependents,
      window.qlarrRuntime,
      componentCode,
      "value",
      value,
      "VALUE CHANGE"
  )
    console.log("NEW STATE in: " + (Date.now() - time) + " millis");
    console.log(current(state))
  }
}

function logTimes(state, code) {
  if (!state.saveTimings) {
    return;
  }
  if (!state.timings) {
    state.timings = [];
  }
  let element = {
    code,
    time: new Date().toISOString().split(".")[0].replace("T", " "),
    name: "ValueTiming",
  };

  if (
    state.timings.length > 0 &&
    state.timings[state.timings.length - 1].code === code
  ) {
    state.timings[state.timings.length - 1] = element;
  } else {
    state.timings.push(element);
  }
}

function next(state) {
  if (!state.values.Survey.validity) {
    state.values.Survey.show_errors = true;
  } else {
    state.values.Survey.show_errors = false;
    state.navigation = {
      values: getValues(state.values),
      navigationDirection: { name: "NEXT" },
    };
  }
}

function getValues(values) {
  let retrunObj = {};
  for (var key in values) {
    if (values.hasOwnProperty(key)) {
      let element = values[key];
      if (element.hasOwnProperty("value")) {
        let value = element["value"];
        if (typeof value !== "undefined") {
          retrunObj[key + ".value"] = value;
        }
      }
    }
  }
  return retrunObj;
}
