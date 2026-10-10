/**
 * Offer Controller
 * Manages Promotional Campaigns, Store Discounts, and Voucher Redemptions
 */

const db = require('../config/db');

/**
 * GET /api/offers
 */
const getAllOffers = async (req, res, next) => {
  try {
    const { active_only, shop_id } = req.query;
    let sql = `
      SELECT
        o.*,
        s.shop_name,
        s.floor,
        COUNT(ou.usage_id) AS redemptions_count,
        CASE
          WHEN CURRENT_DATE BETWEEN o.start_date AND o.end_date THEN 'Active'
          WHEN CURRENT_DATE < o.start_date THEN 'Upcoming'
          ELSE 'Expired'
        END AS status
      FROM OFFER o
      JOIN SHOP s ON o.shop_id = s.shop_id
      LEFT JOIN OFFER_USAGE ou ON o.offer_id = ou.offer_id
    `;
    const params = [];
    const conditions = [];

    if (shop_id) {
      params.push(shop_id);
      conditions.push(`o.shop_id = $${params.length}`);
    }

    if (active_only === 'true') {
      conditions.push(`CURRENT_DATE BETWEEN o.start_date AND o.end_date`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY o.offer_id, s.shop_name, s.floor ORDER BY o.start_date DESC';

    const result = await db.query(sql, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/offers/:id
 */
const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offerRes = await db.query(
      `SELECT o.*, s.shop_name, s.floor
       FROM OFFER o
       JOIN SHOP s ON o.shop_id = s.shop_id
       WHERE o.offer_id = $1`,
      [id]
    );

    if (offerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const offer = offerRes.rows[0];

    const usagesRes = await db.query(
      `SELECT ou.*, c.customer_name, c.email, p.total_amount
       FROM OFFER_USAGE ou
       JOIN CUSTOMER c ON ou.customer_id = c.customer_id
       JOIN PURCHASE p ON ou.purchase_id = p.purchase_id
       WHERE ou.offer_id = $1
       ORDER BY ou.used_date DESC`,
      [id]
    );
    offer.usages = usagesRes.rows;

    return res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/offers
 */
const createOffer = async (req, res, next) => {
  try {
    const { shop_id, offer_name, discount_percentage, start_date, end_date } = req.body;

    if (!shop_id || !offer_name || !discount_percentage || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'All fields (shop_id, offer_name, discount_percentage, start_date, end_date) are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO OFFER (shop_id, offer_name, discount_percentage, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shop_id, offer_name.trim(), discount_percentage, start_date, end_date]
    );

    return res.status(201).json({
      success: true,
      message: 'Offer created successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/offers/:id
 */
const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { shop_id, offer_name, discount_percentage, start_date, end_date } = req.body;

    const result = await db.query(
      `UPDATE OFFER
       SET shop_id = COALESCE($1, shop_id),
           offer_name = COALESCE($2, offer_name),
           discount_percentage = COALESCE($3, discount_percentage),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date)
       WHERE offer_id = $6
       RETURNING *`,
      [shop_id, offer_name, discount_percentage, start_date, end_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Offer updated successfully.',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/offers/:id
 */
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM OFFER WHERE offer_id = $1 RETURNING offer_id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    return res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
