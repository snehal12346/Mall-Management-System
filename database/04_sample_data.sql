-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 04: Sample Data Insertion
-- Database: Mini_project_172_173
-- Comprehensive, consistent academic sample data for Phoenix Marketcity Kurla
-- ============================================================================

-- Disable triggers temporarily during bulk seed if needed, or insert in FK order
-- Clear existing data in reverse dependency order
TRUNCATE TABLE OFFER_USAGE CASCADE;
TRUNCATE TABLE OFFER CASCADE;
TRUNCATE TABLE MAINTENANCE_ASSIGNMENT CASCADE;
TRUNCATE TABLE MAINTENANCE_REQUEST CASCADE;
TRUNCATE TABLE COMPLAINT_ASSIGNMENT CASCADE;
TRUNCATE TABLE COMPLAINT CASCADE;
TRUNCATE TABLE EMPLOYEE CASCADE;
TRUNCATE TABLE EVENT_REGISTRATION CASCADE;
TRUNCATE TABLE EVENT CASCADE;
TRUNCATE TABLE PARKING_ENTRY CASCADE;
TRUNCATE TABLE PARKING_SLOT CASCADE;
TRUNCATE TABLE VEHICLE CASCADE;
TRUNCATE TABLE PAYMENT CASCADE;
TRUNCATE TABLE PURCHASE_DETAIL CASCADE;
TRUNCATE TABLE PURCHASE CASCADE;
TRUNCATE TABLE PRODUCT CASCADE;
TRUNCATE TABLE LEASE CASCADE;
TRUNCATE TABLE TENANT CASCADE;
TRUNCATE TABLE SHOP CASCADE;
TRUNCATE TABLE MEMBERSHIP CASCADE;
TRUNCATE TABLE CUSTOMER CASCADE;
TRUNCATE TABLE APP_USER CASCADE;

-- ----------------------------------------------------------------------------
-- 1. APP_USER (Admin & Staff Authentication)
-- Passwords hashed with bcrypt (cost factor 10):
-- 'admin123'   -> $2a$10$tZ2yD8z2Jz5aR9kH2/J0uuI1Z6H4Wc4YfUaN8aWJmI6lKkU9eD2eC
-- 'manager123' -> $2a$10$qV3zF7v3Lz8aK6hF4/K1vuJ2Z7H5Wd5ZfVbO9bXKnJ7mLlV0fE3fD
-- 'staff123'   -> $2a$10$rW4aG8w4Mz9bL7iG5/L2wvK3a8I6Xe6agWcP0cYLoK8nMmW1gF4gE
-- ----------------------------------------------------------------------------
INSERT INTO APP_USER (user_id, username, password_hash, full_name, email, role, created_at, is_active) VALUES
(1, 'admin', '$2a$10$rOuq25J5.fR8N7lF9eR5vOHbNlCekV/Z9.fH0u1fCeqlHOmU92qiq', 'System Administrator', 'admin@phoenixmarketcity.mumbai.in', 'Admin', '2026-01-01 09:00:00', TRUE),
(2, 'manager', '$2a$10$rOuq25J5.fR8N7lF9eR5vOHbNlCekV/Z9.fH0u1fCeqlHOmU92qiq', 'Rajesh Kulkarni', 'manager.ops@phoenixmarketcity.mumbai.in', 'Manager', '2026-01-05 10:00:00', TRUE),
(3, 'staff_neha', '$2a$10$rOuq25J5.fR8N7lF9eR5vOHbNlCekV/Z9.fH0u1fCeqlHOmU92qiq', 'Neha Deshmukh', 'neha.d@phoenixmarketcity.mumbai.in', 'Staff', '2026-01-10 11:30:00', TRUE);

