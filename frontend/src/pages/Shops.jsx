import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal, { ConfirmDialog } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { IconStore, IconPlus, IconEdit, IconTrash, IconEye, IconSearch } from '../components/Icons';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedShop, setSelectedShop] = useState(null);
  const [viewShopData, setViewShopData] = useState(null);

  const [formData, setFormData] = useState({
    shop_name: '',
    category: 'Fashion',
    floor: 'First Floor',
    contact_no: '',
  });

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shops', {
        params: {
          search: search || undefined,
          floor: floorFilter || undefined,
          category: categoryFilter || undefined,
        },
      });
      setShops(res.data.data);
    } catch (err) {
      setError('Failed to load shop records from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [search, floorFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setFormData({ shop_name: '', category: 'Fashion', floor: 'First Floor', contact_no: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedShop(s);
    setFormData({
      shop_name: s.shop_name,
      category: s.category || '',
      floor: s.floor || '1',
      contact_no: s.contact_no || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = async (s) => {
    try {
      const res = await api.get(`/shops/${s.shop_id}`);
      setViewShopData(res.data.data);
      setIsViewOpen(true);
    } catch (err) {
      setError('Failed to fetch detailed shop data.');
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shops', formData);
      setSuccess('Shop registered successfully.');
      setIsAddOpen(false);
      fetchShops();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating shop.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/shops/${selectedShop.shop_id}`, formData);
      setSuccess('Shop updated successfully.');
      setIsEditOpen(false);
      fetchShops();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating shop.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/shops/${selectedShop.shop_id}`);
      setSuccess('Shop deleted.');
      setIsDeleteOpen(false);
      fetchShops();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete shop with active leases or product inventory.');
      setIsDeleteOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Mall Shops & Retail Directory</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Store occupancy, floor positioning, and commercial tenant mappings
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <IconPlus size={16} /> Add New Shop
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: 14, padding: 14, flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 260 }}>
          <span className="search-icon"><IconSearch size={18} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search shops by brand name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: 170 }}>
          <select className="form-control" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
            <option value="">All Floors</option>
            <option value="Ground">Ground Floor</option>
            <option value="1">First Floor</option>
            <option value="2">Second Floor</option>
            <option value="3">Third Floor</option>
          </select>
        </div>
        <div style={{ width: 200 }}>
          <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Fashion">Fashion & Apparel</option>
            <option value="Electronics">Electronics</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Sportswear">Sportswear</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Toys & Kids">Toys & Kids</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shop ID</th>
              <th>Shop Name</th>
              <th>Category</th>
              <th>Floor</th>
              <th>Contact No</th>
              <th>Active Tenant</th>
              <th>Monthly Rent</th>
              <th>Products</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  Loading retail stores...
                </td>
              </tr>
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                  No shops found matching filter criteria.
                </td>
              </tr>
            ) : (
              shops.map((s) => (
                <tr key={s.shop_id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{s.shop_id}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.shop_name}</td>
                  <td><span className="badge badge-purple">{s.category}</span></td>
                  <td><strong>{s.floor}</strong></td>
                  <td>{s.contact_no || '—'}</td>
                  <td>{s.tenant_name || <span style={{ color: '#94a3b8' }}>Unleased</span>}</td>
                  <td style={{ fontWeight: 600, color: s.monthly_rent ? '#0f172a' : '#94a3b8' }}>
                    {s.monthly_rent ? `₹${Number(s.monthly_rent).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td><span className="badge badge-blue">{s.total_products || 0} items</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => handleOpenView(s)} className="btn btn-secondary btn-sm" title="View Store">
                        <IconEye size={15} />
                      </button>
                      <button onClick={() => handleOpenEdit(s)} className="btn btn-secondary btn-sm" title="Edit">
                        <IconEdit size={15} />
                      </button>
                      <button onClick={() => { setSelectedShop(s); setIsDeleteOpen(true); }} className="btn btn-danger btn-sm" title="Delete">
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Shop Outlet">
        <form onSubmit={handleSaveAdd}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Shop Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                placeholder="e.g. Marks & Spencer"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Sportswear">Sportswear</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Toys & Kids">Toys & Kids</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <select className="form-control" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })}>
                  <option value="Ground">Ground Floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.contact_no}
                onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                placeholder="e.g. 9000000011"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Shop</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Shop Information">
        <form onSubmit={handleSaveEdit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Shop Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Sportswear">Sportswear</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Toys & Kids">Toys & Kids</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <select className="form-control" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })}>
                  <option value="Ground">Ground Floor</option>
                  <option value="First">1st Floor</option>
                  <option value="Second">2nd Floor</option>
                  <option value="Third">3rd Floor</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.contact_no}
                onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Shop</button>
          </div>
        </form>
      </Modal>

      {/* View Shop Details Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Shop Overview & Performance" maxWidth={750}>
        {viewShopData && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{viewShopData.shop_name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {viewShopData.floor} | {viewShopData.category} | {viewShopData.contact_no || 'No contact phone'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cumulative Sales (via function):</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                  ₹{Number(viewShopData.totalSales).toLocaleString('en-IN')}
                </h4>
              </div>
            </div>

            {/* Lease Status */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Active Lease Contract</h4>
              {viewShopData.lease ? (
                <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div><strong>Tenant Entity:</strong> {viewShopData.lease.tenant_name}</div>
                  <div style={{ marginTop: 4 }}><strong>Monthly Rent:</strong> ₹{Number(viewShopData.lease.monthly_rent).toLocaleString('en-IN')}</div>
                  <div style={{ marginTop: 4 }}><strong>Tenancy Term:</strong> {viewShopData.lease.lease_start} to {viewShopData.lease.lease_end}</div>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>No active lease on record for this unit.</p>
              )}
            </div>

            {/* Inventory List */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Available Products ({viewShopData.products?.length || 0})</h4>
              {viewShopData.products?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewShopData.products.map((p) => (
                        <tr key={p.product_id}>
                          <td><strong>{p.product_name}</strong></td>
                          <td>{p.category}</td>
                          <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td>{p.stock_quantity} in stock</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>No products listed for this shop.</p>
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
        title="Delete Shop"
        message={`Are you sure you want to delete "${selectedShop?.shop_name}"?`}
      />
    </div>
  );
};

export default Shops;
