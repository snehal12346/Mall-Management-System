import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal, { ConfirmDialog } from '../components/Modal';
import { IconBuilding, IconPlus, IconEdit, IconTrash, IconSearch } from '../components/Icons';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formData, setFormData] = useState({ tenant_name: '', contact_no: '', email: '' });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenants', { params: { search: search || undefined } });
      setTenants(res.data.data);
    } catch (err) {
      setError('Failed to load tenants from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({ tenant_name: '', contact_no: '', email: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTenant(t);
    setFormData({
      tenant_name: t.tenant_name,
      contact_no: t.contact_no || '',
      email: t.email || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tenants', formData);
      setSuccess('Tenant registered successfully.');
      setIsAddOpen(false);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating tenant.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tenants/${selectedTenant.tenant_id}`, formData);
      setSuccess('Tenant updated successfully.');
      setIsEditOpen(false);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating tenant.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/tenants/${selectedTenant.tenant_id}`);
      setSuccess('Tenant deleted.');
      setIsDeleteOpen(false);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete tenant with active lease contracts.');
      setIsDeleteOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Commercial Tenants & Parent Companies</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Corporate entities, retail partners, and holding companies
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <IconPlus size={16} /> Add Tenant Entity
        </button>
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

      <div className="card" style={{ padding: 14 }}>
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <span className="search-icon"><IconSearch size={18} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search tenants by company name, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tenant Corporate Entity</th>
              <th>Contact Number</th>
              <th>Official Email</th>
              <th>Active Leases</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Loading tenants...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>No tenant entities found.</td></tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.tenant_id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{t.tenant_id}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.tenant_name}</td>
                  <td>{t.contact_no || '—'}</td>
                  <td>{t.email || '—'}</td>
                  <td><span className="badge badge-blue">{t.leases_count || 0} Leases</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => handleOpenEdit(t)} className="btn btn-secondary btn-sm" title="Edit">
                        <IconEdit size={15} />
                      </button>
                      <button onClick={() => { setSelectedTenant(t); setIsDeleteOpen(true); }} className="btn btn-danger btn-sm" title="Delete">
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Tenant Entity">
        <form onSubmit={handleSaveAdd}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Corporate Entity Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                placeholder="e.g. Reliance Brands Limited"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                  placeholder="022-61801000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="corporate@brand.com"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Tenant</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Tenant Entity">
        <form onSubmit={handleSaveEdit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Corporate Entity Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Tenant</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tenant"
        message={`Are you sure you want to remove "${selectedTenant?.tenant_name}"?`}
      />
    </div>
  );
};

export default Tenants;
