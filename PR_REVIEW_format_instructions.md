# PR Review: feature/format_instructions → main

## Executive Summary

This document provides a deep technical review of the `feature/format_instructions` PR, analyzing code quality, identifying anti-patterns, potential bugs, dead code, and over-engineering concerns.

### PR Statistics
- **Files Changed**: 12
- **Additions**: +666 lines
- **Deletions**: -165 lines
- **New Files**: 6 (InstructionHighlightExtension.js, InstructionTooltipManager.js, instructionUtils.js, QuestionDisplayTransformer.js, useInstructionHighlighting.js, constants/instruction.js)
- **Modified Files**: 6 (MentionExtension.js, MentionList.jsx, extensions.js, TipTapEditor/index.jsx, ContentEditor/index.jsx, tiptap-editor.css)

### Issue Summary by Severity

| Severity | Count | Fixed | Not a Bug | Remaining |
|----------|-------|-------|-----------|-----------|
| 🔥 Critical | 2 | ✅ 2 | 0 | 0 |
| ⚠️ High | 4 | ✅ 1 | 1 | 2 |
| 📋 Medium | 7 | ✅ 1 | 0 | 6 |
| 📝 Low | 4 | ✅ 4 | 0 | 0 |
| **Total** | **17** | **8** | **1** | **8** |

### Fixed Issues (feature/format_instructions_bugs branch)

| Issue # | Description | Severity | Commit |
|---------|-------------|----------|--------|
| 1 | Missing regex lastIndex reset | 🔥 Critical | 1978762 |
| 2 | Global pattern cache | 🔥 Critical | 1978762 |
| 3 | Excessive HTML decoding | ⚠️ High | 63def95 |
| 7 | Double regex testing | 📋 Medium | ed032a8 |
| 16 | Pending RAF not cancelled | 📝 Low | 606dacd |
| 17 | Private _tippy property access | 📝 Low | b562925 |
| 19 | CSS selector brittleness | 📝 Low | d2c7ce3 |
| - | Globalized REGEX_ESCAPE_PATTERN | Bonus | 1978762 |

---

## 🔥 Critical Bugs

### 1. Missing Regex lastIndex Reset - Data Corruption Risk

**File**: `src/utils/QuestionDisplayTransformer.js`
**Line**: 79
**Severity**: 🔥 CRITICAL
**Status**: ✅ FIXED (commit 1978762)

**Issue**:
The `findAllCodesInPattern` method uses a cached global regex pattern without resetting `lastIndex` between forEach iterations. This causes the regex state to persist across iterations, leading to missed or duplicated matches.

```javascript
codesInPattern.forEach((codeOrIndex) => {
  const questionCode = resolveQuestionCode(codeOrIndex, indexToCodeMap);
  const searchCode = codeOrIndex;
  const ref = referenceInstruction?.[questionCode];

  if (!ref || !ref.index) {
    return;
  }

  const codePattern = createQuestionCodePattern(searchCode);  // Returns cached global regex
  let match;

  // ❌ MISSING: codePattern.lastIndex = 0;
  while ((match = codePattern.exec(fullPattern)) !== null) {  // Line 79
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      code: questionCode,
      text: match[0],
      ref: ref,
    });
  }
});
```

**Impact**:
- If `codesInPattern` contains multiple codes, the second iteration starts where the first ended
- Can skip valid matches at the beginning of the string
- Can cause incorrect tooltip placement or missing highlights
- Silent data corruption - no error thrown

**Reproduction Scenario**:
```javascript
// Input: fullPattern = "Q1. first Q2. second Q1. third"
// codesInPattern = ["Q1", "Q2"]
//
// First iteration (Q1): finds matches at positions 0 and 23
// Second iteration (Q2): starts from position 29 (after Q1's last match)
//                       MISSES Q2 at position 12!
```

**Fix**:
```javascript
const codePattern = createQuestionCodePattern(searchCode);
codePattern.lastIndex = 0;  // ✅ ADD THIS
let match;
while ((match = codePattern.exec(fullPattern)) !== null) {
  // ...
}
```

---

### 2. Global Pattern Cache Without Invalidation

**File**: `src/constants/instruction.js`
**Lines**: 15-26
**Severity**: 🔥 CRITICAL
**Status**: ✅ FIXED (commit 1978762)

**Issue**:
The `createQuestionCodePattern` function uses a global Map cache with no invalidation mechanism. Cached regex patterns maintain state (lastIndex) which is shared across all uses.

```javascript
const patternCache = new Map();  // Global mutable state

export function createQuestionCodePattern(questionCode) {
  if (patternCache.has(questionCode)) {
    return patternCache.get(questionCode);  // Returns same regex instance
  }

  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escapedCode}\\b(?=[.:\\s}])`, "g");  // 'g' flag = stateful
  patternCache.set(questionCode, pattern);
  return pattern;
}
```

**Impact**:
- Regex patterns with `g` flag maintain `lastIndex` state
- Returning cached patterns means all callers share the same regex instance
- Concurrent or sequential uses interfere with each other
- Causes the critical bug in QuestionDisplayTransformer.js:79
- No cache eviction - memory leak for dynamically generated question codes

**Context**:
Commit `780336c` removed regex caching from `getInstructionRegex()` due to performance analysis showing ~0.1μs creation time with negligible benefit. This function contradicts that decision.

**Fix Options**:

1. **Remove caching entirely** (recommended):
```javascript
export function createQuestionCodePattern(questionCode) {
  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedCode}\\b(?=[.:\\s}])`, "g");
}
```