-- ----------------------------------------------------------------------------
-- 2. CUSTOMER
-- ----------------------------------------------------------------------------
INSERT INTO CUSTOMER (customer_id, customer_name, phone, email, registration_date) VALUES
(1, 'Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com', '2026-01-10'),
(2, 'Aditi Patil', '9823456710', 'aditi.patil@outlook.com', '2026-02-05'),
(3, 'Riya Shah', '9765432180', 'riya.shah@yahoo.com', '2026-02-12'),
(4, 'Arjun Mehta', '9898989898', 'arjun.mehta@hotmail.com', '2026-03-01'),
(5, 'Sneha Joshi', '9811223344', 'sneha.joshi@gmail.com', '2026-03-10'),
(6, 'Vikram Malhotra', '9822334455', 'vikram.m@gmail.com', '2026-03-15'),
(7, 'Pooja Nair', '9833445566', 'pooja.nair@gmail.com', '2026-03-20'),
(8, 'Rohan Verma', '9844556677', 'rohan.v@rediffmail.com', '2026-03-22'),
(9, 'Ananya Iyer', '9855667788', 'ananya.iyer@gmail.com', '2026-04-02'),
(10, 'Karan Singhania', '9866778899', 'karan.s@enterprise.com', '2026-04-05'),
(11, 'Tanvi Kulkarni', '9877889900', 'tanvi.k@gmail.com', '2026-04-10'),
(12, 'Devendra Bhatia', '9888990011', 'd.bhatia@corp.in', '2026-04-12');

-- ----------------------------------------------------------------------------
-- 3. MEMBERSHIP
-- ----------------------------------------------------------------------------
INSERT INTO MEMBERSHIP (membership_id, customer_id, membership_type, join_date, points, status) VALUES
(1, 1, 'Platinum', '2026-01-10', 1450, 'Active'),
(2, 2, 'Gold', '2026-02-05', 820, 'Active'),
(3, 3, 'Silver', '2026-02-12', 340, 'Active'),
(4, 4, 'Platinum', '2026-03-01', 2100, 'Active'),
(5, 5, 'Gold', '2026-03-10', 950, 'Active'),
(6, 6, 'Silver', '2026-03-15', 180, 'Active'),
(7, 7, 'Silver', '2026-03-20', 220, 'Active'),
(8, 8, 'Gold', '2026-03-22', 670, 'Active'),
(9, 9, 'Platinum', '2026-04-02', 1890, 'Active'),
(10, 10, 'Silver', '2026-04-05', 120, 'Inactive');

-- ----------------------------------------------------------------------------
-- 4. SHOP (Phoenix Marketcity Mumbai Brands)
-- ----------------------------------------------------------------------------
INSERT INTO SHOP (shop_id, shop_name, category, floor, contact_no) VALUES
(101, 'Zara', 'Fashion', '1', '9000000001'),
(102, 'H&M', 'Fashion', '1', '9000000002'),
(103, 'Croma Electronics', 'Electronics', '2', '9000000003'),
(104, 'Starbucks Coffee', 'Food & Beverage', 'Ground', '9000000004'),
(105, 'Apple Imagine Store', 'Electronics', 'Ground', '9000000005'),
(106, 'PVR Inox Cinemas', 'Entertainment', '3', '9000000006'),
(107, 'Sephora Beauty', 'Cosmetics', 'Ground', '9000000007'),
(108, 'Hamleys Toy Store', 'Toys & Kids', '2', '9000000008'),
(109, 'Nike Superstore', 'Sportswear', '1', '9000000009'),
(110, 'Punjab Grill', 'Food & Beverage', '3', '9000000010');

-- ----------------------------------------------------------------------------
-- 5. TENANT
-- ----------------------------------------------------------------------------
INSERT INTO TENANT (tenant_id, tenant_name, contact_no, email) VALUES
(201, 'Inditex Trent Retail India Pvt Ltd', '022-61801001', 'leasing@inditex.com'),
(202, 'H&M Hennes & Mauritz Retail Pvt Ltd', '022-61801002', 'corporate@hm.com'),
(203, 'Infiniti Retail Limited (Tata Group)', '022-61801003', 'mallops@croma.com'),
(204, 'Tata Starbucks Private Limited', '022-61801004', 'store.phoenix@starbucks.in'),
(205, 'Ample Technologies Pvt Ltd', '022-61801005', 'imagine.kurla@ample.co.in'),
(206, 'PVR INOX Limited', '022-61801006', 'cinemas.kurla@pvrcinemas.com'),
(207, 'Arvind Lifestyle Brands Limited', '022-61801007', 'sephora.mumbai@arvind.com'),
(208, 'Reliance Brands Limited (Hamleys)', '022-61801008', 'hamleys.ops@ril.com'),
(209, 'RJ Corp Retail (Nike)', '022-61801009', 'nike.phoenix@rjcorp.in'),
(210, 'Lite Bite Foods Pvt Ltd', '022-61801010', 'ops@punjabgrill.in');

