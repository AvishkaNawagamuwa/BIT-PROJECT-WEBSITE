-- Fix Order Status Lookup Table
-- Creates the order_status table and seeds it with required statuses

USE sampath_grocery;

-- ============================================
-- CREATE ORDER STATUS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS OrderStatus (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_status_name (status_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED ORDER STATUSES
-- ============================================

-- Clear existing data if any
DELETE FROM OrderStatus WHERE 1=1;

-- Insert order statuses
INSERT INTO OrderStatus (status_name, description, display_order, is_active) VALUES
('PENDING', 'Order is awaiting confirmation and processing', 1, TRUE),
('CONFIRMED', 'Order has been confirmed by cashier/manager', 2, TRUE),
('PROCESSING', 'Order is being prepared/packaged', 3, TRUE),
('COMPLETED', 'Order has been completed and delivered to customer', 4, TRUE),
('CANCELLED', 'Order has been cancelled', 5, TRUE);

-- ============================================
-- VERIFY INSERTION
-- ============================================

SELECT 'Order Status Setup Complete!' as status;
SELECT * FROM OrderStatus ORDER BY display_order;
