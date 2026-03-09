-- =====================================================
-- QUICK FIX: Run this in MySQL Workbench or phpMyAdmin
-- This fixes the "Unable to find UnitOfMeasure with id 0" error
-- =====================================================

USE sampath_grocery;

-- Fix: Update all products with unit_id = 0 to use default unit (PCS - Pieces)
UPDATE product p
INNER JOIN unit_of_measure u ON u.unit_code = 'PCS'
SET p.unit_id = u.unit_id
WHERE p.unit_id = 0 OR p.unit_id IS NULL;

-- Verify: Check if the fix worked
SELECT 
    COUNT(*) as fixed_count,
    'Products now using PCS unit' as description
FROM product p
INNER JOIN unit_of_measure u ON p.unit_id = u.unit_id
WHERE u.unit_code = 'PCS';

SELECT 'Fix completed successfully!' as status;
