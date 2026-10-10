import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { IconAward, IconPlus, IconEdit } from '../components/Icons';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isPointsOpen, setIsPointsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMem, setSelectedMem] = useState(null);

  // Forms
  const [pointsToAdd, setPointsToAdd] = useState(100);
  const [editTier, setEditTier] = useState('Gold');
  const [editStatus, setEditStatus] = useState('Active');

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memberships', {
        params: {
          tier: tierFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setMemberships(res.data.data);
    } catch (err) {
      setError('Failed to fetch membership records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [tierFilter, statusFilter]);

  const handleOpenAddPoints = (m) => {
    setSelectedMem(m);
    setPointsToAdd(100);
    setIsPointsOpen(true);
  };

  const handleCreditPoints = async (e) => {
    e.preventDefault();
    try {
      await api.post('/memberships/add-points', {
        customer_id: selectedMem.customer_id,
        points: parseInt(pointsToAdd, 10),
      });
      setSuccess(`Successfully credited ${pointsToAdd} points to ${selectedMem.customer_name} via procedure.`);
      setIsPointsOpen(false);
      fetchMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing stored procedure.');
    }
  };

  const handleOpenEdit = (m) => {
    setSelectedMem(m);
    setEditTier(m.membership_type);
    setEditStatus(m.status);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/memberships/${selectedMem.membership_id}`, {
        membership_type: editTier,
        status: editStatus,
      });
      setSuccess('Membership updated successfully.');
      setIsEditOpen(false);
      fetchMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating membership.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Phoenix Loyalty Club</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Rewards program, tier progression, and points ledger management
          </p>
        </div>
      </div>

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

      {/* Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: 14, padding: 14, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}>
          <select
            className="form-control"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="">All Tiers (All)</option>
            <option value="Platinum">Platinum (VIP)</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>
        </div>
        <div style={{ minWidth: 180 }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Membership ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Tier</th>
              <th>Loyalty Points</th>
              <th>Status</th>
              <th>Member Since</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  Loading membership data...
                </td>
              </tr>
            ) : memberships.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  No memberships found for criteria.
                </td>
              </tr>
            ) : (
              memberships.map((m) => (
                <tr key={m.membership_id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{m.membership_id}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.customer_name}</td>
                  <td>{m.phone || '—'}</td>
                  <td><StatusBadge status={m.membership_type} /></td>
                  <td style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.95rem' }}>
                    {m.points.toLocaleString('en-IN')} pts
                  </td>
                  <td><StatusBadge status={m.status} /></td>
                  <td style={{ color: '#64748b' }}>{new Date(m.join_date).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenAddPoints(m)}
                        className="btn btn-secondary btn-sm"
                        title="Add Points via Stored Procedure"
                      >
                        <IconPlus size={15} /> Points
                      </button>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Tier / Status"
                      >
                        <IconEdit size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Points Modal (invokes sp_add_membership_points) */}
      <Modal isOpen={isPointsOpen} onClose={() => setIsPointsOpen(false)} title="Credit Loyalty Points (Procedure)">
        <form onSubmit={handleCreditPoints}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 14 }}>
              Credit loyalty points to <strong>{selectedMem?.customer_name}</strong> via stored procedure <code>sp_add_membership_points</code>.
            </p>
            <div className="form-group">
              <label className="form-label">Points to Credit</label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsPointsOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Execute Procedure</button>
          </div>
        </form>
      </Modal>

      {/* Edit Tier / Status Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Membership Tier">
        <form onSubmit={handleUpdate}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Membership Tier</label>
              <select className="form-control" value={editTier} onChange={(e) => setEditTier(e.target.value)}>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Memberships;
