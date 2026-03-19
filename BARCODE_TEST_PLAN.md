# Barcode System Integration Test Script

## 🧪 Test Plan

This document outlines all tests to verify the barcode system is working correctly.

---

## Phase 1: Database Testing

### Test 1.1: Verify Column Creation
```sql
-- Expected: Should return barcode column details
DESC product_batch;

-- Check specifically for barcode
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'product_batch' AND COLUMN_NAME = 'barcode';
```

**Expected Result:** 
- Column name: `barcode`
- Type: `VARCHAR(100)`
- Nullable: `YES`

### Test 1.2: Verify Indexes
```sql
-- Check if indexes were created
SHOW INDEX FROM product_batch WHERE Column_name = 'barcode';
```

**Expected Result:** 
- idx_barcode_unique
- idx_barcode_search
- idx_product_barcode

### Test 1.3: Add Sample Data
```sql
-- Add barcodes to test records
UPDATE product_batch 
SET barcode = '8901234567890' 
WHERE batch_id = 1;

UPDATE product_batch 
SET barcode = '8901234567891' 
WHERE batch_id = 2;

-- Verify
SELECT batch_id, barcode, product_id, selling_price 
FROM product_batch 
WHERE barcode LIKE '890123%';
```

**Expected Result:** 
- 2 records returned with different barcodes
- Each barcode unique
- Pricing information visible

---

## Phase 2: API Testing

### Test 2.1: Get Pricing by Barcode
```bash
curl -X GET "http://localhost:8080/api/batches/barcode/8901234567890/pricing" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Pricing information retrieved",
  "data": {
    "batchId": 1,
    "barcode": "8901234567890",
    "productId": ...,
    "productName": "...",
    "sellingPrice": 65.00,
    "purchasePrice": 45.00,
    "mrp": 70.00,
    "stockQuantity": 150,
    "expiryDate": "2026-06-30"
  }
}
```

### Test 2.2: Get Batch by Barcode
```bash
curl -X GET "http://localhost:8080/api/batches/barcode/8901234567890" \
  -H "Content-Type: application/json"
```

**Expected Result:** ProductBatchResponse with full details

### Test 2.3: Get All Batches by Barcode
```bash
curl -X GET "http://localhost:8080/api/batches/barcode/8901234567890/all" \
  -H "Content-Type: application/json"
```

**Expected Result:** List of ProductBatchResponse (FIFO ordered)

### Test 2.4: Deduct Stock by Barcode
```bash
curl -X POST "http://localhost:8080/api/batches/barcode/8901234567890/deduct-stock" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2,
    "referenceNumber": "TEST-001"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock deducted successfully",
  "data": {
    "barcode": "8901234567890",
    "quantityDeducted": 2,
    "referenceNumber": "TEST-001",
    "message": "Stock deducted successfully using barcode"
  }
}
```

**Verify in Database:**
```sql
SELECT batch_id, barcode, stock_quantity 
FROM product_batch 
WHERE barcode = '8901234567890';
-- Stock should be reduced by 2
```

---

## Phase 3: POS Integration Testing

### Test 3.1: Barcode Scanning Simulation
1. Open POS page: http://localhost:8080/pos
2. In barcode input field, type: `8901234567890`
3. Press Enter

**Expected Behavior:**
- ✅ Product appears in shopping cart
- ✅ Unit price displayed correctly (from batch)
- ✅ Stock quantity shown
- ✅ Batch/Expiry info visible
- ✅ No console errors

### Test 3.2: Multiple Barcode Scans
1. Scan first product: `8901234567890`
2. Scan second product: `8901234567891`
3. Modify quantities

**Expected Behavior:**
- ✅ Both items in cart
- ✅ Correct prices for each
- ✅ Cart total calculated correctly
- ✅ Each item shows batch info

### Test 3.3: Test Insufficient Stock
1. Create batch with limited stock (e.g., 2 units)
2. In POS, scan barcode multiple times to exceed stock
3. Try to complete transaction

**Expected Behavior:**
- ❌ Error message on deduction attempt
- ✅ Transaction not completed
- ✅ Stock remains unchanged

---

## Phase 4: Data Validation Tests

### Test 4.1: Unique Barcode Constraint
```sql
-- Try to insert duplicate barcode (should fail)
UPDATE product_batch SET barcode = '8901234567890' WHERE batch_id = 2;
-- Expected: Error - Duplicate entry
```

