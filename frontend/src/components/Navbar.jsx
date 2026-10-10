import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IconLogOut } from './Icons';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="top-navbar">
      {/* Context Breadcrumb / Location Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>
          📍 Phoenix Marketcity, Kurla, Mumbai
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: 9999,
            backgroundColor: '#d1fae5',
            color: '#065f46',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} />
          PostgreSQL Connected
        </span>
      </div>

      {/* User Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {user.fullName || user.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Role: <strong style={{ color: '#4f46e5' }}>{user.role}</strong>
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid #c7d2fe',
              }}
            >
              {(user.fullName || user.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Sign Out"
        >
          <IconLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
