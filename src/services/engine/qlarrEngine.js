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
 * Map every component to the codes of its active, design-authored validation rules.
 *
 * Walks the assembled design DSL and collects, per qualifiedCode, the `validation_*`
 * instruction codes the survey author defined on that component (required, min/max
 * char length, option counts, patterns, …). Engine-internal integrity checks
 * (validation_enum / validation_list, auto-added during validate()) are NOT in the
 * design's instructionList, so they're naturally excluded.
 *
 * @param {string} surveyJson - the assembled design DSL (see assembleSurveyJson).
 * @returns {Object<string, string[]>} qualifiedCode -> active design validation codes.
 */
function collectDesignValidationCodes(surveyJson) {
  const map = {};
  let root;
  try {
    root = JSON.parse(surveyJson);
  } catch {
    return map;
  }
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    const code = node.qualifiedCode ?? node.code;
    if (code && Array.isArray(node.instructionList)) {
      const codes = node.instructionList
        .filter(
          (i) =>
            i &&
            typeof i.code === "string" &&
            i.code.startsWith("validation_") &&
            i.isActive !== false &&
            !i.remove
        )
        .map((i) => i.code);
      if (codes.length) map[code] = codes;
    }
    ["groups", "questions", "answers", "children"].forEach((key) => {
      if (Array.isArray(node[key])) node[key].forEach(visit);
    });
  };
  visit(root);
  return map;
}

/**
 * Correct the inverted leaf `validity` the vendored engine bundle produces.
 *
 * The bundle compiles each question's `validity` as the conjunction of NEGATED
 * validation flags (`!validation_a && !validation_b && …`) — the pre-#223 "a flag is
 * true when the rule is VIOLATED" convention. But the design DSL (and the backend)
 * follow #223: validation flags are true when the rule PASSES (e.g.
 * `validation_required = QlarrScripts.isNotVoid(value)`). So the bundle's negation
 * inverts validity for every design-authored rule — any answer that satisfies its
 * rules reads as INVALID in the preview. (The full/normal preview is unaffected: it
 * runs through the backend, which computes validity correctly.)
 *
 * Until the vendored bundle is rebuilt to the #223 convention, recompute each
 * question's `validity` to match it: valid ⇔ every active design rule passes. We fix
 * both the initial value (in `variables`) and the reactive runtime function (in
 * `window.qlarrRuntime`) that recomputes validity on value change.
 *
 * @param {object} variables - navigated qlarrVariables (mutated in place).
 * @param {Object<string, string[]>} designValidations - from collectDesignValidationCodes.
 */
function correctValidityPolarity(variables, designValidations) {
  for (const [code, validationCodes] of Object.entries(designValidations)) {
    const valid = (state) =>
      validationCodes.every((c) => state?.[code]?.[c] === true);
    if (window.qlarrRuntime?.[code]) {
      window.qlarrRuntime[code].validity = valid;
    }
    if (variables[code]) {
      variables[code].validity = valid(variables);
    }
  }
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

  // The vendored bundle inverts leaf `validity` (negates pass-polarity validation
  // flags). Recompute it client-side to the #223 "true when valid" convention before
  // handing the state to runState. See correctValidityPolarity.
  const variables = navigationJsonOutput.state.qlarrVariables;
  correctValidityPolarity(variables, collectDesignValidationCodes(surveyJson));

  return {
    survey: navigationJsonOutput.survey,
    navigationIndex: navigationJsonOutput.navigationIndex,
    state: {
      qlarrVariables: variables,
      qlarrDependents: navigationJsonOutput.state.qlarrDependents,
    },
  };
}

/**
 * Reduce a navigated survey to a single question for the inline design preview.
 *
 * Returns a NEW response whose `survey.groups` holds only the group that owns
 * `qualifiedCode`, that group holding only that one question — both marked
 * `inCurrentNavigation`. The FULL `qlarrVariables` map is preserved (so dependent
 * instructions still resolve), but the target group's and question's `relevance`
 * are forced true, so the question always shows even when its compiled relevance is
 * false (offline types, or logic that depends on as-yet-unanswered questions).
 * `navigationIndex` / `qlarrDependents` / theme pass through untouched.
 *
 * If the question (or its owning group) isn't found, the original response is
 * returned unchanged — the renderer stays safe and simply shows the full result for
 * one frame until the next recompile.
 *
 * This is the single place that knows "the preview shows one question": the shared
 * run renderer (Survey/Group/Question) renders whatever survey it's handed, so it
 * needs no preview-specific branches.
 *
 * @param {{survey: object, navigationIndex: object,
 *   state: {qlarrVariables: object, qlarrDependents: object}}} response
 * @param {string} qualifiedCode - the target question's qualifiedCode.
 */
export function pruneToSingleQuestion(response, qualifiedCode) {
  const groups = response?.survey?.groups;
  if (!Array.isArray(groups) || !qualifiedCode) return response;

  const ownerGroup = groups.find((g) =>
    (g.questions ?? []).some((q) => q.qualifiedCode === qualifiedCode)
  );
  const targetQuestion = ownerGroup?.questions?.find(
    (q) => q.qualifiedCode === qualifiedCode
  );
  if (!ownerGroup || !targetQuestion) return response;

  const prunedGroup = {
    ...ownerGroup,
    inCurrentNavigation: true,
    questions: [{ ...targetQuestion, inCurrentNavigation: true }],
  };

  const variables = { ...response.state.qlarrVariables };
  if (variables[ownerGroup.code]) {
    variables[ownerGroup.code] = { ...variables[ownerGroup.code], relevance: true };
  }
  if (variables[qualifiedCode]) {
    variables[qualifiedCode] = { ...variables[qualifiedCode], relevance: true };
  }

  return {
    ...response,
    survey: { ...response.survey, groups: [prunedGroup] },
    state: { ...response.state, qlarrVariables: variables },
  };
}
