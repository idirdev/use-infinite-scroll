> **Archived** — Kept for reference. Not part of the current portfolio.

# use-infinite-scroll

[![npm version](https://img.shields.io/npm/v/@idirdev/use-infinite-scroll)](https://www.npmjs.com/package/@idirdev/use-infinite-scroll)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@idirdev/use-infinite-scroll)](https://bundlephobia.com/package/@idirdev/use-infinite-scroll)

React hook for infinite scrolling with virtualization. Load data on demand and render massive lists efficiently.

## Features

- **IntersectionObserver-based** -- no scroll event listeners for infinite loading
- **Virtualization** -- render only visible items, handle 100k+ rows smoothly
- **Fixed & dynamic row heights** -- supports both uniform and variable row sizes
- **Loading, error & end states** -- built-in UI states with customization
- **TypeScript first** -- full type safety with generics
- **Zero dependencies** -- only React as a peer dependency
- **SSR compatible** -- gracefully handles server-side rendering
- **Accessible** -- proper ARIA attributes and roles

## Installation

```bash
npm install @idirdev/use-infinite-scroll
```

## Quick Start

### useInfiniteScroll Hook

```tsx
import { useInfiniteScroll } from '@idirdev/use-infinite-scroll';

function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { sentinelRef, isLoading, error, reset } = useInfiniteScroll({
    onLoadMore: async () => {
      const data = await fetchPosts(page);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    },
    hasMore,
    rootMargin: '200px',
  });

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {isLoading && <Spinner />}
      {error && <button onClick={reset}>Retry</button>}
      <div ref={sentinelRef} />
    </div>
  );
}
```

### InfiniteList Component

```tsx
import { InfiniteList } from '@idirdev/use-infinite-scroll';

function Feed() {
  return (
    <InfiniteList
      items={posts}
      renderItem={(post) => <PostCard post={post} />}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      isLoading={isFetching}
      keyExtractor={(post) => post.id}
      rootMargin="200px"
    />
  );
}
```

### VirtualList Component

```tsx
import { VirtualList } from '@idirdev/use-infinite-scroll';

function BigTable() {
  return (
    <VirtualList
      items={allRows}           // 10,000+ items
      rowHeight={48}            // fixed row height
      containerHeight={600}     // viewport height
      overscan={5}              // buffer rows
      renderItem={(row, index, style) => (
        <div style={style} key={row.id}>
          {row.name} - {row.email}
        </div>
      )}
      keyExtractor={(row) => row.id}
    />
  );
}
```

### useVirtualList Hook

```tsx
import { useVirtualList } from '@idirdev/use-infinite-scroll';

function CustomVirtualList({ items }) {
  const { containerRef, virtualItems, totalHeight, scrollToIndex } =
    useVirtualList({
      items,
      rowHeight: 50,
      containerHeight: 400,
      overscan: 3,
    });

  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((vItem) => (
          <div
            key={vItem.index}
            style={{
              position: 'absolute',
              top: vItem.offsetTop,
              height: vItem.height,
              width: '100%',
            }}
          >
            {vItem.data.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### useInfiniteScroll(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onLoadMore` | `() => void \| Promise<void>` | required | Callback to load more data |
| `hasMore` | `boolean` | required | Whether more data is available |
| `isLoading` | `boolean` | `undefined` | External loading state |
| `threshold` | `number` | `0` | IntersectionObserver threshold |
| `rootMargin` | `string` | `'100px'` | IntersectionObserver root margin |
| `root` | `RefObject<HTMLElement>` | `undefined` | Scroll container ref |
| `enabled` | `boolean` | `true` | Enable/disable the observer |
| `loadDelay` | `number` | `0` | Debounce delay in ms |

**Returns:** `{ sentinelRef, isLoading, error, reset }`

### useVirtualList(options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `T[]` | required | Full list of items |
| `rowHeight` | `number \| (index) => number` | required | Row height (fixed or dynamic) |
| `containerHeight` | `number` | required | Visible viewport height |
| `overscan` | `number` | `3` | Extra items to render |
| `initialScrollOffset` | `number` | `0` | Initial scroll position |
| `onScroll` | `(offset) => void` | `undefined` | Scroll callback |

**Returns:** `{ containerRef, virtualItems, totalHeight, scrollOffset, scrollToIndex, scrollToOffset }`

### Utility Functions

- `throttle(fn, limit)` -- Throttle a function to fire at most once per interval
- `debounce(fn, delay)` -- Debounce a function to fire after inactivity
- `calculateVisibleRange(offset, height, count, rowHeight, overscan)` -- Calculate visible item indices

## License

MIT
