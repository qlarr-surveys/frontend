let worker = null;
let messageId = 0;
const pending = new Map();

const isWorkerSupported = () => typeof Worker !== 'undefined';

function getWorker() {
  if (!worker && isWorkerSupported()) {
    worker = new Worker(
      new URL('./analytics.worker.js', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const entry = pending.get(id);
      if (entry) {
        pending.delete(id);
        if (error) {
          entry.reject(new Error(error));
        } else {
          entry.resolve(result);
        }
      }
    };
    worker.onerror = () => {
      for (const [, entry] of pending) {
        entry.reject(new Error('Worker error'));
      }
      pending.clear();
    };
  }
  return worker;
}

export function runTransform(fnName, ...args) {
  const w = getWorker();
  if (!w) {
    return import('../utils/analytics/dataTransformers').then((mod) => {
      const fn = mod[fnName];
      if (!fn) throw new Error(`Unknown transformer: ${fnName}`);
      return fn(...args);
    });
  }

  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    w.postMessage({ id, fnName, args });
  });
}

export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    for (const [, entry] of pending) {
      entry.reject(new Error('Worker terminated'));
    }
    pending.clear();
  }
}
