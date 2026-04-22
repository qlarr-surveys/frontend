/**
 * Re-position the intro.js skip (×) button to the corner opposite the
 * tooltip arrow so the two never visually overlap.
 *
 * intro.js renders the arrow on different sides of the tooltip depending on
 * the computed position relative to the highlighted element; the CSS
 * defaults for `.introjs-skipbutton` are direction-based (top-right in LTR,
 * top-left in RTL) and have no knowledge of where the arrow ends up — in
 * edge cases (e.g. RTL `bottom-left-aligned`, or LTR `bottom-right-aligned`)
 * both sit in the same corner and collide. This helper reads the arrow's
 * class list after intro.js positions it and sets inline style on the skip
 * button to steer clear.
 *
 * Arrow-class → actual CSS corner (intro.js v8 — see introjs.css):
 *   top            left:10px  top:-10px     → TOP-LEFT corner
 *   top-middle     left:50%   top:-10px     → TOP-CENTER
 *   top-right      right:10px top:-10px     → TOP-RIGHT
 *   bottom         left:10px  bottom:-10px  → BOTTOM-LEFT
 *   bottom-middle  left:50%   bottom:-10px  → BOTTOM-CENTER
 *   bottom-right   right:10px bottom:-10px  → BOTTOM-RIGHT
 *   left           left:-10px top:10px      → LEFT edge, top
 *   left-bottom    left:-10px bottom:10px   → LEFT edge, bottom
 *   right          right:-10px top:10px     → RIGHT edge, top
 *   right-bottom   right:-10px bottom:10px  → RIGHT edge, bottom
 *
 * Note: intro.js v8 has no `top-left` / `bottom-left` classes — the
 * "default" positions (plain `top` / `bottom`) are rendered on the LEFT.
 *
 * Call from `intro.onAfterChange`. Internally retries on a microtask and a
 * short timeout so we catch whichever frame intro.js actually commits the
 * arrow class on.
 */

const ARROW_ON_LEFT = ["top", "bottom", "left", "left-bottom"];
const ARROW_ON_RIGHT = ["top-right", "bottom-right", "right", "right-bottom"];

function applySkipButtonPosition() {
  const arrow = document.querySelector(".introjs-arrow");
  const skipBtn = document.querySelector(".introjs-skipbutton");
  if (!arrow || !skipBtn) return;

  const classes = Array.from(arrow.classList);
  const onLeft = ARROW_ON_LEFT.some((c) => classes.includes(c));
  const onRight = ARROW_ON_RIGHT.some((c) => classes.includes(c));

  if (onLeft) {
    skipBtn.style.setProperty("right", "-10px", "important");
    skipBtn.style.setProperty("left", "auto", "important");
  } else if (onRight) {
    skipBtn.style.setProperty("right", "auto", "important");
    skipBtn.style.setProperty("left", "-10px", "important");
  } else {
    skipBtn.style.removeProperty("right");
    skipBtn.style.removeProperty("left");
  }
}

export function positionSkipButtonAwayFromArrow() {
  applySkipButtonPosition();
  requestAnimationFrame(applySkipButtonPosition);
  setTimeout(applySkipButtonPosition, 150);
}
