/**
 * In-browser bridge to the Qlarr survey engine (Kotlin/JS, pinned to engine 0.1.6).
 *
 * This mirrors, fully client-side, what the backend does to produce a runnable
 * survey: validate the design DSL into a runtime script + dependency graph, then
 * run the engine's navigation to compute the initial state. No backend calls.
 *
 * Pipeline (see ValidationUseCaseWrapper / NavigationUseCaseWrapper in the engine):
 *   1. inject the engine UMD bundle (sets window.surveyengine) + the two runtime
 *      scripts (define global qlarrStateMachine / QlarrScripts / navigate).
 *   2. ValidationUseCaseWrapper.create(surveyJson).validate() -> validationJsonOutput
 *      (script, survey, impactMap, schema, ...).
 *   3. inject validationJsonOutput.script -> defines global qlarrRuntime.
 *   4. NavigationUseCaseWrapper.init(...).navigate(scriptEngine) where scriptEngine
 *      is a plain JS object delegating to the global navigate() runtime function.
 *
 * The reactive value-change path (window.qlarrStateMachine + window.qlarrRuntime)
 * is the same one src/state/runState.js already uses, so interactions keep working.
 */

// The engine UMD bundle lives in public/ so it's served verbatim (it attaches
// `window.surveyengine`); it's only fetched when the panel first opens.
const engineUrl = `${import.meta.env.BASE_URL}qlarr-engine/surveyengine.js`;
// The small runtime scripts are inlined as strings and eval'd into global scope.
import commonScriptSrc from "~/vendor/qlarr-engine/common_script.js?raw";
import initialScriptSrc from "~/vendor/qlarr-engine/initial_script.js?raw";

const ENGINE_SCRIPT_ID = "qlarr-engine-bundle";
const COMMON_SCRIPT_ID = "qlarr-common-script";
const INITIAL_SCRIPT_ID = "qlarr-initial-script";
const RUNTIME_SCRIPT_ID = "qlarr-runtime-script";

let enginePromise = null;
let runtimeScriptsInjected = false;

/** Run `text` in global, non-strict scope by appending a <script> element. */
function injectInlineScript(text, id) {
  if (id) {
    const prev = document.getElementById(id);
    if (prev) prev.remove();
  }
  const el = document.createElement("script");
  if (id) el.id = id;
  el.text = text;
  document.body.appendChild(el);
}

/** Lazily load the engine UMD bundle; resolves to window.surveyengine. */
function loadEngineBundle() {
  if (enginePromise) return enginePromise;
  enginePromise = new Promise((resolve, reject) => {
    if (window.surveyengine?.com?.qlarr) {
      resolve(window.surveyengine);
      return;
    }
    const el = document.createElement("script");
    el.id = ENGINE_SCRIPT_ID;
    el.src = engineUrl;
    el.async = true;
    el.onload = () => {
      const engine = window.surveyengine;
      if (engine?.com?.qlarr) {
        resolve(engine);
      } else {
        reject(new Error("Qlarr engine loaded but exports are missing"));
      }
    };
    el.onerror = () => reject(new Error("Failed to load the Qlarr engine bundle"));
    document.body.appendChild(el);
  });
  return enginePromise;
}

/** Define the survey-independent runtime globals once. */
function ensureRuntimeScripts() {
  if (runtimeScriptsInjected) return;
  injectInlineScript(commonScriptSrc, COMMON_SCRIPT_ID);
  injectInlineScript(initialScriptSrc, INITIAL_SCRIPT_ID);
  runtimeScriptsInjected = true;
}

/**
 * Compile a live design DSL and compute its initial runtime state, entirely in
 * the browser. Returns a shape ready for runState's `stateReceived`.
 *
 * @param {string} surveyJson - the design DSL as JSON (see assembleSurveyJson).
 * @param {string} lang - language code (e.g. "en").
 * @param {"offline"|"online"} surveyMode - the survey mode the engine navigates in.
 *   Defaults to "offline" so offline-only question types (barcode, photo_capture,
 *   video_capture) are relevant and interactive in the preview — in "online" mode the
 *   engine compiles their `mode: offline` instruction to `relevance = false`, hiding them.
 *   Online question types are relevant in both modes, so this is safe for every question.
 * @returns {Promise<{survey: object, navigationIndex: object,
 *   state: {qlarrVariables: object, qlarrDependents: object}}>}
 * @throws if the engine bundle fails to load or the design has blocking errors.
 */
export async function compileAndNavigate(surveyJson, lang = "en", surveyMode = "offline") {
  const engine = await loadEngineBundle();
  ensureRuntimeScripts();

  const usecase = engine.com.qlarr.surveyengine.usecase;
  const exposed = engine.com.qlarr.surveyengine.model.exposed;
  const mode =
    surveyMode === "online" ? exposed.SurveyMode.ONLINE : exposed.SurveyMode.OFFLINE;

  // Validate the design -> runtime script + dependency/impact maps.
  let validationJsonOutput;
  try {
    validationJsonOutput = JSON.parse(
      usecase.ValidationUseCaseWrapper.create(surveyJson).validate()
    );
  } catch (e) {
    throw new Error(`qlarr validate() failed: ${e?.message ?? e}`, { cause: e });
  }

  // Define the per-survey qlarrRuntime (window.qlarrRuntime) for this compile.
  injectInlineScript(validationJsonOutput.script, RUNTIME_SCRIPT_ID);

  // The engine asks this adapter to run the navigation script; we delegate to
  // the global navigate() from initial_script.js (eval'd above).
  const scriptEngine = {
    navigate: (script) => window.navigate(JSON.parse(script)),
  };

  let navigationJsonOutput;
  try {
    navigationJsonOutput = JSON.parse(
      usecase.NavigationUseCaseWrapper.init(
        "{}",
        JSON.stringify(validationJsonOutput),
        lang,
        exposed.NavigationMode.ALL_IN_ONE,
        null,
        exposed.NavigationDirection.Start,
        true,
        mode
      ).navigate(scriptEngine)
    );
  } catch (e) {
    throw new Error(`qlarr navigate() failed: ${e?.message ?? e}`, { cause: e });
  }

  return {
    survey: navigationJsonOutput.survey,
    navigationIndex: navigationJsonOutput.navigationIndex,
    state: {
      qlarrVariables: navigationJsonOutput.state.qlarrVariables,
      qlarrDependents: navigationJsonOutput.state.qlarrDependents,
    },
  };
}
