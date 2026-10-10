/**
 * Customer Controller
 * Handles Customer Profiles, Registrations, Search, and Summary Aggregates
 */

const db = require('../config/db');

/**
 * GET /api/customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT
        c.customer_id,
        c.customer_name,
        c.phone,
        c.email,
        c.registration_date,
        m.membership_type,
        m.points AS loyalty_points,
        m.status AS membership_status
      FROM CUSTOMER c
      LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
    `;
    const params = [];

    if (search) {
      sql += ` WHERE c.customer_name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1`;
      params.push(`%${search.trim()}%`);
    }

    sql += ` ORDER BY c.customer_id DESC`;

    const result = await db.query(sql, params);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/customers/:id
 */
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Customer Profile
    const custRes = await db.query(
      `SELECT c.*, m.membership_type, m.points, m.status AS membership_status, m.join_date
       FROM CUSTOMER c
       LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
       WHERE c.customer_id = $1`,
      [id]
    );

    if (custRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = custRes.rows[0];

    // Vehicles
    const vehRes = await db.query(`SELECT * FROM VEHICLE WHERE customer_id = $1`, [id]);
    customer.vehicles = vehRes.rows;

    // Purchases
    const purRes = await db.query(
      `SELECT p.purchase_id, p.purchase_date, p.total_amount, s.shop_name
       FROM PURCHASE p
       JOIN SHOP s ON p.shop_id = s.shop_id
       WHERE p.customer_id = $1
       ORDER BY p.purchase_date DESC LIMIT 10`,
      [id]
    );
    customer.recentPurchases = purRes.rows;

    // Event Registrations
    const evRes = await db.query(
      `SELECT er.registration_id, er.registration_date, er.attendance_status, e.event_name, e.event_date
       FROM EVENT_REGISTRATION er
       JOIN EVENT e ON er.event_id = e.event_id
       WHERE er.customer_id = $1`,
      [id]
    );
    customer.eventRegistrations = evRes.rows;

    // Complaints
    const compRes = await db.query(
      `SELECT * FROM COMPLAINT WHERE customer_id = $1 ORDER BY complaint_date DESC`,
      [id]
    );
    customer.complaints = compRes.rows;

    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/customers
 */
const createCustomer = async (req, res, next) => {
  try {
    const { customer_name, phone, email, registration_date, membership_type } = req.body;

    if (!customer_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are mandatory.',
      });
    }

    const regDate = registration_date || new Date().toISOString().split('T')[0];

    // Insert customer
    const insertRes = await db.query(
      `INSERT INTO CUSTOMER (customer_name, phone, email, registration_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_name.trim(), phone?.trim() || null, email.trim(), regDate]
    );

    const newCustomer = insertRes.rows[0];

    // Create default membership if provided
    const tier = membership_type || 'Silver';
    await db.query(
      `INSERT INTO MEMBERSHIP (customer_id, membership_type, join_date, points, status)
       VALUES ($1, $2, $3, 0, 'Active')`,
      [newCustomer.customer_id, tier, regDate]
    );

    return res.status(201).json({
      success: true,
      message: 'Customer and membership created successfully.',
      data: newCustomer,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/customers/:id
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_name, phone, email, registration_date } = req.body;

    const result = await db.query(
      `UPDATE CUSTOMER
       SET customer_name = COALESCE($1, customer_name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           registration_date = COALESCE($4, registration_date)
       WHERE customer_id = $5
       RETURNING *`,
      [customer_name, phone, email, registration_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer details updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/customers/:id
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM CUSTOMER WHERE customer_id = $1 RETURNING customer_id, customer_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Customer "${result.rows[0].customer_name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/customers/summary/overview
 */
const getCustomerSummary = async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM v_customer_purchase_summary ORDER BY total_spent DESC`);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSummary,
};
