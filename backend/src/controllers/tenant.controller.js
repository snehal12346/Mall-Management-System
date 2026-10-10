/**
 * Tenant Controller
 * Manages Commercial Brand Tenants and Corporate Entities
 */

const db = require('../config/db');

/**
 * GET /api/tenants
 */
const getAllTenants = async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT t.*, COUNT(l.lease_id) AS leases_count
      FROM TENANT t
      LEFT JOIN LEASE l ON t.tenant_id = l.tenant_id
    `;
    const params = [];

    if (search) {
      sql += ` WHERE t.tenant_name ILIKE $1 OR t.email ILIKE $1 OR t.contact_no ILIKE $1`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` GROUP BY t.tenant_id ORDER BY t.tenant_id ASC`;

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tenants/:id
 */
const getTenantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM TENANT WHERE tenant_id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const tenant = result.rows[0];
    const leasesRes = await db.query(
      `SELECT l.*, s.shop_name, s.floor
       FROM LEASE l
       JOIN SHOP s ON l.shop_id = s.shop_id
       WHERE l.tenant_id = $1`,
      [id]
    );
    tenant.leases = leasesRes.rows;

    return res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tenants
 */
const createTenant = async (req, res, next) => {
  try {
    const { tenant_name, contact_no, email } = req.body;

    if (!tenant_name) {
      return res.status(400).json({ success: false, message: 'Tenant name is required.' });
    }

    const result = await db.query(
      `INSERT INTO TENANT (tenant_name, contact_no, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [tenant_name.trim(), contact_no, email]
    );

    return res.status(201).json({
      success: true,
      message: 'Tenant created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/tenants/:id
 */
const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenant_name, contact_no, email } = req.body;

    const result = await db.query(
      `UPDATE TENANT
       SET tenant_name = COALESCE($1, tenant_name),
           contact_no = COALESCE($2, contact_no),
           email = COALESCE($3, email)
       WHERE tenant_id = $4
       RETURNING *`,
      [tenant_name, contact_no, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/tenants/:id
 */
const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM TENANT WHERE tenant_id = $1 RETURNING tenant_id, tenant_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Tenant "${result.rows[0].tenant_name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
};
