/**
 * Dashboard Controller
 * Aggregates Executive KPIs, Visual Chart Data, and Real-Time Operational Signals
 * ALL METRICS DERIVED DIRECTLY FROM POSTGRESQL (No Mock/Hardcoded Data)
 */

const db = require('../config/db');

/**
 * GET /api/dashboard/summary
 * Returns the 10 Required KPI Cards & System High-Level Totals
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Total Customers
    const custRes = await db.query(`SELECT COUNT(*) AS total_customers FROM CUSTOMER`);
    // 2. Total Shops
    const shopRes = await db.query(`SELECT COUNT(*) AS total_shops FROM SHOP`);
    // 3. Total Products
    const prodRes = await db.query(`SELECT COUNT(*) AS total_products FROM PRODUCT`);
    // 4. Total Purchases
    const purRes = await db.query(`SELECT COUNT(*) AS total_purchases FROM PURCHASE`);
    // 5. Total Sales (Gross Sales Revenue)
    const salesRes = await db.query(`SELECT COALESCE(SUM(total_amount), 0.00) AS total_sales FROM PURCHASE`);
    // 6. Active Leases
    const leaseRes = await db.query(`SELECT COUNT(*) AS active_leases FROM LEASE WHERE lease_status = 'Active'`);
    // 7. Available Parking Slots (calls fn_get_available_parking_slots)
    const parkRes = await db.query(`SELECT fn_get_available_parking_slots(NULL) AS available_parking_slots`);
    // 8. Upcoming Events
    const eventRes = await db.query(`SELECT COUNT(*) AS upcoming_events FROM EVENT WHERE event_date >= CURRENT_DATE`);
    // 9. Open Complaints
    const compRes = await db.query(`SELECT COUNT(*) AS open_complaints FROM COMPLAINT WHERE status <> 'Resolved' AND status <> 'Closed'`);
    // 10. Pending Maintenance
    const maintRes = await db.query(`SELECT COUNT(*) AS pending_maintenance FROM MAINTENANCE_REQUEST WHERE status <> 'Completed'`);

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers: parseInt(custRes.rows[0].total_customers, 10),
        totalShops: parseInt(shopRes.rows[0].total_shops, 10),
        totalProducts: parseInt(prodRes.rows[0].total_products, 10),
        totalPurchases: parseInt(purRes.rows[0].total_purchases, 10),
        totalSales: parseFloat(salesRes.rows[0].total_sales),
        activeLeases: parseInt(leaseRes.rows[0].active_leases, 10),
        availableParkingSlots: parseInt(parkRes.rows[0].available_parking_slots, 10),
        upcomingEvents: parseInt(eventRes.rows[0].upcoming_events, 10),
        openComplaints: parseInt(compRes.rows[0].open_complaints, 10),
        pendingMaintenance: parseInt(maintRes.rows[0].pending_maintenance, 10),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/charts
 * Returns dataset for all 9 required charts:
 * 1. Sales by Shop
 * 2. Monthly Sales
 * 3. Top Products
 * 4. Customer Purchase Patterns (Repeat vs One-time)
 * 5. Parking Usage by Floor & Status
 * 6. Event Registrations & Turnout
 * 7. Complaint Status
 * 8. Maintenance Status
 * 9. Payment Methods
 */
const getDashboardCharts = async (req, res, next) => {
  try {
    // 1. Sales by Shop (From v_shop_sales_summary)
    const salesByShop = await db.query(
      `SELECT shop_name, total_revenue
       FROM v_shop_sales_summary
       ORDER BY total_revenue DESC LIMIT 8`
    );

    // 2. Monthly Sales
    const monthlySales = await db.query(
      `SELECT
         TO_CHAR(purchase_date, 'Mon YYYY') AS month,
         COUNT(purchase_id) AS order_count,
         SUM(total_amount) AS revenue
       FROM PURCHASE
       GROUP BY TO_CHAR(purchase_date, 'YYYY-MM'), TO_CHAR(purchase_date, 'Mon YYYY')
       ORDER BY TO_CHAR(purchase_date, 'YYYY-MM') ASC`
    );

    // 3. Top Products
    const topProducts = await db.query(
      `SELECT pr.product_name, SUM(pd.quantity) AS quantity_sold, SUM(pd.quantity * pd.unit_price - pd.discount) AS sales_value
       FROM PRODUCT pr
       JOIN PURCHASE_DETAIL pd ON pr.product_id = pd.product_id
       GROUP BY pr.product_id, pr.product_name
       ORDER BY quantity_sold DESC LIMIT 6`
    );

    // 4. Customer Purchase Patterns (Frequency Distribution)
    const customerPatterns = await db.query(
      `SELECT
         CASE
           WHEN purchase_count = 1 THEN '1 Purchase'
           WHEN purchase_count = 2 THEN '2 Purchases'
           WHEN purchase_count >= 3 THEN '3+ Purchases (Loyal)'
           ELSE 'No Purchases'
         END AS segment,
         COUNT(*) AS customer_count
       FROM (
         SELECT c.customer_id, COUNT(p.purchase_id) AS purchase_count
         FROM CUSTOMER c
         LEFT JOIN PURCHASE p ON c.customer_id = p.customer_id
         GROUP BY c.customer_id
       ) sub
       GROUP BY segment`
    );

    // 5. Parking Usage (Slot counts by Floor & Status)
    const parkingUsage = await db.query(
      `SELECT floor, status, COUNT(*) AS slot_count
       FROM PARKING_SLOT
       GROUP BY floor, status
       ORDER BY floor, status`
    );

    // 6. Event Registrations
    const eventRegistrations = await db.query(
      `SELECT e.event_name, COUNT(er.registration_id) AS registered, e.capacity
       FROM EVENT e
       LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
       GROUP BY e.event_id, e.event_name, e.capacity
       ORDER BY registered DESC`
    );

    // 7. Complaint Status
    const complaintStatus = await db.query(
      `SELECT status, COUNT(*) AS count
       FROM COMPLAINT
       GROUP BY status`
    );

    // 8. Maintenance Status
    const maintenanceStatus = await db.query(
      `SELECT status, COUNT(*) AS count
       FROM MAINTENANCE_REQUEST
       GROUP BY status`
    );

    // 9. Payment Methods
    const paymentMethods = await db.query(
      `SELECT payment_method, COUNT(*) AS count, SUM(amount) AS total_amount
       FROM PAYMENT
       GROUP BY payment_method
       ORDER BY total_amount DESC`
    );

    return res.status(200).json({
      success: true,
      data: {
        salesByShop: salesByShop.rows,
        monthlySales: monthlySales.rows,
        topProducts: topProducts.rows,
        customerPatterns: customerPatterns.rows,
        parkingUsage: parkingUsage.rows,
        eventRegistrations: eventRegistrations.rows,
        complaintStatus: complaintStatus.rows,
        maintenanceStatus: maintenanceStatus.rows,
        paymentMethods: paymentMethods.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardCharts,
};
