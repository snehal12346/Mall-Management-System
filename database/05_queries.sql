-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 05: 60 Comprehensive SQL Queries
-- Database: Mini_project_172_173
-- Demonstrates: SELECT, WHERE, ORDER BY, DISTINCT, JOINs, GROUP BY, HAVING,
-- Aggregates (COUNT, SUM, AVG, MIN, MAX), CASE, Subqueries, Date/Time
-- ============================================================================

-- ============================================================================
-- MODULE 1: CUSTOMER & MEMBERSHIP (Q01 - Q06)
-- ============================================================================

-- Q01: List all registered customers sorted alphabetically by name
SELECT customer_id, customer_name, phone, email, registration_date
FROM CUSTOMER
ORDER BY customer_name ASC;

-- Q02: Find distinct email domains used by customers
SELECT DISTINCT SUBSTRING(email FROM POSITION('@' IN email) + 1) AS email_domain
FROM CUSTOMER
WHERE email IS NOT NULL;

-- Q03: Active Platinum and Gold members with their current point balances
SELECT c.customer_id, c.customer_name, m.membership_type, m.points, m.join_date
FROM CUSTOMER c
JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
WHERE m.status = 'Active' AND m.membership_type IN ('Platinum', 'Gold')
ORDER BY m.points DESC;

-- Q04: Count of customers registered grouped by membership tier
SELECT m.membership_type, COUNT(c.customer_id) AS total_customers, AVG(m.points) AS avg_loyalty_points
FROM CUSTOMER c
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
GROUP BY m.membership_type
ORDER BY total_customers DESC;

-- Q05: Customers who registered in 2026 but do not have an active membership
SELECT c.customer_id, c.customer_name, c.email, c.registration_date
FROM CUSTOMER c
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
WHERE m.membership_id IS NULL OR m.status <> 'Active';

-- Q06: Customers with more than 1000 loyalty points and their account age in months
SELECT c.customer_name, m.membership_type, m.points,
       EXTRACT(MONTH FROM AGE(CURRENT_DATE, m.join_date)) AS membership_age_months
FROM CUSTOMER c
JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
WHERE m.points > 1000
ORDER BY m.points DESC;


-- ============================================================================
-- MODULE 2: SHOP, TENANT & LEASE (Q07 - Q13)
-- ============================================================================

-- Q07: Shops grouped by floor with contact numbers
SELECT floor, shop_id, shop_name, category, contact_no
FROM SHOP
ORDER BY floor, shop_name;

-- Q08: Count of shops in each category
SELECT category, COUNT(*) AS number_of_shops
FROM SHOP
GROUP BY category
ORDER BY number_of_shops DESC;

-- Q09: Active leases with tenant details and monthly rent
SELECT l.lease_id, s.shop_name, s.floor, t.tenant_name, t.contact_no, l.monthly_rent, l.lease_start, l.lease_end
FROM LEASE l
INNER JOIN SHOP s ON l.shop_id = s.shop_id
INNER JOIN TENANT t ON l.tenant_id = t.tenant_id
WHERE l.lease_status = 'Active'
ORDER BY l.monthly_rent DESC;

-- Q10: Total rental income per floor for active leases
SELECT s.floor, COUNT(l.lease_id) AS leased_shops, SUM(l.monthly_rent) AS total_monthly_revenue
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
WHERE l.lease_status = 'Active'
GROUP BY s.floor
ORDER BY total_monthly_revenue DESC;

-- Q11: Expired leases or leases expiring within the year 2026
SELECT l.lease_id, s.shop_name, t.tenant_name, l.lease_end, l.lease_status
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
JOIN TENANT t ON l.tenant_id = t.tenant_id
WHERE l.lease_status = 'Expired' OR (l.lease_end BETWEEN '2026-01-01' AND '2026-12-31')
ORDER BY l.lease_end ASC;

-- Q12: Average rent by shop category with minimum and maximum rent
SELECT s.category,
       ROUND(AVG(l.monthly_rent), 2) AS avg_rent,
       MIN(l.monthly_rent) AS min_rent,
       MAX(l.monthly_rent) AS max_rent
FROM LEASE l
JOIN SHOP s ON l.shop_id = s.shop_id
GROUP BY s.category
ORDER BY avg_rent DESC;

-- Q13: Tenants paying higher than the overall average mall rent (Subquery)
SELECT t.tenant_name, s.shop_name, l.monthly_rent
FROM LEASE l
JOIN TENANT t ON l.tenant_id = t.tenant_id
JOIN SHOP s ON l.shop_id = s.shop_id
WHERE l.monthly_rent > (SELECT AVG(monthly_rent) FROM LEASE);


