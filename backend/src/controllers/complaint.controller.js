/**
 * Complaint Controller
 * Manages Customer Grievances, SLA Tracking, and Staff Assignments
 */

const db = require('../config/db');

/**
 * GET /api/complaints
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    let sql = `
      SELECT
        co.*,
        c.customer_name,
        c.phone AS customer_phone,
        emp.employee_name AS assigned_to,
        emp.employee_id AS assigned_employee_id,
        ca.assignment_status
      FROM COMPLAINT co
      JOIN CUSTOMER c ON co.customer_id = c.customer_id
      LEFT JOIN COMPLAINT_ASSIGNMENT ca ON co.complaint_id = ca.complaint_id
      LEFT JOIN EMPLOYEE emp ON ca.employee_id = emp.employee_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`co.status = $${params.length}`);
    }

    if (priority) {
      params.push(priority);
      conditions.push(`co.priority = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(co.complaint_type ILIKE $${params.length} OR c.customer_name ILIKE $${params.length} OR co.description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY co.complaint_date DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/complaints/:id
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT co.*, c.customer_name, c.phone, c.email,
              emp.employee_name AS assigned_to, ca.assignment_status
       FROM COMPLAINT co
       JOIN CUSTOMER c ON co.customer_id = c.customer_id
       LEFT JOIN COMPLAINT_ASSIGNMENT ca ON co.complaint_id = ca.complaint_id
       LEFT JOIN EMPLOYEE emp ON ca.employee_id = emp.employee_id
       WHERE co.complaint_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints
 */
const createComplaint = async (req, res, next) => {
  try {
    const { customer_id, complaint_type, description, priority } = req.body;

    if (!customer_id || !complaint_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'customer_id, complaint_type, and description are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO COMPLAINT (customer_id, complaint_type, description, complaint_date, status, priority)
       VALUES ($1, $2, $3, CURRENT_DATE, 'Open', $4)
       RETURNING *`,
      [customer_id, complaint_type.trim(), description.trim(), priority || 'Medium']
    );

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints/:id/assign
 */
const assignEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required.' });
    }

    // Check if assignment exists
    const existing = await db.query(`SELECT assignment_id FROM COMPLAINT_ASSIGNMENT WHERE complaint_id = $1`, [id]);

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE COMPLAINT_ASSIGNMENT
         SET employee_id = $1, assigned_date = CURRENT_DATE, assignment_status = 'Assigned'
         WHERE complaint_id = $2 RETURNING *`,
        [employee_id, id]
      );
    } else {
      result = await db.query(
        `INSERT INTO COMPLAINT_ASSIGNMENT (complaint_id, employee_id, assigned_date, assignment_status)
         VALUES ($1, $2, CURRENT_DATE, 'Assigned') RETURNING *`,
        [id, employee_id]
      );
    }

    // Update complaint status to In Progress
    await db.query(`UPDATE COMPLAINT SET status = 'In Progress' WHERE complaint_id = $1`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned to staff member.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints/:id/resolve
 * Invokes Stored Procedure sp_complete_complaint
 */
const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(`CALL sp_complete_complaint($1, CURRENT_DATE)`, [id]);

    return res.status(200).json({
      success: true,
      message: 'Complaint resolved and completed.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/complaints/:id
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM COMPLAINT WHERE complaint_id = $1 RETURNING complaint_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    return res.status(200).json({ success: true, message: 'Complaint deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  assignEmployee,
  resolveComplaint,
  deleteComplaint,
};
