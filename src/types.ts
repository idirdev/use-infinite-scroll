import { RefObject } from 'react';

/**
 * Options for the useInfiniteScroll hook.
 */
export interface UseInfiniteScrollOptions {
  /** Callback fired when the sentinel element becomes visible */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a load is currently in progress */
  isLoading?: boolean;
  /** IntersectionObserver threshold (0 to 1) */
  threshold?: number;
  /** Root margin for the IntersectionObserver (e.g., '100px') */
  rootMargin?: string;
  /** Optional root element ref for the IntersectionObserver */
  root?: RefObject<HTMLElement | null>;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
  /** Delay in ms before triggering loadMore (debounce) */
  loadDelay?: number;
}

/**
 * Return type of the useInfiniteScroll hook.
 */
export interface UseInfiniteScrollReturn {
  /** Ref to attach to the sentinel element */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Whether a load is in progress */
  isLoading: boolean;
  /** Error from the last loadMore call, if any */
  error: Error | null;
  /** Reset the hook state (clears error, resets loading) */
  reset: () => void;
}

/**
 * Options for the useVirtualList hook.
 */
export interface VirtualListOptions<T> {
  /** The full list of items */
  items: T[];
  /** Height of each row in pixels (fixed) or a function for dynamic heights */
  rowHeight: number | ((index: number) => number);
  /** Height of the scrollable container in pixels */
  containerHeight: number;
  /** Number of extra items to render above and below the visible area */
  overscan?: number;
  /** Initial scroll offset in pixels */
  initialScrollOffset?: number;
  /** Callback when scroll position changes */
  onScroll?: (scrollOffset: number) => void;
}

/**
 * A single virtual item with positioning information.
 */
export interface VirtualItem<T> {
  /** The original data item */
  data: T;
  /** Index in the full items array */
  index: number;
  /** Top offset in pixels */
  offsetTop: number;
  /** Height of this row in pixels */
  height: number;
}

/**
 * Return type of the useVirtualList hook.
 */
export interface UseVirtualListReturn<T> {
  /** Ref to attach to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The visible (plus overscan) virtual items to render */
  virtualItems: VirtualItem<T>[];
  /** Total height of all items combined (for the inner spacer) */
  totalHeight: number;
  /** Current scroll offset */
  scrollOffset: number;
  /** Programmatically scroll to a specific index */
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  /** Programmatically scroll to a specific offset */
  scrollToOffset: (offset: number) => void;
}

/**
 * Props for the InfiniteList component.
 */
export interface InfiniteListProps<T> {
  /** The list of loaded items */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Callback to load more items */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a load is currently in progress */
  isLoading?: boolean;
  /** Custom loading spinner element */
  loadingComponent?: React.ReactNode;
  /** Custom end-of-list message element */
  endComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** IntersectionObserver root margin */
  rootMargin?: string;
  /** CSS class for the list container */
  className?: string;
  /** CSS class for each item wrapper */
  itemClassName?: string;
  /** Unique key extractor for each item */
  keyExtractor?: (item: T, index: number) => string | number;
}

/**
 * Props for the VirtualList component.
 */
export interface VirtualListProps<T> {
  /** The full list of items */
  items: T[];
  /** Height of each row in pixels, or a function for dynamic heights */
  rowHeight: number | ((index: number) => number);
  /** Height of the scrollable container in pixels */
  containerHeight: number;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  /** Number of extra items to render above/below visible area */
  overscan?: number;
  /** CSS class for the outer container */
  className?: string;
  /** Callback when scroll position changes */
  onScroll?: (scrollOffset: number) => void;
  /** Unique key extractor */
  keyExtractor?: (item: T, index: number) => string | number;
}
