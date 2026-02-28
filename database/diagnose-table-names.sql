-- ============================================
-- DIAGNOSTIC: Check all delivery-related tables
-- ============================================
USE sampath_grocery;

-- Show all delivery-related tables
SELECT TABLE_NAME, TABLE_COLLATION, CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'sampath_grocery' 
AND TABLE_NAME LIKE '%delivery%' OR TABLE_NAME LIKE '%Delivery%' OR TABLE_NAME LIKE '%route%' OR TABLE_NAME LIKE '%Route%';

-- Try to describe all possible table variations
SELECT 'Checking DeliveryRoute table...' AS Status;
SHOW CREATE TABLE DeliveryRoute;

SELECT 'Checking delivery_route table...' AS Status;
SHOW CREATE TABLE delivery_route;

SELECT 'Checking deliveryroute table...' AS Status;
SHOW CREATE TABLE deliveryroute;
