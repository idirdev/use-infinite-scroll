import React from 'react';
import { useVirtualList } from '../useVirtualList';
import type { VirtualListProps } from '../types';

/**
 * A virtualized list component that only renders items visible within
 * the scrollable viewport. Dramatically improves performance for lists
 * with thousands or tens of thousands of items.
 *
 * Supports both fixed row heights (number) and dynamic row heights (function).
 *
 * @example
 * ```tsx
 * <VirtualList
 *   items={allItems}
 *   rowHeight={48}
 *   containerHeight={600}
 *   renderItem={(item, index, style) => (
 *     <div style={style} key={item.id}>
 *       {item.name}
 *     </div>
 *   )}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  rowHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  keyExtractor,
}: VirtualListProps<T>) {
  const { containerRef, virtualItems, totalHeight } = useVirtualList({
    items,
    rowHeight,
    containerHeight,
    overscan,
    onScroll,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        willChange: 'transform',
      }}
      role="list"
      aria-rowcount={items.length}
    >
      {/* Inner container that represents the full scrollable height */}
      <div
        style={{
          height: totalHeight,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const key = keyExtractor
            ? keyExtractor(virtualItem.data, virtualItem.index)
            : virtualItem.index;

          const itemStyle: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualItem.height,
            transform: `translateY(${virtualItem.offsetTop}px)`,
          };

          return (
            <div
              key={key}
              role="listitem"
              aria-rowindex={virtualItem.index + 1}
              style={itemStyle}
            >
              {renderItem(virtualItem.data, virtualItem.index, itemStyle)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
