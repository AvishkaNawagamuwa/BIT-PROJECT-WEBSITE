-- =========================================================
-- SAMPLE DATA: Add Barcodes to Existing Product Batches
-- =========================================================
-- This script adds sample barcodes to existing product_batch records
-- for testing and demonstration purposes

USE sampath_grocery;

-- Update existing batches with sample EAN-13 barcodes
-- Note: Replace with actual barcodes from your products

-- Sample 1: Anchor Milk
UPDATE product_batch 
SET barcode = '8906056501208'
WHERE batch_code = 'BATCH-00001' AND barcode IS NULL
LIMIT 1;

-- Sample 2: Maliban Biscuits
UPDATE product_batch 
SET barcode = '8919033001052'
WHERE batch_code = 'BATCH-00002' AND barcode IS NULL
LIMIT 1;

-- Sample 3: Nested Coffee
UPDATE product_batch 
SET barcode = '8904308000149'
WHERE batch_code = 'BATCH-00003' AND barcode IS NULL
LIMIT 1;

-- Sample 4: Coca Cola
UPDATE product_batch 
SET barcode = '8901499000000'
WHERE batch_code = 'BATCH-00004' AND barcode IS NULL
LIMIT 1;

-- Sample 5: Rice
UPDATE product_batch 
SET barcode = '8901234567895'
WHERE batch_code = 'BATCH-00005' AND barcode IS NULL
LIMIT 1;

-- Verify the updates
SELECT batch_id, batch_code, barcode, product_id, stock_quantity, selling_price 
FROM product_batch 
WHERE barcode IS NOT NULL
ORDER BY batch_id;

-- Count how many batches now have barcodes
SELECT COUNT(*) as total_batches, 
       COUNT(CASE WHEN barcode IS NOT NULL THEN 1 END) as batches_with_barcode
FROM product_batch;
