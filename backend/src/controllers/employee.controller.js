/**
 * Employee Controller
 * Manages Mall Staff, Facility Technicians, and Operations Department
 */

const db = require('../config/db');

/**
 * GET /api/employees
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let sql = `
      SELECT
        e.*,
        COUNT(DISTINCT ca.assignment_id) AS active_complaint_assignments,
        COUNT(DISTINCT ma.assignment_id) AS active_maintenance_assignments
      FROM EMPLOYEE e
      LEFT JOIN COMPLAINT_ASSIGNMENT ca ON e.employee_id = ca.employee_id AND ca.assignment_status <> 'Completed'
      LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON e.employee_id = ma.employee_id AND ma.assignment_status <> 'Completed'
    `;
    const params = [];
    const conditions = [];

    if (department) {
      params.push(department);
      conditions.push(`e.department = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(e.employee_name ILIKE $${params.length} OR e.designation ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY e.employee_id ORDER BY e.employee_id ASC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empRes = await db.query(`SELECT * FROM EMPLOYEE WHERE employee_id = $1`, [id]);
    if (empRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const employee = empRes.rows[0];

    // Complaints assigned
    const compRes = await db.query(
      `SELECT ca.*, c.complaint_type, c.priority, c.status AS complaint_status, c.description
       FROM COMPLAINT_ASSIGNMENT ca
       JOIN COMPLAINT c ON ca.complaint_id = c.complaint_id
       WHERE ca.employee_id = $1`,
      [id]
    );
    employee.complaintAssignments = compRes.rows;

    // Maintenance assigned
    const maintRes = await db.query(
      `SELECT ma.*, m.issue_type, m.status AS request_status, m.description
       FROM MAINTENANCE_ASSIGNMENT ma
       JOIN MAINTENANCE_REQUEST m ON ma.request_id = m.request_id
       WHERE ma.employee_id = $1`,
      [id]
    );
    employee.maintenanceAssignments = maintRes.rows;

    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const { employee_name, department, designation, phone } = req.body;

    if (!employee_name || !department || !designation || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (employee_name, department, designation, phone) are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO EMPLOYEE (employee_name, department, designation, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [employee_name.trim(), department.trim(), designation.trim(), phone.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_name, department, designation, phone } = req.body;

    const result = await db.query(
      `UPDATE EMPLOYEE
       SET employee_name = COALESCE($1, employee_name),
           department = COALESCE($2, department),
           designation = COALESCE($3, designation),
           phone = COALESCE($4, phone)
       WHERE employee_id = $5
       RETURNING *`,
      [employee_name, department, designation, phone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM EMPLOYEE WHERE employee_id = $1 RETURNING employee_id, employee_name`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, message: `Employee "${result.rows[0].employee_name}" deleted.` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
