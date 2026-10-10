import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Placeholder for sidebar sections whose pages have not been built yet.
 * It shows no data and does not call the API. It exists only so that
 * navigation does not break until the PDF-defined pages are implemented.
 */
const NotImplemented = () => {
  const { pathname } = useLocation();
  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Page not implemented yet</h2>
      <p style={{ color: '#64748b' }}>
        The page for <code>{pathname}</code> has not been built yet.
      </p>
    </div>
  );
};

export default NotImplemented;
