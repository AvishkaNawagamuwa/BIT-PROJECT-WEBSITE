# Purchase Order Smart Filtering Implementation

## Overview
This implementation adds intelligent supplier-product filtering to the Purchase Order form, making it easier and more accurate to create purchase orders by:
- Automatically filtering products when a supplier is selected
- Automatically loading the suggested purchase price based on history
- Ensuring only valid supplier-product combinations can be selected

## Business Logic

### Smart Filtering Rules

#### 1. When Supplier is Selected First
- Product dropdown automatically filters to show only products that supplier can supply
- If a product was already selected but is not supplied by the new supplier, it gets cleared
- User can only select products that this supplier actually provides

#### 2. When Product is Selected
- If supplier is already selected, system validates the combination
- System loads suggested unit price automatically

#### 3. Auto Price Loading
When both supplier AND product are selected, the system automatically:
1. Checks for last purchase price from PO history (highest priority)
2. Falls back to default purchase price from supplier_products table
3. Auto-fills the unit price field
4. User can still manually override the price if needed

### Price Priority Logic
```
1st Priority: Last Purchase Price (from actual PO history)
    ↓ (if not found)
2nd Priority: Default Purchase Price (from supplier_products table)
    ↓ (if not found)
3rd Priority: Manual Entry (user enters price)
```

## Backend Implementation

### New Database Features

#### Added to PurchaseOrderItemRepository
```java
@Query("SELECT poi.unitPrice FROM PurchaseOrderItem poi " +
       "JOIN poi.purchaseOrderRequest po " +
       "WHERE po.supplier.supplierId = :supplierId " +
       "AND poi.product.productId = :productId " +
       "AND po.status IN ('APPROVED', 'ORDERED', 'RECEIVED') " +
       "ORDER BY po.requestedDate DESC, poi.itemId DESC")
Optional<BigDecimal> findLastPurchasePrice(@Param("supplierId") Integer supplierId, 
                                            @Param("productId") Integer productId);
```

### New DTO Created

**SupplierProductPriceDTO**
- Location: `com.sampathgrocery.dto.supplier.SupplierProductPriceDTO`
- Purpose: Returns pricing information for supplier-product combinations
- Fields:
  - `defaultPurchasePrice`: Price from supplier_products table
  - `lastPurchasePrice`: Most recent price from PO history
  - `suggestedUnitPrice`: Final recommended price
  - `leadTimeDays`: Delivery lead time
  - `minimumOrderQty`: Minimum order quantity
  - `isPrimarySupplier`: Whether this is the preferred supplier

### New Service Created

**SupplierProductFilterService**
- Location: `com.sampathgrocery.service.supplier.SupplierProductFilterService`
- Purpose: Handles all supplier-product filtering logic

#### Service Methods:

**getSuppliersByProduct(Integer productId)**
- Returns list of suppliers that can supply a specific product
- Used when product is selected first

**getProductsBySupplier(Integer supplierId)**
- Returns list of products that a supplier can provide
- Used when supplier is selected first

**getPriceInformation(Integer supplierId, Integer productId)**
- Returns complete pricing information
- Includes default price, last purchase price, and suggested price

**canSupplierSupplyProduct(Integer supplierId, Integer productId)**
- Simple validation check
- Returns true/false

### New Controller Created

**SupplierProductFilterController**
- Location: `com.sampathgrocery.controller.api.SupplierProductFilterController`
- Base URL: `/api/supplier-products`

#### API Endpoints:

##### 1. Get Suppliers by Product
```http
GET /api/supplier-products/products/{productId}/suppliers
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "supplierId": 1,
      "supplierCode": "SUP-00001",
      "supplierName": "Maliban Distributors",
      "phone": "0771234567",
      "email": "supplier@example.com",
      "isActive": true
    }
  ]
}
```

##### 2. Get Products by Supplier
```http
GET /api/supplier-products/suppliers/{supplierId}/products
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": 11,
      "productCode": "PROD-00003",
      "productName": "Maliban Cream Crackers 190g",
      "categoryName": "Bakery Items",
      "barcode": "BC1772774145328",
      "brand": "Maliban",
      "unitOfMeasure": "PCS",
      "isActive": true
    }
  ]
}
```

##### 3. Get Price Information
```http
GET /api/supplier-products/price?supplierId=1&productId=11
```
**Response:**
```json
{
  "success": true,
  "data": {
    "supplierId": 1,
    "supplierName": "Maliban Distributors",
    "productId": 11,
    "productCode": "PROD-00003",
    "productName": "Maliban Cream Crackers 190g",
    "defaultPurchasePrice": 120.00,
    "lastPurchasePrice": 118.50,
    "suggestedUnitPrice": 118.50,
    "leadTimeDays": 3,
    "minimumOrderQty": 10,
    "isPrimarySupplier": true
  }
}
```

##### 4. Check if Supplier Can Supply Product
```http
GET /api/supplier-products/can-supply?supplierId=1&productId=11
```

