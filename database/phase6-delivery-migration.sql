-- ============================================
-- PHASE 6: DELIVERY MANAGEMENT MODULE
-- ============================================
-- MySQL 8.x Migration Script
-- Run this to add delivery management tables

USE sampath_grocery;

-- ============================================
-- Table 1: Driver
-- ============================================
CREATE TABLE Driver (
    driver_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    driver_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Auto-generated: DRV-00001, DRV-00002, etc.',
    
    -- Driver Information
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_expiry_date DATE NOT NULL,
    
    -- Relationships
    employee_id BIGINT NULL COMMENT 'FK to Employee table',
    user_id INT NULL COMMENT 'FK to User table for login',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_driver_code (driver_code),
    INDEX idx_phone (phone),
    INDEX idx_license (license_number),
    INDEX idx_active (is_active),
    INDEX idx_employee (employee_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Delivery drivers';

-- ============================================
-- Table 2: Vehicle
-- ============================================
CREATE TABLE Vehicle (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Auto-generated: VEH-00001, VEH-00002, etc.',
    
    -- Vehicle Information
    vehicle_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'License plate number',
    vehicle_type VARCHAR(20) NOT NULL COMMENT 'BIKE, THREE_WHEELER, VAN, TRUCK',
    make VARCHAR(50) NULL COMMENT 'Manufacturer',
    model VARCHAR(50) NULL,
    year INT NULL,
    fuel_type VARCHAR(20) NULL COMMENT 'PETROL, DIESEL, ELECTRIC',
    capacity DECIMAL(10,2) NULL COMMENT 'Weight capacity in kg or volume in cubic meters',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_vehicle_code (vehicle_code),
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Delivery vehicles';

-- ============================================
-- Table 3: Delivery
-- ============================================
CREATE TABLE Delivery (
    delivery_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Auto-generated: DEL-00001, DEL-00002, etc.',
    
    -- Order Reference
    order_id BIGINT NOT NULL COMMENT 'FK to Order table',
    
    -- Assignment
    driver_id BIGINT NULL COMMENT 'Assigned driver',
    vehicle_id BIGINT NULL COMMENT 'Assigned vehicle',
    
    -- Delivery Details
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Scheduling
    scheduled_date DATE NULL COMMENT 'Planned delivery date',
    actual_delivery_date DATETIME NULL COMMENT 'When it was actually delivered',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED, CANCELLED',
    
    -- Additional Info
    proof_of_delivery_url VARCHAR(500) NULL COMMENT 'Photo/signature URL',
    special_instructions TEXT NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_delivery_code (delivery_code),
    INDEX idx_order (order_id),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_city (delivery_city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Delivery records';

-- ============================================
-- Table 4: Delivery Route
-- ============================================
CREATE TABLE DeliveryRoute (
    route_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Route Information
    route_name VARCHAR(100) NOT NULL,
    route_date DATE NOT NULL,
    
    -- Assignment
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    
    -- Location
    start_location VARCHAR(200) NULL,
    end_location VARCHAR(200) NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' COMMENT 'PLANNED, IN_PROGRESS, COMPLETED, CANCELLED',
    
    -- Statistics (auto-updated)
    total_deliveries INT DEFAULT 0 COMMENT 'Total number of deliveries in this route',
    completed_deliveries INT DEFAULT 0 COMMENT 'Number of completed deliveries',
    failed_deliveries INT DEFAULT 0 COMMENT 'Number of failed deliveries',
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_route_date (route_date),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Delivery routes for planning';

-- ============================================
-- Table 5: Delivery Route Item (Junction Table)
-- ============================================
CREATE TABLE DeliveryRouteItem (
    route_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Relationships
    route_id BIGINT NOT NULL,
    delivery_id BIGINT NOT NULL,
    
    -- Sequencing
    stop_order INT NOT NULL COMMENT 'Order of stops in the route (1, 2, 3, ...)',
    estimated_time TIME NULL COMMENT 'Estimated time to reach this stop',
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (route_id) REFERENCES DeliveryRoute(route_id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_id) REFERENCES Delivery(delivery_id) ON DELETE CASCADE,
    
    -- Unique Constraint
    UNIQUE KEY uk_route_delivery (route_id, delivery_id),
    
    -- Indexes
    INDEX idx_route (route_id),
    INDEX idx_delivery (delivery_id),
    INDEX idx_stop_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items in delivery routes';

-- ============================================
-- Table 6: Delivery Status History
-- ============================================
CREATE TABLE DeliveryStatusHistory (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Delivery Reference
    delivery_id BIGINT NOT NULL,
    
    -- Status Change
    old_status VARCHAR(20) NULL COMMENT 'Previous status (NULL for first entry)',
    new_status VARCHAR(20) NOT NULL COMMENT 'New status',
    
    -- Location (GPS)
    latitude DECIMAL(10,8) NULL COMMENT 'GPS latitude when status changed',
    longitude DECIMAL(11,8) NULL COMMENT 'GPS longitude when status changed',
    
    -- Notes
    notes TEXT NULL COMMENT 'Additional notes about the status change',
    
    -- Audit
    changed_by VARCHAR(100) NULL COMMENT 'Username who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (delivery_id) REFERENCES Delivery(delivery_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_delivery (delivery_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_new_status (new_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='History of all delivery status changes';

-- ============================================
-- Table 7: Driver Attendance
-- ============================================
CREATE TABLE DriverAttendance (
    attendance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Driver Reference
    driver_id BIGINT NOT NULL,
    
    -- Attendance Details
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL COMMENT 'PRESENT, ABSENT, HALF_DAY, LEAVE, HOLIDAY',
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    notes TEXT NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE CASCADE,
    
    -- Unique Constraint (one record per driver per day)
    UNIQUE KEY uk_driver_date (driver_id, attendance_date),
    
    -- Indexes
    INDEX idx_driver (driver_id),
    INDEX idx_date (attendance_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily attendance records for drivers';

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Note: Insert sample data only if you want to test
-- Make sure you have existing Employee and User records first

-- Sample Driver
-- INSERT INTO Driver (driver_code, full_name, phone, license_number, license_expiry_date, employee_id, user_id, is_active) 
-- VALUES ('DRV-00001', 'John Doe', '0771234567', 'B1234567', '2025-12-31', 1, 2, TRUE);

-- Sample Vehicle
-- INSERT INTO Vehicle (vehicle_code, vehicle_number, vehicle_type, make, model, year, fuel_type, capacity, is_active) 
-- VALUES ('VEH-00001', 'ABC-1234', 'VAN', 'Toyota', 'Hiace', 2020, 'DIESEL', 1000.00, TRUE);

-- Sample Delivery (requires existing order)
-- INSERT INTO Delivery (delivery_code, order_id, driver_id, vehicle_id, delivery_address, delivery_city, postal_code, customer_phone, scheduled_date, status) 
-- VALUES ('DEL-00001', 1, 1, 1, '123 Main St, Colombo 7', 'Colombo', '00700', '0761234567', '2024-01-15', 'PENDING');

-- ============================================
-- Verification Queries
-- ============================================

-- Check if all tables were created
SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    CREATE_TIME 
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'sampath_grocery' 
    AND TABLE_NAME IN ('Driver', 'Vehicle', 'Delivery', 'DeliveryRoute', 'DeliveryRouteItem', 'DeliveryStatusHistory', 'DriverAttendance')
ORDER BY 
    TABLE_NAME;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 7 tables created:
-- 1. Driver
-- 2. Vehicle
-- 3. Delivery
-- 4. DeliveryRoute
-- 5. DeliveryRouteItem
-- 6. DeliveryStatusHistory
-- 7. DriverAttendance
-- ============================================