2. **Reset lastIndex on retrieval**:
```javascript
if (patternCache.has(questionCode)) {
  const pattern = patternCache.get(questionCode);
  pattern.lastIndex = 0;  // Reset state
  return pattern;
}
```

---

## ⚠️ High Severity Issues

### 3. Excessive HTML Decoding Repetition

**File**: `src/components/design/ContentEditor/TipTapEditor/index.jsx`
**Lines**: 159, 195, 275, 293, 313
**Severity**: ⚠️ HIGH
**Status**: ✅ FIXED (commit 63def95)

**Issue**:
`QuestionDisplayTransformer.decodeInstructionEntities()` is called 5 times in different lifecycle hooks and effects, performing the same transformation repeatedly.

**Occurrences**:
```javascript
// 1. onUpdate callback (line 159)
onUpdate: ({ editor }) => {
  const html = QuestionDisplayTransformer.decodeInstructionEntities(
    editor.getHTML()
  );
  editorRef.current = html;
}

// 2. onBlur callback (line 195)
const currentHtml = QuestionDisplayTransformer.decodeInstructionEntities(
  editor?.getHTML() || ""
);

// 3. First useEffect - focus check (line 275)
const currentContent = QuestionDisplayTransformer.decodeInstructionEntities(
  editor.getHTML()
);

// 4. Sync effect - initial check (line 293)
const currentContent = QuestionDisplayTransformer.decodeInstructionEntities(
  editor.getHTML()
);

// 5. Sync effect - timeout check (line 313)
const finalCurrentContent = QuestionDisplayTransformer.decodeInstructionEntities(
  editor.getHTML()
);
```

**Impact**:
- Redundant string processing on every editor update
- Each call performs 5 sequential regex replace operations
- Performance degradation with large content
- Unnecessary re-renders if results are used in render path

**Fix**:
Create a memoized helper or move decoding to a single strategic location:

```javascript
const getDecodedHTML = useCallback(() => {
  if (!editor) return "";
  return QuestionDisplayTransformer.decodeInstructionEntities(editor.getHTML());
}, [editor]);
```

Or use `useMemo` to cache the decoded value:
```javascript
const decodedHTML = useMemo(() => {
  if (!editor) return "";
  return QuestionDisplayTransformer.decodeInstructionEntities(editor.getHTML());
}, [editor, /* trigger dependency */]);
```

---

### 4. Lost Accessibility - Button to Div Conversion

**File**: `src/components/design/ContentEditor/TipTapEditor/MentionList.jsx`
**Line**: 54
**Severity**: ⚠️ HIGH

**Issue**:
Mention items were changed from semantic `<button>` elements to `<div>` elements, breaking accessibility.

**Before (accessible)**:
```javascript
<button className="mention-item">
  {/* content */}
</button>
```

**After (inaccessible)**:
```javascript
<div
  className={`mention-item ${index === selectedIndex ? "is-selected" : ""}`}
  onMouseDown={(e) => {
    e.preventDefault();
    selectItem(index);
  }}
  key={index}
>
  <span className="mention-label">{item.value || item.label}</span>
  <span className="mention-type">{item.type}</span>
</div>
```

**Impact**:
- ❌ No keyboard tab navigation - users can't tab to mention items
- ❌ No semantic meaning - screen readers don't announce as interactive
- ❌ No default focus styles
- ❌ No built-in click/enter behavior
- ❌ Violates WCAG 2.1 accessibility guidelines

**Fix Options**:

1. **Restore `<button>` elements** (recommended):
```javascript
<button
  type="button"
  className={`mention-item ${index === selectedIndex ? "is-selected" : ""}`}
  onMouseDown={(e) => {
    e.preventDefault();
    selectItem(index);
  }}
  key={index}
>
  {/* content */}
</button>
```

2. **Add ARIA attributes to divs**:
```javascript
<div
  role="button"
  tabIndex={0}
  aria-label={`Select ${item.value || item.label}`}
  className={`mention-item ${index === selectedIndex ? "is-selected" : ""}`}
  onClick={() => selectItem(index)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectItem(index);
    }
  }}
>
  {/* content */}
</div>
```

---

### 5. Data Loss in MentionExtension Simplification

**File**: `src/components/design/ContentEditor/TipTapEditor/MentionExtension.js`
**Lines**: 28-35
**Severity**: ⚠️ HIGH
**Status**: ✅ NOT A BUG - Intentional simplification (commit c216fda by Askoura)

**Note**: After investigation, this was an intentional refactoring where `id` and `type` attributes were removed because the system switched to using `instruction` as the primary identifier. The simplification from `{{Q1:question}}` to `{{Q1}}` was deliberate.

**Issue**:
The simplified `renderHTML` implementation discards the `type` and `id` attributes that were previously stored.

**Before**:
```javascript
renderHTML({ node, HTMLAttributes }) {
  const displayId = referenceInstruction && referenceInstruction[node.attrs.id]
    ? referenceInstruction[node.attrs.id]
    : node.attrs.id;
  const displayText = `{{${displayId}:${node.attrs.type}}}`;
  // Returned structured span with attributes
}
```

