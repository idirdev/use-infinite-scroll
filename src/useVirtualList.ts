import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { VirtualListOptions, UseVirtualListReturn, VirtualItem } from './types';
import { calculateVisibleRange, throttle, clamp } from './utils';

/**
 * React hook for virtualizing a list of items. Only items within the visible
 * viewport (plus an overscan buffer) are rendered, dramatically improving
 * performance for large lists.
 *
 * Supports both fixed and dynamic (variable) row heights.
 *
 * @example
 * ```tsx
 * const { containerRef, virtualItems, totalHeight } = useVirtualList({
 *   items: myItems,
 *   rowHeight: 50,
 *   containerHeight: 600,
 *   overscan: 5,
 * });
 * ```
 */
export function useVirtualList<T>(
  options: VirtualListOptions<T>
): UseVirtualListReturn<T> {
  const {
    items,
    rowHeight,
    containerHeight,
    overscan = 3,
    initialScrollOffset = 0,
    onScroll: onScrollCallback,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset);

  // Compute total height of all items
  const totalHeight = useMemo(() => {
    if (typeof rowHeight === 'number') {
      return items.length * rowHeight;
    }
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += rowHeight(i);
    }
    return total;
  }, [items.length, rowHeight]);

  // Calculate the visible range and build virtual items
  const virtualItems = useMemo((): VirtualItem<T>[] => {
    if (items.length === 0) return [];

    const { startIndex, endIndex, offsets } = calculateVisibleRange(
      scrollOffset,
      containerHeight,
      items.length,
      rowHeight,
      overscan
    );

    const result: VirtualItem<T>[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const height =
        typeof rowHeight === 'function' ? rowHeight(i) : rowHeight;

      result.push({
        data: items[i],
        index: i,
        offsetTop: offsets[i],
        height,
      });
    }

    return result;
  }, [items, scrollOffset, containerHeight, rowHeight, overscan]);

  // Throttled scroll handler
  const handleScroll = useMemo(() => {
    return throttle((event: Event) => {
      const target = event.target as HTMLDivElement;
      if (!target) return;

      const newOffset = target.scrollTop;
      setScrollOffset(newOffset);

      if (onScrollCallback) {
        onScrollCallback(newOffset);
      }
    }, 16); // ~60fps
  }, [onScrollCallback]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [handleScroll]);

  // Set initial scroll offset
  useEffect(() => {
    if (initialScrollOffset > 0 && containerRef.current) {
      containerRef.current.scrollTop = initialScrollOffset;
    }
  }, [initialScrollOffset]);

  /**
   * Scroll to a specific item index with optional alignment.
   */
  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      const container = containerRef.current;
      if (!container || items.length === 0) return;

      const safeIndex = clamp(index, 0, items.length - 1);

      // Calculate the offset of the target item
      let targetOffset = 0;
      if (typeof rowHeight === 'number') {
        targetOffset = safeIndex * rowHeight;
      } else {
        for (let i = 0; i < safeIndex; i++) {
          targetOffset += rowHeight(i);
        }
      }

      const itemHeight =
        typeof rowHeight === 'function' ? rowHeight(safeIndex) : rowHeight;

      let scrollTo: number;

      switch (align) {
        case 'center':
          scrollTo = targetOffset - containerHeight / 2 + itemHeight / 2;
          break;
        case 'end':
          scrollTo = targetOffset - containerHeight + itemHeight;
          break;
        case 'start':
        default:
          scrollTo = targetOffset;
          break;
      }

      scrollTo = clamp(scrollTo, 0, totalHeight - containerHeight);

      container.scrollTop = scrollTo;
      setScrollOffset(scrollTo);
    },
    [items.length, rowHeight, containerHeight, totalHeight]
  );

  /**
   * Scroll to a specific pixel offset.
   */
  const scrollToOffset = useCallback(
    (offset: number) => {
      const container = containerRef.current;
      if (!container) return;

      const clampedOffset = clamp(offset, 0, totalHeight - containerHeight);
      container.scrollTop = clampedOffset;
      setScrollOffset(clampedOffset);
    },
    [totalHeight, containerHeight]
  );

  return {
    containerRef,
    virtualItems,
    totalHeight,
    scrollOffset,
    scrollToIndex,
    scrollToOffset,
  };
}