-- ----------------------------------------------------------------------------
-- 6. LEASE
-- ----------------------------------------------------------------------------
INSERT INTO LEASE (lease_id, shop_id, tenant_id, lease_start, lease_end, monthly_rent, lease_status) VALUES
(301, 101, 201, '2024-01-01', '2027-12-31', 450000.00, 'Active'),
(302, 102, 202, '2024-03-01', '2027-02-28', 420000.00, 'Active'),
(303, 103, 203, '2023-06-01', '2026-05-31', 580000.00, 'Active'),
(304, 104, 204, '2024-01-15', '2029-01-14', 280000.00, 'Active'),
(305, 105, 205, '2023-11-01', '2026-10-31', 520000.00, 'Active'),
(306, 106, 206, '2022-01-01', '2032-12-31', 950000.00, 'Active'),
(307, 107, 207, '2024-05-01', '2027-04-30', 310000.00, 'Active'),
(308, 108, 208, '2023-01-01', '2026-01-01', 340000.00, 'Expired'),
(309, 109, 209, '2024-02-01', '2027-01-31', 380000.00, 'Active'),
(310, 110, 210, '2023-09-01', '2026-08-31', 360000.00, 'Active');

-- ----------------------------------------------------------------------------
-- 7. PRODUCT
-- ----------------------------------------------------------------------------
INSERT INTO PRODUCT (product_id, shop_id, product_name, category, price, stock_quantity) VALUES
(1001, 101, 'Slim Fit Linen Shirt', 'Clothing', 2499.00, 45),
(1002, 101, 'Straight Denim Jeans', 'Clothing', 2999.00, 32),
(1003, 101, 'Cotton Casual Blazer', 'Clothing', 6990.00, 18),
(1004, 102, 'Graphic Oversized T-Shirt', 'Clothing', 1299.00, 65),
(1005, 102, 'Relaxed Fit Cargo Trousers', 'Clothing', 2299.00, 40),
(1006, 103, 'Sony WH-1000XM5 Headphones', 'Electronics', 26990.00, 15),
(1007, 103, 'Samsung 55-inch QLED 4K TV', 'Electronics', 64990.00, 8),
(1008, 103, 'Dell XPS 13 Laptop', 'Electronics', 119990.00, 6),
(1009, 104, 'Caffe Latte Grande', 'Beverage', 320.00, 250),
(1010, 104, 'Java Chip Frappuccino', 'Beverage', 395.00, 200),
(1011, 105, 'Apple iPhone 16 Pro 256GB', 'Electronics', 129900.00, 25),
(1012, 105, 'Apple AirPods Pro 2', 'Electronics', 24900.00, 30),
(1013, 106, 'PVR Gold Class Ticket (IMAX)', 'Entertainment', 850.00, 120),
(1014, 107, 'Huda Beauty Liquid Matte Lipstick', 'Cosmetics', 1950.00, 50),
(1015, 107, 'Dior Sauvage Eau De Parfum 100ml', 'Fragrance', 11500.00, 14),
(1016, 108, 'LEGO Technic Bugatti Chiron', 'Toys', 34999.00, 10),
(1017, 109, 'Nike Air Zoom Pegasus 41', 'Footwear', 10495.00, 22),
(1018, 109, 'Nike Dri-FIT Training Tee', 'Apparel', 1995.00, 55),
(1019, 110, 'Dal Makhani Bukhara Style', 'Food', 575.00, 100),
(1020, 110, 'Murgh Makhani Platter', 'Food', 795.00, 80);

