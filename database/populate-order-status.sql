-- Populate the CORRECT order_status table that backend uses
USE sampath_grocery;

-- Clear any existing data
DELETE FROM order_status WHERE 1=1;

-- Insert all status values
INSERT INTO order_status (status_name, description, display_order, is_active) VALUES
('PENDING', 'Order is awaiting confirmation and processing', 1, 1),
('CONFIRMED', 'Order has been confirmed by cashier/manager', 2, 1),
('PROCESSING', 'Order is being prepared/packaged', 3, 1),
('COMPLETED', 'Order has been completed and delivered to customer', 4, 1),
('CANCELLED', 'Order has been cancelled', 5, 1);

-- Verify
SELECT '✓ ORDER_STATUS TABLE POPULATED!' as status;
SELECT * FROM order_status ORDER BY display_order;

-- Test the query backend uses
SELECT '✓ TEST QUERY - Finding PENDING status:' as test;
SELECT * FROM order_status WHERE status_name = 'PENDING';
