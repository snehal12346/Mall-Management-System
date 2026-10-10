import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, prefix = '', suffix = '' }) => {
  const colorMap = {
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    emerald: { bg: '#ecfdf5', text: '#059669' },
    amber: { bg: '#fef3c7', text: '#d97706' },
    blue: { bg: '#eff6ff', text: '#2563eb' },
    rose: { bg: '#fef2f2', text: '#dc2626' },
    purple: { bg: '#f5f3ff', text: '#7c3aed' },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {Icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: scheme.bg,
            color: scheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? 0)}{suffix}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