##### 5. Get Supplier Count for Product
```http
GET /api/supplier-products/products/{productId}/supplier-count
```

##### 6. Get Product Count for Supplier
```http
GET /api/supplier-products/suppliers/{supplierId}/product-count
```

## Frontend Implementation

### JavaScript Functions Added

#### 1. onPOSupplierChange()
- Triggered when supplier dropdown changes
- Fetches products that supplier can supply
- Filters product dropdown
- Clears invalid product selections
- Reloads price if valid product still selected

#### 2. onPOProductChange()
- Triggered when product dropdown changes
- If supplier is already selected, loads suggested price

#### 3. loadSuggestedPrice(supplierId, productId)
- Fetches price information from API
- Auto-fills unit price field
- Calculates item total automatically
- Logs price source for transparency

#### 4. populateItemProductDropdown(productList)
- Helper function to populate product dropdown
- Maintains current selection if still valid

### JavaScript Event Listeners Added

```javascript
// In setupEventListeners()
const poSupplier = document.getElementById('poSupplier');
const itemProduct = document.getElementById('itemProduct');

if (poSupplier) {
    poSupplier.addEventListener('change', onPOSupplierChange);
}

if (itemProduct) {
    itemProduct.addEventListener('change', onPOProductChange);
}
```

## User Workflow

### Scenario 1: Supplier First Workflow (Most Common)

**Step 1:** User opens Purchase Order form  
**Step 2:** User selects supplier (e.g., "Maliban Distributors")  
**Step 3:** Product dropdown automatically filters to show only Maliban products  
**Step 4:** User selects product (e.g., "Maliban Cream Crackers 190g")  
**Step 5:** Unit price automatically loads from history/default  
**Step 6:** User enters quantity  
**Step 7:** Total automatically calculates  
**Step 8:** User clicks "Add Item"  

### Scenario 2: Product First Workflow

**Step 1:** User opens Purchase Order form  
**Step 2:** User selects product  
**Step 3:** System validates supplier can supply it (when user changes dropdown)  
**Step 4:** When both are selected, price auto-loads  

### Scenario 3: Changing Supplier Mid-Form

**Step 1:** User has supplier "A" selected and product "X" selected  
**Step 2:** User changes supplier to "B"  
**Step 3:** If supplier "B" cannot supply product "X":
  - Product selection is cleared
  - Price is cleared
  - User must select new product from filtered list
**Step 4:** If supplier "B" can supply product "X":
  - Product remains selected
  - Price reloads with supplier "B"'s pricing

## Benefits

### For Users
✅ Faster data entry - no need to remember which supplier provides which product  
✅ Reduced errors - cannot select invalid supplier-product combinations  
✅ Accurate pricing - system suggests correct price based on history  
✅ Consistent workflow - always using latest purchase prices  

### For Business
✅ Data integrity - all POs have valid supplier-product relationships  
✅ Price tracking - maintains accurate purchase price history  
✅ Supplier management - clear visibility of supplier capabilities  
✅ Audit trail - can track price changes over time  

### For System
✅ Database integrity - enforces referential integrity  
✅ Scalability - can handle many suppliers and products  
✅ Maintainability - clean separation of concerns  
✅ Performance - efficient queries with proper indexing  

## Testing Guide

### Test Case 1: Supplier Selection Filters Products
1. Open PO form
2. Select "Maliban Distributors"
3. Open product dropdown
4. **Expected:** Only Maliban products shown
5. Try to find Anchor products
6. **Expected:** Not in the list

### Test Case 2: Price Auto-Loading
1. Select supplier
2. Select product
3. **Expected:** Unit price field automatically fills
4. Check browser console for price source message
5. **Expected:** Shows either "Last purchase price" or "Default price"

