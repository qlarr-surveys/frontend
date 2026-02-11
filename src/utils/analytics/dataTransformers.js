// Data transformers for converting survey responses to chart-ready formats
import {
  calculateNPS,
  calculateStats,
  calculateFrequency,

  calculateRankingAverages,
  calculateMCQFrequency,
  calculateMatrixData,
  calculateEmailDomains,
  calculateCompletionRate,
  detectOutliers,
} from './calculations';
import { getChartColor, NPS_COLORS, LIKERT_COLORS } from './colors';
import { BACKEND_BASE_URL } from '~/constants/networking';

// Resolve relative API image URLs to full URLs
export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return BACKEND_BASE_URL + url.replace(/^\//, '');
};

// Transform SCQ data for pie/bar charts
export const transformSCQData = (question) => {
  const { options, responses } = question;
  const frequency = calculateFrequency(responses);

  return {
    pieData: frequency.map((item, i) => ({
      name: item.value,
      value: item.count,
      percentage: item.percentage,
      fill: getChartColor(i),
    })),
    barData: frequency.map((item, i) => ({
      name: item.value,
      count: item.count,
      percentage: item.percentage,
      fill: getChartColor(i),
    })),
    total: responses.length,
    mode: frequency[0]?.value,
    modeCount: frequency[0]?.count,
  };
};

// Transform MCQ data for bar charts
export const transformMCQData = (question) => {
  const { options, responses } = question;
  const answerIds = options.map((_, i) => `A${i + 1}`);
  const freq = calculateMCQFrequency(responses, answerIds);

  const avgSelections = responses.length > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / responses.length).toFixed(1)
    : 0;

  return {
    barData: freq.map((item, i) => ({
      name: options[answerIds.indexOf(item.option)] || item.option,
      count: item.count,
      percentage: item.percentage,
      fill: getChartColor(i),
    })),
    total: responses.length,
    avgSelections,
  };
};

// Transform NPS data for gauge and bar charts
export const transformNPSData = (question) => {
  const { responses } = question;
  const nps = calculateNPS(responses);

  // Distribution by score (0-10)
  const distribution = Array(11).fill(0);
  responses.forEach((score) => distribution[score]++);

  return {
    score: nps.score,
    categoryData: [
      { name: 'Detractors', value: nps.detractors, percentage: nps.detractorPct, fill: NPS_COLORS.detractor },
      { name: 'Passives', value: nps.passives, percentage: nps.passivePct, fill: NPS_COLORS.passive },
      { name: 'Promoters', value: nps.promoters, percentage: nps.promoterPct, fill: NPS_COLORS.promoter },
    ],
    distributionData: distribution.map((count, score) => ({
      score: score.toString(),
      count,
      fill: score <= 6 ? NPS_COLORS.detractor : score <= 8 ? NPS_COLORS.passive : NPS_COLORS.promoter,
    })),
    ...nps,
  };
};

// Transform Ranking data for bar charts
export const transformRankingData = (question) => {
  const { options, responses } = question;
  const rankings = calculateRankingAverages(responses, options);

  // Calculate rank distribution for stacked chart
  const rankDistribution = options.map((opt) => {
    const data = { option: opt };
    for (let rank = 1; rank <= options.length; rank++) {
      data[`Rank ${rank}`] = responses.filter((r) => r.indexOf(opt) === rank - 1).length;
    }
    return data;
  });

  return {
    averageRankData: rankings.map((item, i) => ({
      name: item.option,
      averageRank: item.averageRank,
      firstPlace: item.firstPlaceCount,
      lastPlace: item.lastPlaceCount,
      fill: getChartColor(i),
    })),
    rankDistribution,
    total: responses.length,
  };
};

// Transform Number data for table view
export const transformNumberData = (question) => {
  const { responses } = question;

  // Calculate statistics
  const stats = calculateStats(responses);
  const outlierData = detectOutliers(responses);

  return {
    stats,
    outlierData,
    total: responses.length
  };
};

