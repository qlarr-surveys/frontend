// Text analysis utilities for word clouds and text visualization

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'is', 'it', 'that', 'this', 'with', 'as', 'be', 'was', 'are', 'been',
  'have', 'has', 'had', 'we', 'our', 'i', 'you', 'they', 'them', 'their',
  'he', 'she', 'his', 'her', 'its', 'my', 'your', 'from', 'by', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now', 'also', 'any', 'both', 'being',
  'would', 'could', 'get', 'got', 'getting', 'been', 'being', 'do', 'does',
  'did', 'doing', 'done', 'make', 'made', 'making', 'if', 'up', 'out', 'over',
]);

// Clean and tokenize text
export const tokenizeText = (text, options = {}) => {
  const {
    lowercase = true,
    removeStopWords = true,
    minLength = 2,
    maxLength = 30,
  } = options;

  let processed = text;

  // Convert to lowercase if specified
  if (lowercase) {
    processed = processed.toLowerCase();
  }

  // Remove special characters and numbers, keep letters and spaces
  processed = processed.replace(/[^a-zA-Z\s]/g, ' ');

  // Split into words
  let words = processed.split(/\s+/).filter((word) => word.length > 0);

  // Filter by length
  words = words.filter((word) => word.length >= minLength && word.length <= maxLength);

  // Remove stop words if specified
  if (removeStopWords) {
    words = words.filter((word) => !STOP_WORDS.has(word.toLowerCase()));
  }

  return words;
};

// Calculate word frequency from array of texts
export const calculateWordFrequency = (texts, options = {}) => {
  const frequency = {};

  texts.forEach((text) => {
    if (!text) return;
    const words = tokenizeText(text, options);
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
  });

  return Object.entries(frequency)
    .map(([word, count]) => ({ text: word, value: count }))
    .sort((a, b) => b.value - a.value);
};

// Extract n-grams (phrases) from text
export const extractNGrams = (text, n = 2) => {
  const words = tokenizeText(text, { removeStopWords: false });
  const ngrams = [];

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }

  return ngrams;
};

// Calculate phrase frequency
export const calculatePhraseFrequency = (texts, n = 2) => {
  const frequency = {};

  texts.forEach((text) => {
    if (!text) return;
    const ngrams = extractNGrams(text, n);
    ngrams.forEach((phrase) => {
      // Filter out phrases with stop words at start/end
      const words = phrase.split(' ');
      if (!STOP_WORDS.has(words[0]) && !STOP_WORDS.has(words[words.length - 1])) {
        frequency[phrase] = (frequency[phrase] || 0) + 1;
      }
    });
  });

  return Object.entries(frequency)
    .filter(([_, count]) => count > 1) // Only phrases that appear more than once
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
};

// Simple sentiment analysis (basic positive/negative word matching)
const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'love', 'loved', 'loving', 'best', 'better', 'happy', 'pleased', 'satisfied',
  'helpful', 'friendly', 'professional', 'reliable', 'easy', 'quick', 'fast',
  'recommend', 'recommended', 'impressive', 'outstanding', 'perfect', 'brilliant',
  'incredible', 'exceptional', 'superb', 'beautiful', 'nice', 'positive', 'enjoy',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'worse', 'hate',
  'hated', 'disappointed', 'disappointing', 'frustrating', 'frustrated',
  'difficult', 'hard', 'slow', 'confusing', 'confused', 'broken', 'bug',
  'buggy', 'error', 'errors', 'problem', 'problems', 'issue', 'issues',
  'unhappy', 'unsatisfied', 'useless', 'fail', 'failed', 'failure', 'negative',
]);

export const analyzeSentiment = (text) => {
  const words = tokenizeText(text, { removeStopWords: false });
  let positive = 0;
  let negative = 0;

  words.forEach((word) => {
    if (POSITIVE_WORDS.has(word)) positive++;
    if (NEGATIVE_WORDS.has(word)) negative++;
  });

  const total = positive + negative;
  if (total === 0) return { sentiment: 'neutral', score: 0, positive: 0, negative: 0 };

  const score = (positive - negative) / total;

  return {
    sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    score: Math.round(score * 100) / 100,
    positive,
    negative,
  };
};

// Analyze sentiment for multiple texts
export const analyzeSentiments = (texts) => {
  const results = texts.map((text) => analyzeSentiment(text));

  const counts = { positive: 0, neutral: 0, negative: 0 };
  let totalScore = 0;

  results.forEach((result) => {
    counts[result.sentiment]++;
    totalScore += result.score;
  });

  return {
    breakdown: counts,
    averageScore: texts.length > 0 ? Math.round((totalScore / texts.length) * 100) / 100 : 0,
    percentages: {
      positive: Math.round((counts.positive / texts.length) * 100),
      neutral: Math.round((counts.neutral / texts.length) * 100),
      negative: Math.round((counts.negative / texts.length) * 100),
    },
  };
};

// Calculate text statistics
export const calculateTextStats = (texts) => {
  const stats = {
    totalResponses: texts.length,
    totalWords: 0,
    totalCharacters: 0,
    avgWordCount: 0,
    avgCharCount: 0,
    minWordCount: Infinity,
    maxWordCount: 0,
  };

  texts.forEach((text) => {
    if (!text) return;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const charCount = text.length;

    stats.totalWords += wordCount;
    stats.totalCharacters += charCount;
    stats.minWordCount = Math.min(stats.minWordCount, wordCount);
    stats.maxWordCount = Math.max(stats.maxWordCount, wordCount);
  });

  if (texts.length > 0) {
    stats.avgWordCount = Math.round(stats.totalWords / texts.length);
    stats.avgCharCount = Math.round(stats.totalCharacters / texts.length);
  }

  if (stats.minWordCount === Infinity) stats.minWordCount = 0;

  return stats;
};
