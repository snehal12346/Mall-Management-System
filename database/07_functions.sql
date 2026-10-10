-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 07: Stored Functions (10 PL/pgSQL Business Functions)
-- Database: Mini_project_172_173
-- Demonstrates stored calculations, scalar functions, and parameterized logic
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCTION: Calculate Purchase Total
-- Sum of (quantity * unit_price - discount) from purchase_detail
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_purchase_total(p_purchase_id INT)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total DECIMAL(12,2) := 0.00;
BEGIN
    SELECT COALESCE(SUM((quantity * unit_price) - discount), 0.00)
    INTO v_total
    FROM PURCHASE_DETAIL
    WHERE purchase_id = p_purchase_id;

    RETURN v_total;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. FUNCTION: Calculate Parking Fee
-- Based on duration (hours rounded up) and rate per vehicle type:
-- Car: ₹40/hr, SUV: ₹50/hr, Two-Wheeler: ₹20/hr, EV: ₹30/hr (Min 1 hour)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_parking_fee(
    p_entry_time TIMESTAMP,
    p_exit_time TIMESTAMP,
    p_vehicle_type VARCHAR
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_hours NUMERIC;
    v_rate_per_hour DECIMAL(10,2) := 40.00;
    v_fee DECIMAL(10,2) := 0.00;
BEGIN
    IF p_exit_time IS NULL OR p_entry_time IS NULL OR p_exit_time <= p_entry_time THEN
        RETURN 0.00;
    END IF;

    -- Calculate total duration in fractional hours, rounded up to ceiling
    v_hours := CEIL(EXTRACT(EPOCH FROM (p_exit_time - p_entry_time)) / 3600.0);
    IF v_hours < 1 THEN
        v_hours := 1;
    END IF;

    -- Determine hourly rate based on vehicle classification
    CASE LOWER(TRIM(p_vehicle_type))
        WHEN 'two-wheeler' THEN v_rate_per_hour := 20.00;
        WHEN 'car' THEN v_rate_per_hour := 40.00;
        WHEN 'suv' THEN v_rate_per_hour := 50.00;
        WHEN 'ev' THEN v_rate_per_hour := 30.00;
        ELSE v_rate_per_hour := 40.00;
    END CASE;

    v_fee := v_hours * v_rate_per_hour;
    RETURN v_fee;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. FUNCTION: Customer Purchase Count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_customer_purchase_count(p_customer_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INT := 0;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM PURCHASE
    WHERE customer_id = p_customer_id;

    RETURN v_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. FUNCTION: Shop Total Sales
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_shop_total_sales(p_shop_id INT)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_sales DECIMAL(12,2) := 0.00;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0.00)
    INTO v_sales
    FROM PURCHASE
    WHERE shop_id = p_shop_id;

    RETURN v_sales;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. FUNCTION: Available Parking Slots Count
-- Parameterized by vehicle type ('Car', 'Two-Wheeler', 'SUV', 'EV', or NULL for all)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_available_parking_slots(p_vehicle_type VARCHAR DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_available INT := 0;
BEGIN
    IF p_vehicle_type IS NULL OR UPPER(TRIM(p_vehicle_type)) = 'ALL' THEN
        SELECT COUNT(*)
        INTO v_available
        FROM PARKING_SLOT
        WHERE status = 'Available';
    ELSE
        SELECT COUNT(*)
        INTO v_available
        FROM PARKING_SLOT
        WHERE status = 'Available'
          AND LOWER(vehicle_type) = LOWER(TRIM(p_vehicle_type));
    END IF;

    RETURN v_available;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. FUNCTION: Calculate Membership Points
-- Standard Mall Rule: 1 point earned per ₹100 spent (rounded down)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_membership_points(p_purchase_amount DECIMAL)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_purchase_amount IS NULL OR p_purchase_amount <= 0 THEN
        RETURN 0;
    END IF;
    RETURN FLOOR(p_purchase_amount / 100.00)::INT;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. FUNCTION: Get Product Stock Quantity
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_product_stock(p_product_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock INT := 0;
BEGIN
    SELECT stock_quantity
    INTO v_stock
    FROM PRODUCT
    WHERE product_id = p_product_id;

    RETURN COALESCE(v_stock, 0);
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. FUNCTION: Get Event Registration Count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_event_registration_count(p_event_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INT := 0;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM EVENT_REGISTRATION
    WHERE event_id = p_event_id;

    RETURN v_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. FUNCTION: Check Parking Slot Availability
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_is_slot_available(p_slot_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status
    FROM PARKING_SLOT
    WHERE slot_id = p_slot_id;

    RETURN (v_status = 'Available');
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. FUNCTION: Customer Total Spending
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_customer_total_spent(p_customer_id INT)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total DECIMAL(12,2) := 0.00;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0.00)
    INTO v_total
    FROM PURCHASE
    WHERE customer_id = p_customer_id;

    RETURN v_total;
END;
$$;