// Transform Date data for timeline
export const transformDateData = (question) => {
  const { responses } = question;

  // Group by month
  const monthCounts = {};
  const dayOfWeekCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  responses.forEach((dateStr) => {
    const date = new Date(dateStr);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    dayOfWeekCounts[dayNames[date.getDay()]]++;
  });

  const dates = responses.map((d) => new Date(d)).sort((a, b) => a - b);

  return {
    monthData: Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count], i) => ({ name: month, count, fill: getChartColor(i) })),
    dayOfWeekData: dayNames.map((day, i) => ({
      name: day,
      count: dayOfWeekCounts[day],
      fill: getChartColor(i),
    })),
    dateRange: {
      earliest: dates[0]?.toISOString().split('T')[0],
      latest: dates[dates.length - 1]?.toISOString().split('T')[0],
    },
    total: responses.length,
  };
};

// Transform Time data for hour histogram
export const transformTimeData = (question) => {
  const { responses } = question;

  const hourCounts = Array(24).fill(0);
  responses.forEach((timeStr) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    hourCounts[hour]++;
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const morning = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoon = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
  const evening = hourCounts.slice(18, 24).reduce((a, b) => a + b, 0);

  return {
    hourData: hourCounts.map((count, hour) => ({
      name: `${hour.toString().padStart(2, '0')}:00`,
      count,
      fill: getChartColor(Math.floor(hour / 6)),
    })),
    peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
    periodData: [
      { name: 'Morning (6-12)', count: morning, fill: getChartColor(0) },
      { name: 'Afternoon (12-18)', count: afternoon, fill: getChartColor(1) },
      { name: 'Evening (18-24)', count: evening, fill: getChartColor(2) },
    ],
    total: responses.length,
  };
};

// Transform DateTime data for heatmap
export const transformDateTimeData = (question) => {
  const { responses } = question;

  const heatmapData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create 7x24 matrix
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmapData.push({
        day: dayNames[day],
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: 0,
      });
    }
  }

  responses.forEach((dtStr) => {
    const date = new Date(dtStr);
    const dayIndex = date.getDay();
    const hour = date.getHours();
    const index = dayIndex * 24 + hour;
    heatmapData[index].count++;
  });

  const maxCount = Math.max(...heatmapData.map((d) => d.count));

  return {
    heatmapData: heatmapData.map((d) => ({
      ...d,
      intensity: maxCount > 0 ? d.count / maxCount : 0,
    })),
    total: responses.length,
  };
};

// Extract rows and columns from response objects when metadata is null
const extractMatrixDimensions = (responses, questionRows, questionColumns, isMultiSelect = false) => {
  const rows = questionRows?.length ? questionRows : responses.length > 0
    ? [...new Set(responses.flatMap((r) => Object.keys(r)))].sort()
    : [];
  const columns = questionColumns?.length ? questionColumns : responses.length > 0
    ? [...new Set(responses.flatMap((r) =>
        isMultiSelect ? Object.values(r).flat() : Object.values(r)
      ))].sort()
    : [];
  return { rows, columns };
};

// Transform Matrix SCQ data for heatmap
export const transformMatrixSCQData = (question) => {
  const responses = question.responses || [];
  const { rows, columns } = extractMatrixDimensions(responses, question.rows, question.columns);
  const matrix = calculateMatrixData(responses, rows, columns);

  // Calculate row averages (for Likert scale)
  const rowAverages = matrix.map((rowData) => {
    let sum = 0;
    let count = 0;
    columns.forEach((col, i) => {
      sum += rowData[col] * (i + 1);
      count += rowData[col];
    });
    return { row: rowData.row, average: count > 0 ? (sum / count).toFixed(2) : 0 };
  });

  // Diverging bar data for Likert
  const divergingData = columns.length >= 5 ? matrix.map((rowData) => {
    const total = columns.reduce((sum, col) => sum + rowData[col], 0);
    if (total === 0) return { row: rowData.row, negative: '0.0', neutral: '0.0', positive: '0.0' };
    return {
      row: rowData.row,
      negative: ((rowData[columns[0]] + rowData[columns[1]]) / total * -100).toFixed(1),
      neutral: ((rowData[columns[2]]) / total * 100).toFixed(1),
      positive: ((rowData[columns[3]] + rowData[columns[4]]) / total * 100).toFixed(1),
    };
  }) : [];

  return {
    heatmapData: matrix,
    rowAverages,
    divergingData,
    rows,
    columns,
    total: responses.length,
  };
};