**After**:
```javascript
renderHTML({ node, HTMLAttributes }) {
  const instruction = QuestionDisplayTransformer.getDisplayId(
    node.attrs.instruction,
    referenceInstruction
  );

  return ["span", {}, `{{${instruction}}}`];  // ❌ type lost, HTMLAttributes ignored
}
```

**Impact**:
- **Breaking Change**: Old content with `{{code:type}}` format won't display correctly
- **Migration Risk**: Existing stored content may break
- **HTMLAttributes Ignored**: The second parameter is completely unused
- **Type Information Lost**: Can't distinguish between question/group mentions
- **No Error Handling**: If `node.attrs.instruction` is undefined, renders `{{undefined}}`

**Fix**:
```javascript
renderHTML({ node, HTMLAttributes }) {
  const instruction = QuestionDisplayTransformer.getDisplayId(
    node.attrs.instruction,
    referenceInstruction
  );

  // Validate instruction
  if (!instruction) {
    console.warn('[MentionExtension] Missing instruction attribute');
    return ["span", {}, ""];
  }

  // Preserve type if available
  const type = node.attrs.type;
  const displayText = type ? `{{${instruction}:${type}}}` : `{{${instruction}}}`;

  // Use HTMLAttributes
  return ["span", HTMLAttributes, displayText];
}
```

---

### 6. Inefficient HTML Entity Replacements

**File**: `src/utils/QuestionDisplayTransformer.js`
**Lines**: 93-104
**Severity**: ⚠️ HIGH

**Issue**:
The `decodeInstructionEntities` method performs 5 sequential string replace operations, each compiling a new regex.

```javascript
static decodeInstructionEntities(html) {
  if (!html) return html;

  return html.replace(INSTRUCTION_SYNTAX_PATTERN, (match) => {
    return match
      .replace(/&gt;/g, '>')      // 1st regex compile
      .replace(/&lt;/g, '<')      // 2nd regex compile
      .replace(/&amp;/g, '&')     // 3rd regex compile
      .replace(/&quot;/g, '"')    // 4th regex compile
      .replace(/&#39;/g, "'");    // 5th regex compile
  });
}
```

