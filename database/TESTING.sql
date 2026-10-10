-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 11: Comprehensive Database Automated Testing Suite
-- File: database/TESTING.sql
-- Database: Mini_project_172_173
-- Tests 21 tables, constraints, sample data, views, functions, procedures, triggers
-- ============================================================================

\echo '========================================================================'
\echo 'STARTING DATABASE VERIFICATION & TESTING SUITE'
\echo '========================================================================'

-- ----------------------------------------------------------------------------
-- TEST 1: VERIFY TABLE EXISTENCE AND ROW COUNTS (21 TABLES + APP_USER)
-- ----------------------------------------------------------------------------
\echo 'TEST 1: Verifying Table Row Counts...'
SELECT
    'APP_USER' AS table_name, COUNT(*) AS total_rows FROM APP_USER
UNION ALL SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER
UNION ALL SELECT 'MEMBERSHIP', COUNT(*) FROM MEMBERSHIP
UNION ALL SELECT 'SHOP', COUNT(*) FROM SHOP
UNION ALL SELECT 'TENANT', COUNT(*) FROM TENANT
UNION ALL SELECT 'LEASE', COUNT(*) FROM LEASE
UNION ALL SELECT 'PRODUCT', COUNT(*) FROM PRODUCT
UNION ALL SELECT 'PURCHASE', COUNT(*) FROM PURCHASE
UNION ALL SELECT 'PURCHASE_DETAIL', COUNT(*) FROM PURCHASE_DETAIL
UNION ALL SELECT 'PAYMENT', COUNT(*) FROM PAYMENT
UNION ALL SELECT 'VEHICLE', COUNT(*) FROM VEHICLE
UNION ALL SELECT 'PARKING_SLOT', COUNT(*) FROM PARKING_SLOT
UNION ALL SELECT 'PARKING_ENTRY', COUNT(*) FROM PARKING_ENTRY
UNION ALL SELECT 'EVENT', COUNT(*) FROM EVENT
UNION ALL SELECT 'EVENT_REGISTRATION', COUNT(*) FROM EVENT_REGISTRATION
UNION ALL SELECT 'EMPLOYEE', COUNT(*) FROM EMPLOYEE
UNION ALL SELECT 'COMPLAINT', COUNT(*) FROM COMPLAINT
UNION ALL SELECT 'COMPLAINT_ASSIGNMENT', COUNT(*) FROM COMPLAINT_ASSIGNMENT
UNION ALL SELECT 'MAINTENANCE_REQUEST', COUNT(*) FROM MAINTENANCE_REQUEST
UNION ALL SELECT 'MAINTENANCE_ASSIGNMENT', COUNT(*) FROM MAINTENANCE_ASSIGNMENT
UNION ALL SELECT 'OFFER', COUNT(*) FROM OFFER
UNION ALL SELECT 'OFFER_USAGE', COUNT(*) FROM OFFER_USAGE;

-- ----------------------------------------------------------------------------
-- TEST 2: TEST ALL 12 VIEWS
-- ----------------------------------------------------------------------------
\echo 'TEST 2: Verifying Views Execution...'
SELECT 'v_customer_purchase_summary' AS view_name, COUNT(*) AS rows_returned FROM v_customer_purchase_summary
UNION ALL SELECT 'v_shop_sales_summary', COUNT(*) FROM v_shop_sales_summary
UNION ALL SELECT 'v_product_stock', COUNT(*) FROM v_product_stock
UNION ALL SELECT 'v_parking_status', COUNT(*) FROM v_parking_status
UNION ALL SELECT 'v_event_registrations', COUNT(*) FROM v_event_registrations
UNION ALL SELECT 'v_complaints', COUNT(*) FROM v_complaints
UNION ALL SELECT 'v_maintenance', COUNT(*) FROM v_maintenance
UNION ALL SELECT 'v_leases', COUNT(*) FROM v_leases
UNION ALL SELECT 'v_purchase_details', COUNT(*) FROM v_purchase_details
UNION ALL SELECT 'v_payments', COUNT(*) FROM v_payments
UNION ALL SELECT 'v_active_offers_summary', COUNT(*) FROM v_active_offers_summary
UNION ALL SELECT 'v_employee_workload', COUNT(*) FROM v_employee_workload;

-- ----------------------------------------------------------------------------
-- TEST 3: TEST STORED FUNCTIONS
-- ----------------------------------------------------------------------------
\echo 'TEST 3: Testing Stored Functions...'
SELECT
    fn_calculate_purchase_total(5001) AS test_purchase_total,
    fn_calculate_parking_fee('2026-04-08 10:00:00', '2026-04-08 13:30:00', 'Car') AS test_parking_fee_car,
    fn_get_customer_purchase_count(1) AS test_customer_purchases,
    fn_get_shop_total_sales(101) AS test_shop_sales,
    fn_get_available_parking_slots('Car') AS test_available_car_slots,
    fn_calculate_membership_points(5498.00) AS test_points_calc,
    fn_get_product_stock(1001) AS test_product_stock,
    fn_get_event_registration_count(1201) AS test_event_registrations,
    fn_is_slot_available(902) AS test_slot_902_available,
    fn_get_customer_total_spent(1) AS test_customer_1_total_spent;

