/**
 * Vehicle Controller
 * Manages Customer Vehicles, Registration Numbers, and Vehicle Categories
 */

const db = require('../config/db');

/**
 * GET /api/vehicles
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const { vehicle_type, search } = req.query;
    let sql = `
      SELECT
        v.*,
        c.customer_name,
        c.phone AS customer_phone
      FROM VEHICLE v
      LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
    `;
    const params = [];
    const conditions = [];

    if (vehicle_type) {
      params.push(vehicle_type);
      conditions.push(`v.vehicle_type = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(v.vehicle_number ILIKE $${params.length} OR c.customer_name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY v.vehicle_id ASC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/vehicles/:id
 */
const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT v.*, c.customer_name, c.phone AS customer_phone, c.email AS customer_email
       FROM VEHICLE v
       LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
       WHERE v.vehicle_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/vehicles
 */
const createVehicle = async (req, res, next) => {
  try {
    const { customer_id, vehicle_number, vehicle_type } = req.body;

    if (!vehicle_number || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: 'vehicle_number and vehicle_type are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO VEHICLE (customer_id, vehicle_number, vehicle_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [customer_id || null, vehicle_number.trim().toUpperCase(), vehicle_type]
    );

    return res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/vehicles/:id
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_id, vehicle_number, vehicle_type } = req.body;

    const result = await db.query(
      `UPDATE VEHICLE
       SET customer_id = COALESCE($1, customer_id),
           vehicle_number = COALESCE($2, vehicle_number),
           vehicle_type = COALESCE($3, vehicle_type)
       WHERE vehicle_id = $4
       RETURNING *`,
      [customer_id, vehicle_number?.toUpperCase(), vehicle_type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/vehicles/:id
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`DELETE FROM VEHICLE WHERE vehicle_id = $1 RETURNING vehicle_id, vehicle_number`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Vehicle "${result.rows[0].vehicle_number}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
