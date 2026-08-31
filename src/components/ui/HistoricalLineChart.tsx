"use client";

import { TrendingUp } from 'lucide-react';

export interface HistoryPoint {
  time: string;
  value: number;
}

interface HistoricalLineChartProps {
  history: HistoryPoint[];
  threshold?: number;
}

export default function HistoricalLineChart({ history, threshold = 50 }: HistoricalLineChartProps) {
  if (!history || history.length === 0) return null;

  const height = 180;
  const width = 500;
  const padding = 30;
  const maxVal = Math.max(100, ...history.map(p => p.value));

  const getX = (idx: number) => {
    return padding + (idx / (history.length - 1)) * (width - 2 * padding);
  };

  const getY = (val: number) => {
    return height - padding - (val / maxVal) * (height - 2 * padding);
  };

  const pointsString = history.map((p, idx) => `${getX(idx)},${getY(p.value)}`).join(' ');
  const thresholdY = getY(threshold);

  return (
    <div style={{ width: '100%', marginTop: '1rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={16} color="#38bdf8" /> Historical 1-Hour Moisture Trend
        </span>
        <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>Threshold: {threshold}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 12, padding: '10px 0' }}>
        {/* Horizontal Threshold Line */}
        <line
          x1={padding}
          y1={thresholdY}
          x2={width - padding}
          y2={thresholdY}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <text x={width - padding - 60} y={thresholdY - 6} fill="#f59e0b" fontSize="10" fontWeight="600">
          Limit ({threshold})
        </text>

        {/* Data Line */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          points={pointsString}
        />

        {/* Data Points & Labels */}
        {history.map((p, idx) => {
          const cx = getX(idx);
          const cy = getY(p.value);
          const isLeak = p.value >= threshold;

          return (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill={isLeak ? '#ef4444' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth="2"
              />
              <text cx={cx} x={cx} y={cy - 10} fill={isLeak ? '#fca5a5' : '#e2e8f0'} fontSize="10" textAnchor="middle" fontWeight="700">
                {p.value}
              </text>
              <text cx={cx} x={cx} y={height - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {p.time}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