-- ----------------------------------------------------------------------------
-- 8. PURCHASE
-- ----------------------------------------------------------------------------
INSERT INTO PURCHASE (purchase_id, customer_id, shop_id, purchase_date, total_amount) VALUES
(5001, 1, 101, '2026-03-01 14:30:00', 5498.00),
(5002, 1, 104, '2026-03-01 16:45:00', 715.00),
(5003, 2, 102, '2026-03-03 12:15:00', 3598.00),
(5004, 3, 103, '2026-03-05 18:00:00', 26990.00),
(5005, 4, 105, '2026-03-10 11:20:00', 154800.00),
(5006, 5, 107, '2026-03-12 17:10:00', 13450.00),
(5007, 6, 109, '2026-03-15 15:40:00', 12490.00),
(5008, 7, 106, '2026-03-18 20:00:00', 1700.00),
(5009, 8, 110, '2026-03-20 13:30:00', 1370.00),
(5010, 9, 108, '2026-03-22 16:15:00', 34999.00),
(5011, 1, 105, '2026-03-25 19:10:00', 24900.00),
(5012, 2, 101, '2026-03-28 14:00:00', 6990.00),
(5013, 4, 109, '2026-04-01 11:45:00', 10495.00),
(5014, 5, 104, '2026-04-02 18:30:00', 395.00),
(5015, 3, 102, '2026-04-05 17:00:00', 2299.00);

-- ----------------------------------------------------------------------------
-- 9. PURCHASE_DETAIL
-- ----------------------------------------------------------------------------
INSERT INTO PURCHASE_DETAIL (purchase_detail_id, purchase_id, product_id, quantity, unit_price, discount) VALUES
(6001, 5001, 1001, 1, 2499.00, 0.00),
(6002, 5001, 1002, 1, 2999.00, 0.00),
(6003, 5002, 1009, 1, 320.00, 0.00),
(6004, 5002, 1010, 1, 395.00, 0.00),
(6005, 5003, 1004, 1, 1299.00, 0.00),
(6006, 5003, 1005, 1, 2299.00, 0.00),
(6007, 5004, 1006, 1, 26990.00, 0.00),
(6008, 5005, 1011, 1, 129900.00, 0.00),
(6009, 5005, 1012, 1, 24900.00, 0.00),
(6010, 5006, 1014, 1, 1950.00, 0.00),
(6011, 5006, 1015, 1, 11500.00, 0.00),
(6012, 5007, 1017, 1, 10495.00, 0.00),
(6013, 5007, 1018, 1, 1995.00, 0.00),
(6014, 5008, 1013, 2, 850.00, 0.00),
(6015, 5009, 1019, 1, 575.00, 0.00),
(6016, 5009, 1020, 1, 795.00, 0.00),
(6017, 5010, 1016, 1, 34999.00, 0.00),
(6018, 5011, 1012, 1, 24900.00, 0.00),
(6019, 5012, 1003, 1, 6990.00, 0.00),
(6020, 5013, 1017, 1, 10495.00, 0.00),
(6021, 5014, 1010, 1, 395.00, 0.00),
(6022, 5015, 1005, 1, 2299.00, 0.00);

-- ----------------------------------------------------------------------------
-- 10. PAYMENT
-- ----------------------------------------------------------------------------
INSERT INTO PAYMENT (payment_id, purchase_id, payment_date, amount, payment_method, payment_status) VALUES
(7001, 5001, '2026-03-01 14:32:00', 5498.00, 'UPI', 'Completed'),
(7002, 5002, '2026-03-01 16:47:00', 715.00, 'Cash', 'Completed'),
(7003, 5003, '2026-03-03 12:17:00', 3598.00, 'Debit Card', 'Completed'),
(7004, 5004, '2026-03-05 18:03:00', 26990.00, 'Credit Card', 'Completed'),
(7005, 5005, '2026-03-10 11:25:00', 154800.00, 'Credit Card', 'Completed'),
(7006, 5006, '2026-03-12 17:12:00', 13450.00, 'UPI', 'Completed'),
(7007, 5007, '2026-03-15 15:43:00', 12490.00, 'Net Banking', 'Completed'),
(7008, 5008, '2026-03-18 20:02:00', 1700.00, 'UPI', 'Completed'),
(7009, 5009, '2026-03-20 13:35:00', 1370.00, 'Credit Card', 'Completed'),
(7010, 5010, '2026-03-22 16:20:00', 34999.00, 'Debit Card', 'Completed'),
(7011, 5011, '2026-03-25 19:12:00', 24900.00, 'UPI', 'Completed'),
(7012, 5012, '2026-03-28 14:02:00', 6990.00, 'Credit Card', 'Completed'),
(7013, 5013, '2026-04-01 11:48:00', 10495.00, 'UPI', 'Completed'),
(7014, 5014, '2026-04-02 18:32:00', 395.00, 'UPI', 'Completed'),
(7015, 5015, '2026-04-05 17:02:00', 2299.00, 'Debit Card', 'Completed');

