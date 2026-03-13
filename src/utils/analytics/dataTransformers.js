// Data transformers for converting survey responses to chart-ready formats
import {
  calculateNPS,
  calculateStats,
  calculateFrequency,
  calculateRankingAverages,
  calculateMCQFrequency,
  calculateMatrixData,
  calculateEmailDomains,
  detectOutliers,
} from './calculations';
import { getChartColor, NPS_COLORS, STATUS_COLORS } from './colors';
import { BACKEND_BASE_URL } from '~/constants/networking';

const MAX_CHART_BAR_ITEMS = 10;
const MAX_DOMAIN_ITEMS = 10;

// Build code→label lookup from AnalyticsOption arrays ({code, label})
const buildLabelMap = (options) =>
  Object.fromEntries((options ?? []).map((o) => [o.code, o.label]));

// Extract just the code strings from AnalyticsOption arrays
const extractCodes = (options) => (options ?? []).map((o) => o.code);

// Largest-remainder rounding: ensures percentages sum to exactly 100
const largestRemainderRound = (items, getCount, total) => {
  if (total === 0) return items.map(() => 0);
  const rawPcts = items.map((item) => (getCount(item) / total) * 100);
  const floored = rawPcts.map(Math.floor);
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const remainders = rawPcts.map((raw, i) => ({ i, frac: raw - floored[i] }));
  remainders.sort((a, b) => b.frac - a.frac);
  for (let j = 0; j < remainder; j++) {
    floored[remainders[j].i]++;
  }
  return floored;
};

// Shared helper: extract total/answered/skipped/incomplete/preview from any question
const getResponseMetrics = ({ responses = [], totalResponses, incompleteResponses = 0, previewResponses = 0 }) => {
  const total = totalResponses ?? responses.length;
  const answered = responses.length;
  const incomplete = incompleteResponses;
  const preview = previewResponses;
  const completed = total - incomplete - preview;
  const skipped = Math.max(0, completed - answered);
  return {
    total,
    answered,
    skipped,
    incomplete,
    preview,
  };
};

// Build status chart entries (Skipped, Incomplete, Preview) to append to chart data
const buildStatusEntries = (metrics) => {
  const entries = [];
  if (metrics.skipped > 0) {
    entries.push({ name: 'Skipped', value: metrics.skipped, count: metrics.skipped, fill: '#e5e7eb' });
  }
  if (metrics.incomplete > 0) {
    entries.push({ name: 'Incomplete', value: metrics.incomplete, count: metrics.incomplete, fill: STATUS_COLORS.incomplete });
  }
  if (metrics.preview > 0) {
    entries.push({ name: 'Preview', value: metrics.preview, count: metrics.preview, fill: STATUS_COLORS.preview });
  }
  return entries;
};

// Apply largest-remainder rounding to chart data items, returns new array with percentage field
const applyRoundedPercentages = (items, total) => {
  const percentages = largestRemainderRound(items, (item) => item.count, total);
  return items.map((item, i) => ({ ...item, percentage: percentages[i] }));
};

// Resolve relative API image URLs to full URLs
export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return BACKEND_BASE_URL + url.replace(/^\//, '');
};

// Build a fast lookup for matching response codes/labels to images
const buildImageLookup = (images) => {
  if (!images || images.length === 0) return () => null;
  const byId = new Map();
  const bySuffix = new Map();
  const byLabel = new Map();
  images.forEach((img) => {
    byId.set(img.id, img);
    if (img.label) byLabel.set(img.label, img);
    const suffix = img.id.match(/([A-Za-z]\d+)$/)?.[1];
    if (suffix) bySuffix.set(suffix, img);
  });
  return (responseValue) => {
    if (!responseValue) return null;
    return byId.get(responseValue) || bySuffix.get(responseValue) || byLabel.get(responseValue) || null;
  };
};

