/**
 * Purchase Controller
 * Handles Multi-Item Point-of-Sale Transactions, Triggers, and Invoicing
 */

const db = require('../config/db');

/**
 * GET /api/purchases
 */
const getAllPurchases = async (req, res, next) => {
  try {
    const { customer_id, shop_id, start_date, end_date } = req.query;
    let sql = `
      SELECT
        p.purchase_id,
        p.customer_id,
        c.customer_name,
        p.shop_id,
        s.shop_name,
        p.purchase_date,
        p.total_amount,
        COUNT(pd.purchase_detail_id) AS items_count,
        COALESCE(py.payment_status, 'Unpaid') AS payment_status,
        py.payment_method
      FROM PURCHASE p
      JOIN CUSTOMER c ON p.customer_id = c.customer_id
      JOIN SHOP s ON p.shop_id = s.shop_id
      LEFT JOIN PURCHASE_DETAIL pd ON p.purchase_id = pd.purchase_id
      LEFT JOIN PAYMENT py ON p.purchase_id = py.purchase_id
    `;
    const params = [];
    const conditions = [];

    if (customer_id) {
      params.push(customer_id);
      conditions.push(`p.customer_id = $${params.length}`);
    }

    if (shop_id) {
      params.push(shop_id);
      conditions.push(`p.shop_id = $${params.length}`);
    }

    if (start_date) {
      params.push(start_date);
      conditions.push(`p.purchase_date >= $${params.length}`);
    }

    if (end_date) {
      params.push(end_date);
      conditions.push(`p.purchase_date <= $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ` GROUP BY p.purchase_id, c.customer_name, s.shop_name, py.payment_status, py.payment_method
             ORDER BY p.purchase_date DESC`;

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/purchases/:id
 */
const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Header
    const purRes = await db.query(
      `SELECT p.*, c.customer_name, c.phone AS customer_phone, c.email AS customer_email,
              s.shop_name, s.floor AS shop_floor, s.contact_no AS shop_contact
       FROM PURCHASE p
       JOIN CUSTOMER c ON p.customer_id = c.customer_id
       JOIN SHOP s ON p.shop_id = s.shop_id
       WHERE p.purchase_id = $1`,
      [id]
    );

    if (purRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase not found.' });
    }

    const purchase = purRes.rows[0];

    // Details
    const itemsRes = await db.query(
      `SELECT pd.*, pr.product_name, pr.category
       FROM PURCHASE_DETAIL pd
       JOIN PRODUCT pr ON pd.product_id = pr.product_id
       WHERE pd.purchase_id = $1`,
      [id]
    );
    purchase.items = itemsRes.rows;

    // Payment
    const payRes = await db.query(`SELECT * FROM PAYMENT WHERE purchase_id = $1`, [id]);
    purchase.payment = payRes.rows[0] || null;

    return res.status(200).json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/purchases
 * Atomic Point-of-Sale Checkout with triggers execution
 */
const createPurchase = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { customer_id, shop_id, items, payment_method, offer_id } = req.body;

    if (!customer_id || !shop_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'customer_id, shop_id, and at least one line item are required.',
      });
    }

    await client.query('BEGIN');

    // 1. Insert Purchase Header
    const purRes = await client.query(
      `INSERT INTO PURCHASE (customer_id, shop_id, purchase_date, total_amount)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 0.00)
       RETURNING purchase_id, purchase_date`,
      [customer_id, shop_id]
    );
    const purchaseId = purRes.rows[0].purchase_id;

    // 2. Insert items into PURCHASE_DETAIL
    // Triggers will validate stock and reduce inventory automatically
    for (const item of items) {
      // Fetch unit price if not supplied
      let unitPrice = item.unit_price;
      if (!unitPrice) {
        const pr = await client.query('SELECT price FROM PRODUCT WHERE product_id = $1', [item.product_id]);
        if (pr.rows.length === 0) {
          throw new Error(`Product ID ${item.product_id} not found.`);
        }
        unitPrice = pr.rows[0].price;
      }

      await client.query(
        `INSERT INTO PURCHASE_DETAIL (purchase_id, product_id, quantity, unit_price, discount)
         VALUES ($1, $2, $3, $4, $5)`,
        [purchaseId, item.product_id, item.quantity, unitPrice, item.discount || 0.00]
      );
    }

    // 3. Fetch recalculated total from purchase table (updated by trigger trg_sync_purchase_total)
    const totalRes = await client.query('SELECT total_amount FROM PURCHASE WHERE purchase_id = $1', [purchaseId]);
    const finalAmount = totalRes.rows[0].total_amount;

    // 4. Create Payment if payment method provided
    let paymentRecord = null;
    if (payment_method && finalAmount > 0) {
      const payRes = await client.query(
        `INSERT INTO PAYMENT (purchase_id, payment_date, amount, payment_method, payment_status)
         VALUES ($1, CURRENT_TIMESTAMP, $2, $3, 'Completed')
         RETURNING *`,
        [purchaseId, finalAmount, payment_method]
      );
      paymentRecord = payRes.rows[0];
      // Trigger trg_award_membership_points will automatically award loyalty points!
    }

    // 5. Record offer usage if coupon applied
    if (offer_id) {
      await client.query(
        `INSERT INTO OFFER_USAGE (offer_id, customer_id, purchase_id, used_date)
         VALUES ($1, $2, $3, CURRENT_DATE)`,
        [offer_id, customer_id, purchaseId]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Purchase transaction completed successfully.',
      data: {
        purchaseId,
        totalAmount: finalAmount,
        payment: paymentRecord,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * DELETE /api/purchases/:id
 */
const deletePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM PURCHASE WHERE purchase_id = $1 RETURNING purchase_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase not found.' });
    }

    return res.status(200).json({ success: true, message: 'Purchase deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
};
