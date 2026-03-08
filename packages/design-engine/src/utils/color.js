function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function blendColors(color1, color2, opacity) {
  const r = Math.round(color1[0] * (1 - opacity) + color2[0] * opacity);
  const g = Math.round(color1[1] * (1 - opacity) + color2[1] * opacity);
  const b = Math.round(color1[2] * (1 - opacity) + color2[2] * opacity);
  return [r, g, b];
}

export const getContrastColor = (hexColor, opacity = 0.2) => {
  const rgbColor = hexToRgb(hexColor);

  // Calculate luminance
  const luminance =
    (0.299 * rgbColor[0] + 0.587 * rgbColor[1] + 0.114 * rgbColor[2]) / 255;

  // Determine contrast color (black or white)
  const contrastRgb = luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const effectiveOpacity = luminance > 0.5 ? opacity : 1 - opacity;

  // Blend the original color with the contrasting color
  const blendedRgb = blendColors(rgbColor, contrastRgb, effectiveOpacity);

  // Convert the blended RGB color back to hex
  return rgbToHex(...blendedRgb);
};

export const getMildBorderColor = (textColor, opacity = 0.2) => {
  const rgbColor = hexToRgb(textColor);

  // Create a gray color (neutral gray)
  const grayRgb = [120, 120, 120];

  // Blend the text color with gray to create a mild version
  const mildRgb = blendColors(rgbColor, grayRgb, opacity);

  // Convert back to hex
  return rgbToHex(...mildRgb);
};

export const extractRgbaValues = (colorString) => {
  // Handle hex colors
  if (colorString.startsWith("#")) {
    const rgb = hexToRgb(colorString);
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
  }

  // Handle rgba colors: rgba(r, g, b, a)
  const rgbaMatch = colorString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?\.?\d+)?\)/
  );
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Handle rgb colors: rgb(r, g, b)
  const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 1,
    };
  }

  // Default fallback
  return { r: 0, g: 0, b: 0, a: 1 };
};

// WCAG luminance calculation (replaces MUI's getContrastRatio)
function getLuminance(hex) {
  const rgb = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(fg, bg) {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export const colorToThemeMode = (color) => {
  const whiteContrast = getContrastRatio(color, "#ffffff");
  const blackContrast = getContrastRatio(color, "#000000");

  // If white text has better contrast, use dark theme
  return whiteContrast > blackContrast ? "light" : "dark";
};

export { hexToRgb, rgbToHex, blendColors };