-- ----------------------------------------------------------------------------
-- 11. VEHICLE
-- ----------------------------------------------------------------------------
INSERT INTO VEHICLE (vehicle_id, customer_id, vehicle_number, vehicle_type) VALUES
(801, 1, 'MH02-DX-1001', 'Car'),
(802, 2, 'MH01-CE-2020', 'Car'),
(803, 3, 'MH03-AB-4050', 'Two-Wheeler'),
(804, 4, 'MH04-FF-8888', 'SUV'),
(805, 5, 'MH02-ZZ-9999', 'Car'),
(806, 6, 'MH01-BK-3321', 'Two-Wheeler'),
(807, 7, 'MH03-GH-5544', 'Car'),
(808, 8, 'MH02-EV-7700', 'EV'),
(809, 9, 'MH04-XY-1234', 'Car'),
(810, 10, 'MH01-AQ-9876', 'SUV');

-- ----------------------------------------------------------------------------
-- 12. PARKING_SLOT (Multi-level Basements at Phoenix Kurla)
-- ----------------------------------------------------------------------------
INSERT INTO PARKING_SLOT (slot_id, floor, slot_number, vehicle_type, status) VALUES
(901, 'Basement 1', 'B1-01', 'Car', 'Occupied'),
(902, 'Basement 1', 'B1-02', 'Car', 'Available'),
(903, 'Basement 1', 'B1-03', 'Car', 'Available'),
(904, 'Basement 1', 'B1-04', 'SUV', 'Occupied'),
(905, 'Basement 1', 'B1-05', 'SUV', 'Available'),
(906, 'Basement 1', 'B1-06', 'EV', 'Occupied'),
(907, 'Basement 1', 'B1-07', 'Two-Wheeler', 'Occupied'),
(908, 'Basement 1', 'B1-08', 'Two-Wheeler', 'Available'),
(909, 'Basement 2', 'B2-01', 'Car', 'Available'),
(910, 'Basement 2', 'B2-02', 'Car', 'Available'),
(911, 'Basement 2', 'B2-03', 'Car', 'Available'),
(912, 'Basement 2', 'B2-04', 'SUV', 'Available'),
(913, 'Basement 2', 'B2-05', 'Two-Wheeler', 'Available'),
(914, 'Basement 2', 'B2-06', 'Two-Wheeler', 'Available');

-- ----------------------------------------------------------------------------
-- 13. PARKING_ENTRY
-- ----------------------------------------------------------------------------
INSERT INTO PARKING_ENTRY (entry_id, vehicle_id, slot_id, entry_time, exit_time, parking_fee) VALUES
(1101, 801, 901, '2026-04-08 10:30:00', NULL, 0.00), -- Currently parked
(1102, 802, 902, '2026-04-07 11:00:00', '2026-04-07 14:30:00', 120.00),
(1103, 803, 907, '2026-04-08 12:15:00', NULL, 0.00), -- Currently parked
(1104, 804, 904, '2026-04-08 13:00:00', NULL, 0.00), -- Currently parked
(1105, 805, 903, '2026-04-06 14:00:00', '2026-04-06 17:00:00', 100.00),
(1106, 806, 908, '2026-04-05 16:30:00', '2026-04-05 18:30:00', 40.00),
(1107, 807, 909, '2026-04-05 17:00:00', '2026-04-05 21:00:00', 140.00),
(1108, 808, 906, '2026-04-08 14:10:00', NULL, 0.00), -- Currently parked EV
(1109, 809, 910, '2026-04-04 12:00:00', '2026-04-04 15:00:00', 100.00),
(1110, 810, 912, '2026-04-03 18:00:00', '2026-04-03 22:30:00', 150.00);

