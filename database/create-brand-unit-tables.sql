-- =====================================================
-- BRAND AND UNIT OF MEASURE MASTER TABLES
-- Create separate master data tables for brands and units
-- =====================================================

-- Create Brand table
CREATE TABLE IF NOT EXISTS brand (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
);

-- Create Unit of Measure table
CREATE TABLE IF NOT EXISTS unit_of_measure (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL UNIQUE,
    unit_code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
);

-- Insert default units
INSERT INTO unit_of_measure (unit_name, unit_code, description, status, created_at) VALUES
('Kilogram', 'KG', 'Weight in kilograms', 'ACTIVE', NOW()),
('Gram', 'G', 'Weight in grams', 'ACTIVE', NOW()),
('Liter', 'L', 'Volume in liters', 'ACTIVE', NOW()),
('Milliliter', 'ML', 'Volume in milliliters', 'ACTIVE', NOW()),
('Piece', 'PCS', 'Individual pieces or units', 'ACTIVE', NOW()),
('Pack', 'PACK', 'Packaged items', 'ACTIVE', NOW()),
('Box', 'BOX', 'Boxed items', 'ACTIVE', NOW()),
('Bottle', 'BOTTLE', 'Bottled items', 'ACTIVE', NOW()),
('Tin', 'TIN', 'Tinned items', 'ACTIVE', NOW()),
('Bag', 'BAG', 'Bagged items', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE unit_name = VALUES(unit_name);

-- Insert some default brands (optional - add real brands as needed)
INSERT INTO brand (brand_name, description, status, created_at) VALUES
('Anchor', 'Anchor Food Products', 'ACTIVE', NOW()),
('Maliban', 'Maliban Biscuit Manufactories', 'ACTIVE', NOW()),
('Nestlé', 'Nestlé Lanka PLC', 'ACTIVE', NOW()),
('Coca Cola', 'Coca Cola Company', 'ACTIVE', NOW()),
('Regina', 'Regina Tissue Products', 'ACTIVE', NOW()),
('Munchee', 'Munchee Biscuits', 'ACTIVE', NOW()),
('Prima', 'Prima Ceylon Limited', 'ACTIVE', NOW()),
('Unilever', 'Unilever Sri Lanka', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name);

-- Add indexes for better query performance
CREATE INDEX idx_brand_status ON brand(status);
CREATE INDEX idx_brand_name ON brand(brand_name);
CREATE INDEX idx_unit_status ON unit_of_measure(status);
CREATE INDEX idx_unit_code ON unit_of_measure(unit_code);

-- =====================================================
-- MIGRATION: UPDATE PRODUCT TABLE
-- Add foreign key relationships to brand and unit tables
-- =====================================================

-- Step 1: Add new foreign key columns (nullable initially for migration)
ALTER TABLE product
ADD COLUMN brand_id INT NULL AFTER category_id,
ADD COLUMN unit_id INT NULL AFTER brand_id;

-- Step 2: Migrate existing brand data (text) to brand table
-- This will create brand records for any brands currently stored as text
INSERT INTO brand (brand_name, status, created_at)
SELECT DISTINCT brand, 'ACTIVE', NOW()
FROM product
WHERE brand IS NOT NULL AND brand != '' AND brand NOT IN (SELECT brand_name FROM brand);

-- Step 3: Update product table to link to brand_id
UPDATE product p
INNER JOIN brand b ON p.brand = b.brand_name
SET p.brand_id = b.brand_id
WHERE p.brand IS NOT NULL AND p.brand != '';

-- Step 4: Migrate existing unit_of_measure enum values to unit table
-- Map enum values to corresponding unit_id
UPDATE product p
INNER JOIN unit_of_measure u ON p.unit_of_measure = u.unit_code
SET p.unit_id = u.unit_id
WHERE p.unit_of_measure IS NOT NULL;

-- Step 5: Set default unit (PCS) for any products without a unit or with invalid unit_id (0)
UPDATE product p
INNER JOIN unit_of_measure u ON u.unit_code = 'PCS'
SET p.unit_id = u.unit_id
WHERE p.unit_id IS NULL OR p.unit_id = 0;

-- Step 6: Add foreign key constraints
ALTER TABLE product
ADD CONSTRAINT fk_product_brand
    FOREIGN KEY (brand_id) REFERENCES brand(brand_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_product_unit
    FOREIGN KEY (unit_id) REFERENCES unit_of_measure(unit_id) ON DELETE RESTRICT;

-- Step 7: Make unit_id NOT NULL (required field)
ALTER TABLE product
MODIFY COLUMN unit_id INT NOT NULL;

-- Step 8: Drop old text/enum columns (ONLY AFTER VERIFYING MIGRATION!)
-- UNCOMMENT THESE LINES AFTER CONFIRMING DATA MIGRATION IS SUCCESSFUL:
-- ALTER TABLE product DROP COLUMN brand;
-- ALTER TABLE product DROP COLUMN unit_of_measure;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check brand migration
-- SELECT 
--     p.product_name,
--     p.brand as old_brand_text,
--     b.brand_name as new_brand_name,
--     p.brand_id
-- FROM product p
-- LEFT JOIN brand b ON p.brand_id = b.brand_id
-- LIMIT 20;

-- Check unit migration
-- SELECT 
--     p.product_name,
--     p.unit_of_measure as old_unit_enum,
--     u.unit_code as new_unit_code,
--     u.unit_name as new_unit_name,
--     p.unit_id
-- FROM product p
-- LEFT JOIN unit_of_measure u ON p.unit_id = u.unit_id
-- LIMIT 20;

-- Count products by brand
-- SELECT b.brand_name, COUNT(p.product_id) as product_count
-- FROM brand b
-- LEFT JOIN product p ON b.brand_id = p.brand_id
-- GROUP BY b.brand_id, b.brand_name
-- ORDER BY product_count DESC;

-- Count products by unit
-- SELECT u.unit_name, u.unit_code, COUNT(p.product_id) as product_count
-- FROM unit_of_measure u
-- LEFT JOIN product p ON u.unit_id = p.unit_id
-- GROUP BY u.unit_id, u.unit_name, u.unit_code
-- ORDER BY product_count DESC;