-- ============================================================================
-- MODULE 3: PRODUCT & INVENTORY (Q14 - Q19)
-- ============================================================================

-- Q14: All products with prices formatted and stock level status
SELECT product_id, product_name, category, price, stock_quantity,
       CASE
           WHEN stock_quantity = 0 THEN 'Out of Stock'
           WHEN stock_quantity < 15 THEN 'Low Stock'
           WHEN stock_quantity < 50 THEN 'Moderate'
           ELSE 'Well Stocked'
       END AS inventory_health
FROM PRODUCT
ORDER BY stock_quantity ASC;

-- Q15: Products priced above 10,000 INR with their offering shop
SELECT p.product_id, p.product_name, s.shop_name, s.floor, p.price
FROM PRODUCT p
JOIN SHOP s ON p.shop_id = s.shop_id
WHERE p.price >= 10000.00
ORDER BY p.price DESC;

-- Q16: Average, minimum, and maximum product price per shop
SELECT s.shop_name,
       COUNT(p.product_id) AS product_count,
       ROUND(AVG(p.price), 2) AS avg_price,
       MIN(p.price) AS min_price,
       MAX(p.price) AS max_price
FROM SHOP s
JOIN PRODUCT p ON s.shop_id = p.shop_id
GROUP BY s.shop_id, s.shop_name
ORDER BY avg_price DESC;

-- Q17: Total stock value per category (price * stock_quantity)
SELECT category, SUM(price * stock_quantity) AS total_inventory_valuation
FROM PRODUCT
GROUP BY category
ORDER BY total_inventory_valuation DESC;

-- Q18: Products that have never been purchased (Subquery with NOT IN)
SELECT p.product_id, p.product_name, p.price, p.stock_quantity
FROM PRODUCT p
WHERE p.product_id NOT IN (SELECT DISTINCT product_id FROM PURCHASE_DETAIL);

-- Q19: Top 3 most expensive products in each category (Window Function)
SELECT product_id, product_name, category, price,
       DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank
FROM PRODUCT;


-- ============================================================================
-- MODULE 4: PURCHASES & SALES ANALYTICS (Q20 - Q27)
-- ============================================================================

-- Q20: Total sales revenue by shop (From PDF 19.1)
SELECT s.shop_name, SUM(p.total_amount) AS total_sales
FROM SHOP s
JOIN PURCHASE p ON s.shop_id = p.shop_id
GROUP BY s.shop_id, s.shop_name
ORDER BY total_sales DESC;

-- Q21: Popular products by quantity sold (From PDF 19.2)
SELECT pr.product_name, SUM(pd.quantity) AS quantity_sold
FROM PRODUCT pr
JOIN PURCHASE_DETAIL pd ON pr.product_id = pd.product_id
GROUP BY pr.product_id, pr.product_name
ORDER BY quantity_sold DESC;

-- Q22: Returning customers who made more than one purchase (From PDF 19.3)
SELECT c.customer_id, c.customer_name, COUNT(p.purchase_id) AS purchase_count
FROM CUSTOMER c
JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(p.purchase_id) > 1
ORDER BY purchase_count DESC;

-- Q23: Purchases made in March 2026 with customer and shop details
SELECT p.purchase_id, p.purchase_date, c.customer_name, s.shop_name, p.total_amount
FROM PURCHASE p
JOIN CUSTOMER c ON p.customer_id = c.customer_id
JOIN SHOP s ON p.shop_id = s.shop_id
WHERE p.purchase_date >= '2026-03-01 00:00:00' AND p.purchase_date < '2026-04-01 00:00:00'
ORDER BY p.purchase_date DESC;

-- Q24: Detailed line items for purchase ID 5005
SELECT pd.purchase_detail_id, pr.product_name, pd.quantity, pd.unit_price, pd.discount,
       (pd.quantity * pd.unit_price - pd.discount) AS subtotal
FROM PURCHASE_DETAIL pd
JOIN PRODUCT pr ON pd.product_id = pr.product_id
WHERE pd.purchase_id = 5005;

-- Q25: Average order value (AOV) per customer
SELECT c.customer_name,
       COUNT(p.purchase_id) AS orders_placed,
       ROUND(AVG(p.total_amount), 2) AS avg_order_value,
       SUM(p.total_amount) AS lifetime_value
