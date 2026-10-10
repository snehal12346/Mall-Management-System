/**
 * Product Controller
 * Manages Retail Inventory, Stock Quantities, and Reorder Alerts
 */

const db = require('../config/db');

/**
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { shop_id, category, search } = req.query;
    let sql = `
      SELECT
        p.*,
        s.shop_name,
        s.floor,
        (p.price * p.stock_quantity) AS inventory_value
      FROM PRODUCT p
      JOIN SHOP s ON p.shop_id = s.shop_id
    `;
    const params = [];
    const conditions = [];

    if (shop_id) {
      params.push(shop_id);
      conditions.push(`p.shop_id = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(p.product_name ILIKE $${params.length} OR s.shop_name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.product_id ASC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT p.*, s.shop_name, s.floor
       FROM PRODUCT p
       JOIN SHOP s ON p.shop_id = s.shop_id
       WHERE p.product_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { shop_id, product_name, category, price, stock_quantity } = req.body;

    if (!shop_id || !product_name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'shop_id, product_name, and price are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO PRODUCT (shop_id, product_name, category, price, stock_quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shop_id, product_name.trim(), category, price, stock_quantity || 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shop_id, product_name, category, price, stock_quantity } = req.body;

    const result = await db.query(
      `UPDATE PRODUCT
       SET shop_id = COALESCE($1, shop_id),
           product_name = COALESCE($2, product_name),
           category = COALESCE($3, category),
           price = COALESCE($4, price),
           stock_quantity = COALESCE($5, stock_quantity)
       WHERE product_id = $6
       RETURNING *`,
      [shop_id, product_name, category, price, stock_quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`DELETE FROM PRODUCT WHERE product_id = $1 RETURNING product_id, product_name`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${result.rows[0].product_name}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/alerts/low-stock
 */
const getLowStockAlerts = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT pr.*, s.shop_name, s.floor
       FROM PRODUCT pr
       JOIN SHOP s ON pr.shop_id = s.shop_id
       WHERE pr.stock_quantity < 15
       ORDER BY pr.stock_quantity ASC`
    );
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
};
