-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 10: 35 Advanced Management & Analytical Reports
-- Database: Mini_project_172_173
-- Real-time analytics across Sales, Customers, Inventory, Parking, Events, etc.
-- ============================================================================

-- ============================================================================
-- SECTION 1: SALES & REVENUE REPORTS (R01 - R05)
-- ============================================================================

-- R01: Monthly Sales Trend (Revenue & Order Counts)
SELECT
    TO_CHAR(purchase_date, 'YYYY-MM') AS sales_month,
    COUNT(purchase_id) AS total_orders,
    SUM(total_amount) AS monthly_revenue,
    ROUND(AVG(total_amount), 2) AS avg_basket_size
FROM PURCHASE
GROUP BY TO_CHAR(purchase_date, 'YYYY-MM')
ORDER BY sales_month ASC;

-- R02: Top 5 Highest Performing Shops by Revenue
SELECT
    s.shop_id,
    s.shop_name,
    s.category,
    s.floor,
    COUNT(p.purchase_id) AS total_bills,
    SUM(p.total_amount) AS total_gross_revenue,
    ROUND(AVG(p.total_amount), 2) AS average_bill_amount
FROM SHOP s
JOIN PURCHASE p ON s.shop_id = p.shop_id
GROUP BY s.shop_id, s.shop_name, s.category, s.floor
ORDER BY total_gross_revenue DESC
LIMIT 5;

-- R03: Category-wise Sales Distribution & Percentage Contribution
SELECT
    pr.category,
    COUNT(DISTINCT p.purchase_id) AS orders_count,
    SUM(pd.quantity) AS units_sold,
    SUM(pd.quantity * pd.unit_price - pd.discount) AS category_revenue,
    ROUND((SUM(pd.quantity * pd.unit_price - pd.discount) * 100.0 /
          (SELECT SUM(quantity * unit_price - discount) FROM PURCHASE_DETAIL)), 2) AS revenue_share_pct
FROM PURCHASE_DETAIL pd
JOIN PRODUCT pr ON pd.product_id = pr.product_id
JOIN PURCHASE p ON pd.purchase_id = p.purchase_id
GROUP BY pr.category
ORDER BY category_revenue DESC;

-- R04: Floor-wise Retail Performance
SELECT
    s.floor,
    COUNT(DISTINCT s.shop_id) AS active_shops,
    COUNT(p.purchase_id) AS total_purchases,
    SUM(p.total_amount) AS total_floor_revenue
FROM SHOP s
LEFT JOIN PURCHASE p ON s.shop_id = p.shop_id
GROUP BY s.floor
ORDER BY total_floor_revenue DESC;

-- R05: Daily Sales Breakdown for Current Month
SELECT
    DATE(purchase_date) AS transaction_date,
    COUNT(*) AS transactions_count,
    SUM(total_amount) AS daily_revenue
FROM PURCHASE
WHERE EXTRACT(MONTH FROM purchase_date) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY DATE(purchase_date)
ORDER BY transaction_date DESC;


-- ============================================================================
-- SECTION 2: CUSTOMER ANALYTICS REPORTS (R06 - R09)
-- ============================================================================

-- R06: Customer Tier Classification & Lifetime Value
SELECT
    c.customer_id,
    c.customer_name,
    c.phone,
    m.membership_type,
    m.points,
    COUNT(p.purchase_id) AS purchase_frequency,
    COALESCE(SUM(p.total_amount), 0.00) AS lifetime_expenditure,
    CASE
        WHEN COALESCE(SUM(p.total_amount), 0.00) >= 50000 THEN 'VIP Elite'
        WHEN COALESCE(SUM(p.total_amount), 0.00) >= 15000 THEN 'High Value'
        WHEN COALESCE(SUM(p.total_amount), 0.00) >= 5000  THEN 'Mid Tier'
        ELSE 'Occasional'
    END AS customer_segment
FROM CUSTOMER c
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
LEFT JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name, c.phone, m.membership_type, m.points
ORDER BY lifetime_expenditure DESC;

