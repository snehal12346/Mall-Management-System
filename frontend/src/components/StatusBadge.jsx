import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  let badgeClass = 'badge-slate';

  if (['active', 'completed', 'resolved', 'available', 'present', 'adequate', 'live now'].includes(s)) {
    badgeClass = 'badge-emerald';
  } else if (['in progress', 'assigned', 'registered', 'gold', 'moderate', 'high value'].includes(s)) {
    badgeClass = 'badge-blue';
  } else if (['pending', 'silver', 'low stock', 'warning: reorder now', 'mid tier', 'upcoming'].includes(s)) {
    badgeClass = 'badge-amber';
  } else if (['expired', 'critical: out of stock', 'out of stock', 'urgent', 'high', 'failed', 'terminated', 'absent', 'occupied'].includes(s)) {
    badgeClass = 'badge-rose';
  } else if (['platinum', 'vip elite'].includes(s)) {
    badgeClass = 'badge-purple';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
      {status}
    </span>
  );
};

export default StatusBadge;