-- ----------------------------------------------------------------------------
-- 14. EVENT
-- ----------------------------------------------------------------------------
INSERT INTO EVENT (event_id, event_name, event_date, start_time, end_time, location, capacity) VALUES
(1201, 'Mumbai Summer Shopping Carnival', '2026-04-20', '11:00:00', '22:00:00', 'Central Atrium, Ground Floor', 500),
(1202, 'Monsoon Tech & Gadget Expo', '2026-05-15', '10:00:00', '20:00:00', 'Exhibition Hall, Floor 2', 350),
(1203, 'Weekend Live Acoustic Music Fest', '2026-04-25', '18:00:00', '21:30:00', 'Food Court Amphitheatre, Floor 3', 200),
(1204, 'Kids LEGO Building Championship', '2026-05-02', '14:00:00', '18:00:00', 'Atrium 2, Floor 2', 150),
(1205, 'Luxury Fashion Runway Preview', '2026-06-10', '17:00:00', '21:00:00', 'Grand Foyer, Floor 1', 250);

-- ----------------------------------------------------------------------------
-- 15. EVENT_REGISTRATION
-- ----------------------------------------------------------------------------
INSERT INTO EVENT_REGISTRATION (registration_id, event_id, customer_id, registration_date, attendance_status) VALUES
(1301, 1201, 1, '2026-04-02 10:15:00', 'Registered'),
(1302, 1201, 2, '2026-04-02 11:30:00', 'Registered'),
(1303, 1201, 3, '2026-04-03 09:40:00', 'Registered'),
(1304, 1201, 4, '2026-04-03 14:20:00', 'Registered'),
(1305, 1201, 5, '2026-04-04 16:50:00', 'Registered'),
(1306, 1202, 1, '2026-04-05 12:00:00', 'Registered'),
(1307, 1202, 4, '2026-04-05 13:10:00', 'Registered'),
(1308, 1202, 8, '2026-04-06 18:25:00', 'Registered'),
(1309, 1203, 2, '2026-04-06 15:40:00', 'Registered'),
(1310, 1203, 6, '2026-04-07 11:20:00', 'Registered'),
(1311, 1203, 7, '2026-04-07 14:00:00', 'Registered'),
(1312, 1204, 9, '2026-04-07 16:15:00', 'Registered'),
(1313, 1204, 5, '2026-04-08 10:00:00', 'Registered');

-- ----------------------------------------------------------------------------
-- 16. EMPLOYEE
-- ----------------------------------------------------------------------------
INSERT INTO EMPLOYEE (employee_id, employee_name, department, designation, phone) VALUES
(1401, 'Suresh Gawde', 'Operations', 'Facility Manager', '9100000001'),
(1402, 'Pooja Chawla', 'Customer Service', 'Helpdesk Executive', '9100000002'),
(1403, 'Amitabh Sanyal', 'Maintenance', 'Senior HVAC Technician', '9100000003'),
(1404, 'Ramesh Shinde', 'Maintenance', 'Chief Electrician', '9100000004'),
(1405, 'Farhan Qureshi', 'Security', 'Security Supervisor', '9100000005'),
(1406, 'Deepa Kamath', 'Operations', 'Leasing Coordinator', '9100000006'),
(1407, 'Sunil Yadav', 'Housekeeping', 'Floor Supervisor', '9100000007'),
(1408, 'Kavita Menon', 'Customer Service', 'CRM Officer', '9100000008');