// Attach icon info to matrix rows and columns
const attachIconsToMatrixData = (baseData, images) => {
  const resolveIcon = buildImageLookup(images);
  const attachIcons = (items) => items.map((item) => {
    const image = resolveIcon(item);
    return { key: item, label: image?.label || item, iconUrl: resolveImageUrl(image?.url) };
  });
  return {
    ...baseData,
    columnsWithIcons: attachIcons(baseData.columns),
    rowsWithIcons: attachIcons(baseData.rows),
  };
};

// Transform SCQ data for pie/bar charts
export const transformSCQData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const frequency = calculateFrequency(responses);
  const labelMap = buildLabelMap(question.options);

  const rawItems = frequency.map((item, i) => ({
    name: labelMap[item.value] || item.value,
    value: item.count,
    count: item.count,
    fill: getChartColor(i),
  }));
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const chartData = applyRoundedPercentages(allItems, metrics.total);

  return {
    pieData: chartData,
    barData: chartData,
    ...metrics,
    mode: labelMap[frequency[0]?.value] || frequency[0]?.value,
    modeCount: frequency[0]?.count,
  };
};

// Transform MCQ data for bar charts
export const transformMCQData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const labelMap = buildLabelMap(question.options);
  const freq = calculateMCQFrequency(responses, extractCodes(question.options));

  const avgSelections = metrics.answered > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / metrics.answered).toFixed(1)
    : 0;

  const rawItems = freq.map((item, i) => ({
    name: labelMap[item.option] || item.option,
    value: item.count,
    count: item.count,
    fill: getChartColor(i),
  }));
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const chartData = applyRoundedPercentages(allItems, metrics.total);

  return {
    pieData: chartData,
    barData: chartData,
    ...metrics,
    avgSelections,
  };
};

// Transform NPS data for gauge and bar charts
export const transformNPSData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const nps = calculateNPS(responses);

  // Distribution by score (0-10)
  const distribution = Array(11).fill(0);
  responses.forEach((score) => distribution[score]++);

  const rawCategoryData = [
    { name: 'Detractors', value: nps.detractors, count: nps.detractors, fill: NPS_COLORS.detractor },
    { name: 'Passives', value: nps.passives, count: nps.passives, fill: NPS_COLORS.passive },
    { name: 'Promoters', value: nps.promoters, count: nps.promoters, fill: NPS_COLORS.promoter },
  ];
  const allCategoryItems = [...rawCategoryData, ...buildStatusEntries(metrics)];
  const categoryData = applyRoundedPercentages(allCategoryItems, metrics.total);

  return {
    score: nps.score,
    categoryData,
    distributionData: distribution.map((count, score) => ({
      score: score.toString(),
      count,
      fill: score <= 6 ? NPS_COLORS.detractor : score <= 8 ? NPS_COLORS.passive : NPS_COLORS.promoter,
    })),
    ...nps,
    ...metrics,
  };
};

// Transform Ranking data for bar charts
export const transformRankingData = (question) => {
  const { options, responses } = question;
  const metrics = getResponseMetrics(question);
  const labelMap = buildLabelMap(options);
  const optionCodes = extractCodes(options);
  const rankings = calculateRankingAverages(responses, optionCodes);

  // Calculate rank distribution for stacked chart
  const rankDistribution = optionCodes.map((code) => {
    const data = { option: labelMap[code] || code };
    for (let rank = 1; rank <= optionCodes.length; rank++) {
      data[`Rank ${rank}`] = responses.filter((r) => r.indexOf(code) === rank - 1).length;
    }
    return data;
  });

  return {
    averageRankData: rankings.map((item, i) => ({
      name: labelMap[item.option] || item.option,
      averageRank: item.averageRank,
      firstPlace: item.firstPlaceCount,
      lastPlace: item.lastPlaceCount,
      fill: getChartColor(i),
    })),
    rankDistribution,
    ...metrics,
  };
};