**Impact**:
- 5 separate regex compilations per instruction match
- String intermediates created for each replacement
- Called 5 times per editor interaction (see issue #3)
- No type validation - fails silently if `html` is not a string

**Fix**:

1. **Use a single regex with lookup map**:
```javascript
const HTML_ENTITY_MAP = {
  '&gt;': '>',
  '&lt;': '<',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'"
};

const HTML_ENTITY_PATTERN = /&(?:gt|lt|amp|quot|#39);/g;

static decodeInstructionEntities(html) {
  if (typeof html !== 'string') return html;
  if (!html) return html;

  return html.replace(INSTRUCTION_SYNTAX_PATTERN, (match) => {
    return match.replace(HTML_ENTITY_PATTERN, (entity) => HTML_ENTITY_MAP[entity]);
  });
}
```

2. **Cache compiled patterns** (if keeping sequential approach):
```javascript
const GT_PATTERN = /&gt;/g;
const LT_PATTERN = /&lt;/g;
const AMP_PATTERN = /&amp;/g;
const QUOT_PATTERN = /&quot;/g;
const APOS_PATTERN = /&#39;/g;

static decodeInstructionEntities(html) {
  if (typeof html !== 'string') return html;
  if (!html) return html;

  return html.replace(INSTRUCTION_SYNTAX_PATTERN, (match) => {
    return match
      .replace(GT_PATTERN, '>')
      .replace(LT_PATTERN, '<')
      .replace(AMP_PATTERN, '&')
      .replace(QUOT_PATTERN, '"')
      .replace(APOS_PATTERN, "'");
  });
}
```

**Note**: Order matters! `&amp;` should be decoded last to avoid double-decoding (e.g., `&amp;gt;` → `&gt;` → `>`).

---

## 📋 Medium Severity Issues

  ### 7. Double Regex Testing Inefficiency

**File**: `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js`
**Lines**: 180-224
**Severity**: 📋 MEDIUM
**Status**: ✅ FIXED (commit ed032a8)

**Issue**:
The `highlightInstructionsInStaticContent` function tests nodes with `regex.test()` first, then runs `regex.exec()` on the same content.

```javascript
// First pass: test for matches
while ((node = walker.nextNode())) {
  if (regex.test(node.textContent)) {  // ❌ First regex pass
    nodesToProcess.push(node);
  }
}

// Second pass: exec on same content
nodesToProcess.forEach((textNode) => {
  const text = textNode.textContent;
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {  // ❌ Second regex pass
    // Process matches
  }
});
```

**Impact**:
- Unnecessary double processing of text content
- `test()` pass is redundant - `exec()` returns null if no match
- Minor performance impact with many nodes

**Fix**:
Remove the filtering step entirely - the while loop naturally handles no matches:

```javascript
const regex = getInstructionRegex();

while ((node = walker.nextNode())) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    regex.lastIndex = 0;
    let match;

    const matches = [];
    while ((match = regex.exec(text)) !== null) {
      matches.push(match);
    }

    if (matches.length > 0) {
      // Process node with matches
    }
  }
}
```

---

### 8. Redundant lastIndex Resets After Caching Removal

**File**: `src/components/design/ContentEditor/TipTapEditor/InstructionHighlightExtension.js`
**Line**: 77
**File**: `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js`
**Line**: 196
**Severity**: 📋 MEDIUM

**Issue**:
After commit `780336c` refactored `getInstructionRegex()` to return a fresh regex instance on each call, manual `lastIndex = 0` resets became redundant.

```javascript
// InstructionHighlightExtension.js:71-77
function findInstructionPatterns(doc) {
  const decorations = [];
  const regex = getInstructionRegex();  // Returns NEW regex each time

  doc.descendants((node, pos) => {
    if (node.isText) {
      regex.lastIndex = 0;  // ❌ Redundant - regex is fresh with lastIndex=0
      const text = node.text;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // ...
      }
    }
  });
}
```

**Context**:
```javascript
// instructionUtils.js:12-14
export const getInstructionRegex = () => {
  return new RegExp(INSTRUCTION_SYNTAX_PATTERN.source, "g");  // Always fresh
};
```

**Impact**:
- Code clarity - implies regex state management when none exists
- Maintenance burden - if someone reintroduces caching
- Not harmful, just misleading

**Contrast**:
The reset IS necessary in `extractReferencedCodes` (instructionUtils.js:36) because `REFERENCED_CODE_PATTERN` is a global constant:

```javascript
// instructionUtils.js:27-39
export function extractReferencedCodes(content) {
  if (typeof content !== "string") return new Set();

  const codes = new Set();
  let match;

  while ((match = REFERENCED_CODE_PATTERN.exec(content)) !== null) {
    codes.add(match[1].trim());
  }
  REFERENCED_CODE_PATTERN.lastIndex = 0;  // ✅ Necessary - global pattern

  return codes;
}
```

**Fix**:
Remove redundant resets from locations using `getInstructionRegex()`:

```javascript
doc.descendants((node, pos) => {
  if (node.isText) {
    // Remove: regex.lastIndex = 0;
    const text = node.text;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // ...
    }
  }
});
```

---

### 9. Hook Parameter Redundancy

**File**: `src/components/design/ContentEditor/index.jsx`
**Lines**: 58-63
**Severity**: 📋 MEDIUM

**Issue**:
`useInstructionHighlighting` receives both `index` and `designState`, but `index` is already available within `designState.componentIndex`.

```javascript
const { referenceInstruction, fixedValue } = useInstructionHighlighting({
  content: value,
  index,           // ❌ Redundant
  designState,     // Contains componentIndex
  mainLang,
  isActive,
  renderedContentRef,
});
```

**Impact**:
- Unclear API contract - which `index` takes precedence?
- Potential bugs if `index` and `designState.componentIndex` diverge
- Unnecessary coupling between hook and parent component

**Related Issue**:
The hook also has a `lang` vs `mainLang` inconsistency. Line 54 in ContentEditor uses `lang`:
```javascript
value = content?.[lang]?.[contentKey]  // Uses lang
```

But the hook receives `mainLang`:
```javascript
useInstructionHighlighting({ mainLang /* not lang */ })
```

**Fix**:
Simplify the hook interface:

```javascript
// Option 1: Only pass designState
const { referenceInstruction, fixedValue } = useInstructionHighlighting({
  content: value,
  designState,  // Hook extracts index internally
  lang,        // Match the language being displayed
  isActive,
  renderedContentRef,
});

// Option 2: Remove designState, be explicit
const { referenceInstruction, fixedValue } = useInstructionHighlighting({
  content: value,
  index,
  lang,
  questions: designState.questions,
  isActive,
  renderedContentRef,
});
```

---

### 10. Hardcoded String - Lost Internationalization

**File**: `src/components/design/ContentEditor/TipTapEditor/MentionList.jsx`
**Line**: 69
**Severity**: 📋 MEDIUM

**Issue**:
The "No result" text was previously translated but is now hardcoded.

**Before**:
```javascript
import { useTranslation } from 'react-i18next';

const MentionList = forwardRef(({ items, command }, ref) => {
  const { t } = useTranslation();

  return (
    <div className="mention-item">{t("mention_no_result")}</div>
  );
});
```

**After**:
```javascript
// useTranslation removed
return (
  <div className="mention-item">No result</div>  // ❌ Hardcoded English
);
```

**Impact**:
- Non-English users see untranslated text
- Regression in internationalization coverage
- Violates project's i18n patterns

**Fix**:
Restore translation:

```javascript
import { useTranslation } from 'react-i18next';

const MentionList = forwardRef(({ items, command }, ref) => {
  const { t } = useTranslation();

  return (
    <div className="mention-item">
      {items.length ? (
        items.map((item, index) => (
          // ... item rendering
        ))
      ) : (
        <div className="mention-item">{t("mention_no_result")}</div>
      )}
    </div>
  );
});
```

---

### 11. Silent Error Swallowing

**File**: `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js`
**Lines**: 232-234
**Severity**: 📋 MEDIUM

**Issue**:
Errors are caught and only logged to console, with no way for callers to detect or handle failures.

```javascript
try {
  // ... highlight logic
} catch (error) {
  console.error("Error highlighting instructions:", error);
  // ❌ No rethrow, no callback, no return indication of failure
}
```

**Impact**:
- Silent failures in production (console.error may not be monitored)
- Callers have no way to know highlighting failed
- No contextual information in error message (which element? which pattern?)
- No recovery mechanism

**Fix**:

1. **Add error boundary or callback**:
```javascript
export function highlightInstructionsInStaticContent(
  element,
  referenceInstruction = {},
  indexToCodeMap = {},
  onError = null  // Optional error callback
) {
  try {
    // ... logic
    return cleanup;
  } catch (error) {
    console.error(
      "[highlightInstructionsInStaticContent] Error:",
      error,
      { element, referenceInstruction, indexToCodeMap }
    );

    if (onError) {
      onError(error);
    }

    // Return noop cleanup
    return () => {};
  }
}
```

2. **Or add structured error handling**:
```javascript
class InstructionHighlightError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'InstructionHighlightError';
    this.context = context;
  }
}

try {
  // ... logic
} catch (error) {
  throw new InstructionHighlightError(
    'Failed to highlight instructions',
    { element, originalError: error }
  );
}
```

---

### 12. Magic Numbers in Tooltip Configuration

**File**: `src/constants/editor.js`
**Lines**: 75-84
**Severity**: 📋 MEDIUM

**Issue**:
Tooltip configuration contains undocumented magic numbers with unclear units and meaning.

```javascript
export const INSTRUCTION_EDITOR_CONFIG = {
  PATTERN: INSTRUCTION_SYNTAX_PATTERN,
  TOOLTIP: {
    delay: [0, 0],           // ❌ What do these mean?
    duration: [200, 150],    // ❌ In ms? Why 200 and 150?
    placement: "auto",
    theme: "instruction",
    arrow: true,
    maxWidth: 400,           // ❌ In px? Why 400?
    interactive: false,
    appendTo: document.body, // ⚠️ Browser-only, breaks SSR
    ignoreAttributes: true,
  },
};
```

**Impact**:
- Unmaintainable - no one knows why these specific values
- Hard to adjust without understanding intent
- No documentation for Tippy.js array format
- `document.body` breaks server-side rendering

**Fix**:
Add documentation and named constants:

```javascript
// Tippy.js delay format: [show delay, hide delay] in milliseconds
const TOOLTIP_SHOW_DELAY_MS = 0;    // Show immediately on hover
const TOOLTIP_HIDE_DELAY_MS = 0;    // Hide immediately on unhover

// Tippy.js duration format: [show animation, hide animation] in milliseconds
const TOOLTIP_SHOW_DURATION_MS = 200;   // Fade in over 200ms
const TOOLTIP_HIDE_DURATION_MS = 150;   // Fade out over 150ms

// Maximum width before text wraps
const TOOLTIP_MAX_WIDTH_PX = 400;

export const INSTRUCTION_EDITOR_CONFIG = {
  PATTERN: INSTRUCTION_SYNTAX_PATTERN,
  TOOLTIP: {
    // Delay before showing/hiding tooltip [show, hide] in ms
    delay: [TOOLTIP_SHOW_DELAY_MS, TOOLTIP_HIDE_DELAY_MS],

    // Animation duration [show, hide] in ms
    duration: [TOOLTIP_SHOW_DURATION_MS, TOOLTIP_HIDE_DURATION_MS],

    placement: "auto",        // Auto-position based on available space
    theme: "instruction",      // Custom theme name (see tiptap-editor.css)
    arrow: true,              // Show tooltip arrow pointer
    maxWidth: TOOLTIP_MAX_WIDTH_PX,
    interactive: false,       // Tooltip doesn't capture mouse events

    // Append to body (note: breaks SSR, wrap in typeof window check if needed)
    appendTo: typeof document !== 'undefined' ? document.body : null,

    ignoreAttributes: true,   // Don't use data-tippy-* attributes
  },
};
```

---

### 13. Code Duplication in Fragment Building

**File**: `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js`
**Lines**: 67-89 (processInstructionContent) and 200-220 (highlightInstructionsInStaticContent)
**Severity**: 📋 MEDIUM

**Issue**:
The pattern of building document fragments with interleaved text nodes and highlighted spans is duplicated in two functions.

**Pattern 1** (processInstructionContent, lines 67-89):
```javascript
let lastIndex = 0;

codeMatches.forEach((codeMatch) => {
  if (codeMatch.start > lastIndex) {
    wrapperSpan.appendChild(
      document.createTextNode(fullPattern.slice(lastIndex, codeMatch.start))
    );
  }

  const codeSpan = document.createElement("span");
  codeSpan.textContent = codeMatch.text;
  // ... set attributes
  wrapperSpan.appendChild(codeSpan);
  lastIndex = codeMatch.end;
});

if (lastIndex < fullPattern.length) {
  wrapperSpan.appendChild(
    document.createTextNode(fullPattern.slice(lastIndex))
  );
}
```

**Pattern 2** (highlightInstructionsInStaticContent, lines 200-220):
```javascript
let lastIndex = 0;

while ((match = regex.exec(text)) !== null) {
  if (match.index > lastIndex) {
    fragment.appendChild(
      document.createTextNode(text.slice(lastIndex, match.index))
    );
  }

  // ... create processed span
  lastIndex = match.index + match[0].length;
}

if (lastIndex < text.length) {
  fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
}
```

**Impact**:
- Violates DRY principle
- Maintenance burden - fixes need to be applied in two places
- Increased cognitive load

**Fix**:
Extract common logic into utility function:

```javascript
/**
 * Builds a document fragment with interleaved text nodes and highlighted spans
 * @param {string} text - Full text content
 * @param {Array<{start: number, end: number, node: Node}>} spans - Highlighted spans with positions
 * @param {DocumentFragment|HTMLElement} container - Container to append to
 */
function buildFragmentWithHighlights(text, spans, container) {
  let lastIndex = 0;

  spans.forEach(({ start, end, node }) => {
    // Add text before highlight
    if (start > lastIndex) {
      container.appendChild(
        document.createTextNode(text.slice(lastIndex, start))
      );
    }

    // Add highlighted span
    container.appendChild(node);
    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return container;
}
```

Then use in both locations:
```javascript
// In processInstructionContent:
const spans = codeMatches.map(codeMatch => {
  const codeSpan = document.createElement("span");
  codeSpan.textContent = codeMatch.text;
  codeSpan.setAttribute("data-tooltip", tooltipContent);
  codeSpan.setAttribute("data-question-code", codeMatch.code);

  return {
    start: codeMatch.start,
    end: codeMatch.end,
    node: codeSpan
  };
});

buildFragmentWithHighlights(fullPattern, spans, wrapperSpan);
```

---

## 🔧 Over-Engineering

### 14. Pattern Cache with Negligible Benefit

**File**: `src/constants/instruction.js`
**Lines**: 15-26
**Status**: Contradicts architectural decision in commit 780336c
**Severity**: 📋 MEDIUM

**Analysis**:
Commit `780336c` specifically removed regex caching from `getInstructionRegex()` after performance testing showed:
- Regex creation time: ~0.1 microseconds
- Cache lookup overhead: comparable to creation
- Conclusion: Caching provides no measurable benefit

Yet `createQuestionCodePattern` still implements caching:

```javascript
const patternCache = new Map();

export function createQuestionCodePattern(questionCode) {
  if (patternCache.has(questionCode)) {
    return patternCache.get(questionCode);
  }

  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${escapedCode}\\b(?=[.:\\s}])`, "g");
  patternCache.set(questionCode, pattern);
  return pattern;
}
```

**Problems**:
1. **Inconsistent with architecture decision** - contradicts commit 780336c rationale
2. **Causes critical bug** - shared regex state (see Critical Bug #1)
3. **Memory leak potential** - cache never clears, unbounded growth
4. **Minimal benefit** - regex creation is negligible (~0.1μs)
5. **Added complexity** - global mutable state to manage

**Recommendation**:
Remove caching to align with project architecture:

```javascript
export function createQuestionCodePattern(questionCode) {
  const escapedCode = questionCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedCode}\\b(?=[.:\\s}])`, "g");
}
```

