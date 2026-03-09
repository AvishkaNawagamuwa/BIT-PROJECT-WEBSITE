-- =====================================================
-- FIX PRODUCTS WITH UNIT_ID = 0
-- This fixes the "Unable to find UnitOfMeasure with id 0" error
-- =====================================================

-- Check how many products have unit_id = 0 or NULL
SELECT 
    COUNT(*) as problem_count,
    'Products with unit_id = 0 or NULL' as description
FROM product 
WHERE unit_id = 0 OR unit_id IS NULL;

-- Show the problematic products
SELECT product_id, product_name, unit_id, brand_id
FROM product 
WHERE unit_id = 0 OR unit_id IS NULL
LIMIT 20;

-- Fix: Update all products with unit_id = 0 to use default unit (PCS - Pieces)
UPDATE product p
INNER JOIN unit_of_measure u ON u.unit_code = 'PCS'
SET p.unit_id = u.unit_id
WHERE p.unit_id = 0 OR p.unit_id IS NULL;

-- Verify the fix
SELECT 
    COUNT(*) as remaining_problems,
    'Products still with unit_id = 0 or NULL' as description
FROM product 
WHERE unit_id = 0 OR unit_id IS NULL;

-- Show sample of updated products
SELECT p.product_id, p.product_name, u.unit_name, u.unit_code
FROM product p
INNER JOIN unit_of_measure u ON p.unit_id = u.unit_id
LIMIT 10;