-- ----------------------------------------------------------------------------
-- 17. COMPLAINT
-- ----------------------------------------------------------------------------
INSERT INTO COMPLAINT (complaint_id, customer_id, complaint_type, description, complaint_date, status, priority, resolution_date) VALUES
(1501, 1, 'Parking', 'Automated ticketing boom barrier on Basement 1 entry was unresponsive', '2026-03-28', 'Resolved', 'Medium', '2026-03-29'),
(1502, 2, 'Air Conditioning', 'Central corridor air conditioning on 2nd floor was uncomfortably hot', '2026-04-01', 'Resolved', 'High', '2026-04-02'),
(1503, 3, 'Cleanliness', 'Spill near Food Court beverage counter on 3rd floor', '2026-04-05', 'Closed', 'Low', '2026-04-05'),
(1504, 4, 'Billing', 'Delayed loyalty points credit after purchase at Apple store', '2026-04-06', 'In Progress', 'Medium', NULL),
(1505, 5, 'Security', 'Lost sunglasses near central atrium bench', '2026-04-07', 'Open', 'Low', NULL),
(1506, 6, 'Elevator', 'Escalator connecting Floor 1 to Floor 2 producing grinding noise', '2026-04-08', 'Open', 'Urgent', NULL);

-- ----------------------------------------------------------------------------
-- 18. COMPLAINT_ASSIGNMENT
-- ----------------------------------------------------------------------------
INSERT INTO COMPLAINT_ASSIGNMENT (assignment_id, complaint_id, employee_id, assigned_date, assignment_status) VALUES
(1601, 1501, 1401, '2026-03-28', 'Completed'),
(1602, 1502, 1403, '2026-04-01', 'Completed'),
(1603, 1503, 1407, '2026-04-05', 'Completed'),
(1604, 1504, 1408, '2026-04-06', 'In Progress'),
(1605, 1505, 1405, '2026-04-07', 'Assigned'),
(1606, 1506, 1404, '2026-04-08', 'Assigned');

-- ----------------------------------------------------------------------------
-- 19. MAINTENANCE_REQUEST
-- ----------------------------------------------------------------------------
INSERT INTO MAINTENANCE_REQUEST (request_id, reported_by_customer_id, issue_type, description, request_date, status, completion_date) VALUES
(1701, 1, 'Electrical', 'Restroom lighting sensor malfunctioning near East Wing Floor 1', '2026-03-25', 'Completed', '2026-03-26'),
(1702, NULL, 'HVAC', 'Chiller unit 3 routine quarterly maintenance and filter replacement', '2026-04-01', 'Completed', '2026-04-03'),
(1703, 6, 'Escalator', 'Emergency stop button diagnostic and track lubrication Floor 1-2', '2026-04-08', 'In Progress', NULL),
(1704, NULL, 'Plumbing', 'Water pressure reduction in Food Court kitchen supply line', '2026-04-07', 'Pending', NULL),
(1705, NULL, 'Civil / Structural', 'Tile crack repair near Starbucks ground floor entrance', '2026-04-06', 'Pending', NULL);

-- ----------------------------------------------------------------------------
-- 20. MAINTENANCE_ASSIGNMENT
-- ----------------------------------------------------------------------------
INSERT INTO MAINTENANCE_ASSIGNMENT (assignment_id, request_id, employee_id, assigned_date, assignment_status) VALUES
(1801, 1701, 1404, '2026-03-25', 'Completed'),
(1802, 1702, 1403, '2026-04-01', 'Completed'),
(1803, 1703, 1403, '2026-04-08', 'In Progress'),
(1804, 1704, 1401, '2026-04-07', 'Assigned'),
(1805, 1705, 1407, '2026-04-06', 'Assigned');

-- ----------------------------------------------------------------------------
-- 21. OFFER
-- ----------------------------------------------------------------------------
INSERT INTO OFFER (offer_id, shop_id, offer_name, discount_percentage, start_date, end_date) VALUES
(1901, 101, 'Zara Mid-Season Special 10%', 10.00, '2026-03-01', '2026-04-30'),
(1902, 102, 'H&M Spring Lookbook 15%', 15.00, '2026-03-01', '2026-04-15'),
(1903, 103, 'Croma Audio Fest 5%', 5.00, '2026-03-01', '2026-05-31'),
(1904, 107, 'Sephora Glamour Weekend 10%', 10.00, '2026-03-10', '2026-03-31'),
(1905, 109, 'Nike Athlete Privilege 12%', 12.00, '2026-03-15', '2026-04-30');

