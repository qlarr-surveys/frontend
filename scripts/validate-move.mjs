/**
 * validate-move.mjs
 *
 * Source-level comparison of every function moved during the
 * designState.js refactoring.  Reads the original file and the two
 * destination files, extracts each function body, normalises known
 * intentional changes, and compares character-by-character.
 *
 * Usage:  node scripts/validate-move.mjs
 * Exit 0 = all pass, Exit 1 = at least one mismatch.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── file contents ──────────────────────────────────────────────────
const original = readFileSync(
  resolve(root, "src/state/design/designState.original.js"),
  "utf-8"
);
const stateUtils = readFileSync(
  resolve(root, "src/state/design/stateUtils.js"),
  "utf-8"
);
const addInstructions = readFileSync(
  resolve(root, "src/state/design/addInstructions.js"),
  "utf-8"
);

// ── helpers ────────────────────────────────────────────────────────

/**
 * Extract a top-level arrow-function or function body from source text.
 * Matches:  [export ]const name = (...) => {   or   function name(...) {
 * Returns the full body including the closing `};`
 */
function extractFunction(source, name) {
  const lines = source.split("\n");

  // Patterns to match the start of a function declaration
  const arrowPattern = new RegExp(
    `^(?:export\\s+)?const\\s+${name}\\s*=`
  );
  const regularPattern = new RegExp(
    `^(?:export\\s+)?function\\s+${name}\\s*\\(`
  );

  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only match top-level declarations (no leading whitespace or minimal)
    // This avoids matching local variables like `const newQuestion = {` inside reducers
    if (line.length > 0 && line[0] !== " " && line[0] !== "\t") {
      const trimmed = line.trimStart();
      if (arrowPattern.test(trimmed) || regularPattern.test(trimmed)) {
        startIdx = i;
        break;
      }
    }
  }

  if (startIdx === -1) return null;

  // Track brace depth to find the end of the function
  let depth = 0;
  let started = false;
  let endIdx = startIdx;

  for (let i = startIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") {
        depth--;
      }
    }
    if (started && depth === 0) {
      endIdx = i;
      break;
    }
  }

  return lines.slice(startIdx, endIdx + 1).join("\n");
}

/**
 * Normalise a function body so that cosmetic / intentional differences
 * don't cause false negatives.
 */
function normalise(body) {
  let s = body;

  // 1. Strip leading `export ` keyword
  s = s.replace(/^export\s+/, "");

  // 2. Normalise the intentional caseReducers.setup → state.setup change
  //    Original:  designState.caseReducers.setup(state, {\n    payload: {\n      code: <expr>,\n      rules: <expr>,\n    },\n  });
  //    New:       state.setup = { code: <expr>, rules: <expr> };
  //
  //    We normalise the OLD form → the NEW form so both sides match.
  s = s.replace(
    /designState\.caseReducers\.setup\(state,\s*\{\s*payload:\s*\{\s*code:\s*([^,]+),\s*rules:\s*([^,]+),?\s*\},?\s*\}\s*\);/g,
    (_, codeExpr, rulesExpr) =>
      `state.setup = { code: ${codeExpr.trim()}, rules: ${rulesExpr.trim()} };`
  );

  // 3. Collapse all whitespace (spaces, tabs, newlines) into single space
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

// ── function routing table ─────────────────────────────────────────
const functions = [
  // → addInstructions.js (4 functions)
  { name: "cleanupRandomRules", dest: "addInstructions" },
  { name: "cleanupSkipDestinations", dest: "addInstructions" },
  { name: "cleanupValidation", dest: "addInstructions" },
  { name: "addRelevanceInstructions", dest: "addInstructions" },

  // → stateUtils.js (16 functions)
  { name: "splitQuestionCodes", dest: "stateUtils" },
  { name: "buildIndex", dest: "stateUtils" },
  { name: "buildCodeIndex", dest: "stateUtils" },
  { name: "saveContentResources", dest: "stateUtils" },
  { name: "creatNewState", dest: "stateUtils" },
  { name: "mapCodeToUserFriendlyOrder", dest: "stateUtils" },
  { name: "reorderGroups", dest: "stateUtils" },
  { name: "reorderAnswers", dest: "stateUtils" },
  { name: "reorderAnswersByType", dest: "stateUtils" },
  { name: "insertAnswer", dest: "stateUtils" },
  { name: "addAnswer", dest: "stateUtils" },
  { name: "reparentQuestion", dest: "stateUtils" },
  { name: "reorderQuestions", dest: "stateUtils" },
  { name: "newQuestion", dest: "stateUtils" },
  { name: "newGroup", dest: "stateUtils" },
  { name: "specialGroup", dest: "stateUtils" },
];

// ── run comparison ─────────────────────────────────────────────────
let passed = 0;
let failed = 0;

console.log("=== Source-Level Validation ===\n");

for (const { name, dest } of functions) {
  const destSource = dest === "addInstructions" ? addInstructions : stateUtils;
  const destLabel =
    dest === "addInstructions" ? "addInstructions.js" : "stateUtils.js";

  const origBody = extractFunction(original, name);
  const movedBody = extractFunction(destSource, name);

  if (!origBody) {
    console.log(`  SKIP  ${name} — not found in designState.original.js`);
    continue;
  }
  if (!movedBody) {
    console.log(
      `  FAIL  ${name} — not found in ${destLabel}`
    );
    failed++;
    continue;
  }

  const normOrig = normalise(origBody);
  const normMoved = normalise(movedBody);

  if (normOrig === normMoved) {
    console.log(`  PASS  ${name}  →  ${destLabel}`);
    passed++;
  } else {
    console.log(`  FAIL  ${name}  →  ${destLabel}`);
    // Show first divergence point for debugging
    for (let i = 0; i < Math.max(normOrig.length, normMoved.length); i++) {
      if (normOrig[i] !== normMoved[i]) {
        const ctx = 40;
        console.log(
          `        First diff at char ${i}:`
        );
        console.log(
          `          original: ...${normOrig.slice(Math.max(0, i - ctx), i + ctx)}...`
        );
        console.log(
          `          moved:    ...${normMoved.slice(Math.max(0, i - ctx), i + ctx)}...`
        );
        break;
      }
    }
    failed++;
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
