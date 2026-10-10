-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 06: Views (12 Business Analytical & Operational Views)
-- Database: Mini_project_172_173
-- Encapsulates complex joins, summaries, and metrics for fast API reporting
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: Customer Purchase Summary
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_customer_purchase_summary CASCADE;
CREATE VIEW v_customer_purchase_summary AS
SELECT
    c.customer_id,
    c.customer_name,
    c.phone,
    c.email,
    m.membership_type,
    COALESCE(m.points, 0) AS loyalty_points,
    COUNT(p.purchase_id) AS total_purchases,
    COALESCE(SUM(p.total_amount), 0.00) AS total_spent,
    MAX(p.purchase_date) AS last_purchase_date
FROM CUSTOMER c
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
LEFT JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name, c.phone, c.email, m.membership_type, m.points;

-- ----------------------------------------------------------------------------
-- 2. VIEW: Shop Sales Summary
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_shop_sales_summary CASCADE;
CREATE VIEW v_shop_sales_summary AS
SELECT
    s.shop_id,
    s.shop_name,
    s.category,
    s.floor,
    s.contact_no,
    COUNT(DISTINCT p.purchase_id) AS total_transactions,
    COALESCE(SUM(p.total_amount), 0.00) AS total_revenue,
    COALESCE(ROUND(AVG(p.total_amount), 2), 0.00) AS avg_transaction_value,
    COUNT(DISTINCT pr.product_id) AS total_products_offered
FROM SHOP s
LEFT JOIN PURCHASE p ON s.shop_id = p.shop_id
LEFT JOIN PRODUCT pr ON s.shop_id = pr.shop_id
GROUP BY s.shop_id, s.shop_name, s.category, s.floor, s.contact_no;

-- ----------------------------------------------------------------------------
-- 3. VIEW: Product Stock & Inventory Status
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_product_stock CASCADE;
CREATE VIEW v_product_stock AS
SELECT
    pr.product_id,
    pr.product_name,
    pr.category,
    pr.price,
    pr.stock_quantity,
    s.shop_id,
    s.shop_name,
    s.floor,
    (pr.price * pr.stock_quantity) AS stock_valuation,
    CASE
        WHEN pr.stock_quantity = 0 THEN 'Out of Stock'
        WHEN pr.stock_quantity < 15 THEN 'Low Stock Warning'
        WHEN pr.stock_quantity < 50 THEN 'Moderate'
        ELSE 'Adequate'
    END AS stock_status,
    COALESCE(SUM(pd.quantity), 0) AS total_units_sold
FROM PRODUCT pr
JOIN SHOP s ON pr.shop_id = s.shop_id
LEFT JOIN PURCHASE_DETAIL pd ON pr.product_id = pd.product_id
GROUP BY pr.product_id, pr.product_name, pr.category, pr.price, pr.stock_quantity, s.shop_id, s.shop_name, s.floor;

-- ----------------------------------------------------------------------------
-- 4. VIEW: Parking Status & Live Availability
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_parking_status CASCADE;
CREATE VIEW v_parking_status AS
SELECT
    ps.slot_id,
    ps.floor,
    ps.slot_number,
    ps.vehicle_type,
    ps.status AS current_slot_status,
    pe.entry_id,
    pe.entry_time,
    v.vehicle_number,
    c.customer_name AS driver_name
FROM PARKING_SLOT ps
LEFT JOIN PARKING_ENTRY pe ON ps.slot_id = pe.slot_id AND pe.exit_time IS NULL
LEFT JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id;

-- ----------------------------------------------------------------------------
-- 5. VIEW: Event Registrations & Capacity Analytics
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_event_registrations CASCADE;
CREATE VIEW v_event_registrations AS
SELECT
    e.event_id,
    e.event_name,
    e.event_date,
    e.start_time,
    e.end_time,
    e.location,
    e.capacity,
    COUNT(er.registration_id) AS total_registered,
    (e.capacity - COUNT(er.registration_id)) AS available_slots,
    ROUND((COUNT(er.registration_id) * 100.0 / e.capacity), 2) AS registration_percentage,
    SUM(CASE WHEN er.attendance_status = 'Present' THEN 1 ELSE 0 END) AS attended_count
FROM EVENT e
LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
GROUP BY e.event_id, e.event_name, e.event_date, e.start_time, e.end_time, e.location, e.capacity;

-- ----------------------------------------------------------------------------
-- 6. VIEW: Complaints Overview
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_complaints CASCADE;
CREATE VIEW v_complaints AS
SELECT
    comp.complaint_id,
    comp.complaint_type,
    comp.description,
    comp.complaint_date,
    comp.status,
    comp.priority,
    comp.resolution_date,
    c.customer_id,
    c.customer_name,
    c.phone AS customer_phone,
    emp.employee_id AS assigned_employee_id,
    emp.employee_name AS assigned_to,
    ca.assignment_status
FROM COMPLAINT comp
JOIN CUSTOMER c ON comp.customer_id = c.customer_id
LEFT JOIN COMPLAINT_ASSIGNMENT ca ON comp.complaint_id = ca.complaint_id
LEFT JOIN EMPLOYEE emp ON ca.employee_id = emp.employee_id;

