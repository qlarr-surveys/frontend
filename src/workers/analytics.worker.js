import * as transformers from '../utils/analytics/dataTransformers';

self.onmessage = function (e) {
  const { id, fnName, args } = e.data;
  try {
    const fn = transformers[fnName];
    if (!fn) {
      throw new Error(`Unknown transformer: ${fnName}`);
    }
    const result = fn(...args);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
