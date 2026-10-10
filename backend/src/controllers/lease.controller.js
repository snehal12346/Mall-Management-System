/**
 * Lease Controller
 * Manages Commercial Lease Contracts, Monthly Rent, and Status
 */

const db = require('../config/db');

/**
 * GET /api/leases
 */
const getAllLeases = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT
        l.lease_id,
        l.shop_id,
        s.shop_name,
        s.floor,
        l.tenant_id,
        t.tenant_name,
        l.lease_start,
        l.lease_end,
        l.monthly_rent,
        l.lease_status,
        (l.lease_end - CURRENT_DATE) AS days_remaining
      FROM LEASE l
      JOIN SHOP s ON l.shop_id = s.shop_id
      JOIN TENANT t ON l.tenant_id = t.tenant_id
    `;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` WHERE l.lease_status = $1`;
    }

    sql += ` ORDER BY l.lease_start DESC`;

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/leases/:id
 */
const getLeaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT l.*, s.shop_name, s.floor, t.tenant_name, t.contact_no, t.email
       FROM LEASE l
       JOIN SHOP s ON l.shop_id = s.shop_id
       JOIN TENANT t ON l.tenant_id = t.tenant_id
       WHERE l.lease_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease agreement not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/leases
 */
const createLease = async (req, res, next) => {
  try {
    const { shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status } = req.body;

    if (!shop_id || !tenant_id || !lease_start || !lease_end || !monthly_rent) {
      return res.status(400).json({
        success: false,
        message: 'All fields (shop_id, tenant_id, lease_start, lease_end, monthly_rent) are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO LEASE (shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status || 'Active']
    );

    return res.status(201).json({
      success: true,
      message: 'Lease agreement created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/leases/:id
 */
const updateLease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status } = req.body;

    const result = await db.query(
      `UPDATE LEASE
       SET shop_id = COALESCE($1, shop_id),
           tenant_id = COALESCE($2, tenant_id),
           lease_start = COALESCE($3, lease_start),
           lease_end = COALESCE($4, lease_end),
           monthly_rent = COALESCE($5, monthly_rent),
           lease_status = COALESCE($6, lease_status)
       WHERE lease_id = $7
       RETURNING *`,
      [shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lease agreement updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/leases/:id
 */
const deleteLease = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`DELETE FROM LEASE WHERE lease_id = $1 RETURNING lease_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease not found.' });
    }

    return res.status(200).json({ success: true, message: 'Lease deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllLeases,
  getLeaseById,
  createLease,
  updateLease,
  deleteLease,
};