-- R07: Churn Risk Analysis (Customers without purchases in the last 60 days)
SELECT
    c.customer_id,
    c.customer_name,
    c.phone,
    c.email,
    MAX(p.purchase_date) AS last_activity_date,
    CURRENT_DATE - DATE(MAX(p.purchase_date)) AS days_inactive
FROM CUSTOMER c
LEFT JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name, c.phone, c.email
HAVING MAX(p.purchase_date) IS NULL OR (CURRENT_DATE - DATE(MAX(p.purchase_date))) > 60
ORDER BY days_inactive DESC;

-- R08: New Customer Acquisition by Month
SELECT
    TO_CHAR(registration_date, 'YYYY-MM') AS acquisition_month,
    COUNT(*) AS new_customers_onboarded
FROM CUSTOMER
GROUP BY TO_CHAR(registration_date, 'YYYY-MM')
ORDER BY acquisition_month ASC;

-- R09: Loyalty Points Liability Report
SELECT
    membership_type,
    COUNT(*) AS members_count,
    SUM(points) AS total_points_outstanding,
    ROUND(AVG(points), 1) AS avg_points_per_member,
    (SUM(points) * 0.50) AS points_monetary_value_rupees -- 1 point = ₹0.50 redemption value
FROM MEMBERSHIP
WHERE status = 'Active'
GROUP BY membership_type
ORDER BY total_points_outstanding DESC;


-- ============================================================================
-- SECTION 3: PRODUCT & INVENTORY REPORTS (R10 - R13)
-- ============================================================================

-- R10: Inventory Stockout Alert (Items with Stock < 15)
SELECT
    pr.product_id,
    pr.product_name,
    s.shop_name,
    s.floor,
    pr.category,
    pr.price,
    pr.stock_quantity,
    CASE
        WHEN pr.stock_quantity = 0 THEN 'CRITICAL: OUT OF STOCK'
        WHEN pr.stock_quantity <= 10 THEN 'WARNING: REORDER NOW'
        ELSE 'LOW STOCK'
    END AS urgency_status
FROM PRODUCT pr
JOIN SHOP s ON pr.shop_id = s.shop_id
WHERE pr.stock_quantity < 15
ORDER BY pr.stock_quantity ASC;

-- R11: Top 10 Best Selling Products by Volume & Revenue
SELECT
    pr.product_id,
    pr.product_name,
    s.shop_name,
    pr.category,
    SUM(pd.quantity) AS total_units_sold,
    SUM(pd.quantity * pd.unit_price - pd.discount) AS gross_sales_value
FROM PRODUCT pr
JOIN SHOP s ON pr.shop_id = s.shop_id
JOIN PURCHASE_DETAIL pd ON pr.product_id = pd.product_id
GROUP BY pr.product_id, pr.product_name, s.shop_name, pr.category
ORDER BY total_units_sold DESC
LIMIT 10;

-- R12: Slow Moving Inventory (Products unsold or with 0 sales)
SELECT
    pr.product_id,
    pr.product_name,
    s.shop_name,
    pr.category,
    pr.price,
    pr.stock_quantity,
    (pr.price * pr.stock_quantity) AS tied_up_capital
FROM PRODUCT pr
JOIN SHOP s ON pr.shop_id = s.shop_id
LEFT JOIN PURCHASE_DETAIL pd ON pr.product_id = pd.product_id
WHERE pd.purchase_detail_id IS NULL
ORDER BY tied_up_capital DESC;

-- R13: Total Inventory Valuation per Shop
SELECT
    s.shop_id,
    s.shop_name,
    s.category,
    COUNT(pr.product_id) AS total_skus,
    SUM(pr.stock_quantity) AS total_units_in_stock,
    SUM(pr.price * pr.stock_quantity) AS total_inventory_value
FROM SHOP s
JOIN PRODUCT pr ON s.shop_id = pr.shop_id
GROUP BY s.shop_id, s.shop_name, s.category
ORDER BY total_inventory_value DESC;


