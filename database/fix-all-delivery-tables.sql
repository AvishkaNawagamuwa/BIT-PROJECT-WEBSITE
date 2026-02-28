-- ============================================
-- COMPREHENSIVE FIX: Drop all old delivery tables and create fresh ones
-- ============================================
USE sampath_grocery;

-- Step 1: Drop all delivery-related tables (order matters due to foreign keys)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS DeliveryStatusHistory;
DROP TABLE IF EXISTS delivery_status_history;

DROP TABLE IF EXISTS DeliveryRouteItem;
DROP TABLE IF EXISTS delivery_route_item;

DROP TABLE IF EXISTS DeliveryRoute;
DROP TABLE IF EXISTS delivery_route;
DROP TABLE IF EXISTS deliveryroute;
DROP TABLE IF EXISTS delivery_routes;

DROP TABLE IF EXISTS Delivery;
DROP TABLE IF EXISTS delivery;
DROP TABLE IF EXISTS deliveries;

DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS vehicle;

DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS driver;

SET FOREIGN_KEY_CHECKS = 1;

-- Step 2: Recreate tables with correct structure matching entities

-- Table: Driver (CamelCase to match entity)
CREATE TABLE Driver (
    driver_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    driver_code VARCHAR(30) NOT NULL UNIQUE,
    
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    address TEXT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_type VARCHAR(20) NULL,
    license_expiry_date DATE NOT NULL,
    
    employee_id BIGINT NULL,
    user_id INT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE SET NULL,
    
    INDEX idx_driver_code (driver_code),
    INDEX idx_phone (phone),
    INDEX idx_license (license_number),
    INDEX idx_active (is_active),
    INDEX idx_employee (employee_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Vehicle (CamelCase to match entity)
CREATE TABLE Vehicle (
    vehicle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_code VARCHAR(30) NOT NULL UNIQUE,
    
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL,
    make VARCHAR(50) NULL,
    model VARCHAR(50) NULL,
    year INT NULL,
    fuel_type VARCHAR(20) NULL,
    capacity DECIMAL(10,2) NULL,
    mileage DECIMAL(10,2) NULL,
    
    last_service_date DATE NULL,
    next_service_date DATE NULL,
    insurance_expiry_date DATE NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES User(user_id) ON DELETE SET NULL,
    
    INDEX idx_vehicle_code (vehicle_code),
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Delivery (CamelCase to match entity)
CREATE TABLE Delivery (
    delivery_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_code VARCHAR(30) NOT NULL UNIQUE,
    
    order_id BIGINT NOT NULL,
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NULL,
    postal_code VARCHAR(10) NULL,
    customer_phone VARCHAR(20) NULL,
    
    scheduled_date DATE NULL,
    scheduled_time TIME NULL,
    actual_delivery_date DATETIME NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    
    proof_of_delivery_url VARCHAR(500) NULL,
    special_instructions TEXT NULL,
    delivered_by VARCHAR(100) NULL,
    notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES User(user_id) ON DELETE SET NULL,
    
    INDEX idx_delivery_code (delivery_code),
    INDEX idx_order (order_id),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: DeliveryRoute (CamelCase to match entity) - FIXED VERSION
CREATE TABLE DeliveryRoute (
    route_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    route_name VARCHAR(200) NOT NULL,
    route_date DATE NOT NULL,
    
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    
    total_deliveries INT DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    
    total_distance_km DECIMAL(8, 2) NULL,
    notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES User(user_id) ON DELETE SET NULL,
    
    INDEX idx_route_date (route_date),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: DeliveryRouteItem (CamelCase to match entity)
CREATE TABLE DeliveryRouteItem (
    route_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    route_id BIGINT NOT NULL,
    delivery_id BIGINT NOT NULL,
    
    stop_order INT NOT NULL,
    estimated_time TIME NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (route_id) REFERENCES DeliveryRoute(route_id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_id) REFERENCES Delivery(delivery_id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_route_delivery (route_id, delivery_id),
    
    INDEX idx_route (route_id),
    INDEX idx_delivery (delivery_id),
    INDEX idx_stop_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: DeliveryStatusHistory (CamelCase to match entity)
CREATE TABLE DeliveryStatusHistory (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    delivery_id BIGINT NOT NULL,
    
    status VARCHAR(20) NOT NULL,
    
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    
    notes TEXT NULL,
    
    changed_by VARCHAR(100) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    
    FOREIGN KEY (delivery_id) REFERENCES Delivery(delivery_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES User(user_id) ON DELETE SET NULL,
    
    INDEX idx_delivery (delivery_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ All delivery tables recreated successfully with correct structure!' AS Status;
SELECT 'Tables created: Driver, Vehicle, Delivery, DeliveryRoute, DeliveryRouteItem, DeliveryStatusHistory' AS Info;
