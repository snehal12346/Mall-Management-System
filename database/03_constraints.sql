-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 03: Constraints & Indexes (Foreign Keys, Checks, Uniques, Indexes)
-- Database: Mini_project_172_173
-- Enforces relational integrity, business rules, and high query performance
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------------

-- MEMBERSHIP -> CUSTOMER
ALTER TABLE MEMBERSHIP
    ADD CONSTRAINT fk_membership_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- LEASE -> SHOP, TENANT
ALTER TABLE LEASE
    ADD CONSTRAINT fk_lease_shop
    FOREIGN KEY (shop_id) REFERENCES SHOP(shop_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_lease_tenant
    FOREIGN KEY (tenant_id) REFERENCES TENANT(tenant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- PRODUCT -> SHOP
ALTER TABLE PRODUCT
    ADD CONSTRAINT fk_product_shop
    FOREIGN KEY (shop_id) REFERENCES SHOP(shop_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- PURCHASE -> CUSTOMER, SHOP
ALTER TABLE PURCHASE
    ADD CONSTRAINT fk_purchase_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_purchase_shop
    FOREIGN KEY (shop_id) REFERENCES SHOP(shop_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- PURCHASE_DETAIL -> PURCHASE, PRODUCT
ALTER TABLE PURCHASE_DETAIL
    ADD CONSTRAINT fk_purchase_detail_purchase
    FOREIGN KEY (purchase_id) REFERENCES PURCHASE(purchase_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_purchase_detail_product
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- PAYMENT -> PURCHASE
ALTER TABLE PAYMENT
    ADD CONSTRAINT fk_payment_purchase
    FOREIGN KEY (purchase_id) REFERENCES PURCHASE(purchase_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- VEHICLE -> CUSTOMER
ALTER TABLE VEHICLE
    ADD CONSTRAINT fk_vehicle_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- PARKING_ENTRY -> VEHICLE, PARKING_SLOT
ALTER TABLE PARKING_ENTRY
    ADD CONSTRAINT fk_parking_entry_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES VEHICLE(vehicle_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_parking_entry_slot
    FOREIGN KEY (slot_id) REFERENCES PARKING_SLOT(slot_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- EVENT_REGISTRATION -> EVENT, CUSTOMER
ALTER TABLE EVENT_REGISTRATION
    ADD CONSTRAINT fk_event_registration_event
    FOREIGN KEY (event_id) REFERENCES EVENT(event_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_event_registration_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- COMPLAINT -> CUSTOMER
ALTER TABLE COMPLAINT
    ADD CONSTRAINT fk_complaint_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- COMPLAINT_ASSIGNMENT -> COMPLAINT, EMPLOYEE
ALTER TABLE COMPLAINT_ASSIGNMENT
    ADD CONSTRAINT fk_complaint_assignment_complaint
    FOREIGN KEY (complaint_id) REFERENCES COMPLAINT(complaint_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_complaint_assignment_employee
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- MAINTENANCE_REQUEST -> CUSTOMER
ALTER TABLE MAINTENANCE_REQUEST
    ADD CONSTRAINT fk_maintenance_request_customer
    FOREIGN KEY (reported_by_customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- MAINTENANCE_ASSIGNMENT -> MAINTENANCE_REQUEST, EMPLOYEE
ALTER TABLE MAINTENANCE_ASSIGNMENT
    ADD CONSTRAINT fk_maintenance_assignment_request
    FOREIGN KEY (request_id) REFERENCES MAINTENANCE_REQUEST(request_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_maintenance_assignment_employee
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- OFFER -> SHOP
ALTER TABLE OFFER
    ADD CONSTRAINT fk_offer_shop
    FOREIGN KEY (shop_id) REFERENCES SHOP(shop_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- OFFER_USAGE -> OFFER, CUSTOMER, PURCHASE
ALTER TABLE OFFER_USAGE
    ADD CONSTRAINT fk_offer_usage_offer
    FOREIGN KEY (offer_id) REFERENCES OFFER(offer_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_offer_usage_customer
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_offer_usage_purchase
    FOREIGN KEY (purchase_id) REFERENCES PURCHASE(purchase_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CHECK CONSTRAINTS
-- ----------------------------------------------------------------------------

-- CUSTOMER
ALTER TABLE CUSTOMER
    ADD CONSTRAINT chk_customer_email
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- MEMBERSHIP
ALTER TABLE MEMBERSHIP
    ADD CONSTRAINT chk_membership_type
    CHECK (membership_type IN ('Silver', 'Gold', 'Platinum')),
    ADD CONSTRAINT chk_membership_points
    CHECK (points >= 0),
    ADD CONSTRAINT chk_membership_status
    CHECK (status IN ('Active', 'Inactive', 'Suspended'));

-- LEASE
ALTER TABLE LEASE
    ADD CONSTRAINT chk_lease_dates
    CHECK (lease_end > lease_start),
    ADD CONSTRAINT chk_lease_rent
    CHECK (monthly_rent > 0),
    ADD CONSTRAINT chk_lease_status
    CHECK (lease_status IN ('Active', 'Expired', 'Terminated', 'Pending'));

-- PRODUCT
ALTER TABLE PRODUCT
    ADD CONSTRAINT chk_product_price
    CHECK (price >= 0),
    ADD CONSTRAINT chk_product_stock
    CHECK (stock_quantity >= 0);

-- PURCHASE
ALTER TABLE PURCHASE
    ADD CONSTRAINT chk_purchase_total
    CHECK (total_amount >= 0);

-- PURCHASE_DETAIL
ALTER TABLE PURCHASE_DETAIL
    ADD CONSTRAINT chk_purchase_detail_qty
    CHECK (quantity > 0),
    ADD CONSTRAINT chk_purchase_detail_price
    CHECK (unit_price >= 0),
    ADD CONSTRAINT chk_purchase_detail_discount
    CHECK (discount >= 0 AND discount <= (unit_price * quantity));

-- PAYMENT
ALTER TABLE PAYMENT
    ADD CONSTRAINT chk_payment_amount
    CHECK (amount > 0),
    ADD CONSTRAINT chk_payment_method
    CHECK (payment_method IN ('Credit Card', 'Debit Card', 'UPI', 'Cash', 'Net Banking')),
    ADD CONSTRAINT chk_payment_status
    CHECK (payment_status IN ('Completed', 'Pending', 'Failed', 'Refunded'));

-- PARKING_SLOT
ALTER TABLE PARKING_SLOT
    ADD CONSTRAINT chk_parking_slot_status
    CHECK (status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')),
    ADD CONSTRAINT uq_floor_slot_number
    UNIQUE (floor, slot_number);

-- PARKING_ENTRY
ALTER TABLE PARKING_ENTRY
    ADD CONSTRAINT chk_parking_fee
    CHECK (parking_fee >= 0);

-- EVENT
ALTER TABLE EVENT
    ADD CONSTRAINT chk_event_capacity
    CHECK (capacity > 0),
    ADD CONSTRAINT chk_event_times
    CHECK (end_time > start_time);

-- EVENT_REGISTRATION
ALTER TABLE EVENT_REGISTRATION
    ADD CONSTRAINT chk_attendance_status
    CHECK (attendance_status IN ('Registered', 'Present', 'Absent', 'Cancelled'));

-- COMPLAINT
ALTER TABLE COMPLAINT
    ADD CONSTRAINT chk_complaint_status
    CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    ADD CONSTRAINT chk_complaint_priority
    CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));

-- COMPLAINT_ASSIGNMENT
ALTER TABLE COMPLAINT_ASSIGNMENT
    ADD CONSTRAINT chk_complaint_assignment_status
    CHECK (assignment_status IN ('Assigned', 'In Progress', 'Completed', 'Reassigned'));

-- MAINTENANCE_REQUEST
ALTER TABLE MAINTENANCE_REQUEST
    ADD CONSTRAINT chk_maintenance_status
    CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled'));

-- MAINTENANCE_ASSIGNMENT
ALTER TABLE MAINTENANCE_ASSIGNMENT
    ADD CONSTRAINT chk_maintenance_assignment_status
    CHECK (assignment_status IN ('Assigned', 'In Progress', 'Completed', 'Reassigned'));

-- OFFER
ALTER TABLE OFFER
    ADD CONSTRAINT chk_offer_discount
    CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    ADD CONSTRAINT chk_offer_dates
    CHECK (end_date >= start_date);

-- APP_USER
ALTER TABLE APP_USER
    ADD CONSTRAINT chk_app_user_role
    CHECK (role IN ('Admin', 'Manager', 'Staff'));

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR OPTIMIZED QUERY PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX idx_customer_email ON CUSTOMER(email);
CREATE INDEX idx_customer_phone ON CUSTOMER(phone);
CREATE INDEX idx_shop_category ON SHOP(category);
CREATE INDEX idx_product_shop ON PRODUCT(shop_id);
CREATE INDEX idx_product_category ON PRODUCT(category);
CREATE INDEX idx_purchase_customer ON PURCHASE(customer_id);
CREATE INDEX idx_purchase_shop ON PURCHASE(shop_id);
CREATE INDEX idx_purchase_date ON PURCHASE(purchase_date);
CREATE INDEX idx_purchase_detail_purchase ON PURCHASE_DETAIL(purchase_id);
CREATE INDEX idx_purchase_detail_product ON PURCHASE_DETAIL(product_id);
CREATE INDEX idx_payment_purchase ON PAYMENT(purchase_id);
CREATE INDEX idx_vehicle_number ON VEHICLE(vehicle_number);
CREATE INDEX idx_parking_entry_vehicle ON PARKING_ENTRY(vehicle_id);
CREATE INDEX idx_parking_entry_slot ON PARKING_ENTRY(slot_id);
CREATE INDEX idx_event_date ON EVENT(event_date);
CREATE INDEX idx_complaint_status ON COMPLAINT(status);
CREATE INDEX idx_maintenance_status ON MAINTENANCE_REQUEST(status);
CREATE INDEX idx_lease_status ON LEASE(lease_status);
CREATE INDEX idx_offer_shop ON OFFER(shop_id);
