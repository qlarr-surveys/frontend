import { getContrastColor } from "~/components/Questions/utils";

// Contrast strength of each tone against the card (paper) surface.
const TILE_CONTRAST = 0.05; // tile: barely off the card colour
const ICON_CONTRAST = 0.32; // icon: soft but legible

// Stacked-photos artwork for empty image-choice option tiles.
const imageSvgMarkup = (tile, icon) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">` +
  `<rect width="256" height="256" rx="4" fill="${tile}"/>` +
  // back photo frame: outline only, rotated, peeking out behind
  `<rect x="44" y="62" width="150" height="116" rx="14" fill="none" stroke="${icon}" ` +
  `stroke-width="11" stroke-linejoin="round" transform="rotate(-15 119 120)"/>` +
  // front photo frame: solid tile fill occludes the back frame
  `<rect x="74" y="90" width="150" height="116" rx="14" fill="${tile}" stroke="${icon}" ` +
  `stroke-width="11" stroke-linejoin="round"/>` +
  `<circle cx="180" cy="124" r="13" fill="${icon}"/>` + // sun
  `<path d="M90 196 L130 146 L156 172 L176 154 L210 196 Z" fill="${icon}"/>` + // mountains
  `</svg>`;

// Single picture-frame glyph for empty icon-choice slots (original artwork).
const iconSvgMarkup = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">` +
  `<g fill="${color}">` +
  `<path opacity=".2" d="M224 56v122.06l-39.72-39.72a8 8 0 0 0-11.31 0L147.31 164l-49.65-49.66a8 8 0 0 0-11.32 0L32 168.69V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8"/>` +
  `<path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 16v102.75l-26.07-26.06a16 16 0 0 0-22.63 0l-20 20l-44-44a16 16 0 0 0-22.62 0L40 149.37V56ZM40 172l52-52l80 80H40Zm176 28h-21.37l-36-36l20-20L216 181.38zm-72-100a12 12 0 1 1 12 12a12 12 0 0 1-12-12"/>` +
  `</g></svg>`;

// The resolved paper colour is the only input either placeholder depends on, so
// the generated SVGs are cached by it: the markup build + encodeURIComponent
// runs once per theme instead of on every render of every image-choice tile.
const paperOf = (theme) => theme?.palette?.background?.paper || "#ffffff";

// In practice only a handful of paper colours ever occur; the cap is just a
// guard against unbounded growth if a theme cycles through many colours.
const CACHE_LIMIT = 32;
const memoizeByPaper = (compute) => {
  const cache = new Map();
  return (paper) => {
    if (cache.has(paper)) return cache.get(paper);
    if (cache.size >= CACHE_LIMIT) cache.clear();
    const value = compute(paper);
    cache.set(paper, value);
    return value;
  };
};

const buildImageUrl = memoizeByPaper((paper) => {
  const tile = getContrastColor(paper, TILE_CONTRAST);
  const icon = getContrastColor(paper, ICON_CONTRAST);
  return `url("data:image/svg+xml,${encodeURIComponent(
    imageSvgMarkup(tile, icon)
  )}")`;
});

const buildIconSvg = memoizeByPaper((paper) =>
  iconSvgMarkup(getContrastColor(paper, ICON_CONTRAST))
);

/**
 * Theme-aware placeholder for empty image-choice option tiles, as a CSS
 * `background-image` value (inline SVG data URI). Colours derive from the
 * survey card (paper) surface, so it adapts to custom themes. The result is
 * memoized per paper colour.
 */
export function placeholderImageUrl(theme) {
  return buildImageUrl(paperOf(theme));
}

// The resolved tile colour painted behind the placeholder artwork. Exported so
// callers rendering controls on top of the tile can derive a contrasting
// foreground from the same surface the tile uses, instead of from paper.
export function placeholderTileColor(theme) {
  return getContrastColor(paperOf(theme), TILE_CONTRAST);
}

/**
 * Theme-aware placeholder for empty icon-choice slots, as raw inline SVG
 * markup (injected into the DOM by DynamicSvg). Keeps the original single
 * picture-frame icon, recoloured to the card surface. Memoized per paper colour.
 */
export function placeholderIconSvg(theme) {
  return buildIconSvg(paperOf(theme));
}
