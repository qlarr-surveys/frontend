// Statistical calculations for survey data

// Calculate NPS score from array of 0-10 ratings
export const calculateNPS = (responses) => {
  if (!responses || responses.length === 0) return { score: 0, detractors: 0, passives: 0, promoters: 0 };

  const counts = { detractors: 0, passives: 0, promoters: 0 };

  responses.forEach((rating) => {
    if (rating <= 6) counts.detractors++;
    else if (rating <= 8) counts.passives++;
    else counts.promoters++;
  });

  const total = responses.length;
  const detractorPct = (counts.detractors / total) * 100;
  const passivePct = (counts.passives / total) * 100;
  const promoterPct = (counts.promoters / total) * 100;

  return {
    score: Math.round(promoterPct - detractorPct),
    detractors: counts.detractors,
    passives: counts.passives,
    promoters: counts.promoters,
    detractorPct: Math.round(detractorPct),
    passivePct: Math.round(passivePct),
    promoterPct: Math.round(promoterPct),
    total,
  };
};

// Calculate basic statistics for numeric data
export const calculateStats = (values) => {
  if (!values || values.length === 0) {
    return { mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0, range: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Mode
  const frequency = {};
  let maxFreq = 0;
  let mode = sorted[0];
  sorted.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });

  // Standard deviation
  const squaredDiffs = sorted.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    mode,
    stdDev: Math.round(stdDev * 100) / 100,
    min: sorted[0],
    max: sorted[count - 1],
    range: sorted[count - 1] - sorted[0],
    count,
    sum: Math.round(sum * 100) / 100,
  };
};

// Calculate frequency distribution
export const calculateFrequency = (values) => {
  const freq = {};
  values.forEach((val) => {
    freq[val] = (freq[val] || 0) + 1;
  });
  return Object.entries(freq)
    .map(([value, count]) => ({ value, count, percentage: Math.round((count / values.length) * 100) }))
    .sort((a, b) => b.count - a.count);
};

// Calculate histogram bins
export const calculateHistogram = (values, binCount = 10) => {
  if (!values || values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount || 1;

  const bins = Array(binCount).fill(0).map((_, i) => ({
    binStart: Math.round((min + i * binWidth) * 100) / 100,
    binEnd: Math.round((min + (i + 1) * binWidth) * 100) / 100,
    count: 0,
    label: `${Math.round(min + i * binWidth)}-${Math.round(min + (i + 1) * binWidth)}`,
  }));

  values.forEach((val) => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
    bins[binIndex].count++;
  });

  return bins;
};

// Calculate ranking averages
export const calculateRankingAverages = (rankings, options) => {
  const totals = {};
  const counts = {};

  options.forEach((opt) => {
    totals[opt] = 0;
    counts[opt] = 0;
  });

  const parsed = rankings.map((ranking) => {
    if (Array.isArray(ranking)) return ranking;
    if (typeof ranking === 'string') {
      try { return JSON.parse(ranking); } catch { return []; }
    }
    return [];
  });

  parsed.forEach((ranking) => {
    ranking.forEach((opt, index) => {
      totals[opt] += index + 1; // 1-based ranking
      counts[opt]++;
    });
  });

  return options.map((opt) => ({
    option: opt,
    averageRank: counts[opt] > 0 ? Math.round((totals[opt] / counts[opt]) * 100) / 100 : 0,
    firstPlaceCount: parsed.filter((r) => r[0] === opt).length,
    lastPlaceCount: parsed.filter((r) => r[r.length - 1] === opt).length,
  })).sort((a, b) => a.averageRank - b.averageRank);
};

// Calculate MCQ selection frequencies
export const calculateMCQFrequency = (responses, options) => {
  const freq = {};
  options.forEach((opt) => (freq[opt] = 0));

  responses.forEach((selections) => {
    selections.forEach((opt) => {
      freq[opt] = (freq[opt] || 0) + 1;
    });
  });

  const totalRespondents = responses.length;
  return options.map((opt) => ({
    option: opt,
    count: freq[opt] || 0,
    percentage: totalRespondents > 0 ? Math.round((freq[opt] / totalRespondents) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
};

// Calculate matrix data for heatmap
export const calculateMatrixData = (responses, rows, columns) => {
  if (!rows || !columns) return [];

  const matrix = rows.map((row) => {
    const rowData = { row };
    columns.forEach((col) => (rowData[col] = 0));
    return rowData;
  });

  responses.forEach((response) => {
    Object.entries(response).forEach(([row, col]) => {
      const rowIndex = rows.indexOf(row);
      if (rowIndex >= 0) {
        if (Array.isArray(col)) {
          col.forEach((c) => (matrix[rowIndex][c] = (matrix[rowIndex][c] || 0) + 1));
        } else {
          matrix[rowIndex][col] = (matrix[rowIndex][col] || 0) + 1;
        }
      }
    });
  });

  return matrix;
};

// Calculate completion rate
export const calculateCompletionRate = (responses, totalExpected) => {
  const completed = responses.filter((r) => r && (r.signed || r.captured || r.uploaded)).length;
  return {
    completed,
    total: totalExpected,
    rate: Math.round((completed / totalExpected) * 100),
  };
};

// Calculate email domain distribution
export const calculateEmailDomains = (emails) => {
  const domains = {};
  let invalidCount = 0;

  emails.forEach((email) => {
    if (!email || !email.includes('@')) {
      invalidCount++;
      return;
    }
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain) {
      domains[domain] = (domains[domain] || 0) + 1;
    }
  });

  return {
    domains: Object.entries(domains)
      .map(([domain, count]) => ({ domain, count, percentage: Math.round((count / emails.length) * 100) }))
      .sort((a, b) => b.count - a.count),
    invalidCount,
    uniqueDomains: Object.keys(domains).length,
  };
};

// Detect outliers using IQR method
export const detectOutliers = (values) => {
  if (!values || values.length < 4) {
    return { outliers: [], outliersCount: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const q1Arr = sorted.slice(0, mid);
  const q3Arr = sorted.length % 2 !== 0 ? sorted.slice(mid + 1) : sorted.slice(mid);
  const q1 = q1Arr[Math.floor(q1Arr.length / 2)];
  const q3 = q3Arr[Math.floor(q3Arr.length / 2)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values.filter((v) => v < lowerBound || v > upperBound);

  return { outliers, outliersCount: outliers.length };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Calculate file upload statistics
export const calculateFileStats = (files) => {
  const types = {};
  let totalSize = 0;

  files.forEach((file) => {
    const ext = file.type || file.filename?.split('.').pop()?.toLowerCase() || 'other';
    types[ext] = (types[ext] || 0) + 1;
    totalSize += file.size || 0;
  });

  return {
    totalFiles: files.length,
    totalSize,
    formattedSize: formatFileSize(totalSize),
    avgSize: files.length > 0 ? formatFileSize(totalSize / files.length) : '0 B',
    types: Object.entries(types)
      .map(([type, count]) => ({ type, count, percentage: Math.round((count / files.length) * 100) }))
      .sort((a, b) => b.count - a.count),
  };
};