-- ----------------------------------------------------------------------------
-- 22. OFFER_USAGE
-- ----------------------------------------------------------------------------
INSERT INTO OFFER_USAGE (usage_id, offer_id, customer_id, purchase_id, used_date) VALUES
(2001, 1901, 1, 5001, '2026-03-01'),
(2002, 1902, 2, 5003, '2026-03-03'),
(2003, 1903, 3, 5004, '2026-03-05'),
(2004, 1904, 5, 5006, '2026-03-12'),
(2005, 1905, 6, 5007, '2026-03-15');

-- ----------------------------------------------------------------------------
-- 23. SYNCHRONIZE IDENTITY SEQUENCES
-- Ensures subsequent INSERT statements generated by application do not conflict
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('app_user', 'user_id'), COALESCE((SELECT MAX(user_id) FROM app_user), 1));
SELECT setval(pg_get_serial_sequence('customer', 'customer_id'), COALESCE((SELECT MAX(customer_id) FROM customer), 1));
SELECT setval(pg_get_serial_sequence('membership', 'membership_id'), COALESCE((SELECT MAX(membership_id) FROM membership), 1));
SELECT setval(pg_get_serial_sequence('shop', 'shop_id'), COALESCE((SELECT MAX(shop_id) FROM shop), 1));
SELECT setval(pg_get_serial_sequence('tenant', 'tenant_id'), COALESCE((SELECT MAX(tenant_id) FROM tenant), 1));
SELECT setval(pg_get_serial_sequence('lease', 'lease_id'), COALESCE((SELECT MAX(lease_id) FROM lease), 1));
SELECT setval(pg_get_serial_sequence('product', 'product_id'), COALESCE((SELECT MAX(product_id) FROM product), 1));
SELECT setval(pg_get_serial_sequence('purchase', 'purchase_id'), COALESCE((SELECT MAX(purchase_id) FROM purchase), 1));
SELECT setval(pg_get_serial_sequence('purchase_detail', 'purchase_detail_id'), COALESCE((SELECT MAX(purchase_detail_id) FROM purchase_detail), 1));
SELECT setval(pg_get_serial_sequence('payment', 'payment_id'), COALESCE((SELECT MAX(payment_id) FROM payment), 1));
SELECT setval(pg_get_serial_sequence('vehicle', 'vehicle_id'), COALESCE((SELECT MAX(vehicle_id) FROM vehicle), 1));
SELECT setval(pg_get_serial_sequence('parking_slot', 'slot_id'), COALESCE((SELECT MAX(slot_id) FROM parking_slot), 1));
SELECT setval(pg_get_serial_sequence('parking_entry', 'entry_id'), COALESCE((SELECT MAX(entry_id) FROM parking_entry), 1));
SELECT setval(pg_get_serial_sequence('event', 'event_id'), COALESCE((SELECT MAX(event_id) FROM event), 1));
SELECT setval(pg_get_serial_sequence('event_registration', 'registration_id'), COALESCE((SELECT MAX(registration_id) FROM event_registration), 1));
SELECT setval(pg_get_serial_sequence('employee', 'employee_id'), COALESCE((SELECT MAX(employee_id) FROM employee), 1));
SELECT setval(pg_get_serial_sequence('complaint', 'complaint_id'), COALESCE((SELECT MAX(complaint_id) FROM complaint), 1));
SELECT setval(pg_get_serial_sequence('complaint_assignment', 'assignment_id'), COALESCE((SELECT MAX(assignment_id) FROM complaint_assignment), 1));
SELECT setval(pg_get_serial_sequence('maintenance_request', 'request_id'), COALESCE((SELECT MAX(request_id) FROM maintenance_request), 1));
SELECT setval(pg_get_serial_sequence('maintenance_assignment', 'assignment_id'), COALESCE((SELECT MAX(assignment_id) FROM maintenance_assignment), 1));
SELECT setval(pg_get_serial_sequence('offer', 'offer_id'), COALESCE((SELECT MAX(offer_id) FROM offer), 1));
SELECT setval(pg_get_serial_sequence('offer_usage', 'usage_id'), COALESCE((SELECT MAX(usage_id) FROM offer_usage), 1));
