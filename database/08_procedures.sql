-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 08: Stored Procedures (8 Core Business Procedures)
-- Database: Mini_project_172_173
-- Demonstrates transactional business workflows, validation, and state changes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROCEDURE: Customer Event Registration
-- Validates capacity, ensures no duplicate, inserts registration
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_register_customer_event(
    p_event_id INT,
    p_customer_id INT,
    INOUT p_status VARCHAR(50) DEFAULT '',
    INOUT p_message VARCHAR(255) DEFAULT ''
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_capacity INT;
    v_registered INT;
    v_existing INT;
BEGIN
    -- Check event exists and fetch capacity
    SELECT capacity INTO v_capacity FROM EVENT WHERE event_id = p_event_id;
    IF NOT FOUND THEN
        p_status := 'ERROR';
        p_message := 'Event not found.';
        RETURN;
    END IF;

    -- Check customer exists
    PERFORM 1 FROM CUSTOMER WHERE customer_id = p_customer_id;
    IF NOT FOUND THEN
        p_status := 'ERROR';
        p_message := 'Customer not found.';
        RETURN;
    END IF;

    -- Check if already registered
    SELECT COUNT(*) INTO v_existing
    FROM EVENT_REGISTRATION
    WHERE event_id = p_event_id AND customer_id = p_customer_id;

    IF v_existing > 0 THEN
        p_status := 'DUPLICATE';
        p_message := 'Customer is already registered for this event.';
        RETURN;
    END IF;

    -- Check capacity
    SELECT COUNT(*) INTO v_registered
    FROM EVENT_REGISTRATION
    WHERE event_id = p_event_id;

    IF v_registered >= v_capacity THEN
        p_status := 'FULL';
        p_message := 'Event registration is full to maximum capacity.';
        RETURN;
    END IF;

    -- Insert registration
    INSERT INTO EVENT_REGISTRATION (event_id, customer_id, registration_date, attendance_status)
    VALUES (p_event_id, p_customer_id, CURRENT_TIMESTAMP, 'Registered');

    p_status := 'SUCCESS';
    p_message := 'Customer successfully registered for the event.';
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. PROCEDURE: Create Purchase Record
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_create_purchase(
    p_customer_id INT,
    p_shop_id INT,
    INOUT p_new_purchase_id INT DEFAULT 0
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate Customer
    PERFORM 1 FROM CUSTOMER WHERE customer_id = p_customer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer ID % does not exist.', p_customer_id;
    END IF;

    -- Validate Shop
    PERFORM 1 FROM SHOP WHERE shop_id = p_shop_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shop ID % does not exist.', p_shop_id;
    END IF;

    -- Insert header
    INSERT INTO PURCHASE (customer_id, shop_id, purchase_date, total_amount)
    VALUES (p_customer_id, p_shop_id, CURRENT_TIMESTAMP, 0.00)
    RETURNING purchase_id INTO p_new_purchase_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. PROCEDURE: Update Purchase Total
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_update_purchase_total(p_purchase_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_calculated_total DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM((quantity * unit_price) - discount), 0.00)
    INTO v_calculated_total
    FROM PURCHASE_DETAIL
    WHERE purchase_id = p_purchase_id;

    UPDATE PURCHASE
    SET total_amount = v_calculated_total
    WHERE purchase_id = p_purchase_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. PROCEDURE: Complete Complaint Resolution
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_complete_complaint(
    p_complaint_id INT,
    p_resolution_date DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update complaint status
    UPDATE COMPLAINT
    SET status = 'Resolved',
        resolution_date = COALESCE(p_resolution_date, CURRENT_DATE)
    WHERE complaint_id = p_complaint_id;

    -- Synchronize assignments
    UPDATE COMPLAINT_ASSIGNMENT
    SET assignment_status = 'Completed'
    WHERE complaint_id = p_complaint_id
      AND assignment_status <> 'Completed';
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. PROCEDURE: Complete Maintenance Work Order
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_complete_maintenance(
    p_request_id INT,
    p_completion_date DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update maintenance status
    UPDATE MAINTENANCE_REQUEST
    SET status = 'Completed',
        completion_date = COALESCE(p_completion_date, CURRENT_DATE)
    WHERE request_id = p_request_id;

    -- Synchronize assignments
    UPDATE MAINTENANCE_ASSIGNMENT
    SET assignment_status = 'Completed'
    WHERE request_id = p_request_id
      AND assignment_status <> 'Completed';
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. PROCEDURE: Add Membership Loyalty Points
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_add_membership_points(
    p_customer_id INT,
    p_points_to_add INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_points INT;
BEGIN
    IF p_points_to_add <= 0 THEN
        RETURN;
    END IF;

    UPDATE MEMBERSHIP
    SET points = points + p_points_to_add
    WHERE customer_id = p_customer_id AND status = 'Active';

    IF NOT FOUND THEN
        RAISE NOTICE 'No active membership found for customer %.', p_customer_id;
    END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. PROCEDURE: Mark Event Attendance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_mark_event_attendance(
    p_event_id INT,
    p_customer_id INT,
    p_attendance_status VARCHAR(20) DEFAULT 'Present'
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EVENT_REGISTRATION
    SET attendance_status = p_attendance_status
    WHERE event_id = p_event_id AND customer_id = p_customer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found for Customer % at Event %.', p_customer_id, p_event_id;
    END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. PROCEDURE: Process Parking Exit & Billing
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_process_parking_exit(
    p_entry_id INT,
    INOUT p_fee DECIMAL(10,2) DEFAULT 0.00
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_slot_id INT;
    v_vehicle_type VARCHAR(30);
    v_entry_time TIMESTAMP;
    v_exit_time TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
    -- Retrieve parking entry info
    SELECT pe.slot_id, pe.entry_time, v.vehicle_type
    INTO v_slot_id, v_entry_time, v_vehicle_type
    FROM PARKING_ENTRY pe
    JOIN VEHICLE v ON pe.vehicle_id = v.vehicle_id
    WHERE pe.entry_id = p_entry_id AND pe.exit_time IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active parking entry not found for Entry ID %.', p_entry_id;
    END IF;

    -- Calculate fee
    p_fee := fn_calculate_parking_fee(v_entry_time, v_exit_time, v_vehicle_type);

    -- Update parking entry with exit time and fee
    UPDATE PARKING_ENTRY
    SET exit_time = v_exit_time,
        parking_fee = p_fee
    WHERE entry_id = p_entry_id;

    -- Free up parking slot
    UPDATE PARKING_SLOT
    SET status = 'Available'
    WHERE slot_id = v_slot_id;
END;
$$;
