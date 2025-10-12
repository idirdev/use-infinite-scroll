/**
 * Creates a throttled version of the given function that only invokes
 * the original function at most once per the specified interval.
 *
 * @param fn - The function to throttle
 * @param limit - Minimum time between invocations in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): T & { cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: unknown[]) {
    const now = Date.now();
    const remaining = limit - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}

/**
 * Creates a debounced version of the given function that delays invocation
 * until after the specified wait time has elapsed since the last call.
 *
 * @param fn - The function to debounce
 * @param delay - Wait time in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] | null = null;
  let lastThis: unknown = null;

  const debounced = function (this: unknown, ...args: unknown[]) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(lastThis, lastArgs!);
      lastArgs = null;
      lastThis = null;
    }, delay);
  } as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastThis = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  return debounced;
}

/**
 * Calculates the range of visible items given a scroll offset, container height,
 * and item sizes. Supports both fixed and dynamic row heights.
 *
 * @param scrollOffset - Current scroll position in pixels
 * @param containerHeight - Height of the visible container in pixels
 * @param itemCount - Total number of items
 * @param rowHeight - Fixed row height or function returning height for each index
 * @param overscan - Number of extra items to include above/below visible range
 * @returns Object with startIndex, endIndex, and offsets array
 */
export function calculateVisibleRange(
  scrollOffset: number,
  containerHeight: number,
  itemCount: number,
  rowHeight: number | ((index: number) => number),
  overscan: number = 3
): { startIndex: number; endIndex: number; offsets: number[] } {
  if (itemCount === 0) {
    return { startIndex: 0, endIndex: 0, offsets: [] };
  }

  const offsets: number[] = new Array(itemCount);
  let currentOffset = 0;

  // Build offsets array
  for (let i = 0; i < itemCount; i++) {
    offsets[i] = currentOffset;
    const height = typeof rowHeight === 'function' ? rowHeight(i) : rowHeight;
    currentOffset += height;
  }

  // Binary search for start index
  let startIndex = binarySearchOffset(offsets, scrollOffset);
  startIndex = Math.max(0, startIndex - overscan);

  // Find end index
  const endOffset = scrollOffset + containerHeight;
  let endIndex = binarySearchOffset(offsets, endOffset);
  endIndex = Math.min(itemCount - 1, endIndex + overscan);

  return { startIndex, endIndex, offsets };
}

/**
 * Binary search to find the index of the first item whose offset is >= target.
 */
function binarySearchOffset(offsets: number[], target: number): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (offsets[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, low - 1);
}

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a stable unique ID for list items when no key extractor is provided.
 */
let idCounter = 0;
export function generateId(prefix: string = 'inf'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}