---

### 15. Unnecessary Extension Re-Sync in TipTapEditor

**File**: `src/components/design/ContentEditor/TipTapEditor/index.jsx`
**Lines**: 209-215
**Severity**: 📋 MEDIUM

**Issue**:
A new useEffect manually calls `editor.setOptions({extensions})` whenever extensions change, but extensions are already memoized and passed to `useEditor`.

```javascript
// Line 77-93: Extensions are memoized
const extensions = useMemo(() => {
  return createAllExtensions({
    getMentionSuggestions,
    referenceInstruction,
    extended,
    onNewLine,
    onBlurListener,
    lang,
  });
}, [
  getMentionSuggestions,
  referenceInstruction,
  extended,
  onNewLine,
  onBlurListener,
  lang,
]);

// Line 95-97: Editor receives memoized extensions
const editor = useEditor({
  extensions,
  // ...
});

// Line 209-215: ❌ Redundant manual sync
useEffect(() => {
  if (editor && extensions) {
    editor.setOptions({
      extensions,
    });
  }
}, [editor, extensions]);
```

**Analysis**:
- TipTap's `useEditor` hook automatically handles extension changes when dependencies update
- The `useMemo` already prevents unnecessary extension recreation
- Manually calling `setOptions` may cause:
  - Duplicate initialization
  - State thrashing if extensions change rapidly
  - Lost cursor position or editor state

