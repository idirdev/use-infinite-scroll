import React, { useMemo, useCallback, useState } from 'react';
import { VirtualList } from '../src';

/**
 * Data item for the virtualized list demo.
 */
interface DataRow {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  score: number;
}

/**
 * Generates a large dataset for testing virtualization performance.
 */
function generateData(count: number): DataRow[] {
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];
  const statuses: DataRow['status'][] = ['active', 'inactive', 'pending'];
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];

  const data: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];

    data.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      department: departments[i % departments.length],
      status: statuses[i % statuses.length],
      score: Math.floor(Math.random() * 100),
    });
  }

  return data;
}

/**
 * Returns a color based on the status value.
 */
function getStatusColor(status: DataRow['status']): string {
  switch (status) {
    case 'active':
      return '#10b981';
    case 'inactive':
      return '#ef4444';
    case 'pending':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
}

/**
 * Returns a background shade for the score progress bar.
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

/**
 * VirtualizedList example demonstrates rendering 10,000 items efficiently
 * using the VirtualList component. Only ~15-20 rows are in the DOM at any time.
 */
export function VirtualizedList() {
  const [itemCount, setItemCount] = useState(10000);
  const [rowHeight, setRowHeight] = useState(64);

  const data = useMemo(() => generateData(itemCount), [itemCount]);

  const renderRow = useCallback(
    (item: DataRow, _index: number, _style: React.CSSProperties) => {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            height: '100%',
            borderBottom: '1px solid #f3f4f6',
            backgroundColor: item.id % 2 === 0 ? '#fafafa' : '#ffffff',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* ID Column */}
          <div style={{ width: '60px', color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
            #{item.id}
          </div>

          {/* Name Column */}
          <div style={{ flex: 1, minWidth: '140px', fontWeight: 500, color: '#111827' }}>
            {item.name}
          </div>

          {/* Email Column */}
          <div style={{ flex: 1.5, minWidth: '200px', color: '#6b7280' }}>
            {item.email}
          </div>

          {/* Department Column */}
          <div style={{ width: '120px', color: '#4b5563' }}>
            {item.department}
          </div>

          {/* Status Column */}
          <div style={{ width: '90px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                color: getStatusColor(item.status),
                backgroundColor: `${getStatusColor(item.status)}18`,
              }}
            >
              {item.status}
            </span>
          </div>

          {/* Score Column */}
          <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${item.score}%`,
                  height: '100%',
                  backgroundColor: getScoreColor(item.score),
                  borderRadius: '3px',
                  transition: 'width 0.2s',
                }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontVariantNumeric: 'tabular-nums', minWidth: '28px' }}>
              {item.score}
            </span>
          </div>
        </div>
      );
    },
    []
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>
          Virtualized List Demo
        </h1>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Rendering {itemCount.toLocaleString()} rows efficiently. Only visible rows are in the DOM.
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Items:
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
              <option value={50000}>50,000</option>
              <option value={100000}>100,000</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Row height:
            <select
              value={rowHeight}
              onChange={(e) => setRowHeight(Number(e.target.value))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value={48}>Compact (48px)</option>
              <option value={64}>Normal (64px)</option>
              <option value={80}>Spacious (80px)</option>
            </select>
          </label>
        </div>
      </header>

      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          height: '40px',
          backgroundColor: '#f9fafb',
          borderBottom: '2px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ width: '60px' }}>ID</div>
        <div style={{ flex: 1, minWidth: '140px' }}>Name</div>
        <div style={{ flex: 1.5, minWidth: '200px' }}>Email</div>
        <div style={{ width: '120px' }}>Department</div>
        <div style={{ width: '90px' }}>Status</div>
        <div style={{ width: '100px' }}>Score</div>
      </div>

      {/* Virtualized List */}
      <VirtualList
        items={data}
        rowHeight={rowHeight}
        containerHeight={600}
        renderItem={renderRow}
        overscan={5}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
