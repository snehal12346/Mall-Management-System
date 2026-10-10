/**
 * Event Registration Controller
 * Manages Customer Registrations, Duplicate Checks, and Attendance Markings
 */

const db = require('../config/db');

/**
 * GET /api/event-registrations
 */
const getAllRegistrations = async (req, res, next) => {
  try {
    const { event_id, customer_id } = req.query;
    let sql = `
      SELECT
        er.*,
        e.event_name,
        e.event_date,
        e.location,
        c.customer_name,
        c.phone,
        c.email
      FROM EVENT_REGISTRATION er
      JOIN EVENT e ON er.event_id = e.event_id
      JOIN CUSTOMER c ON er.customer_id = c.customer_id
    `;
    const params = [];
    const conditions = [];

    if (event_id) {
      params.push(event_id);
      conditions.push(`er.event_id = $${params.length}`);
    }

    if (customer_id) {
      params.push(customer_id);
      conditions.push(`er.customer_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY er.registration_date DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/event-registrations
 * Invokes Stored Procedure sp_register_customer_event
 */
const registerCustomer = async (req, res, next) => {
  try {
    const { event_id, customer_id } = req.body;

    if (!event_id || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'event_id and customer_id are required.',
      });
    }

    // Call stored procedure sp_register_customer_event
    const spResult = await db.query(
      `CALL sp_register_customer_event($1, $2, '', '')`,
      [event_id, customer_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: spResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/event-registrations/attendance
 * Invokes Stored Procedure sp_mark_event_attendance
 */
const markAttendance = async (req, res, next) => {
  try {
    const { event_id, customer_id, attendance_status } = req.body;

    if (!event_id || !customer_id || !attendance_status) {
      return res.status(400).json({
        success: false,
        message: 'event_id, customer_id, and attendance_status are required.',
      });
    }

    await db.query(
      `CALL sp_mark_event_attendance($1, $2, $3)`,
      [event_id, customer_id, attendance_status]
    );

    return res.status(200).json({
      success: true,
      message: `Attendance updated to '${attendance_status}'.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/event-registrations/:id
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `DELETE FROM EVENT_REGISTRATION WHERE registration_id = $1 RETURNING registration_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    return res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRegistrations,
  registerCustomer,
  markAttendance,
  cancelRegistration,
};