### Test Case 3: Invalid Combination Prevention
1. Select supplier "A"
2. Select product "X" (that supplier A provides)
3. Change supplier to "B" (that doesn't provide product X)
4. **Expected:** Product X is cleared from selection
5. **Expected:** Price field is cleared

### Test Case 4: Manual Price Override
1. Select supplier and product
2. Price auto-fills to Rs. 100
3. Manually change price to Rs. 95
4. **Expected:** System accepts manual entry
5. Add item
6. **Expected:** Item added with Rs. 95

### Test Case 5: No Relationship Exists
1. Select supplier
2. Try to select product not in filtered list
3. **Expected:** Product not available
4. Cannot create invalid PO

## Troubleshooting

### Products Not Filtering
**Problem:** Product dropdown shows all products regardless of supplier  
**Solution:** Check browser console for errors. Verify supplier-product relationships exist in database.

**SQL to verify:**
```sql
SELECT sp.*, s.supplier_name, p.product_name
FROM supplier_product sp
JOIN supplier s ON s.supplier_id = sp.supplier_id
JOIN product p ON p.product_id = sp.product_id
WHERE sp.status = 'ACTIVE'
ORDER BY s.supplier_name, p.product_name;
```

### Price Not Auto-Loading
**Problem:** Unit price field remains empty  
**Solution:** 
1. Check if supplier-product relationship has purchase_price set
2. Check if there are any previous POs for this combination
3. Check browser console for API errors

**SQL to check:**
```sql
-- Check default price
SELECT purchase_price FROM supplier_product 
WHERE supplier_id = ? AND product_id = ?;

-- Check last PO price
SELECT poi.unit_price, po.requested_date
FROM purchase_order_item poi
JOIN purchase_order_request po ON po.request_id = poi.purchase_order_request_id
WHERE po.supplier_id = ? AND poi.product_id = ?
ORDER BY po.requested_date DESC
LIMIT 1;
```

### API Errors
**Problem:** 404 or 500 errors in browser console  
**Solution:**
1. Verify backend is running
2. Check if SupplierProductFilterController is loaded
3. Test API endpoints directly:
   ```
   GET http://localhost:8080/api/supplier-products/suppliers/1/products
   ```

## Database Verification Queries

### Check Supplier-Product Relationships
```sql
SELECT 
    s.supplier_name,
    COUNT(sp.product_id) as product_count
FROM supplier s
LEFT JOIN supplier_product sp ON s.supplier_id = sp.supplier_id AND sp.status = 'ACTIVE'
GROUP BY s.supplier_id, s.supplier_name
ORDER BY s.supplier_name;
```

### Check Products with Multiple Suppliers
```sql
SELECT 
    p.product_name,
    COUNT(sp.supplier_id) as supplier_count
FROM product p
LEFT JOIN supplier_product sp ON p.product_id = sp.product_id AND sp.status = 'ACTIVE'
GROUP BY p.product_id, p.product_name
HAVING COUNT(sp.supplier_id) > 1
ORDER BY supplier_count DESC;
```

### Check Price History
```sql
SELECT 
    po.po_number,
    s.supplier_name,
    p.product_name,
    poi.unit_price,
    po.requested_date
FROM purchase_order_item poi
JOIN purchase_order_request po ON po.request_id = poi.purchase_order_request_id
JOIN supplier s ON s.supplier_id = po.supplier_id
JOIN product p ON p.product_id = poi.product_id
WHERE s.supplier_id = 1 AND p.product_id = 11
ORDER BY po.requested_date DESC;
```

## Future Enhancements

### Possible Improvements
1. **Supplier Suggestion**: When user selects product, auto-select primary supplier
2. **Price Alerts**: Show warning if new price is significantly different from history
3. **Quantity Validation**: Check against minimum order quantity
4. **Lead Time Display**: Show expected delivery date based on lead time
5. **Multi-Supplier Comparison**: Show prices from all suppliers for a product
6. **Price Trend Chart**: Display price history graph
7. **Inventory Check**: Warn if adding product with zero stock
8. **Last Order Info**: Show when this product was last ordered

### Advanced Features
1. **Smart Suggestions**: AI-based product suggestions based on order history
2. **Bulk Import**: Import PO items from Excel with validation
3. **Template Orders**: Save frequently ordered product sets
4. **Auto-Reorder**: Generate POs automatically based on stock levels
5. **Supplier Performance**: Track delivery times and quality issues

## Files Modified/Created

### New Files Created
1. `SupplierProductPriceDTO.java` - Price information DTO
2. `SupplierProductFilterService.java` - Filtering service
3. `SupplierProductFilterController.java` - API controller

### Modified Files
1. `PurchaseOrderItemRepository.java` - Added findLastPurchasePrice query
2. `suppliers.js` - Added dynamic filtering functions

### No Changes Required
- `supplier_product` table already exists (from previous implementation)
- `SupplierProductRepository` already has needed queries
- Purchase Order entities already have relationships

## API Usage Examples

### Example 1: Get Products for a Supplier
```javascript
const response = await fetch('/api/supplier-products/suppliers/1/products');
const result = await response.json();
console.log(result.data); // Array of products
```

### Example 2: Get Price Info
```javascript
const supplierId = 1;
const productId = 11;
const response = await fetch(`/api/supplier-products/price?supplierId=${supplierId}&productId=${productId}`);
const result = await response.json();
console.log(result.data.suggestedUnitPrice); // e.g., 118.50
```

### Example 3: Validate Combination
```javascript
const canSupply = await fetch('/api/supplier-products/can-supply?supplierId=1&productId=11');
const result = await canSupply.json();
if (result.data) {
    console.log('Valid combination');
}
```

## Conclusion

This implementation transforms the Purchase Order creation process from a manual, error-prone task to an intelligent, guided workflow. By leveraging the supplier-product relationships established in the database, the system ensures data integrity while significantly improving user experience and operational efficiency.

The smart filtering not only prevents invalid data entry but also helps users make informed decisions by automatically suggesting prices based on historical data. This leads to more consistent pricing, better supplier management, and ultimately, improved business operations.
