-- Check both tables
SELECT '=== Table 1: OrderStatus ===' as info;
SHOW CREATE TABLE OrderStatus\G

SELECT '=== Table 2: order_status ===' as info;
SHOW CREATE TABLE order_status\G

SELECT '=== Data in OrderStatus ===' as info;
SELECT * FROM OrderStatus;

SELECT '=== Data in order_status ===' as info;
SELECT * FROM order_status;