// Transform Matrix MCQ data for heatmap
export const transformMatrixMCQData = (question) => {
  const responses = question.responses || [];
  const { rows, columns } = extractMatrixDimensions(responses, question.rows, question.columns, true);
  const matrix = calculateMatrixData(responses, rows, columns);

  // Calculate average selections per row
  const avgSelections = responses.length > 0
    ? (responses.flat().length / responses.length).toFixed(1)
    : 0;

  return {
    heatmapData: matrix,
    rows,
    columns,
    avgSelections,
    total: responses.length,
  };
};

// Transform Text data for word cloud and table
export const transformTextData = (question) => {
  const { responses } = question;
  const frequency = calculateFrequency(responses);

  const avgLength = responses.length > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / responses.length).toFixed(1)
    : 0;

  return {
    frequencyData: frequency.slice(0, 20), // Top 20
    uniqueCount: frequency.length,
    total: responses.length,
    avgLength,
  };
};

// Transform Paragraph data for frequency table
export const transformParagraphData = (question) => {
  const { responses } = question;
  const frequency = calculateFrequency(responses);

  const avgLength = responses.length > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / responses.length).toFixed(1)
    : 0;

  return {
    frequencyData: frequency.slice(0, 20),
    uniqueCount: frequency.length,
    total: responses.length,
    avgLength,
  };
};

