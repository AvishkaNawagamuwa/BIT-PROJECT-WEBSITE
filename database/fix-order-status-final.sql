-- ============================================
-- ORDER STATUS TABLE - COMPLETE SETUP
-- ============================================

USE sampath_grocery;

-- Step 1: Check and show current state
SELECT 'BEFORE CLEANUP:' as step;
SELECT COUNT(*) as total_records FROM OrderStatus;

-- Step 2: Clear invalid/null records
DELETE FROM OrderStatus WHERE status_id IS NULL OR status_name IS NULL;

-- Step 3: Clear all old data to start fresh
TRUNCATE TABLE OrderStatus;

-- Step 4: Insert correct order statuses
INSERT INTO OrderStatus (status_name, description, display_order, is_active) VALUES
('PENDING', 'Order awaiting confirmation and processing', 1, 1),
('CONFIRMED', 'Order confirmed by cashier', 2, 1),
('PROCESSING', 'Order being prepared', 3, 1),
('COMPLETED', 'Order completed and delivered', 4, 1),
('CANCELLED', 'Order cancelled', 5, 1);

-- Step 5: Verify insertion
SELECT 'AFTER INSERTION:' as step;
SELECT * FROM OrderStatus ORDER BY display_order;
SELECT COUNT(*) as total_records FROM OrderStatus;

-- Step 6: Test query that OrderService uses
SELECT 'TEST QUERY - Finding PENDING:' as step;
SELECT * FROM OrderStatus WHERE status_name = 'PENDING';