FROM CUSTOMER c
JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY lifetime_value DESC;

-- Q26: Purchases where order total exceeds 25,000 INR
SELECT p.purchase_id, c.customer_name, s.shop_name, p.total_amount
FROM PURCHASE p
JOIN CUSTOMER c ON p.customer_id = c.customer_id
JOIN SHOP s ON p.shop_id = s.shop_id
WHERE p.total_amount > 25000.00
ORDER BY p.total_amount DESC;

-- Q27: Hourly distribution of customer purchases (Peak Shopping Hours)
SELECT EXTRACT(HOUR FROM purchase_date) AS purchase_hour,
       COUNT(*) AS total_transactions,
       SUM(total_amount) AS revenue_in_hour
FROM PURCHASE
GROUP BY EXTRACT(HOUR FROM purchase_date)
ORDER BY purchase_hour;


-- ============================================================================
-- MODULE 5: PAYMENTS (Q28 - Q32)
-- ============================================================================

-- Q28: Payment method usage with transaction count and total volume (From PDF 19.9)
SELECT payment_method, COUNT(*) AS transaction_count, SUM(amount) AS total_amount
FROM PAYMENT
GROUP BY payment_method
ORDER BY total_amount DESC;

-- Q29: Payment status summary
SELECT payment_status, COUNT(*) AS count, SUM(amount) AS total_value
FROM PAYMENT
GROUP BY payment_status;

-- Q30: Payment verification check (Compares payment amount against purchase total)
SELECT py.payment_id, py.purchase_id, py.amount AS paid_amount, pu.total_amount AS invoice_amount,
       (py.amount - pu.total_amount) AS discrepancy
FROM PAYMENT py
JOIN PURCHASE pu ON py.purchase_id = pu.purchase_id
WHERE py.amount <> pu.total_amount;

-- Q31: Recent UPI payments processed
SELECT p.payment_id, c.customer_name, p.amount, p.payment_date
FROM PAYMENT p
JOIN PURCHASE pu ON p.purchase_id = pu.purchase_id
JOIN CUSTOMER c ON pu.customer_id = c.customer_id
WHERE p.payment_method = 'UPI'
ORDER BY p.payment_date DESC;

-- Q32: Percentage share of each payment method
SELECT payment_method,
       COUNT(*) AS tx_count,
       ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM PAYMENT)), 2) AS percentage_share
FROM PAYMENT
GROUP BY payment_method;


-- ============================================================================
-- MODULE 6: VEHICLE & PARKING (Q33 - Q38)
-- ============================================================================

-- Q33: Parking slot count by floor and availability status (From PDF 19.4)
SELECT ps.floor, ps.status, COUNT(*) AS slot_count
FROM PARKING_SLOT ps
GROUP BY ps.floor, ps.status
ORDER BY ps.floor, ps.status;

-- Q34: Count of available slots grouped by vehicle type
SELECT vehicle_type, COUNT(*) AS available_slots
FROM PARKING_SLOT
WHERE status = 'Available'
GROUP BY vehicle_type;

-- Q35: Currently occupied slots with vehicle details and driver name
SELECT ps.slot_number, ps.floor, v.vehicle_number, v.vehicle_type, c.customer_name, pe.entry_time
FROM PARKING_ENTRY pe
JOIN PARKING_SLOT ps ON pe.slot_id = ps.slot_id
JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
LEFT JOIN CUSTOMER c ON v.customer_id = c.customer_id
WHERE pe.exit_time IS NULL;

-- Q36: Total parking fee collected by vehicle type for completed sessions
SELECT v.vehicle_type, COUNT(pe.entry_id) AS trips, SUM(pe.parking_fee) AS total_revenue
FROM PARKING_ENTRY pe
JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
WHERE pe.exit_time IS NOT NULL
GROUP BY v.vehicle_type;

-- Q37: Average parking duration in minutes for exited vehicles
SELECT v.vehicle_type,
       ROUND(AVG(EXTRACT(EPOCH FROM (pe.exit_time - pe.entry_time)) / 60), 1) AS avg_duration_mins
FROM PARKING_ENTRY pe
JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
WHERE pe.exit_time IS NOT NULL
GROUP BY v.vehicle_type;

-- Q38: Vehicles registered by customers owning more than one vehicle
SELECT c.customer_name, COUNT(v.vehicle_id) AS vehicle_count
FROM CUSTOMER c
JOIN VEHICLE v ON c.customer_id = v.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(v.vehicle_id) > 1;


