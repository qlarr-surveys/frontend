import { useState, useEffect, useRef } from 'react';
import { runTransform } from '../workers/analyticsWorkerManager';

export function useWorkerTransform(fnName, input) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const currentId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    runTransform(fnName, input)
      .then((result) => {
        if (currentId === requestIdRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (currentId === requestIdRef.current) {
          setError(err);
          setLoading(false);
        }
      });
  }, [fnName, input]);

  return { data, loading, error };
}
