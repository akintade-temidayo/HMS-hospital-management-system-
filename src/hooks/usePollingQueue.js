import { useState, useEffect, useCallback } from 'react';
import { encounterService } from '../services/encounter.service';

export const usePollingQueue = (params, intervalMs = 12000) => {
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const response = await encounterService.getDepartmentQueue(params);
      setQueueData(response.data || response);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Queue polling error:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const initialFetch = setTimeout(fetchQueue, 0);

    const interval = setInterval(() => {
      fetchQueue();
    }, intervalMs);

    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchQueue, intervalMs]);

  return { queueData, loading, error, refetch: fetchQueue };
};