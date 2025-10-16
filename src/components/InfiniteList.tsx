import React, { useCallback } from 'react';
import { useInfiniteScroll } from '../useInfiniteScroll';
import type { InfiniteListProps } from '../types';

/**
 * A ready-to-use infinite scrolling list component.
 *
 * Renders a list of items with a sentinel element at the bottom that
 * triggers loading more items when it becomes visible. Includes built-in
 * loading spinner, end-of-list message, and error handling with retry.
 *
 * @example
 * ```tsx
 * <InfiniteList
 *   items={posts}
 *   renderItem={(post) => <PostCard key={post.id} post={post} />}
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoading={isFetching}
 * />
 * ```
 */
export function InfiniteList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading: externalLoading,
  loadingComponent,
  endComponent,
  errorComponent,
  threshold,
  rootMargin,
  className,
  itemClassName,
  keyExtractor,
}: InfiniteListProps<T>) {
  const { sentinelRef, isLoading, error, reset } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: externalLoading,
    threshold,
    rootMargin,
  });

  const handleRetry = useCallback(() => {
    reset();
    onLoadMore();
  }, [reset, onLoadMore]);

  const defaultLoadingSpinner = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 0',
      }}
      role="status"
      aria-label="Loading more items"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          animation: 'infinite-scroll-spin 1s linear infinite',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="31.416"
          strokeDashoffset="10"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <style>{`
        @keyframes infinite-scroll-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ marginLeft: 8 }}>Loading...</span>
    </div>
  );

  const defaultEndMessage = (
    <div
      style={{
        textAlign: 'center',
        padding: '16px 0',
        color: '#888',
        fontSize: '14px',
      }}
    >
      You have reached the end of the list.
    </div>
  );

  const defaultErrorDisplay = (err: Error, retry: () => void) => (
    <div
      style={{
        textAlign: 'center',
        padding: '16px',
        color: '#ef4444',
        fontSize: '14px',
      }}
      role="alert"
    >
      <p style={{ margin: '0 0 8px 0' }}>
        Failed to load: {err.message}
      </p>
      <button
        onClick={retry}
        style={{
          padding: '6px 16px',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          background: 'transparent',
          color: '#ef4444',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className={className} role="list">
      {items.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : index;

        return (
          <div key={key} className={itemClassName} role="listitem">
            {renderItem(item, index)}
          </div>
        );
      })}

      {/* Error state */}
      {error && !isLoading && (
        errorComponent
          ? errorComponent(error, handleRetry)
          : defaultErrorDisplay(error, handleRetry)
      )}

      {/* Loading state */}
      {isLoading && (loadingComponent ?? defaultLoadingSpinner)}

      {/* Sentinel element for IntersectionObserver */}
      {hasMore && !error && (
        <div
          ref={sentinelRef}
          style={{ height: 1, width: '100%' }}
          aria-hidden="true"
        />
      )}

      {/* End of list */}
      {!hasMore && !isLoading && !error && items.length > 0 && (
        endComponent ?? defaultEndMessage
      )}
    </div>
  );
}
