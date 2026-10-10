import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconBarChart,
  IconStore,
  IconBuilding,
  IconKey,
  IconTag,
  IconShoppingBag,
  IconCreditCard,
  IconPercent,
  IconUsers,
  IconAward,
  IconCalendar,
  IconUserCheck,
  IconCar,
  IconBriefcase,
  IconAlertCircle,
  IconTool,
} from './Icons';

const navSections = [
  {
    title: 'Core Administration',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
      { to: '/reports', label: 'Reports & Analytics', icon: IconBarChart },
    ],
  },
  {
    title: 'Commercial & Retail',
    items: [
      { to: '/shops', label: 'Shops & Brands', icon: IconStore },
      { to: '/tenants', label: 'Tenants & Entities', icon: IconBuilding },
      { to: '/leases', label: 'Lease Contracts', icon: IconKey },
      { to: '/products', label: 'Products & Stock', icon: IconTag },
    ],
  },
  {
    title: 'Point-of-Sale & Billing',
    items: [
      { to: '/purchases', label: 'Purchases (POS)', icon: IconShoppingBag },
      { to: '/payments', label: 'Payment Records', icon: IconCreditCard },
      { to: '/offers', label: 'Promotional Offers', icon: IconPercent },
    ],
  },
  {
    title: 'Customer & CRM',
    items: [
      { to: '/customers', label: 'Customers', icon: IconUsers },
      { to: '/memberships', label: 'Memberships', icon: IconAward },
      { to: '/events', label: 'Events & Expos', icon: IconCalendar },
      { to: '/event-registrations', label: 'Event Registrations', icon: IconUserCheck },
    ],
  },
  {
    title: 'Facility & Operations',
    items: [
      { to: '/vehicles', label: 'Customer Vehicles', icon: IconCar },
      { to: '/parking', label: 'Parking & Decks', icon: IconCar },
      { to: '/employees', label: 'Employees & Staff', icon: IconBriefcase },
      { to: '/complaints', label: 'Complaints', icon: IconAlertCircle },
      { to: '/maintenance', label: 'Maintenance Requests', icon: IconTool },
    ],
  },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            P
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Phoenix Marketcity
            </h2>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              Mall Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                padding: '0 8px 6px',
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? '#4f46e5' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Footer info */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1e293b', fontSize: '0.72rem', color: '#64748b' }}>
        <span>Database: </span>
        <strong style={{ color: '#94a3b8' }}>Mini_project_172_173</strong>
        <div style={{ marginTop: 2 }}>PostgreSQL 3NF Academic Model</div>
      </div>
    </aside>
  );
};

export default Sidebar;
