/**
 * Payment Controller
 * Manages Billing Collections, Methods, and Reconciliation
 */

const db = require('../config/db');

/**
 * GET /api/payments
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { payment_method, payment_status } = req.query;
    let sql = `
      SELECT
        py.payment_id,
        py.purchase_id,
        py.payment_date,
        py.amount,
        py.payment_method,
        py.payment_status,
        c.customer_name,
        s.shop_name
      FROM PAYMENT py
      JOIN PURCHASE p ON py.purchase_id = p.purchase_id
      JOIN CUSTOMER c ON p.customer_id = c.customer_id
      JOIN SHOP s ON p.shop_id = s.shop_id
    `;
    const params = [];
    const conditions = [];

    if (payment_method) {
      params.push(payment_method);
      conditions.push(`py.payment_method = $${params.length}`);
    }

    if (payment_status) {
      params.push(payment_status);
      conditions.push(`py.payment_status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY py.payment_date DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments
 */
const createPayment = async (req, res, next) => {
  try {
    const { purchase_id, amount, payment_method, payment_status } = req.body;

    if (!purchase_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'purchase_id, amount, and payment_method are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO PAYMENT (purchase_id, payment_date, amount, payment_method, payment_status)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)
       RETURNING *`,
      [purchase_id, amount, payment_method, payment_status || 'Completed']
    );

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/stats/summary
 */
const getPaymentStats = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         payment_method,
         COUNT(*) AS transaction_count,
         SUM(amount) AS total_amount,
         ROUND(AVG(amount), 2) AS avg_transaction_value
       FROM PAYMENT
       GROUP BY payment_method
       ORDER BY total_amount DESC`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayments,
  createPayment,
  getPaymentStats,
};
