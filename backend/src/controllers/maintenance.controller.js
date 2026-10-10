/**
 * Maintenance Controller
 * Manages Facility Work Orders, Technician Dispatch, and Resolution
 */

const db = require('../config/db');

/**
 * GET /api/maintenance
 */
const getAllMaintenance = async (req, res, next) => {
  try {
    const { status, issue_type, search } = req.query;
    let sql = `
      SELECT
        mr.*,
        c.customer_name AS reported_by_name,
        c.phone AS reported_by_phone,
        emp.employee_name AS technician_name,
        emp.employee_id AS technician_id,
        emp.phone AS technician_phone,
        ma.assignment_status
      FROM MAINTENANCE_REQUEST mr
      LEFT JOIN CUSTOMER c ON mr.reported_by_customer_id = c.customer_id
      LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON mr.request_id = ma.request_id
      LEFT JOIN EMPLOYEE emp ON ma.employee_id = emp.employee_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }

    if (issue_type) {
      params.push(issue_type);
      conditions.push(`mr.issue_type = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(mr.issue_type ILIKE $${params.length} OR mr.description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY mr.request_date DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/maintenance/:id
 */
const getMaintenanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT mr.*, c.customer_name, c.phone, emp.employee_name AS technician_name, ma.assignment_status
       FROM MAINTENANCE_REQUEST mr
       LEFT JOIN CUSTOMER c ON mr.reported_by_customer_id = c.customer_id
       LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON mr.request_id = ma.request_id
       LEFT JOIN EMPLOYEE emp ON ma.employee_id = emp.employee_id
       WHERE mr.request_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/maintenance
 */
const createMaintenance = async (req, res, next) => {
  try {
    const { reported_by_customer_id, issue_type, description } = req.body;

    if (!issue_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'issue_type and description are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO MAINTENANCE_REQUEST (reported_by_customer_id, issue_type, description, request_date, status)
       VALUES ($1, $2, $3, CURRENT_DATE, 'Pending')
       RETURNING *`,
      [reported_by_customer_id || null, issue_type.trim(), description.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Maintenance work order created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/maintenance/:id/assign
 */
const assignTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required.' });
    }

    const existing = await db.query(`SELECT assignment_id FROM MAINTENANCE_ASSIGNMENT WHERE request_id = $1`, [id]);

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE MAINTENANCE_ASSIGNMENT
         SET employee_id = $1, assigned_date = CURRENT_DATE, assignment_status = 'Assigned'
         WHERE request_id = $2 RETURNING *`,
        [employee_id, id]
      );
    } else {
      result = await db.query(
        `INSERT INTO MAINTENANCE_ASSIGNMENT (request_id, employee_id, assigned_date, assignment_status)
         VALUES ($1, $2, CURRENT_DATE, 'Assigned') RETURNING *`,
        [id, employee_id]
      );
    }

    // Update maintenance request status to In Progress
    await db.query(`UPDATE MAINTENANCE_REQUEST SET status = 'In Progress' WHERE request_id = $1`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Technician successfully assigned to maintenance request.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/maintenance/:id/complete
 * Invokes Stored Procedure sp_complete_maintenance
 */
const completeMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`CALL sp_complete_maintenance($1, CURRENT_DATE)`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Maintenance work order completed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/maintenance/:id
 */
const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM MAINTENANCE_REQUEST WHERE request_id = $1 RETURNING request_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }
    return res.status(200).json({ success: true, message: 'Maintenance request deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  assignTechnician,
  completeMaintenance,
  deleteMaintenance,
};