-- ============================================================================
-- MODULE 7: EVENTS & REGISTRATIONS (Q39 - Q43)
-- ============================================================================

-- Q39: Event registrations and attendance summary (From PDF 19.5)
SELECT e.event_name,
       COUNT(er.registration_id) AS registrations,
       SUM(CASE WHEN er.attendance_status = 'Present' THEN 1 ELSE 0 END) AS attended
FROM EVENT e
LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
GROUP BY e.event_id, e.event_name;

-- Q40: Event capacity utilization percentage
SELECT e.event_name, e.event_date, e.capacity,
       COUNT(er.registration_id) AS registered_seats,
       ROUND((COUNT(er.registration_id) * 100.0 / e.capacity), 2) AS occupancy_percent
FROM EVENT e
LEFT JOIN EVENT_REGISTRATION er ON e.event_id = er.event_id
GROUP BY e.event_id, e.event_name, e.event_date, e.capacity;

-- Q41: Upcoming events scheduled after current date
SELECT event_id, event_name, event_date, start_time, location, capacity
FROM EVENT
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;

-- Q42: Customers registered for multiple events
SELECT c.customer_id, c.customer_name, COUNT(er.registration_id) AS registered_events_count
FROM CUSTOMER c
JOIN EVENT_REGISTRATION er ON c.customer_id = er.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(er.registration_id) > 1;

-- Q43: Attendee list for 'Mumbai Summer Shopping Carnival'
SELECT er.registration_id, c.customer_name, c.phone, er.registration_date, er.attendance_status
FROM EVENT_REGISTRATION er
JOIN EVENT e ON er.event_id = e.event_id
JOIN CUSTOMER c ON er.customer_id = c.customer_id
WHERE e.event_name ILIKE '%Shopping Carnival%';


-- ============================================================================
-- MODULE 8: EMPLOYEES & WORKLOAD (Q44 - Q47)
-- ============================================================================

-- Q44: Employee headcount by department
SELECT department, COUNT(*) AS staff_count
FROM EMPLOYEE
GROUP BY department
ORDER BY staff_count DESC;

-- Q45: Complaint assignments count per employee
SELECT e.employee_name, e.department, COUNT(ca.assignment_id) AS assigned_complaints
FROM EMPLOYEE e
LEFT JOIN COMPLAINT_ASSIGNMENT ca ON e.employee_id = ca.employee_id
GROUP BY e.employee_id, e.employee_name, e.department
ORDER BY assigned_complaints DESC;

-- Q46: Maintenance task load per employee
SELECT e.employee_name, e.department, COUNT(ma.assignment_id) AS assigned_tasks
FROM EMPLOYEE e
LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON e.employee_id = ma.employee_id
GROUP BY e.employee_id, e.employee_name, e.department
ORDER BY assigned_tasks DESC;

-- Q47: Cross-department employee workload (Total complaints + maintenance)
SELECT e.employee_name, e.department,
       COUNT(DISTINCT ca.assignment_id) AS complaints_handled,
       COUNT(DISTINCT ma.assignment_id) AS maintenance_handled,
       (COUNT(DISTINCT ca.assignment_id) + COUNT(DISTINCT ma.assignment_id)) AS total_workload
FROM EMPLOYEE e
LEFT JOIN COMPLAINT_ASSIGNMENT ca ON e.employee_id = ca.employee_id
LEFT JOIN MAINTENANCE_ASSIGNMENT ma ON e.employee_id = ma.employee_id
GROUP BY e.employee_id, e.employee_name, e.department
ORDER BY total_workload DESC;


-- ============================================================================
-- MODULE 9: COMPLAINTS (Q48 - Q51)
-- ============================================================================

-- Q48: Pending complaints not resolved (From PDF 19.6)
SELECT complaint_id, complaint_type, status, priority
FROM COMPLAINT
WHERE status <> 'Resolved';

-- Q49: Most common complaint types (From PDF 19.10)
SELECT complaint_type, COUNT(*) AS complaint_count
FROM COMPLAINT
GROUP BY complaint_type
ORDER BY complaint_count DESC;

-- Q50: Urgent and High priority complaints with complainant name
SELECT co.complaint_id, co.complaint_type, co.priority, co.status, cu.customer_name, cu.phone
FROM COMPLAINT co
JOIN CUSTOMER cu ON co.customer_id = cu.customer_id
WHERE co.priority IN ('Urgent', 'High')
ORDER BY co.complaint_date DESC;

