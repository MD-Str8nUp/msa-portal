import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}

// Hook for paginated API calls
interface UsePaginatedApiOptions extends UseApiOptions {
  pageSize?: number;
}

interface UsePaginatedApiResult<T> extends UseApiResult<T> {
  page: number;
  totalPages: number;
  hasMore: boolean;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export function usePaginatedApi<T = any>(
  apiFunction: (page: number, limit: number, ...args: any[]) => Promise<any>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { pageSize = 20, ...apiOptions } = options;
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<T[]>([]);

  const fetchPage = useCallback(
    async (pageNum: number, ...args: any[]) => {
      const result = await apiFunction(pageNum, pageSize, ...args);
      
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setPage(result.pagination.page);
      }
      
      setItems(result.data || []);
      return result;
    },
    [apiFunction, pageSize]
  );

  const api = useApi(fetchPage, apiOptions);

  const nextPage = useCallback(async () => {
    if (page < totalPages) {
      await api.execute(page + 1);
    }
  }, [api, page, totalPages]);

  const prevPage = useCallback(async () => {
    if (page > 1) {
      await api.execute(page - 1);
    }
  }, [api, page]);

  const goToPage = useCallback(
    async (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        await api.execute(pageNum);
      }
    },
    [api, totalPages]
  );

  return {
    ...api,
    data: items as T,
    page,
    totalPages,
    hasMore: page < totalPages,
    nextPage,
    prevPage,
    goToPage,
  };
}

// Hook for real-time data with polling
interface UseRealtimeApiOptions extends UseApiOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

export function useRealtimeApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseRealtimeApiOptions = {}
): UseApiResult<T> {
  const { pollingInterval = 5000, enabled = true, ...apiOptions } = options;
  
  const api = useApi(apiFunction, { ...apiOptions, immediate: enabled });

  useEffect(() => {
    if (!enabled || !pollingInterval) return;

    const interval = setInterval(() => {
      api.execute();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [api, pollingInterval, enabled]);

  return api;
}