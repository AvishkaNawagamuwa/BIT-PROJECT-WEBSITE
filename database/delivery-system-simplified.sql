-- ========================================================================
-- Simplified Delivery Management System - Database Setup
-- Assignments: Direct Driver + Vehicle (NO ROUTES)
-- ========================================================================

-- Ensure deliveries table exists with correct structure
-- This table stores order-to-driver-vehicle assignments
CREATE TABLE IF NOT EXISTS `delivery` (
    `delivery_id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `driver_id` BIGINT NOT NULL,
    `vehicle_id` BIGINT NOT NULL,
    `scheduled_date` DATE,
    `delivery_notes` TEXT,
    `status` VARCHAR(50) DEFAULT 'ASSIGNED',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
    FOREIGN KEY (`driver_id`) REFERENCES `driver` (`driver_id`),
    FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`),
    
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_driver_id` (`driver_id`),
    INDEX `idx_vehicle_id` (`vehicle_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure order status includes ASSIGNED
-- Update order status enum to include ASSIGNED state
ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'ASSIGNED', 'COMPLETED', 'CANCELLED') 
DEFAULT 'PENDING';

-- Ensure driver table has is_active column for filtering available drivers
ALTER TABLE `driver` 
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT 1;

-- Ensure vehicle table has is_active column for filtering available vehicles
ALTER TABLE `vehicle` 
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT 1;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS `idx_driver_active` ON `driver` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_vehicle_active` ON `vehicle` (`is_active`);

-- Ensure order_status reference table has ASSIGNED status
INSERT IGNORE INTO `order_status` (`status_id`, `status_name`) 
VALUES (3, 'ASSIGNED');

-- Drop routes-related constraints if they exist (for cleanup)
-- Routes table can remain for historical data but won't be used in new assignments
ALTER TABLE `delivery_route` 
MODIFY COLUMN `status` VARCHAR(50) DEFAULT 'INACTIVE' COMMENT 'Routes feature disabled - use direct driver+vehicle assignment';

-- Verify all drivers and vehicles are marked as active (for demo/existing data)
UPDATE `driver` SET `is_active` = 1 WHERE `is_active` IS NULL;
UPDATE `vehicle` SET `is_active` = 1 WHERE `is_active` IS NULL;

-- Success message
-- System is now configured for simplified delivery management
-- Deliveries are assigned directly to drivers and vehicles
-- Order status progresses: PENDING → ASSIGNED → COMPLETED