**Fix**:
Remove the redundant effect:

```javascript
// Delete lines 209-215
// useEffect(() => {
//   if (editor && extensions) {
//     editor.setOptions({
//       extensions,
//     });
//   }
// }, [editor, extensions]);
```

If there's a specific reason for manual sync (e.g., TipTap bug), add a comment explaining why.

---

## 📝 Low Severity Issues

### 16. Pending RAF Not Cancelled on Destroy

**File**: `src/components/design/ContentEditor/TipTapEditor/InstructionHighlightExtension.js`
**Lines**: 54-65
**Severity**: 📝 LOW
**Status**: ✅ FIXED (commit 606dacd)

**Issue**:
`requestAnimationFrame` callback is not cancelled when the extension is destroyed, potentially calling methods on unmounted elements.

```javascript
view() {
  return {
    update(view) {
      requestAnimationFrame(() => {
        tooltipManager.updateTooltips(view.dom);  // ❌ May execute after destroy
      });
    },
    destroy() {
      tooltipManager.destroy();  // ❌ Doesn't cancel pending RAF
    },
  };
},
```

**Impact**:
- Low risk because `InstructionTooltipManager.updateTooltips()` has null check (line 10)
- Potential memory leak if RAF holds references
- Clean architecture principle violation

**Fix**:
Track and cancel RAF callbacks:

```javascript
view() {
  let rafId = null;

  return {
    update(view) {
      // Cancel previous RAF if pending
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        rafId = null;
        tooltipManager.updateTooltips(view.dom);
      });
    },
    destroy() {
      // Cancel pending RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      tooltipManager.destroy();
    },
  };
},
```

---

### 17. Private Property Access (_tippy)