### Test 4.2: Barcode Not Found
```bash
curl -X GET "http://localhost:8080/api/batches/barcode/9999999999999/pricing"
# Expected: 404 Not Found error
```

### Test 4.3: Barcode with NULL Value
```sql
-- Test batch without barcode
INSERT INTO product_batch (
  batch_code, product_id, purchase_price, selling_price, 
  stock_quantity, received_quantity, received_date
) VALUES (
  'TEST-BATCH', 1, 50.00, 75.00, 100, 100, NOW()
);

# Query should not find by barcode
SELECT * FROM product_batch WHERE barcode = '';
# Expected: No results
```

---

## Phase 5: Performance Testing

### Test 5.1: Barcode Lookup Speed
```sql
-- Time a barcode lookup
SELECT SQL_NO_CACHE batch_id, barcode, selling_price 
FROM product_batch 
WHERE barcode = '8901234567890';

-- Expected: < 1ms
```

### Test 5.2: FIFO Retrieval with Multiple Batches
```sql
-- Add multiple batches with same barcode but different expiry
INSERT INTO product_batch (barcode, ...) VALUES ('TEST-BATCH', ...);
INSERT INTO product_batch (barcode, ...) VALUES ('TEST-BATCH', ...);

-- Retrieve and verify FIFO order
SELECT batch_id, barcode, expiry_date 
FROM product_batch 
WHERE barcode = 'TEST-BATCH' 
ORDER BY expiry_date ASC;

-- Expected: < 10ms, ordered by expiry date
```

---

## Phase 6: Stock Movement Tracking

### Test 6.1: Verify Stock Movement Log
```bash
# Deduct stock via barcode
POST /api/batches/barcode/8901234567890/deduct-stock

# Check stock movements table
SELECT * FROM stock_movement 
WHERE reference_number = 'TEST-001' 
ORDER BY created_at DESC LIMIT 5;

# Expected: Movement logged with:
# - Batch ID
# - Quantity deducted (negative)
# - Movement type: SALE
# - Reference number: TEST-001
# - Timestamp recorded
```

---

## Phase 7: Frontend Error Handling

### Test 7.1: Invalid Barcode in POS
```javascript
// Browser console
document.getElementById('barcodeInput').value = 'INVALID-BC';
// Press Enter

// Expected:
// - Product not found message
// - No item added to cart
// - Focus returns to barcode input
```

### Test 7.2: Network Error Handling
```javascript
// Simulate network error
// Open DevTools > Network tab
// Throttle to Offline
// Try scanning a product

// Expected:
// - Error message displayed
// - Graceful error handling
// - No page crash
```

---

## Phase 8: Batch Ordering (FIFO)

### Test 8.1: Verify FIFO on Stock Deduction
```sql
-- Create multiple batches with same barcode
INSERT INTO product_batch (batch_code, barcode, product_id, stock_quantity, 
  expiry_date, purchase_price, selling_price, received_date) 
VALUES 
('BATCH-A', '8901234567890', 1, 10, '2026-06-30', 45, 65, NOW()),
('BATCH-B', '8901234567890', 1, 10, '2026-05-30', 45, 65, NOW()),
('BATCH-C', '8901234567890', 1, 10, '2026-07-30', 45, 65, NOW());

# Deduct 15 units
POST /api/batches/barcode/8901234567890/deduct-stock with quantity=15

# Verify FIFO order (BATCH-B should be empty first as earliest expiry)
SELECT batch_code, stock_quantity, expiry_date 
FROM product_batch 
WHERE barcode = '8901234567890' 
ORDER BY expiry_date;

# Expected:
# BATCH-B: 0 (consumed first - earliest expiry)
# BATCH-A: 5 (consumed 5 units)
# BATCH-C: 10 (untouched - latest expiry)
```

---

## 📋 Test Execution Checklist

- [ ] All Phase 1 database tests pass
- [ ] All Phase 2 API tests return correct responses
- [ ] Phase 3 POS integration works smoothly
- [ ] Phase 4 data validation handles errors correctly
- [ ] Phase 5 performance is acceptable
- [ ] Phase 6 stock movement logged properly
- [ ] Phase 7 error handling is graceful
- [ ] Phase 8 FIFO ordering is correct

---

## ✅ Sign-Off

**Tested By:** ____________  
**Date:** ____________  
**System Status:** ☐ PASS ☐ FAIL  
**Comments:**  
_______________________

---

**Version:** 1.0  
**Last Updated:** 2026-03-18
