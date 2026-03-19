-- Check payment_method table
USE sampath_grocery;

SELECT '=== Payment Method Table Structure ===' as info;
DESCRIBE payment_method;

SELECT '=== Current Data ===' as info;
SELECT * FROM payment_method;

-- If empty, populate with payment methods
DELETE FROM payment_method WHERE 1=1;

INSERT INTO payment_method (method_name, description, is_active) VALUES
('CASH', 'Cash payment at counter', 1),
('CARD', 'Credit or Debit Card', 1),
('CREDIT', 'Buy on credit', 1),
('LOYALTY', 'Loyalty points payment', 1);

SELECT '=== After Population ===' as info;
SELECT * FROM payment_method ORDER BY method_id;

-- Test query backend uses
SELECT '=== Test: Finding method_id=1 ===' as test;
SELECT * FROM payment_method WHERE method_id = 1;
