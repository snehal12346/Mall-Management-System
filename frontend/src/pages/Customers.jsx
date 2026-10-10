import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal, { ConfirmDialog } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconEye } from '../components/Icons';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedCust, setSelectedCust] = useState(null);
  const [viewCustData, setViewCustData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    membership_type: 'Silver',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.data);
    } catch (err) {
      setError('Failed to fetch customers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({ customer_name: '', phone: '', email: '', membership_type: 'Silver' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedCust(c);
    setFormData({
      customer_name: c.customer_name,
      phone: c.phone || '',
      email: c.email || '',
      membership_type: c.membership_type || 'Silver',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = async (c) => {
    try {
      const res = await api.get(`/customers/${c.customer_id}`);
      setViewCustData(res.data.data);
      setIsViewOpen(true);
    } catch (err) {
      setError('Could not retrieve customer complete profile.');
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setSuccess('Customer registered successfully with membership.');
      setIsAddOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating customer.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/customers/${selectedCust.customer_id}`, formData);
      setSuccess('Customer updated successfully.');
      setIsEditOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating customer.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/customers/${selectedCust.customer_id}`);
      setSuccess('Customer record deleted.');
      setIsDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete customer with active purchase references.');
      setIsDeleteOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Directory</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Manage registered shoppers, contact records, and loyalty club tiers
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <IconPlus size={16} /> Add New Customer
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '10px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 14 }}>
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <span className="search-icon"><IconSearch size={18} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Membership Tier</th>
              <th>Loyalty Points</th>
              <th>Status</th>
              <th>Registered Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  Loading customer records from PostgreSQL...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  No customer records found matching query.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.customer_id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{c.customer_id}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{c.customer_name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td><StatusBadge status={c.membership_type || 'Silver'} /></td>
                  <td style={{ fontWeight: 700, color: '#4f46e5' }}>{c.loyalty_points ?? 0} pts</td>
                  <td><StatusBadge status={c.membership_status || 'Active'} /></td>
                  <td style={{ color: '#64748b' }}>{c.registration_date ? new Date(c.registration_date).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => handleOpenView(c)} className="btn btn-secondary btn-sm" title="View Details">
                        <IconEye size={15} />
                      </button>
                      <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm" title="Edit">
                        <IconEdit size={15} />
                      </button>
                      <button
                        onClick={() => { setSelectedCust(c); setIsDeleteOpen(true); }}
                        className="btn btn-danger btn-sm"
                        title="Delete"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Customer">
        <form onSubmit={handleSaveAdd}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="e.g. Ramesh Kulkarni"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9820012345"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ramesh@example.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Membership Tier</label>
              <select
                className="form-control"
                value={formData.membership_type}
                onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
              >
                <option value="Silver">Silver Tier (Standard)</option>
                <option value="Gold">Gold Tier (Premium)</option>
                <option value="Platinum">Platinum Tier (VIP)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save & Register</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleSaveEdit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Details</button>
          </div>
        </form>
      </Modal>

      {/* View Customer Details Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Customer Complete Profile" maxWidth={700}>
        {viewCustData && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{viewCustData.customer_name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{viewCustData.email} | {viewCustData.phone || 'No phone'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={viewCustData.membership_type} />
                <div style={{ fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>{viewCustData.points || 0} Loyalty Points</div>
              </div>
            </div>

            {/* Registered Vehicles */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Registered Vehicles ({viewCustData.vehicles?.length || 0})</h4>
              {viewCustData.vehicles?.length > 0 ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {viewCustData.vehicles.map((v) => (
                    <span key={v.vehicle_id} className="badge badge-slate" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      🚗 {v.vehicle_number} ({v.vehicle_type})
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>No vehicles registered yet.</p>
              )}
            </div>

            {/* Recent Purchases */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Recent Purchases at Mall</h4>
              {viewCustData.recentPurchases?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Store</th>
                        <th>Date</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewCustData.recentPurchases.map((p) => (
                        <tr key={p.purchase_id}>
                          <td>#{p.purchase_id}</td>
                          <td><strong>{p.shop_name}</strong></td>
                          <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>₹{Number(p.total_amount).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>No purchases on record.</p>
              )}
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setIsViewOpen(false)}>Close</button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to remove customer "${selectedCust?.customer_name}"?`}
      />
    </div>
  );
};

export default Customers;