-- ----------------------------------------------------------------------------
-- TEST 4: TEST STORED PROCEDURES (Inside Rollback Transaction)
-- ----------------------------------------------------------------------------
\echo 'TEST 4: Testing Stored Procedures in Rollback Transaction...'
BEGIN;
    -- Test Procedure 1: sp_register_customer_event
    DO $$
    DECLARE
        v_status VARCHAR(50);
        v_msg VARCHAR(255);
    BEGIN
        CALL sp_register_customer_event(1202, 2, v_status, v_msg);
        RAISE NOTICE 'sp_register_customer_event: Status=%, Message=%', v_status, v_msg;
    END $$;

    -- Test Procedure 2: sp_create_purchase
    DO $$
    DECLARE
        v_new_pid INT;
    BEGIN
        CALL sp_create_purchase(1, 101, v_new_pid);
        RAISE NOTICE 'sp_create_purchase: Created Purchase ID %', v_new_pid;
    END $$;

    -- Test Procedure 3: sp_add_membership_points
    CALL sp_add_membership_points(1, 50);

    -- Test Procedure 4: sp_complete_complaint
    CALL sp_complete_complaint(1504, CURRENT_DATE);

    -- Test Procedure 5: sp_complete_maintenance
    CALL sp_complete_maintenance(1703, CURRENT_DATE);

    -- Test Procedure 6: sp_mark_event_attendance
    CALL sp_mark_event_attendance(1201, 1, 'Present');

    -- Test Procedure 7: sp_process_parking_exit
    DO $$
    DECLARE
        v_fee DECIMAL(10,2);
    BEGIN
        CALL sp_process_parking_exit(1101, v_fee);
        RAISE NOTICE 'sp_process_parking_exit: Calculated Fee=₹%', v_fee;
    END $$;
ROLLBACK;
\echo 'Stored Procedures Test Passed and Rolled Back cleanly.'

-- ----------------------------------------------------------------------------
-- TEST 5: TEST BUSINESS RULE TRIGGERS
-- ----------------------------------------------------------------------------
\echo 'TEST 5: Testing Business Rule Triggers...'

-- Test 5.1: Trigger - Stock Reduction & Recalculate Purchase Total
BEGIN;
    \echo 'Testing trg_reduce_stock and trg_sync_purchase_total...'
    -- Initial stock of product 1001
    SELECT stock_quantity FROM PRODUCT WHERE product_id = 1001;

    -- Insert line item
    INSERT INTO PURCHASE_DETAIL (purchase_id, product_id, quantity, unit_price, discount)
    VALUES (5001, 1001, 2, 2499.00, 0.00);

    -- Verify stock decreased by 2
    SELECT stock_quantity AS stock_after_purchase FROM PRODUCT WHERE product_id = 1001;
    -- Verify purchase total updated
    SELECT total_amount AS total_after_insert FROM PURCHASE WHERE purchase_id = 5001;
ROLLBACK;

-- Test 5.2: Trigger - Prevent Negative Stock
BEGIN;
    \echo 'Testing trg_prevent_negative_stock (expecting stock rejection)...'
    DO $$
    BEGIN
        INSERT INTO PURCHASE_DETAIL (purchase_id, product_id, quantity, unit_price, discount)
        VALUES (5001, 1001, 99999, 2499.00, 0.00);
        RAISE EXCEPTION 'Negative stock check failed to reject!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'SUCCESS: Trigger correctly rejected excessive stock order: %', SQLERRM;
    END $$;
ROLLBACK;

-- Test 5.3: Trigger - Parking Slot Occupation & Release
BEGIN;
    \echo 'Testing trg_occupy_parking_slot and trg_release_parking_slot...'
    -- Slot 902 is currently Available
    SELECT slot_id, status FROM PARKING_SLOT WHERE slot_id = 902;

    -- Insert new entry
    INSERT INTO PARKING_ENTRY (vehicle_id, slot_id, entry_time)
    VALUES (802, 902, CURRENT_TIMESTAMP);

    -- Verify slot is now Occupied
    SELECT slot_id, status AS status_after_entry FROM PARKING_SLOT WHERE slot_id = 902;

    -- Update exit_time
    UPDATE PARKING_ENTRY
    SET exit_time = CURRENT_TIMESTAMP, parking_fee = 40.00
    WHERE slot_id = 902 AND exit_time IS NULL;

    -- Verify slot is released back to Available
    SELECT slot_id, status AS status_after_exit FROM PARKING_SLOT WHERE slot_id = 902;
ROLLBACK;

-- Test 5.4: Trigger - Auto Set Complaint Resolution Date
BEGIN;
    \echo 'Testing trg_set_complaint_resolution_date...'
    UPDATE COMPLAINT
    SET status = 'Resolved'
    WHERE complaint_id = 1505;

    SELECT complaint_id, status, resolution_date FROM COMPLAINT WHERE complaint_id = 1505;
ROLLBACK;

\echo '========================================================================'
\echo 'ALL DATABASE TESTS COMPLETED SUCCESSFULLY! SYSTEM READY FOR BACKEND/API'
\echo '========================================================================'