-- Q51: Average turnaround resolution time in days for resolved complaints
SELECT complaint_type,
       ROUND(AVG(resolution_date - complaint_date), 1) AS avg_resolution_days
FROM COMPLAINT
WHERE resolution_date IS NOT NULL
GROUP BY complaint_type;


-- ============================================================================
-- MODULE 10: MAINTENANCE OPERATIONS (Q52 - Q55)
-- ============================================================================

-- Q52: Pending maintenance requests (From PDF 19.7)
SELECT request_id, issue_type, status
FROM MAINTENANCE_REQUEST
WHERE status <> 'Completed';

-- Q53: Maintenance requests categorized by issue type with status
SELECT issue_type, status, COUNT(*) AS total_count
FROM MAINTENANCE_REQUEST
GROUP BY issue_type, status
ORDER BY issue_type;

-- Q54: Maintenance requests assigned to technicians with technician phone
SELECT mr.request_id, mr.issue_type, mr.status, emp.employee_name, emp.phone, ma.assignment_status
FROM MAINTENANCE_REQUEST mr
JOIN MAINTENANCE_ASSIGNMENT ma ON mr.request_id = ma.request_id
JOIN EMPLOYEE emp ON ma.employee_id = emp.employee_id
ORDER BY mr.request_date DESC;

-- Q55: Customer-reported vs internally initiated maintenance requests
SELECT CASE WHEN reported_by_customer_id IS NOT NULL THEN 'Customer Reported' ELSE 'Internal Operations' END AS source,
       COUNT(*) AS total_requests
FROM MAINTENANCE_REQUEST
GROUP BY (reported_by_customer_id IS NOT NULL);


-- ============================================================================
-- MODULE 11: OFFERS & CROSS-DOMAIN ANALYTICS (Q56 - Q60)
-- ============================================================================

-- Q56: Active offers currently running with shop name and discount
SELECT o.offer_id, o.offer_name, s.shop_name, o.discount_percentage, o.start_date, o.end_date
FROM OFFER o
JOIN SHOP s ON o.shop_id = s.shop_id
WHERE CURRENT_DATE BETWEEN o.start_date AND o.end_date;

-- Q57: Offer redemption counts and total revenue generated through offers
SELECT o.offer_name, s.shop_name, COUNT(ou.usage_id) AS times_redeemed, SUM(p.total_amount) AS revenue_facilitated
FROM OFFER o
JOIN SHOP s ON o.shop_id = s.shop_id
LEFT JOIN OFFER_USAGE ou ON o.offer_id = ou.offer_id
LEFT JOIN PURCHASE p ON ou.purchase_id = p.purchase_id
GROUP BY o.offer_id, o.offer_name, s.shop_name
ORDER BY times_redeemed DESC;

-- Q58: Top 5 highest spending customers across all shops (Overall VIPs)
SELECT c.customer_id, c.customer_name, c.email, m.membership_type,
       COUNT(p.purchase_id) AS order_count,
       SUM(p.total_amount) AS grand_total_spent
FROM CUSTOMER c
LEFT JOIN MEMBERSHIP m ON c.customer_id = m.customer_id
JOIN PURCHASE p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.customer_name, c.email, m.membership_type
ORDER BY grand_total_spent DESC
LIMIT 5;

-- Q59: Comprehensive mall footfall & activity summary per customer
SELECT c.customer_id, c.customer_name,
       COUNT(DISTINCT p.purchase_id) AS purchases_count,
       COUNT(DISTINCT er.registration_id) AS events_attended,
       COUNT(DISTINCT v.vehicle_id) AS vehicles_owned,
       COUNT(DISTINCT comp.complaint_id) AS complaints_raised
FROM CUSTOMER c
LEFT JOIN PURCHASE p ON c.customer_id = p.customer_id
LEFT JOIN EVENT_REGISTRATION er ON c.customer_id = er.customer_id
LEFT JOIN VEHICLE v ON c.customer_id = v.customer_id
LEFT JOIN COMPLAINT comp ON c.customer_id = comp.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY purchases_count DESC;

-- Q60: Overall mall revenue summary (Shops revenue + Parking fee revenue)
SELECT 'Shop Sales' AS revenue_stream, SUM(total_amount) AS total_revenue FROM PURCHASE
UNION ALL
SELECT 'Parking Collections' AS revenue_stream, COALESCE(SUM(parking_fee), 0) FROM PARKING_ENTRY WHERE exit_time IS NOT NULL;