// Transform Email data
export const transformEmailData = (question) => {
  const { responses } = question;
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
    domainData: emailStats.domains.slice(0, 10).map((item, i) => ({
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
    invalidCount: emailStats.invalidCount,
    total: responses.length,
  };
};

// Transform Multiple Text data
export const transformMultipleTextData = (question) => {
  const { fields = [], responses = [] } = question;

  const fieldStats = fields.map((field) => {
    const values = responses.map((r) => r[field] || '').filter(Boolean);
    const avgLength = values.length > 0
      ? (values.reduce((sum, v) => sum + v.length, 0) / values.length).toFixed(1)
      : 0;

    return {
      field,
      completionRate: responses.length > 0 ? Math.round((values.length / responses.length) * 100) : 0,
      avgLength,
      count: values.length,
    };
  });

  return { fieldStats, total: responses.length };
};

// Transform Autocomplete data (same as SCQ)
export const transformAutocompleteData = transformSCQData;

// Transform Image Ranking data
export const transformImageRankingData = (question) => {
  const { images, responses } = question;
  const options = images.map((img) => img.id);
  const rankings = calculateRankingAverages(responses, options);

  const rankedImages = rankings.map((item, i) => {
    const image = resolveIconImage(images, item.option);
    return {
      ...item,
      name: image?.label || `Image ${i + 1}`,
      imageUrl: resolveImageUrl(image?.url),
      averageRank: item.averageRank,
      firstPlace: item.firstPlaceCount,
      lastPlace: item.lastPlaceCount,
      fill: getChartColor(i),
    };
  });

  return {
    rankedImages,
    chartData: rankedImages.map(img => ({
      name: img.name,
      averageRank: img.averageRank,
      firstPlace: img.firstPlace,
      lastPlace: img.lastPlace,
      fill: img.fill,
    })),
    images,
    total: responses.length,
  };
};

// Transform Image SCQ data
export const transformImageSCQData = (question) => {
  const { images, responses } = question;
  const frequency = calculateFrequency(responses);
  const total = responses.length;

  // Build lookup: imageId -> frequency entry, bridging short codes ("A2") to full IDs ("Q309vcaA2")
  const freqByImageId = {};
  frequency.forEach((item) => {
    const image = resolveIconImage(images, item.value);
    if (image) {
      freqByImageId[image.id] = item;
    }
  });

  return {
    pieData: images.map((img, i) => {
      const freq = freqByImageId[img.id];
      const count = freq?.count || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name: img.label || `Image ${i + 1}`,
        value: count,
        percentage,
        imageUrl: resolveImageUrl(img.url),
        imageId: img.id,
        fill: getChartColor(i),
      };
    }).sort((a, b) => b.value - a.value),
    images,
    total,
  };
};

// Transform Image MCQ data
export const transformImageMCQData = (question) => {
  const { images, responses } = question;
  const options = images.map((img) => img.id);
  const freq = calculateMCQFrequency(responses, options);

  return {
    barData: freq.map((item, i) => {
      const image = resolveIconImage(images, item.option);
      return {
        name: image?.label || `Image ${i + 1}`,
        count: item.count,
        percentage: item.percentage,
        imageUrl: resolveImageUrl(image?.url),
        imageId: image?.id,
        fill: getChartColor(i),
      };
    }),
    images,
    total: responses.length,
  };
};

// Match response codes or labels to images — tries ID exact, ID suffix, then label match
const resolveIconImage = (images, responseValue) => {
  if (!images || !responseValue) return null;
  return images.find((img) => img.id === responseValue)
    || images.find((img) => img.id.endsWith(responseValue))
    || images.find((img) => img.label === responseValue)
    || null;
};

// Transform Icon SCQ data for pie/bar charts with icon support
export const transformIconSCQData = (question) => {
  const { responses } = question;
  const images = question.images || [];
  const frequency = calculateFrequency(responses);

  const mapItem = (item, i) => {
    const image = resolveIconImage(images, item.value);
    return {
      name: image?.label || `Option ${i + 1}`,
      value: item.count,
      count: item.count,
      percentage: item.percentage,
      iconUrl: resolveImageUrl(image?.url),
      fill: getChartColor(i),
    };
  };

  const pieData = frequency.map(mapItem);

  return {
    pieData,
    barData: pieData,
    total: responses.length,
    mode: pieData[0]?.name,
    modeCount: frequency[0]?.count,
  };
};

// Transform Icon MCQ data for bar charts with icon support
export const transformIconMCQData = (question) => {
  const { responses } = question;
  const images = question.images || [];
  const options = question.options || [];
  const answerIds = options.length > 0
    ? options.map((_, i) => `A${i + 1}`)
    : images.map((_, i) => `A${i + 1}`);
  const freq = calculateMCQFrequency(responses, answerIds);

  const avgSelections = responses.length > 0
    ? (responses.reduce((sum, r) => sum + r.length, 0) / responses.length).toFixed(1)
    : 0;

  return {
    barData: freq.map((item, i) => {
      const image = resolveIconImage(images, item.option);
      return {
        name: image?.label || `Option ${i + 1}`,
        count: item.count,
        percentage: item.percentage,
        iconUrl: resolveImageUrl(image?.url),
        fill: getChartColor(i),
      };
    }),
    total: responses.length,
    avgSelections,
  };
};

// Transform Icon Matrix SCQ data (SCQ_ICON_ARRAY) — heatmap with icon column and row headers
export const transformIconMatrixSCQData = (question) => {
  const baseData = transformMatrixSCQData(question);
  const images = question.images || [];

  const columnsWithIcons = baseData.columns.map((col) => {
    const image = resolveIconImage(images, col);
    return {
      key: col,
      label: image?.label || col,
      iconUrl: resolveImageUrl(image?.url),
    };
  });

  const rowsWithIcons = baseData.rows.map((row) => {
    const image = resolveIconImage(images, row);
    return {
      key: row,
      label: image?.label || row,
      iconUrl: resolveImageUrl(image?.url),
    };
  });

  return { ...baseData, columnsWithIcons, rowsWithIcons };
};

// Transform Icon Matrix MCQ data (MCQ_ICON_ARRAY) — heatmap with icon column and row headers
export const transformIconMatrixMCQData = (question) => {
  const baseData = transformMatrixMCQData(question);
  const images = question.images || [];

  const columnsWithIcons = baseData.columns.map((col) => {
    const image = resolveIconImage(images, col);
    return {
      key: col,
      label: image?.label || col,
      iconUrl: resolveImageUrl(image?.url),
    };
  });

  const rowsWithIcons = baseData.rows.map((row) => {
    const image = resolveIconImage(images, row);
    return {
      key: row,
      label: image?.label || row,
      iconUrl: resolveImageUrl(image?.url),
    };
  });

  return { ...baseData, columnsWithIcons, rowsWithIcons };
};

// Transform File Upload data
export const transformFileUploadData = (question) => {
  const { responses } = question;
  const uploaded = responses.filter((r) => r && r.uploaded).length;

  return {
    completionRate: responses.length > 0 ? Math.round((uploaded / responses.length) * 100) : 0,
    uploaded,
    notUploaded: responses.length - uploaded,
    total: responses.length,
  };
};

// Transform Signature data
export const transformSignatureData = (question) => {
  const { responses } = question;
  const signed = responses.filter((r) => r.signed).length;

  return {
    completionRate: responses.length > 0 ? Math.round((signed / responses.length) * 100) : 0,
    signed,
    unsigned: responses.length - signed,
    total: responses.length,
  };
};

// Transform Photo Capture data
export const transformPhotoCaptureData = (question) => {
  const { responses } = question;
  const captured = responses.filter((r) => r.captured);
  const sizes = captured.map((r) => r.fileSize);
  const stats = calculateStats(sizes);

  return {
    completionRate: responses.length > 0 ? Math.round((captured.length / responses.length) * 100) : 0,
    captured: captured.length,
    notCaptured: responses.length - captured.length,
    sizeStats: stats,
    total: responses.length,
  };
};

// Transform Barcode data
export const transformBarcodeData = (question) => {
  const { responses } = question;
  const frequency = calculateFrequency(responses);
  const duplicates = frequency.filter((f) => f.count > 1);

  return {
    frequencyData: frequency.slice(0, 20),
    barData: frequency.slice(0, 10).map((item, i) => ({
      name: item.value,
      count: item.count,
      fill: getChartColor(i),
    })),
    uniqueCount: frequency.length,
    duplicateCount: duplicates.length,
    total: responses.length,
  };
};

// Alias for MediaCapture (same as PhotoCapture)
export const transformMediaCaptureData = transformPhotoCaptureData;

// Master transformer function
export const transformQuestionData = (question) => {
  const transformers = {
    SCQ: transformSCQData,
    MCQ: transformMCQData,
    NPS: transformNPSData,
    RANKING: transformRankingData,
    NUMBER: transformNumberData,
    DATE: transformDateData,
    TIME: transformTimeData,
    DATETIME: transformDateTimeData,
    MATRIX_SCQ: transformMatrixSCQData,
    MATRIX_MCQ: transformMatrixMCQData,
    TEXT: transformTextData,
    PARAGRAPH: transformParagraphData,
    EMAIL: transformEmailData,
    MULTIPLE_TEXT: transformMultipleTextData,
    AUTOCOMPLETE: transformAutocompleteData,
    IMAGE_RANKING: transformImageRankingData,
    IMAGE_SCQ: transformImageSCQData,
    IMAGE_MCQ: transformImageMCQData,
    ICON_SCQ: transformIconSCQData,
    ICON_MCQ: transformIconMCQData,
    SCQ_ICON_ARRAY: transformIconMatrixSCQData,
    FILE_UPLOAD: transformFileUploadData,
    SIGNATURE: transformSignatureData,
    PHOTO_CAPTURE: transformPhotoCaptureData,
    BARCODE: transformBarcodeData,
  };

  const transformer = transformers[question.type];
  if (!transformer) {
    console.warn(`No transformer found for question type: ${question.type}`);
    return { raw: question.responses };
  }

  return transformer(question);
};
