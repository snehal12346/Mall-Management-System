import React from 'react';

/**
 * Responsive SVG Bar Chart
 */
export const BarChart = ({ data = [], xKey = 'label', yKey = 'value', height = 240, color = '#4f46e5' }) => {
  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => Number(d[yKey]) || 0), 1);
  const chartHeight = height - 50;

  return (
    <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight, gap: 12, padding: '0 8px', borderBottom: '1px solid #e2e8f0' }}>
        {data.map((item, idx) => {
          const val = Number(item[yKey]) || 0;
          const barHeightPercent = Math.max((val / maxValue) * 100, 4);

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
                {val > 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: `${barHeightPercent}%`,
                  backgroundColor: color,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                }}
                title={`${item[xKey]}: ${val}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '8px 8px 0', height: 40, overflow: 'hidden' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item[xKey]}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Responsive SVG Donut Chart
 */
export const DonutChart = ({ data = [], labelKey = 'label', valueKey = 'value', size = 200 }) => {
  if (!data || data.length === 0) {
    return <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No data</div>;
  }

  const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const total = data.reduce((sum, d) => sum + (Number(d[valueKey]) || 0), 0) || 1;

  let cumulativeAngle = 0;
  const radius = 60;
  const cx = 100;
  const cy = 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {data.map((item, idx) => {
          const val = Number(item[valueKey]) || 0;
          const sliceAngle = (val / total) * 360;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + sliceAngle;
          cumulativeAngle += sliceAngle;

          const x1 = cx + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
          const y1 = cy + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
          const x2 = cx + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
          const y2 = cy + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

          const largeArc = sliceAngle > 180 ? 1 : 0;
          const strokeColor = colors[idx % colors.length];

          // Use stroked circle segments for donut
          const circumference = 2 * Math.PI * radius;
          const dash = (sliceAngle / 360) * circumference;
          const gap = circumference - dash;
          const offset = -((startAngle / 360) * circumference);

          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="24"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform="rotate(-90 100 100)"
            />
          );
        })}
        <text x="100" y="96" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
          Total
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="12" fill="#64748b">
          {total > 1000 ? `${(total / 1000).toFixed(1)}k` : total}
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
            <span style={{ color: '#475569', minWidth: 90 }}>{item[labelKey]}</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{Number(item[valueKey]) || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
