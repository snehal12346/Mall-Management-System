/**
 * Shop Controller
 * Manages Retail Outlets, Floor Assignments, and Sales Summaries
 */

const db = require('../config/db');

/**
 * GET /api/shops
 */
const getAllShops = async (req, res, next) => {
  try {
    const { category, floor, search } = req.query;
    let sql = `
      SELECT
        s.shop_id,
        s.shop_name,
        s.category,
        s.floor,
        s.contact_no,
        t.tenant_name,
        l.monthly_rent,
        l.lease_status,
        COUNT(pr.product_id) AS total_products
      FROM SHOP s
      LEFT JOIN LEASE l ON s.shop_id = l.shop_id AND l.lease_status = 'Active'
      LEFT JOIN TENANT t ON l.tenant_id = t.tenant_id
      LEFT JOIN PRODUCT pr ON s.shop_id = pr.shop_id
    `;
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`s.category = $${params.length}`);
    }

    if (floor) {
      params.push(floor);
      conditions.push(`s.floor = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`s.shop_name ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ` GROUP BY s.shop_id, s.shop_name, s.category, s.floor, s.contact_no, t.tenant_name, l.monthly_rent, l.lease_status
             ORDER BY s.shop_id ASC`;

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shops/:id
 */
const getShopById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Shop info
    const shopRes = await db.query(`SELECT * FROM SHOP WHERE shop_id = $1`, [id]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }
    const shop = shopRes.rows[0];

    // Current Lease
    const leaseRes = await db.query(
      `SELECT l.*, t.tenant_name, t.contact_no AS tenant_phone, t.email AS tenant_email
       FROM LEASE l
       JOIN TENANT t ON l.tenant_id = t.tenant_id
       WHERE l.shop_id = $1
       ORDER BY l.lease_start DESC LIMIT 1`,
      [id]
    );
    shop.lease = leaseRes.rows[0] || null;

    // Products
    const prodRes = await db.query(
      `SELECT * FROM PRODUCT WHERE shop_id = $1 ORDER BY product_name ASC`,
      [id]
    );
    shop.products = prodRes.rows;

    // Total sales using function fn_get_shop_total_sales
    const salesRes = await db.query(`SELECT fn_get_shop_total_sales($1) AS total_sales`, [id]);
    shop.totalSales = salesRes.rows[0]?.total_sales || 0.00;

    return res.status(200).json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shops
 */
const createShop = async (req, res, next) => {
  try {
    const { shop_name, category, floor, contact_no } = req.body;

    if (!shop_name) {
      return res.status(400).json({ success: false, message: 'Shop name is required.' });
    }

    const result = await db.query(
      `INSERT INTO SHOP (shop_name, category, floor, contact_no)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [shop_name.trim(), category, floor, contact_no]
    );

    return res.status(201).json({
      success: true,
      message: 'Shop created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/shops/:id
 */
const updateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shop_name, category, floor, contact_no } = req.body;

    const result = await db.query(
      `UPDATE SHOP
       SET shop_name = COALESCE($1, shop_name),
           category = COALESCE($2, category),
           floor = COALESCE($3, floor),
           contact_no = COALESCE($4, contact_no)
       WHERE shop_id = $5
       RETURNING *`,
      [shop_name, category, floor, contact_no, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shops/:id
 */
const deleteShop = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM SHOP WHERE shop_id = $1 RETURNING shop_id, shop_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Shop "${result.rows[0].shop_name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shops/summary/sales
 */
const getShopSalesSummary = async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM v_shop_sales_summary ORDER BY total_revenue DESC`);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
  getShopSalesSummary,
};