**File**: `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js`
**Line**: 154-157
**Severity**: 📝 LOW
**Status**: ✅ FIXED (commit b562925)

**Issue**:
Code accesses the private `_tippy` property of Tippy instances.

```javascript
existingHighlights.forEach((span) => {
  if (span._tippy) {  // ❌ Private property access
    span._tippy.destroy();
  }
  span.remove();
});
```

**Impact**:
- Brittle - `_tippy` is an internal Tippy.js implementation detail
- May break with Tippy.js version updates
- No guarantee this property will exist

**Fix**:
Use Tippy's public API:

```javascript
import tippy from 'tippy.js';

existingHighlights.forEach((span) => {
  const instance = span._tippy;  // Tippy attaches this
  if (instance) {
    instance.destroy();
  }
  span.remove();
});
```

Or better, track instances explicitly:

```javascript
// In InstructionTooltipManager (which already does this)
destroy() {
  this.instances.forEach((instance) => {
    instance.destroy();
  });
  this.instances.clear();
}
```

Then in instructionUtils:
```javascript
// Don't manually destroy - let TooltipManager handle it via cleanup
const cleanup = highlightInstructionsInStaticContent(...);
return cleanup;  // Cleanup function handles tooltip lifecycle
```

---

### 18. Missing Type Validation Throughout

**Multiple Files**
**Severity**: 📝 LOW

**Issue**:
Many functions lack type validation for parameters, relying on implicit type coercion or causing runtime errors.

**Examples**:

1. **QuestionDisplayTransformer.getDisplayId** (line 9):
```javascript
static getDisplayId(questionCode, referenceInstruction = {}) {
  const ref = referenceInstruction[questionCode];  // No check if questionCode is string
  // ...
  return questionCode;  // Could return undefined
}
```

2. **resolveQuestionCode** (instruction.js:28):
```javascript
export function resolveQuestionCode(refCode, reverseIndex = {}) {
  if (DISPLAY_INDEX_PATTERN.test(refCode) && reverseIndex[refCode]) {
    // ❌ No validation that refCode is string before regex test
    return reverseIndex[refCode];
  }
  return refCode;
}
```

3. **parseUsedInstructions** (instructionUtils.js:103):
```javascript
export function parseUsedInstructions(content, index, questions, mainLang, reverseIndex = {}) {
  const result = {};

  if (!content || !index) {  // ❌ Only truthy check, not type check
    return result;
  }
  // No validation of questions, mainLang types
}
```

**Fix**:
Add type guards:

```javascript
static getDisplayId(questionCode, referenceInstruction = {}) {
  if (typeof questionCode !== 'string' || !questionCode) {
    console.warn('[getDisplayId] Invalid questionCode:', questionCode);
    return '';
  }

  if (!referenceInstruction || typeof referenceInstruction !== 'object') {
    return questionCode;
  }

  // ... rest of logic
}
```

Or use TypeScript for compile-time safety.

---

### 19. CSS Selector Brittleness

**File**: `src/components/design/ContentEditor/TipTapEditor/InstructionTooltipManager.js`
**Line**: 14
**Severity**: 📝 LOW
**Status**: ✅ FIXED (commit d2c7ce3)

**Issue**:
Hardcoded CSS selector string could fail silently if class names change.

```javascript
const currentHighlights = new Set(
  editorElement.querySelectorAll(".instruction-highlight [data-tooltip]")
  // ❌ If class name changes, this fails silently
);
```

**Impact**:
- Silent failure - no tooltips, no error
- Tight coupling between JS and CSS
- Difficult to refactor CSS class names

**Fix Options**:

1. **Use a constant**:
```javascript
// constants/editor.js
export const EDITOR_CONSTANTS = {
  // ... existing constants
  SELECTORS: {
    INSTRUCTION_HIGHLIGHT: '.instruction-highlight',
    TOOLTIP_TARGET: '[data-tooltip]',
  }
};

// InstructionTooltipManager.js
const { INSTRUCTION_HIGHLIGHT, TOOLTIP_TARGET } = EDITOR_CONSTANTS.SELECTORS;
const selector = `${INSTRUCTION_HIGHLIGHT} ${TOOLTIP_TARGET}`;
const currentHighlights = new Set(editorElement.querySelectorAll(selector));
```

2. **Add data attribute**:
```javascript
// Use data attribute instead of class
const currentHighlights = new Set(
  editorElement.querySelectorAll("[data-instruction-highlight][data-tooltip]")
);
```

---

## ✅ Positive Changes

Despite the issues identified above, this PR includes several positive improvements:

### 1. Extracted Complex Logic to Reusable Hook
The `useInstructionHighlighting` hook (58 lines) successfully extracts complex instruction parsing logic from ContentEditor, improving:
- Code organization and reusability
- Separation of concerns
- Testability (hook can be tested in isolation)

### 2. Simplified ContentEditor Component
ContentEditor.jsx reduced inline complexity by delegating instruction logic to the custom hook:
- Cleaner component structure
- Easier to understand data flow
- Better maintainability

### 3. Created Specialized Utilities
New utility modules with clear responsibilities:
- `instructionUtils.js` - DOM manipulation for instructions
- `QuestionDisplayTransformer.js` - Data transformation logic
- `InstructionTooltipManager.js` - Lifecycle management for tooltips

### 4. Improved Separation of Concerns
The PR establishes clearer boundaries between:
- Editor extensions (TipTap)
- React components (UI)
- Utilities (business logic)
- Constants (configuration)

