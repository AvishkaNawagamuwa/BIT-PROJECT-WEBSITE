-- Check OrderStatus data
SELECT COUNT(*) as total_records FROM OrderStatus;
SELECT * FROM OrderStatus;

-- If empty, reseed
DELETE FROM OrderStatus WHERE 1=1;

INSERT INTO OrderStatus (status_name, description, display_order, is_active) VALUES
('PENDING', 'Order is awaiting confirmation and processing', 1, TRUE),
('CONFIRMED', 'Order has been confirmed by cashier/manager', 2, TRUE),
('PROCESSING', 'Order is being prepared/packaged', 3, TRUE),
('COMPLETED', 'Order has been completed and delivered to customer', 4, TRUE),
('CANCELLED', 'Order has been cancelled', 5, TRUE);

-- Verify
SELECT 'Data Reseeded Successfully!' as status;
SELECT * FROM OrderStatus ORDER BY display_order;