// Transform Number data for histogram + table view
export const transformNumberData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const stats = calculateStats(responses);
  const outlierData = detectOutliers(responses);

  // Build histogram buckets
  let histogramData = [];
  if (responses.length > 0 && stats.range > 0) {
    const bucketCount = Math.min(Math.ceil(Math.sqrt(responses.length)), 20);
    const bucketSize = stats.range / bucketCount;
    const sorted = [...responses].sort((a, b) => a - b);
    histogramData = Array.from({ length: bucketCount }, (_, i) => {
      const low = stats.min + i * bucketSize;
      const high = low + bucketSize;
      const count = sorted.filter((v) =>
        i === bucketCount - 1 ? v >= low && v <= high : v >= low && v < high
      ).length;
      return {
        name: `${Math.round(low * 10) / 10} - ${Math.round(high * 10) / 10}`,
        count,
      };
    });
  } else if (responses.length > 0) {
    histogramData = [{ name: String(stats.min), count: responses.length }];
  }

  return { stats, outlierData, histogramData, ...metrics };
};

// Remap matrix data from codes to labels for display
const remapMatrixToLabels = (matrix, rowLabelMap, colLabelMap, colCodes) => {
  return matrix.map((rowData) => {
    const remapped = { row: rowLabelMap[rowData.row] || rowData.row };
    colCodes.forEach((code) => {
      const label = colLabelMap[code] || code;
      remapped[label] = rowData[code] || 0;
    });
    return remapped;
  });
};

// Transform Matrix SCQ data for heatmap
export const transformMatrixSCQData = (question) => {
  const responses = question.responses || [];
  const metrics = getResponseMetrics(question);
  const rows = extractCodes(question.rows);
  const columns = extractCodes(question.columns);
  const rowLabelMap = buildLabelMap(question.rows);
  const colLabelMap = buildLabelMap(question.columns);
  const matrix = calculateMatrixData(responses, rows, columns);
  const displayMatrix = remapMatrixToLabels(matrix, rowLabelMap, colLabelMap, columns);
  const displayRows = rows.map((r) => rowLabelMap[r] || r);
  const displayColumns = columns.map((c) => colLabelMap[c] || c);

  // Calculate row averages (for Likert scale)

  const rowAverages = displayMatrix.map((rowData) => {
    let sum = 0;
    let count = 0;
    displayColumns.forEach((col, i) => {
      sum += rowData[col] * (i + 1);
      count += rowData[col];
    });
    return { row: rowData.row, average: count > 0 ? (sum / count).toFixed(2) : 0 };
  });

  // Diverging bar data for Likert
  const divergingData = displayColumns.length >= 5 ? displayMatrix.map((rowData) => {
    const rowTotal = displayColumns.reduce((sum, col) => sum + rowData[col], 0);
    if (rowTotal === 0) return { row: rowData.row, negative: '0.0', neutral: '0.0', positive: '0.0' };
    return {
      row: rowData.row,
      negative: ((rowData[displayColumns[0]] + rowData[displayColumns[1]]) / rowTotal * -100).toFixed(1),
      neutral: ((rowData[displayColumns[2]]) / rowTotal * 100).toFixed(1),
      positive: ((rowData[displayColumns[3]] + rowData[displayColumns[4]]) / rowTotal * 100).toFixed(1),
    };
  }) : [];

  return { heatmapData: displayMatrix, rowAverages, divergingData, rows: displayRows, columns: displayColumns, ...metrics };
};

// Transform Matrix MCQ data for heatmap
export const transformMatrixMCQData = (question) => {
  const responses = question.responses || [];
  const metrics = getResponseMetrics(question);
  const rows = extractCodes(question.rows);
  const columns = extractCodes(question.columns);
  const rowLabelMap = buildLabelMap(question.rows);
  const colLabelMap = buildLabelMap(question.columns);
  const matrix = calculateMatrixData(responses, rows, columns);
  const displayMatrix = remapMatrixToLabels(matrix, rowLabelMap, colLabelMap, columns);
  const displayRows = rows.map((r) => rowLabelMap[r] || r);
  const displayColumns = columns.map((c) => colLabelMap[c] || c);

  const avgSelections = metrics.answered > 0
    ? (responses.flat().length / metrics.answered).toFixed(1)
    : 0;

  return { heatmapData: displayMatrix, rows: displayRows, columns: displayColumns, avgSelections, ...metrics };
};

