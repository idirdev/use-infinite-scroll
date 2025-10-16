import React, { useState, useCallback } from 'react';
import { InfiniteList } from '../src';

/**
 * Mock data item representing a simple post.
 */
interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

/**
 * Simulates an API call that returns a page of posts with a delay.
 */
async function fetchPosts(page: number, pageSize: number = 20): Promise<{
  posts: Post[];
  hasMore: boolean;
  totalCount: number;
}> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const totalCount = 200;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalCount);

  const posts: Post[] = [];
  for (let i = start; i < end; i++) {
    posts.push({
      id: i + 1,
      title: `Post #${i + 1}: ${getRandomTitle()}`,
      body: `This is the body content for post number ${i + 1}. It contains some meaningful text that describes the post in detail.`,
      author: `User ${(i % 10) + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }

  return {
    posts,
    hasMore: end < totalCount,
    totalCount,
  };
}

/**
 * Returns a random title from a predefined list.
 */
function getRandomTitle(): string {
  const titles = [
    'Getting Started with React Hooks',
    'Understanding Virtual DOM',
    'TypeScript Best Practices',
    'Building Scalable Applications',
    'CSS Grid Layout Deep Dive',
    'State Management Patterns',
    'Performance Optimization Tips',
    'Testing React Components',
    'Server-Side Rendering Guide',
    'Accessibility in Web Apps',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * BasicList example demonstrates a simple infinite scrolling list
 * that loads pages of posts from a mock API.
 */
export function BasicList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleLoadMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await fetchPosts(page);
      setPosts((prev) => [...prev, ...result.posts]);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setPage((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading]);

  const renderPost = useCallback((post: Post, index: number) => {
    return (
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
          transition: 'background-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
            {post.title}
          </h3>
          <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '12px' }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
          {post.body}
        </p>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>By {post.author}</span>
      </div>
    );
  }, []);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '24px 16px', borderBottom: '2px solid #e5e7eb' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 700 }}>
          Infinite Scroll Demo
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Loaded {posts.length} of {totalCount || '...'} posts
        </p>
      </header>

      <InfiniteList
        items={posts}
        renderItem={renderPost}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        keyExtractor={(post) => post.id}
        rootMargin="200px"
        endComponent={
          <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '14px' }}>
            All {totalCount} posts loaded.
          </div>
        }
      />
    </div>
  );
}
