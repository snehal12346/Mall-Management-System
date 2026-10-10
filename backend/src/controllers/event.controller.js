/**
 * Event Controller
 * Manages Public Mall Events, Atrium Booking, and Capacity Limits
 */

const db = require('../config/db');

/**
 * GET /api/events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { upcoming } = req.query;
    let sql = `
      SELECT
        e.*,
        COUNT(er.registration_id) AS registered_count,
        (e.capacity - COUNT(er.registration_id)) AS available_capacity,
        ROUND((COUNT(er.registration_id) * 100.0 / e.capacity), 1) AS occupancy_percentage
      FROM EVENT e
      LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
    `;
    const params = [];

    if (upcoming === 'true') {
      sql += ` WHERE e.event_date >= CURRENT_DATE`;
    }

    sql += ` GROUP BY e.event_id ORDER BY e.event_date ASC`;

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evRes = await db.query(`SELECT * FROM EVENT WHERE event_id = $1`, [id]);
    if (evRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = evRes.rows[0];

    const regRes = await db.query(
      `SELECT er.*, c.customer_name, c.email, c.phone
       FROM EVENT_REGISTRATION er
       JOIN CUSTOMER c ON er.customer_id = c.customer_id
       WHERE er.event_id = $1
       ORDER BY er.registration_date DESC`,
      [id]
    );
    event.registrations = regRes.rows;

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const { event_name, event_date, start_time, end_time, location, capacity } = req.body;

    if (!event_name || !event_date || !start_time || !end_time || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, date, start_time, end_time, location, capacity) are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO EVENT (event_name, event_date, start_time, end_time, location, capacity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [event_name.trim(), event_date, start_time, end_time, location.trim(), capacity]
    );

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { event_name, event_date, start_time, end_time, location, capacity } = req.body;

    const result = await db.query(
      `UPDATE EVENT
       SET event_name = COALESCE($1, event_name),
           event_date = COALESCE($2, event_date),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           location = COALESCE($5, location),
           capacity = COALESCE($6, capacity)
       WHERE event_id = $7
       RETURNING *`,
      [event_name, event_date, start_time, end_time, location, capacity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM EVENT WHERE event_id = $1 RETURNING event_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