// Transform Text data for charts and table
export const transformTextData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const frequency = calculateFrequency(responses);

  const avgLength = metrics.answered > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / metrics.answered).toFixed(1)
    : 0;

  // Top 10 most frequent responses for bar chart
  const topResponses = frequency.slice(0, MAX_CHART_BAR_ITEMS).map((item, i) => ({
    name: item.value.length > 30 ? item.value.slice(0, 30) + '…' : item.value,
    count: item.count,
    fill: getChartColor(i),
  }));

  // Length distribution buckets
  const lengthBuckets = [
    { label: '0-10', min: 0, max: 10 },
    { label: '11-25', min: 11, max: 25 },
    { label: '26-50', min: 26, max: 50 },
    { label: '51-100', min: 51, max: 100 },
    { label: '100+', min: 101, max: Infinity },
  ];
  const lengthDistribution = lengthBuckets.map((bucket) => ({
    name: bucket.label,
    count: responses.filter((r) => r.length >= bucket.min && r.length <= bucket.max).length,
  }));

  return {
    frequencyData: frequency,
    uniqueCount: frequency.length,
    topResponses,
    lengthDistribution,
    ...metrics,
    avgLength,
  };
};

// Transform Paragraph data — show all raw text values (not frequency-grouped)
export const transformParagraphData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);

  const avgLength = metrics.answered > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / metrics.answered).toFixed(1)
    : 0;

  // Word count stats
  const wordCounts = responses.map((r) => r.trim().split(/\s+/).filter(Boolean).length);
  const avgWordCount = metrics.answered > 0
    ? (wordCounts.reduce((a, b) => a + b, 0) / metrics.answered).toFixed(1)
    : 0;

  const wordBuckets = [
    { label: '1-10', min: 1, max: 10 },
    { label: '11-25', min: 11, max: 25 },
    { label: '26-50', min: 26, max: 50 },
    { label: '51-100', min: 51, max: 100 },
    { label: '100+', min: 101, max: Infinity },
  ];
  const wordCountDistribution = wordBuckets.map((bucket) => ({
    name: bucket.label,
    count: wordCounts.filter((c) => c >= bucket.min && c <= bucket.max).length,
  }));

  return {
    responses,
    ...metrics,
    avgLength,
    avgWordCount,
    wordCountDistribution,
  };
};

// Transform Date data for timeline + table
export const transformDateData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const counts = {};
  responses.forEach((r) => {
    const dateOnly = r.split(' ')[0];
    counts[dateOnly] = (counts[dateOnly] || 0) + 1;
  });

  const frequencyData = Object.entries(counts)
    .map(([value, count]) => ({ value, count, percentage: Math.round((count / metrics.total) * 100) }))
    .sort((a, b) => b.count - a.count);

  const sortedDates = Object.keys(counts).sort();
  const timelineData = sortedDates.map((date) => ({ name: date, count: counts[date] }));
  const earliest = sortedDates[0] || '-';
  const latest = sortedDates[sortedDates.length - 1] || '-';

  let dateRange = 0;
  if (sortedDates.length >= 2) {
    const d1 = new Date(sortedDates[0]);
    const d2 = new Date(sortedDates[sortedDates.length - 1]);
    dateRange = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  return { frequencyData, timelineData, earliest, latest, dateRange, ...metrics };
};

