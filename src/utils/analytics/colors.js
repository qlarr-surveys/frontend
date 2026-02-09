// Chart color palettes for survey visualizations

export const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export const NPS_COLORS = {
  detractor: '#ef4444', // red (0-6)
  passive: '#f59e0b',   // amber (7-8)
  promoter: '#22c55e',  // green (9-10)
};

export const LIKERT_COLORS = {
  veryNegative: '#ef4444',
  negative: '#f97316',
  neutral: '#9ca3af',
  positive: '#84cc16',
  veryPositive: '#22c55e',
};

export const HEATMAP_COLORS = {
  low: '#dbeafe',    // light blue
  medium: '#60a5fa', // medium blue
  high: '#1d4ed8',   // dark blue
};

export const FILE_TYPE_COLORS = {
  pdf: '#ef4444',
  doc: '#3b82f6',
  docx: '#3b82f6',
  xls: '#22c55e',
  xlsx: '#22c55e',
  png: '#8b5cf6',
  jpg: '#8b5cf6',
  jpeg: '#8b5cf6',
  gif: '#ec4899',
  other: '#9ca3af',
};

// Get color by index with cycling
export const getChartColor = (index) => CHART_COLORS[index % CHART_COLORS.length];

// Generate gradient colors between two colors
export const interpolateColor = (color1, color2, factor) => {
  const hex = (c) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get heatmap color based on value (0-1)
export const getHeatmapColor = (value, minColor = HEATMAP_COLORS.low, maxColor = HEATMAP_COLORS.high) => {
  return interpolateColor(minColor, maxColor, value);
};
