import { describe, it, expect } from 'vitest';
import { throttle, debounce, calculateVisibleRange, clamp, generateId } from '../src/utils';

describe('throttle', () => {
  it('calls the function immediately on first call', () => {
    let callCount = 0;
    const throttled = throttle(() => { callCount++; }, 100);
    throttled();
    expect(callCount).toBe(1);
  });

  it('has a cancel method', () => {
    const throttled = throttle(() => {}, 100);
    expect(typeof throttled.cancel).toBe('function');
  });
});

describe('debounce', () => {
  it('has cancel and flush methods', () => {
    const debounced = debounce(() => {}, 100);
    expect(typeof debounced.cancel).toBe('function');
    expect(typeof debounced.flush).toBe('function');
  });
});

describe('calculateVisibleRange', () => {
  it('returns empty for zero items', () => {
    const result = calculateVisibleRange(0, 500, 0, 50);
    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(0);
    expect(result.offsets).toEqual([]);
  });

  it('calculates correct range with fixed row height', () => {
    // 100 items, each 50px tall, container 200px, scroll at 0
    const result = calculateVisibleRange(0, 200, 100, 50, 0);
    expect(result.startIndex).toBe(0);
    // End index should cover items visible in 200px / 50px = 4 items
    expect(result.endIndex).toBeGreaterThanOrEqual(3);
  });

  it('adjusts range when scrolled', () => {
    // Scroll offset = 500px, row height = 50px -> first visible item around index 10
    const result = calculateVisibleRange(500, 200, 100, 50, 0);
    expect(result.startIndex).toBeGreaterThanOrEqual(9);
  });

  it('includes overscan items', () => {
    const noOverscan = calculateVisibleRange(0, 200, 100, 50, 0);
    const withOverscan = calculateVisibleRange(0, 200, 100, 50, 5);
    // With overscan, end index should be larger
    expect(withOverscan.endIndex).toBeGreaterThan(noOverscan.endIndex);
  });

  it('clamps to valid indices', () => {
    const result = calculateVisibleRange(0, 200, 5, 50, 10);
    expect(result.startIndex).toBeGreaterThanOrEqual(0);
    expect(result.endIndex).toBeLessThan(5);
  });

  it('builds correct offsets array for fixed height', () => {
    const result = calculateVisibleRange(0, 200, 5, 40, 0);
    expect(result.offsets).toEqual([0, 40, 80, 120, 160]);
  });

  it('supports dynamic row height function', () => {
    // Alternating row heights: 30, 60, 30, 60, ...
    const heightFn = (i: number) => i % 2 === 0 ? 30 : 60;
    const result = calculateVisibleRange(0, 200, 10, heightFn, 0);
    expect(result.offsets[0]).toBe(0);
    expect(result.offsets[1]).toBe(30);
    expect(result.offsets[2]).toBe(90);
    expect(result.offsets[3]).toBe(120);
  });
});

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('uses default prefix', () => {
    const id = generateId();
    expect(id.startsWith('inf-')).toBe(true);
  });

  it('uses custom prefix', () => {
    const id = generateId('custom');
    expect(id.startsWith('custom-')).toBe(true);
  });
});
