-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 09: Triggers & Trigger Functions (9 Automated Business Rule Triggers)
-- Database: Mini_project_172_173
-- Guarantees operational consistency, stock safety, and automatic state changes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TRIGGER: Prevent Negative Stock
-- Trigger function checks available stock before order detail insertion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_prevent_negative_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_available_stock INT;
    v_product_name VARCHAR(100);
BEGIN
    SELECT stock_quantity, product_name
    INTO v_available_stock, v_product_name
    FROM PRODUCT
    WHERE product_id = NEW.product_id;

    IF v_available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product "%" (ID: %). Requested: %, Available: %',
            v_product_name, NEW.product_id, NEW.quantity, v_available_stock;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_negative_stock ON PURCHASE_DETAIL;
CREATE TRIGGER trg_prevent_negative_stock
    BEFORE INSERT OR UPDATE OF quantity, product_id ON PURCHASE_DETAIL
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_prevent_negative_stock();


-- ----------------------------------------------------------------------------
-- 2. TRIGGER: Stock Reduction After Purchase Detail Insert
-- Automatically deducts stock quantity from PRODUCT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_reduce_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PRODUCT
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reduce_stock ON PURCHASE_DETAIL;
CREATE TRIGGER trg_reduce_stock
    AFTER INSERT ON PURCHASE_DETAIL
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_reduce_stock();


-- ----------------------------------------------------------------------------
-- 3. TRIGGER: Auto Recalculate Purchase Total
-- Whenever line items are added, updated, or removed
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_sync_purchase_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_pid INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_pid := OLD.purchase_id;
    ELSE
        v_pid := NEW.purchase_id;
    END IF;

    UPDATE PURCHASE
    SET total_amount = (
        SELECT COALESCE(SUM((quantity * unit_price) - discount), 0.00)
        FROM PURCHASE_DETAIL
        WHERE purchase_id = v_pid
    )
    WHERE purchase_id = v_pid;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_purchase_total ON PURCHASE_DETAIL;
CREATE TRIGGER trg_sync_purchase_total
    AFTER INSERT OR UPDATE OR DELETE ON PURCHASE_DETAIL
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_sync_purchase_total();


-- ----------------------------------------------------------------------------
-- 4. TRIGGER: Membership Points Update on Payment Completion
-- Awards 1 point per ₹100 spent upon successful payment
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_award_membership_points()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer_id INT;
    v_points_earned INT;
BEGIN
    IF NEW.payment_status = 'Completed' THEN
        -- Find customer associated with this purchase
        SELECT customer_id INTO v_customer_id
        FROM PURCHASE
        WHERE purchase_id = NEW.purchase_id;

        IF v_customer_id IS NOT NULL THEN
            v_points_earned := FLOOR(NEW.amount / 100.00)::INT;
            IF v_points_earned > 0 THEN
                UPDATE MEMBERSHIP
                SET points = points + v_points_earned
                WHERE customer_id = v_customer_id AND status = 'Active';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_membership_points ON PAYMENT;
CREATE TRIGGER trg_award_membership_points
    AFTER INSERT OR UPDATE OF payment_status ON PAYMENT
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_award_membership_points();


-- ----------------------------------------------------------------------------
-- 5. TRIGGER: Duplicate Event Registration Prevention
-- Checks before inserting into EVENT_REGISTRATION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_check_duplicate_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists INT;
BEGIN
    SELECT COUNT(*) INTO v_exists
    FROM EVENT_REGISTRATION
    WHERE event_id = NEW.event_id AND customer_id = NEW.customer_id;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'Customer % is already registered for Event %.', NEW.customer_id, NEW.event_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_duplicate_registration ON EVENT_REGISTRATION;
CREATE TRIGGER trg_check_duplicate_registration
    BEFORE INSERT ON EVENT_REGISTRATION
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_check_duplicate_registration();


-- ----------------------------------------------------------------------------
-- 6. TRIGGER: Parking Slot Occupation
-- Marks slot as 'Occupied' when a new vehicle entry occurs
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_occupy_parking_slot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PARKING_SLOT
    SET status = 'Occupied'
    WHERE slot_id = NEW.slot_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_occupy_parking_slot ON PARKING_ENTRY;
CREATE TRIGGER trg_occupy_parking_slot
    AFTER INSERT ON PARKING_ENTRY
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_occupy_parking_slot();


-- ----------------------------------------------------------------------------
-- 7. TRIGGER: Parking Slot Release
-- Automatically sets slot status back to 'Available' when exit_time is recorded
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_release_parking_slot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.exit_time IS NOT NULL AND OLD.exit_time IS NULL THEN
        UPDATE PARKING_SLOT
        SET status = 'Available'
        WHERE slot_id = NEW.slot_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_release_parking_slot ON PARKING_ENTRY;
CREATE TRIGGER trg_release_parking_slot
    AFTER UPDATE OF exit_time ON PARKING_ENTRY
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_release_parking_slot();


-- ----------------------------------------------------------------------------
-- 8. TRIGGER: Auto Set Complaint Resolution Date
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_set_complaint_resolution_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'Resolved' AND (OLD.status <> 'Resolved' OR OLD.status IS NULL) THEN
        IF NEW.resolution_date IS NULL THEN
            NEW.resolution_date := CURRENT_DATE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_complaint_resolution_date ON COMPLAINT;
CREATE TRIGGER trg_set_complaint_resolution_date
    BEFORE UPDATE OF status ON COMPLAINT
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_set_complaint_resolution_date();


-- ----------------------------------------------------------------------------
-- 9. TRIGGER: Auto Set Maintenance Completion Date
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trg_set_maintenance_completion_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'Completed' AND (OLD.status <> 'Completed' OR OLD.status IS NULL) THEN
        IF NEW.completion_date IS NULL THEN
            NEW.completion_date := CURRENT_DATE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_maintenance_completion_date ON MAINTENANCE_REQUEST;
CREATE TRIGGER trg_set_maintenance_completion_date
    BEFORE UPDATE OF status ON MAINTENANCE_REQUEST
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_set_maintenance_completion_date();