### 5. Enhanced User Experience
New features provide value to users:
- Instruction highlighting in editor
- Tooltips with question details
- Visual feedback for referenced questions

---

## 📊 Recommendations by Priority

### Priority 1: Critical - Must Fix Before Merge

| Issue | File | Effort | Impact |
|-------|------|--------|--------|
| Missing lastIndex reset | QuestionDisplayTransformer.js:79 | 1 line | 🔥 Data corruption |
| Global pattern cache | instruction.js:15-26 | Remove cache (~10 lines) | 🔥 State bugs |
| Lost accessibility | MentionList.jsx:54 | Restore `<button>` or add ARIA | ⚠️ WCAG violation |

**Estimated Time**: 30 minutes
**Blocker**: Yes - These could cause production issues

---

### Priority 2: High - Should Fix Before Merge

| Issue | File | Effort | Impact |
|-------|------|--------|--------|
| Excessive HTML decoding | TipTapEditor/index.jsx (5 locations) | Add useMemo/useCallback | ⚠️ Performance |
| Data loss in MentionExtension | MentionExtension.js:28-35 | Restore type attribute | ⚠️ Breaking change |
| Inefficient entity replacement | QuestionDisplayTransformer.js:93-104 | Refactor to single regex | ⚠️ Performance |

**Estimated Time**: 1-2 hours
**Blocker**: Recommended - Performance and breaking change risks

---

### Priority 3: Medium - Fix in Follow-up PR

| Issue | File | Effort | Impact |
|-------|------|--------|--------|
| Double regex testing | instructionUtils.js:180-224 | Remove test() pass | 📋 Minor perf |
| Redundant lastIndex resets | InstructionHighlightExtension.js:77, instructionUtils.js:196 | Remove 2 lines | 📋 Clarity |
| Hook parameter redundancy | ContentEditor/index.jsx:58-63 | Simplify interface | 📋 API clarity |
| Hardcoded string | MentionList.jsx:69 | Restore i18n | 📋 Localization |
| Silent error swallowing | instructionUtils.js:232-234 | Add error handling | 📋 Debugging |
| Magic numbers | editor.js:75-84 | Add documentation | 📋 Maintainability |
| Code duplication | instructionUtils.js (2 locations) | Extract helper | 📋 DRY |

**Estimated Time**: 2-3 hours
**Blocker**: No - Quality improvements, can be addressed post-merge

---

### Priority 4: Low - Technical Debt Backlog

| Issue | File | Effort | Impact |
|-------|------|--------|--------|
| RAF not cancelled | InstructionHighlightExtension.js:54-65 | Track RAF IDs | 📝 Memory leak risk |
| Private property access | instructionUtils.js:154 | Use public API | 📝 Version brittleness |
| Missing type validation | Multiple files | Add guards | 📝 Robustness |
| CSS selector brittleness | InstructionTooltipManager.js:14 | Use constants | 📝 Refactoring safety |
| Over-engineering | instruction.js (pattern cache), TipTapEditor.jsx (extension sync) | Remove unnecessary code | 📝 Code simplicity |

**Estimated Time**: 2-4 hours
**Blocker**: No - Nice-to-have improvements

---

## 📁 File Reference

### New Files Created

1. `src/components/design/ContentEditor/TipTapEditor/InstructionHighlightExtension.js` (+104 lines)
2. `src/components/design/ContentEditor/TipTapEditor/InstructionTooltipManager.js` (+46 lines)
3. `src/components/design/ContentEditor/TipTapEditor/instructionUtils.js` (+210 lines)
4. `src/utils/QuestionDisplayTransformer.js` (+108 lines)
5. `src/hooks/useInstructionHighlighting.js` (+58 lines)
6. `src/constants/instruction.js` (+34 lines)

**Total New Code**: ~560 lines

### Modified Files

1. `src/components/design/ContentEditor/TipTapEditor/MentionExtension.js` (-60 lines)
2. `src/components/design/ContentEditor/TipTapEditor/MentionList.jsx` (accessibility regression)
3. `src/components/design/ContentEditor/TipTapEditor/extensions.js` (+3 lines)
4. `src/components/design/ContentEditor/TipTapEditor/index.jsx` (+51 lines, 5× decoding)
5. `src/components/design/ContentEditor/index.jsx` (-75 lines, simplified)
6. `src/constants/editor.js` (+15 lines, tooltip config)
7. `src/styles/tiptap-editor.css` (+22 lines, styling)

**Net Change**: +666 insertions, -165 deletions

---

## 🎯 Conclusion

This PR introduces valuable instruction highlighting functionality but contains **2 critical bugs** and **4 high-severity issues** that should be addressed before merging to prevent data corruption, accessibility violations, and performance problems.

The positive architectural improvements (extracted hooks, clearer separation of concerns) are overshadowed by introduced anti-patterns (global caching, excessive re-processing, lost accessibility).

**Recommendation**:
- ✅ **Merge after Priority 1 & 2 fixes** (estimated 2-3 hours of work)
- 📋 Create follow-up tickets for Priority 3 & 4 issues
- 🔍 Add regression tests for the critical regex state bug
- ♿ Add accessibility tests for MentionList component

---

**Review Date**: 2026-02-01
**Reviewer**: Claude Code (Automated PR Analysis)
**Branch**: feature/format_instructions → main
**Status**: ⚠️ Conditional Approval (fixes required)