// Transform Time data for hourly distribution + table
export const transformTimeData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const counts = {};
  responses.forEach((r) => {
    counts[r] = (counts[r] || 0) + 1;
  });

  const frequencyData = Object.entries(counts)
    .map(([value, count]) => ({ value, count, percentage: Math.round((count / metrics.total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Hourly distribution (24 buckets)
  const hourCounts = Array(24).fill(0);
  responses.forEach((r) => {
    const hour = parseInt(r.split(':')[0], 10);
    if (!isNaN(hour) && hour >= 0 && hour < 24) hourCounts[hour]++;
  });
  const hourlyDistribution = hourCounts.map((count, h) => ({
    name: `${String(h).padStart(2, '0')}:00`,
    count,
  }));
  const peakHour = hourlyDistribution.reduce((max, cur) => (cur.count > max.count ? cur : max), hourlyDistribution[0]);

  return { frequencyData, hourlyDistribution, peakHour: peakHour?.name || '-', ...metrics };
};

// Transform DateTime data for timeline + hourly + table
export const transformDateTimeData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const counts = {};
  responses.forEach((r) => {
    counts[r] = (counts[r] || 0) + 1;
  });

  const frequencyData = Object.entries(counts)
    .map(([value, count]) => ({ value, count, percentage: Math.round((count / metrics.total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Timeline by date
  const dateCounts = {};
  const hourCounts = Array(24).fill(0);
  responses.forEach((r) => {
    const parts = r.split(' ');
    const dateOnly = parts[0];
    dateCounts[dateOnly] = (dateCounts[dateOnly] || 0) + 1;
    const timePart = parts[1] || '';
    const hour = parseInt(timePart.split(':')[0], 10);
    if (!isNaN(hour) && hour >= 0 && hour < 24) hourCounts[hour]++;
  });

  const sortedDates = Object.keys(dateCounts).sort();
  const timelineData = sortedDates.map((date) => ({ name: date, count: dateCounts[date] }));
  const earliest = sortedDates[0] || '-';
  const latest = sortedDates[sortedDates.length - 1] || '-';
  const hourlyDistribution = hourCounts.map((count, h) => ({
    name: `${String(h).padStart(2, '0')}:00`,
    count,
  }));
  const peakHour = hourlyDistribution.reduce((max, cur) => (cur.count > max.count ? cur : max), hourlyDistribution[0]);

  return { frequencyData, timelineData, hourlyDistribution, earliest, latest, peakHour: peakHour?.name || '-', ...metrics };
};

// Transform Email data
export const transformEmailData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const emailStats = calculateEmailDomains(responses);

  // Build per-email frequency map for duplicate detection
  const emailFreq = {};
  responses.forEach((email) => {
    if (email) {
      const key = email.toLowerCase();
      emailFreq[key] = (emailFreq[key] || 0) + 1;
    }
  });

  const emailList = responses.map((email, i) => {
    const key = email ? email.toLowerCase() : '';
    const domain = email && email.includes('@') ? email.split('@')[1]?.toLowerCase() : '';
    return {
      index: i + 1,
      email: email || '',
      domain,
      isDuplicate: emailFreq[key] > 1,
    };
  });

  const duplicateCount = Object.values(emailFreq).filter((c) => c > 1).length;

  return {
    domainData: emailStats.domains.slice(0, MAX_DOMAIN_ITEMS).map((item, i) => ({
      name: item.domain,
      count: item.count,
      percentage: item.percentage,
      fill: getChartColor(i),
    })),
    allDomainData: emailStats.domains.map((item) => ({
      domain: item.domain,
      count: item.count,
      percentage: `${item.percentage}%`,
    })),
    emailList,
    duplicateCount,
    uniqueDomains: emailStats.uniqueDomains,
    ...metrics,
  };
};

// Transform Multiple Text data
export const transformMultipleTextData = (question) => {
  const { fields = [], responses = [] } = question;
  const metrics = getResponseMetrics(question);

  const fieldStats = fields.map((field) => {
    const values = responses.map((r) => r[field.code] || '').filter(Boolean);
    const avgLength = values.length > 0
      ? (values.reduce((sum, v) => sum + v.length, 0) / values.length).toFixed(1)
      : 0;

    return {
      field: field.label,
      completionRate: metrics.total > 0 ? Math.round((values.length / metrics.total) * 100) : 0,
      avgLength,
      count: values.length,
    };
  });

  return { fieldStats, ...metrics };
};

// Transform Autocomplete data (same as SCQ)
export const transformAutocompleteData = transformSCQData;

// Transform Image Ranking data
export const transformImageRankingData = (question) => {
  const { images, responses } = question;
  const metrics = getResponseMetrics(question);
  const optionCodes = extractCodes(question.options);
  const labelMap = buildLabelMap(question.options);
  const parsed = responses.map((r) => {
    if (Array.isArray(r)) return r;
    const entries = Object.entries(r);
    return entries.sort((a, b) => a[1] - b[1]).map(([key]) => key);
  });
  const rankings = calculateRankingAverages(parsed, optionCodes);
  const resolveIcon = buildImageLookup(images);

  const rankedImages = rankings.map((item, i) => {
    const image = resolveIcon(item.option);
    return {
      ...item,
      name: image?.label || labelMap[item.option] || `Image ${i + 1}`,
      imageUrl: resolveImageUrl(image?.url),
      firstPlace: item.firstPlaceCount,
      lastPlace: item.lastPlaceCount,
      fill: getChartColor(i),
    };
  });

  return { rankedImages, chartData: rankedImages, images, ...metrics };
};

// Transform Image SCQ data
export const transformImageSCQData = (question) => {
  const { images, responses } = question;
  const metrics = getResponseMetrics(question);
  const frequency = calculateFrequency(responses);

  // Build lookup: imageId -> frequency entry, bridging short codes ("A2") to full IDs ("Q309vcaA2")
  const resolveIcon = buildImageLookup(images);
  const freqByImageId = {};
  frequency.forEach((item) => {
    const image = resolveIcon(item.value);
    if (image) {
      freqByImageId[image.id] = item;
    }
  });

  const rawItems = images.map((img, i) => {
    const freq = freqByImageId[img.id];
    const count = freq?.count || 0;
    return {
      name: img.label || `Image ${i + 1}`,
      value: count,
      count,
      imageUrl: resolveImageUrl(img.url),
      imageId: img.id,
      fill: getChartColor(i),
    };
  }).sort((a, b) => b.value - a.value);
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const pieData = applyRoundedPercentages(allItems, metrics.total);

  return {
    pieData,
    barData: pieData,
    images,
    ...metrics,
    mode: pieData[0]?.name,
    modeCount: pieData[0]?.count,
  };
};

// Transform Image MCQ data
export const transformImageMCQData = (question) => {
  const { images, responses } = question;
  const metrics = getResponseMetrics(question);
  const options = question.options?.length > 0
    ? extractCodes(question.options)
    : images.map((img) => img.label);
  const freq = calculateMCQFrequency(responses, options);

  const resolveIcon = buildImageLookup(images);
  const rawItems = freq.map((item, i) => {
    const image = resolveIcon(item.option);
    return {
      name: image?.label || `Image ${i + 1}`,
      value: item.count,
      count: item.count,
      imageUrl: resolveImageUrl(image?.url),
      imageId: image?.id,
      fill: getChartColor(i),
    };
  });
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const barData = applyRoundedPercentages(allItems, metrics.total);

  return {
    barData,
    images,
    ...metrics,
  };
};

// Transform Icon SCQ data for pie/bar charts with icon support
export const transformIconSCQData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const images = question.images || [];
  const frequency = calculateFrequency(responses);

  const resolveIcon = buildImageLookup(images);
  const rawItems = frequency.map((item, i) => {
    const image = resolveIcon(item.value);
    return {
      name: image?.label || `Option ${i + 1}`,
      value: item.count,
      count: item.count,
      iconUrl: resolveImageUrl(image?.url),
      fill: getChartColor(i),
    };
  });
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const chartData = applyRoundedPercentages(allItems, metrics.total);

  return {
    pieData: chartData,
    barData: chartData,
    ...metrics,
    mode: chartData[0]?.name,
    modeCount: frequency[0]?.count,
  };
};

// Transform Icon MCQ data for bar charts with icon support
export const transformIconMCQData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const images = question.images || [];
  const options = question.options || [];
  const optionKeys = options.length > 0
    ? extractCodes(options)
    : images.map((img) => img.label);
  const freq = calculateMCQFrequency(responses, optionKeys);

  const avgSelections = metrics.answered > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / metrics.answered).toFixed(1)
    : 0;

  const resolveIcon = buildImageLookup(images);
  const rawItems = freq.map((item, i) => {
    const image = resolveIcon(item.option);
    return {
      name: image?.label || `Option ${i + 1}`,
      value: item.count,
      count: item.count,
      iconUrl: resolveImageUrl(image?.url),
      fill: getChartColor(i),
    };
  });
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const barData = applyRoundedPercentages(allItems, metrics.total);

  return {
    barData,
    ...metrics,
    avgSelections,
  };
};

// Transform Icon Matrix SCQ data (SCQ_ICON_ARRAY)
export const transformIconMatrixSCQData = (question) =>
  attachIconsToMatrixData(transformMatrixSCQData(question), question.images || []);

// Transform Icon Matrix MCQ data (MCQ_ICON_ARRAY)
export const transformIconMatrixMCQData = (question) =>
  attachIconsToMatrixData(transformMatrixMCQData(question), question.images || []);

// Transform File Upload data
export const transformFileUploadData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const extCounts = {};

  responses.forEach((r) => {
    if (r?.filename) {
      const ext = r.filename.split('.').pop().toLowerCase();
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    }
  });

  const rawItems = Object.entries(extCounts)
    .map(([name, count]) => ({ name, count, value: count }))
    .sort((a, b) => b.count - a.count);
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const extensionData = applyRoundedPercentages(allItems, metrics.total);

  return {
    extensionData,
    ...metrics,
  };
};

// Transform Signature data
export const transformSignatureData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const signed = responses.filter((r) => r === true).length;
  const unsigned = Math.max(0, metrics.answered - signed);

  const rawItems = [
    { name: 'Signed', value: signed, count: signed },
    { name: 'Unsigned', value: unsigned, count: unsigned },
  ];
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const chartData = applyRoundedPercentages(allItems, metrics.total);

  return {
    completionRate: metrics.total > 0 ? Math.round((signed / metrics.total) * 100) : 0,
    signed,
    unsigned,
    chartData,
    ...metrics,
  };
};

// Transform Photo Capture data
export const transformPhotoCaptureData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const captured = responses.filter((r) => r.captured);
  const notCaptured = Math.max(0, metrics.answered - captured.length);
  const sizes = captured.map((r) => r.fileSize);
  const stats = calculateStats(sizes);

  const rawItems = [
    { name: 'Captured', value: captured.length, count: captured.length },
    { name: 'Not Captured', value: notCaptured, count: notCaptured },
  ];
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const chartData = applyRoundedPercentages(allItems, metrics.total);

  return {
    completionRate: metrics.total > 0 ? Math.round((captured.length / metrics.total) * 100) : 0,
    captured: captured.length,
    notCaptured,
    sizeStats: stats,
    chartData,
    ...metrics,
  };
};

// Transform Barcode data
export const transformBarcodeData = (question) => {
  const { responses } = question;
  const metrics = getResponseMetrics(question);
  const frequency = calculateFrequency(responses);
  const duplicates = frequency.filter((f) => f.count > 1);

  const rawItems = frequency.slice(0, MAX_CHART_BAR_ITEMS).map((item, i) => ({
    name: item.value,
    value: item.count,
    count: item.count,
    fill: getChartColor(i),
  }));
  const allItems = [...rawItems, ...buildStatusEntries(metrics)];
  const barData = applyRoundedPercentages(allItems, metrics.total);

  return {
    frequencyData: frequency,
    barData,
    uniqueCount: frequency.length,
    duplicateCount: duplicates.length,
    ...metrics,
  };
};

// Alias for MediaCapture (same as PhotoCapture)
export const transformMediaCaptureData = transformPhotoCaptureData;