-- ============================================================================
-- SECTION 4: PARKING OPERATIONS REPORTS (R14 - R17)
-- ============================================================================

-- R14: Parking Occupancy Snapshot by Floor & Vehicle Type
SELECT
    floor,
    vehicle_type,
    COUNT(*) AS total_slots,
    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_slots,
    SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_slots,
    ROUND((SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) AS occupancy_rate_pct
FROM PARKING_SLOT
GROUP BY floor, vehicle_type
ORDER BY floor, vehicle_type;

-- R15: Parking Revenue Collection by Payment Status & Date
SELECT
    DATE(entry_time) AS parking_date,
    COUNT(entry_id) AS total_vehicles_served,
    SUM(parking_fee) AS total_fees_collected,
    ROUND(AVG(parking_fee), 2) AS avg_fee_per_vehicle
FROM PARKING_ENTRY
WHERE exit_time IS NOT NULL
GROUP BY DATE(entry_time)
ORDER BY parking_date DESC;

-- R16: Peak Parking Hours Analysis
SELECT
    EXTRACT(HOUR FROM entry_time) AS entry_hour,
    COUNT(*) AS vehicle_arrivals_count
FROM PARKING_ENTRY
GROUP BY EXTRACT(HOUR FROM entry_time)
ORDER BY vehicle_arrivals_count DESC;

-- R17: Overstaying / Currently Parked Vehicles Audit
SELECT
    pe.entry_id,
    v.vehicle_number,
    v.vehicle_type,
    ps.slot_number,
    ps.floor,
    pe.entry_time,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - pe.entry_time)) / 3600.0, 1) AS hours_parked,
    c.customer_name,
    c.phone
FROM PARKING_ENTRY pe
JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
JOIN PARKING_SLOT ps ON pe.slot_id = ps.slot_id
LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
WHERE pe.exit_time IS NULL
ORDER BY pe.entry_time ASC;


-- ============================================================================
-- SECTION 5: EVENT MANAGEMENT REPORTS (R18 - R20)
-- ============================================================================

-- R18: Event Roster & Attendance Turnout Performance
SELECT
    e.event_id,
    e.event_name,
    e.event_date,
    e.location,
    e.capacity,
    COUNT(er.registration_id) AS registrations,
    SUM(CASE WHEN er.attendance_status = 'Present' THEN 1 ELSE 0 END) AS actual_attendees,
    ROUND((COUNT(er.registration_id) * 100.0 / e.capacity), 1) AS capacity_booking_pct,
    CASE
        WHEN COUNT(er.registration_id) = 0 THEN 0.0
        ELSE ROUND((SUM(CASE WHEN er.attendance_status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(er.registration_id)), 1)
    END AS actual_turnout_pct
FROM EVENT e
LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
GROUP BY e.event_id, e.event_name, e.event_date, e.location, e.capacity
ORDER BY e.event_date DESC;

-- R19: Most Engaged Event Attendees
SELECT
    c.customer_id,
    c.customer_name,
    c.phone,
    c.email,
    COUNT(er.registration_id) AS events_signed_up,
    SUM(CASE WHEN er.attendance_status = 'Present' THEN 1 ELSE 0 END) AS attended_events
FROM CUSTOMER c
JOIN EVENT_REGISTRATION er ON c.customer_id = er.customer_id
GROUP BY c.customer_id, c.customer_name, c.phone, c.email
ORDER BY events_signed_up DESC;

-- R20: Upcoming Mall Events Schedule
SELECT
    event_id,
    event_name,
    event_date,
    start_time,
    end_time,
    location,
    capacity,
    (event_date - CURRENT_DATE) AS days_until_event
FROM EVENT
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;


-- ============================================================================
-- SECTION 6: COMPLAINT MANAGEMENT REPORTS (R21 - R23)
-- ============================================================================

-- R21: Complaint Resolution SLA and Aging Report
SELECT
    co.complaint_id,
    co.complaint_type,
    co.priority,
    co.status,
    co.complaint_date,
    co.resolution_date,
    CASE
        WHEN co.status = 'Resolved' THEN (co.resolution_date - co.complaint_date)
        ELSE (CURRENT_DATE - co.complaint_date)
    END AS turnaround_days,
    cu.customer_name,
    emp.employee_name AS handler_name
FROM COMPLAINT co
JOIN CUSTOMER cu ON co.customer_id = cu.customer_id
LEFT JOIN COMPLAINT_ASSIGNMENT ca ON co.complaint_id = ca.complaint_id
LEFT JOIN EMPLOYEE emp ON ca.employee_id = emp.employee_id
ORDER BY turnaround_days DESC;

-- R22: Complaints Breakdown by Priority & Status
SELECT
    priority,
    COUNT(*) AS total_complaints,
    SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count,
    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed_count
FROM COMPLAINT
GROUP BY priority
ORDER BY total_complaints DESC;

-- R23: Most Frequent Grievance Categories
SELECT
    complaint_type,
    COUNT(*) AS occurrences,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM COMPLAINT)), 1) AS category_pct
