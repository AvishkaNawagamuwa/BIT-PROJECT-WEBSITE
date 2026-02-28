-- ============================================
-- Fix DeliveryRoute Table Structure
-- ============================================
-- This script fixes the DeliveryRoute table to match the entity

USE sampath_grocery;

-- Drop old delivery_routes table if it exists (from base schema)
DROP TABLE IF EXISTS delivery_routes;

-- Drop DeliveryRoute table if it exists
DROP TABLE IF EXISTS DeliveryRouteItem;
DROP TABLE IF EXISTS DeliveryRoute;

-- Recreate DeliveryRoute table with correct structure matching the entity
CREATE TABLE DeliveryRoute (
    route_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Route Information
    route_name VARCHAR(200) NOT NULL,
    route_date DATE NOT NULL,
    
    -- Assignment
    driver_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    
    -- Timing
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' COMMENT 'PLANNED, IN_PROGRESS, COMPLETED, CANCELLED',
    
    -- Statistics (auto-updated)
    total_deliveries INT DEFAULT 0 COMMENT 'Total number of deliveries in this route',
    completed_deliveries INT DEFAULT 0 COMMENT 'Number of completed deliveries',
    failed_deliveries INT DEFAULT 0 COMMENT 'Number of failed deliveries',
    
    -- Additional Fields
    total_distance_km DECIMAL(8, 2) NULL COMMENT 'Total distance in kilometers',
    notes TEXT NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL COMMENT 'FK to User table - who created this route',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES User(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_route_date (route_date),
    INDEX idx_driver (driver_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Delivery routes for planning';

-- Recreate DeliveryRouteItem table
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

SELECT '✅ DeliveryRoute table fixed successfully!' AS Status;