-- ----------------------------------------------------------------------------
-- 7. VIEW: Maintenance Requests & Tasks
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_maintenance CASCADE;
CREATE VIEW v_maintenance AS
SELECT
    mr.request_id,
    mr.issue_type,
    mr.description,
    mr.request_date,
    mr.status,
    mr.completion_date,
    mr.reported_by_customer_id,
    c.customer_name AS reported_by,
    emp.employee_id AS technician_id,
    emp.employee_name AS technician_name,
    ma.assignment_status
FROM MAINTENANCE_REQUEST mr
LEFT JOIN CUSTOMER c ON mr.reported_by_customer_id = c.customer_id
LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON mr.request_id = ma.request_id
LEFT JOIN EMPLOYEE emp ON ma.employee_id = emp.employee_id;

-- ----------------------------------------------------------------------------
-- 8. VIEW: Leases & Commercial Tenancy
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_leases CASCADE;
CREATE VIEW v_leases AS
SELECT
    l.lease_id,
    s.shop_id,
    s.shop_name,
    s.floor,
    s.category,
    t.tenant_id,
    t.tenant_name,
    t.contact_no AS tenant_contact,
    t.email AS tenant_email,
    l.lease_start,
    l.lease_end,
    l.monthly_rent,
    l.lease_status,
    (l.lease_end - CURRENT_DATE) AS days_remaining
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
JOIN TENANT t ON l.tenant_id = t.tenant_id;

-- ----------------------------------------------------------------------------
-- 9. VIEW: Purchase Details (Itemized Bills)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_purchase_details CASCADE;
CREATE VIEW v_purchase_details AS
SELECT
    pd.purchase_detail_id,
    p.purchase_id,
    p.purchase_date,
    c.customer_id,
    c.customer_name,
    s.shop_id,
    s.shop_name,
    pr.product_id,
    pr.product_name,
    pr.category AS product_category,
    pd.quantity,
    pd.unit_price,
    pd.discount,
    (pd.quantity * pd.unit_price - pd.discount) AS line_total
FROM PURCHASE_DETAIL pd
JOIN PURCHASE p ON pd.purchase_id = p.purchase_id
JOIN CUSTOMER c ON p.customer_id = c.customer_id
JOIN SHOP s ON p.shop_id = s.shop_id
JOIN PRODUCT pr ON pd.product_id = pr.product_id;

-- ----------------------------------------------------------------------------
-- 10. VIEW: Payments Breakdown
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_payments CASCADE;
CREATE VIEW v_payments AS
SELECT
    py.payment_id,
    py.payment_date,
    py.amount,
    py.payment_method,
    py.payment_status,
    p.purchase_id,
    p.total_amount AS invoice_total,
    c.customer_id,
    c.customer_name,
    s.shop_id,
    s.shop_name
FROM PAYMENT py
JOIN PURCHASE p ON py.purchase_id = p.purchase_id
JOIN CUSTOMER c ON p.customer_id = c.customer_id
JOIN SHOP s ON p.shop_id = s.shop_id;

-- ----------------------------------------------------------------------------
-- 11. VIEW: Active Offers & Campaign Performance
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_active_offers_summary CASCADE;
CREATE VIEW v_active_offers_summary AS
SELECT
    o.offer_id,
    o.offer_name,
    s.shop_name,
    s.floor,
    o.discount_percentage,
    o.start_date,
    o.end_date,
    CASE
        WHEN CURRENT_DATE BETWEEN o.start_date AND o.end_date THEN 'Live Now'
        WHEN CURRENT_DATE < o.start_date THEN 'Upcoming'
        ELSE 'Expired'
    END AS campaign_status,
    COUNT(ou.usage_id) AS redemptions_count,
    COALESCE(SUM(p.total_amount), 0.00) AS revenue_driven
FROM OFFER o
JOIN SHOP s ON o.shop_id = s.shop_id
LEFT JOIN OFFER_USAGE ou ON o.offer_id = ou.offer_id
LEFT JOIN PURCHASE p ON ou.purchase_id = p.purchase_id
GROUP BY o.offer_id, o.offer_name, s.shop_name, s.floor, o.discount_percentage, o.start_date, o.end_date;

-- ----------------------------------------------------------------------------
-- 12. VIEW: Employee Workload & Assignment Distribution
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_employee_workload CASCADE;
CREATE VIEW v_employee_workload AS
SELECT
    e.employee_id,
    e.employee_name,
    e.department,
    e.designation,
    e.phone,
    COUNT(DISTINCT ca.assignment_id) AS total_complaints_assigned,
    COUNT(DISTINCT CASE WHEN ca.assignment_status = 'Completed' THEN ca.assignment_id END) AS complaints_resolved,
    COUNT(DISTINCT ma.assignment_id) AS total_maintenance_assigned,
    COUNT(DISTINCT CASE WHEN ma.assignment_status = 'Completed' THEN ma.assignment_id END) AS maintenance_resolved
FROM EMPLOYEE e
LEFT JOIN COMPLAINT_ASSIGNMENT ca ON e.employee_id = ca.employee_id
LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON e.employee_id = ma.employee_id
GROUP BY e.employee_id, e.employee_name, e.department, e.designation, e.phone;