FROM COMPLAINT
GROUP BY complaint_type
ORDER BY occurrences DESC;


-- ============================================================================
-- SECTION 7: MAINTENANCE FACILITY REPORTS (R24 - R26)
-- ============================================================================

-- R24: Maintenance Request Status by Department & Issue Type
SELECT
    issue_type,
    status,
    COUNT(*) AS requests_count
FROM MAINTENANCE_REQUEST
GROUP BY issue_type, status
ORDER BY issue_type, status;

-- R25: Open Maintenance Work Orders Requiring Immediate Action
SELECT
    mr.request_id,
    mr.issue_type,
    mr.description,
    mr.request_date,
    (CURRENT_DATE - mr.request_date) AS pending_days,
    emp.employee_name AS assigned_technician,
    emp.phone AS technician_phone
FROM MAINTENANCE_REQUEST mr
LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON mr.request_id = ma.request_id
LEFT JOIN EMPLOYEE emp ON ma.employee_id = emp.employee_id
WHERE mr.status IN ('Pending', 'In Progress')
ORDER BY pending_days DESC;

-- R26: Maintenance Workload Distribution per Technician
SELECT
    emp.employee_id,
    emp.employee_name,
    emp.department,
    COUNT(ma.assignment_id) AS total_assigned_jobs,
    SUM(CASE WHEN ma.assignment_status = 'Completed' THEN 1 ELSE 0 END) AS jobs_completed,
    SUM(CASE WHEN ma.assignment_status <> 'Completed' THEN 1 ELSE 0 END) AS jobs_pending
FROM EMPLOYEE emp
JOIN MAINTENANCE_ASSIGNMENT ma ON emp.employee_id = ma.employee_id
GROUP BY emp.employee_id, emp.employee_name, emp.department
ORDER BY jobs_pending DESC;


-- ============================================================================
-- SECTION 8: COMMERCIAL LEASING REPORTS (R27 - R29)
-- ============================================================================

-- R27: Lease Expiry Pipeline (Leases Expiring in Next 365 Days)
SELECT
    l.lease_id,
    s.shop_name,
    t.tenant_name,
    t.contact_no,
    l.lease_end,
    (l.lease_end - CURRENT_DATE) AS days_until_expiry,
    l.monthly_rent,
    l.lease_status
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
JOIN TENANT t ON l.tenant_id = t.tenant_id
WHERE l.lease_end BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '365 days')
ORDER BY l.lease_end ASC;

-- R28: Commercial Space Rent Realization per Square Category
SELECT
    s.category,
    COUNT(l.lease_id) AS occupied_units,
    SUM(l.monthly_rent) AS aggregate_monthly_rent,
    ROUND(AVG(l.monthly_rent), 2) AS mean_unit_rent
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
WHERE l.lease_status = 'Active'
GROUP BY s.category
ORDER BY aggregate_monthly_rent DESC;

