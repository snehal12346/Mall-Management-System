/**
 * Membership Controller
 * Handles Loyalty Tiers, Points Accrual, and Procedures
 */

const db = require('../config/db');

/**
 * GET /api/memberships
 */
const getAllMemberships = async (req, res, next) => {
  try {
    const { tier, status } = req.query;
    let sql = `
      SELECT
        m.membership_id,
        m.customer_id,
        c.customer_name,
        c.email,
        c.phone,
        m.membership_type,
        m.join_date,
        m.points,
        m.status
      FROM MEMBERSHIP m
      JOIN CUSTOMER c ON m.customer_id = c.customer_id
    `;
    const params = [];
    const conditions = [];

    if (tier) {
      params.push(tier);
      conditions.push(`m.membership_type = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`m.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY m.points DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/memberships/:id
 */
const updateMembership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { membership_type, points, status } = req.body;

    const result = await db.query(
      `UPDATE MEMBERSHIP
       SET membership_type = COALESCE($1, membership_type),
           points = COALESCE($2, points),
           status = COALESCE($3, status)
       WHERE membership_id = $4
       RETURNING *`,
      [membership_type, points, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Membership not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Membership updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/memberships/add-points
 * Executes PostgreSQL Stored Procedure sp_add_membership_points
 */
const addPoints = async (req, res, next) => {
  try {
    const { customer_id, points } = req.body;

    if (!customer_id || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid customer_id and positive points count are required.',
      });
    }

    // Call stored procedure
    await db.query(`CALL sp_add_membership_points($1, $2)`, [customer_id, points]);

    // Fetch updated points
    const checkRes = await db.query(
      `SELECT points, membership_type FROM MEMBERSHIP WHERE customer_id = $1`,
      [customer_id]
    );

    return res.status(200).json({
      success: true,
      message: `Successfully credited ${points} points.`,
      data: checkRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMemberships,
  updateMembership,
  addPoints,
};
