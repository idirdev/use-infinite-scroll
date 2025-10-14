import { useRef, useEffect, useCallback, useState } from 'react';
import type { UseInfiniteScrollOptions, UseInfiniteScrollReturn } from './types';

/**
 * React hook for infinite scrolling using IntersectionObserver.
 *
 * Attaches an IntersectionObserver to a sentinel element. When the sentinel
 * enters the viewport, the `onLoadMore` callback is triggered. Handles
 * loading state, errors, and cleanup automatically.
 *
 * @example
 * ```tsx
 * const { sentinelRef, isLoading, error, reset } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasMore: data.hasNextPage,
 *   rootMargin: '200px',
 * });
 * ```
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn {
  const {
    onLoadMore,
    hasMore,
    isLoading: externalLoading,
    threshold = 0,
    rootMargin = '100px',
    root,
    enabled = true,
    loadDelay = 0,
  } = options;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use external loading state if provided, otherwise use internal
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Stable reference to the onLoadMore callback
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // The core load function with error handling
  const triggerLoad = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setError(null);
    setInternalLoading(true);

    try {
      const result = onLoadMoreRef.current();
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      const loadError =
        err instanceof Error ? err : new Error(String(err));
      setError(loadError);
      console.error('[useInfiniteScroll] Load error:', loadError);
    } finally {
      setInternalLoading(false);
    }
  }, [isLoading, hasMore, enabled]);

  // Reset function to clear error and loading state
  const reset = useCallback(() => {
    setError(null);
    setInternalLoading(false);
    if (loadDelayTimerRef.current) {
      clearTimeout(loadDelayTimerRef.current);
      loadDelayTimerRef.current = null;
    }
  }, []);

  // Set up the IntersectionObserver
  useEffect(() => {
    // Bail out if disabled or nothing more to load
    if (!enabled || !hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (!entry) return;

      if (entry.isIntersecting && hasMore && !isLoading) {
        if (loadDelay > 0) {
          // Debounce the load trigger
          if (loadDelayTimerRef.current) {
            clearTimeout(loadDelayTimerRef.current);
          }
          loadDelayTimerRef.current = setTimeout(() => {
            loadDelayTimerRef.current = null;
            triggerLoad();
          }, loadDelay);
        } else {
          triggerLoad();
        }
      }
    };

    const observerOptions: IntersectionObserverInit = {
      root: root?.current ?? null,
      rootMargin,
      threshold,
    };

    observerRef.current = new IntersectionObserver(
      handleIntersect,
      observerOptions
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (loadDelayTimerRef.current) {
        clearTimeout(loadDelayTimerRef.current);
        loadDelayTimerRef.current = null;
      }
    };
  }, [enabled, hasMore, isLoading, threshold, rootMargin, root, loadDelay, triggerLoad]);

  return {
    sentinelRef,
    isLoading,
    error,
    reset,
  };
}