-- R29: Overall Mall Occupancy Status (Leased vs Vacant Units)
SELECT
    s.shop_id,
    s.shop_name,
    s.floor,
    s.category,
    CASE
        WHEN l.lease_id IS NOT NULL AND l.lease_status = 'Active' THEN 'Occupied / Leased'
        ELSE 'Vacant / Available for Lease'
    END AS tenancy_status,
    l.monthly_rent
FROM SHOP s
LEFT JOIN LEASE l ON s.shop_id = l.shop_id AND l.lease_status = 'Active'
ORDER BY s.floor, s.shop_name;


-- ============================================================================
-- SECTION 9: PAYMENT CHANNEL REPORTS (R30 - R32)
-- ============================================================================

-- R30: Payment Method Revenue Volume & Market Share
SELECT
    payment_method,
    COUNT(payment_id) AS transaction_count,
    SUM(amount) AS total_settled_amount,
    ROUND((SUM(amount) * 100.0 / (SELECT SUM(amount) FROM PAYMENT)), 2) AS value_market_share_pct
FROM PAYMENT
WHERE payment_status = 'Completed'
GROUP BY payment_method
ORDER BY total_settled_amount DESC;

-- R31: Daily Payment Processing Volume
SELECT
    DATE(payment_date) AS payment_day,
    COUNT(*) AS daily_transactions,
    SUM(amount) AS daily_collected
FROM PAYMENT
GROUP BY DATE(payment_date)
ORDER BY payment_day DESC;

-- R32: Average Ticket Size by Payment Method
SELECT
    payment_method,
    ROUND(AVG(amount), 2) AS average_ticket_size,
    MIN(amount) AS min_transaction,
    MAX(amount) AS max_transaction
FROM PAYMENT
GROUP BY payment_method
ORDER BY average_ticket_size DESC;


-- ============================================================================
-- SECTION 10: PROMOTIONAL OFFERS & CAMPAIGN ROI (R33 - R35)
-- ============================================================================

-- R33: Offer Redemption & Revenue Impact Report
SELECT
    o.offer_id,
    o.offer_name,
    s.shop_name,
    o.discount_percentage,
    COUNT(ou.usage_id) AS total_redemptions,
    COALESCE(SUM(p.total_amount), 0.00) AS gross_sales_attributed,
    COALESCE(ROUND(AVG(p.total_amount), 2), 0.00) AS avg_basket_size_with_offer
FROM OFFER o
JOIN SHOP s ON o.shop_id = s.shop_id
LEFT JOIN OFFER_USAGE ou ON o.offer_id = ou.offer_id
LEFT JOIN PURCHASE p ON ou.purchase_id = p.purchase_id
GROUP BY o.offer_id, o.offer_name, s.shop_name, o.discount_percentage
ORDER BY total_redemptions DESC;

-- R34: Customer Coupon Utilization Habits
SELECT
    c.customer_id,
    c.customer_name,
    m.membership_type,
    COUNT(ou.usage_id) AS coupons_used,
    SUM(p.total_amount) AS total_spending_on_promotions
FROM CUSTOMER c
JOIN OFFER_USAGE ou ON c.customer_id = ou.customer_id
JOIN PURCHASE p ON ou.purchase_id = p.purchase_id
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
GROUP BY c.customer_id, c.customer_name, m.membership_type
ORDER BY coupons_used DESC;

-- R35: Active vs Inactive Promotional Campaigns
SELECT
    CASE
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'Active'
        WHEN CURRENT_DATE > end_date THEN 'Concluded'
        ELSE 'Scheduled / Upcoming'
    END AS campaign_lifecycle,
    COUNT(*) AS total_campaigns,
    ROUND(AVG(discount_percentage), 1) AS avg_discount_pct
FROM OFFER
GROUP BY
    CASE
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'Active'
        WHEN CURRENT_DATE > end_date THEN 'Concluded'
        ELSE 'Scheduled / Upcoming'
    END;
