-- =========================================================
-- BARCODE IMPLEMENTATION FOR PRODUCT BATCH TABLE
-- Adds barcode support to product_batch table
-- =========================================================

USE sampath_grocery;

-- Add barcode column to product_batch table if it doesn't exist
ALTER TABLE product_batch 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) NULL COMMENT 'Product barcode for identification';

-- Add unique index on barcode (allowing NULL values)
ALTER TABLE product_batch 
ADD UNIQUE INDEX IF NOT EXISTS idx_barcode_unique (barcode);

-- Add regular index on barcode for search performance
ALTER TABLE product_batch 
ADD INDEX IF NOT EXISTS idx_barcode_search (barcode);

-- Add product barcode search index (composite)
ALTER TABLE product_batch 
ADD INDEX IF NOT EXISTS idx_product_barcode (product_id, barcode);

-- Verify the columns exist
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'product_batch' 
AND TABLE_SCHEMA = 'sampath_grocery'
ORDER BY ORDINAL_POSITION;
