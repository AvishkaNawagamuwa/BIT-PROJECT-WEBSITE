# Supplier-Product Many-to-Many Relationship Implementation Guide

## Overview
This implementation adds a many-to-many relationship between suppliers and products, allowing:
- One supplier can supply many products
- One product can come from multiple suppliers
- Proper tracking of which supplier provides which products

## Database Schema

### New Table: `supplier_product`
Junction table that links suppliers and products with additional metadata:

```sql
CREATE TABLE supplier_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    product_id INT NOT NULL,
    supplier_product_code VARCHAR(50),
    purchase_price DECIMAL(10,2),
    lead_time_days INT,
    minimum_order_qty INT DEFAULT 1,
    is_primary_supplier BOOLEAN DEFAULT FALSE,
    last_supplied_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    UNIQUE KEY (supplier_id, product_id)
);
```

## Setup Instructions

### Step 1: Run Database Migration

```bash
cd database
run-supplier-products-migration.bat
```

Or manually run:
```bash
mysql -u root -p1234 sampath_grocery_db < create-supplier-products-table.sql
```

### Step 2: Restart the Application

Since we added new entities and relationships, restart the Spring Boot application:

```bash
cd backend
mvnw spring-boot:run
```

Or if using your IDE, restart the application.

## Backend Components Created

### 1. Entity Classes

#### SupplierProduct Entity
- Location: `com.sampathgrocery.entity.supplier.SupplierProduct`
- Represents the relationship between supplier and product
- Includes fields like purchase price, lead time, primary supplier flag

#### Updated Entities
- **Supplier**: Added `@OneToMany` relationship with SupplierProduct
- **Product**: Added `@OneToMany` relationship with SupplierProduct

### 2. Repository

#### SupplierProductRepository
- Location: `com.sampathgrocery.repository.supplier.SupplierProductRepository`
- Custom queries for:
  - Finding products by supplier
  - Finding suppliers by product
  - Finding primary supplier for a product
  - Counting relationships

### 3. DTOs

#### SupplierProductRequest
- Used for creating/updating supplier-product associations
- Fields: productId, supplierProductCode, purchasePrice, etc.

#### SupplierProductResponse
- Returns supplier-product relationship data
- Includes product and supplier details

#### Updated DTOs
- **SupplierRequest**: Added `productIds` list
- **SupplierResponse**: Added `suppliedProducts` list and `totalProducts` count

### 4. Service Layer

#### SupplierService - New Methods
- `addProductsToSupplier()`: Adds multiple products to a supplier
- `updateSupplierProducts()`: Updates supplier's product list
- `removeProductFromSupplier()`: Removes a product from supplier
- `getSupplierProducts()`: Gets all products for a supplier

#### Updated Methods
- `createSupplier()`: Now handles product associations
- `updateSupplier()`: Now updates product associations
- `toResponse()`: Now includes supplied products in response

### 5. Controller Layer

#### SupplierController - New Endpoints

**GET /api/suppliers/{supplierId}/products**
- Returns all products supplied by a supplier

**POST /api/suppliers/{supplierId}/products**
- Request Body: `[1, 2, 3]` (array of product IDs)
- Adds products to a supplier

**DELETE /api/suppliers/{supplierId}/products/{productId}**
- Removes a product from a supplier

## Frontend Components Updated

### 1. Supplier Form HTML (suppliers.html)

#### New Section: "Products Supplied"
- Location: After "Business Information" section
- Features:
  - Product search box
  - Scrollable checkbox list of all products
  - Selected product counter
  - Product details showing: name, code, category, barcode

### 2. JavaScript Updates (suppliers.js)

#### New Global Variable
```javascript
let selectedProductIds = [];
```

#### New Functions

**populateProductCheckboxes()**
- Populates the product checkbox list from the products array
- Shows product name, code, category, and barcode
- Only shows active products

**filterProductCheckboxes()**
- Filters products based on search input
- Real-time search functionality

**updateSelectedProductCount()**
- Updates the counter showing how many products are selected
- Updates global `selectedProductIds` array

**getSelectedProductIds()**
- Returns array of selected product IDs

**setSelectedProducts(productIds)**
- Sets checkboxes based on provided product IDs
- Used when editing a supplier

#### Updated Functions

**getSupplierFormData()**
- Now includes `productIds` field

**editSupplier(supplierId)**
- Loads and sets the supplier's products
- Checks appropriate checkboxes

**clearSupplierForm()**
- Clears selected products

**displaySuppliers()**
- Shows product count badge for each supplier

## Usage Guide

### Creating a New Supplier with Products

1. Click "Add Supplier" button
2. Fill in supplier details (name, contact, etc.)
3. Scroll to "Products Supplied" section
4. Use search box to find products
5. Check products that this supplier can provide
6. Selected count updates automatically
7. Click "Add Supplier"

### Editing Supplier Products

1. Click Edit button on a supplier
2. Form loads with supplier details
3. Previously selected products are checked
4. Add or remove products by checking/unchecking
5. Click "Update Supplier"

### Viewing Supplier Products

- In the suppliers table, the "Products" column shows a badge with product count
- When editing, all selected products are visible

## API Examples

### Create Supplier with Products

```json
POST /api/suppliers
{
  "supplierCode": "SUP-00004",
  "supplierName": "Fresh Fruits Lanka",
  "contactPerson": "John Doe",
  "phone": "0771234567",
  "email": "supplier@example.com",
  "address": "123 Main St, Colombo",
  "city": "Colombo",
  "paymentTerms": "Credit 30 days",
  "creditLimit": 500000,
  "isActive": true,
  "productIds": [9, 10, 11, 12, 13]
}
```

### Update Supplier Products

```json
PUT /api/suppliers/1
{
  "supplierCode": "SUP-00001",
  "supplierName": "Updated Supplier Name",
  "phone": "0771234567",
  "address": "Updated Address",
  "productIds": [9, 10, 14]  // Replaces all existing products
}
```

### Get Supplier with Products

```json
GET /api/suppliers/1

Response:
{
  "success": true,
  "data": {
    "supplierId": 1,
    "supplierName": "Fresh Fruits Lanka",
    "supplierCode": "SUP-00001",
    "totalProducts": 5,
    "suppliedProducts": [
      {
        "id": 1,
        "productId": 9,
        "productName": "Anchor Full Cream Milk Powder 400g",
        "productCode": "PROD-00001",
        "categoryName": "Dairy Products",
        "barcode": "BC1772773991365",
        "status": "ACTIVE"
      },
      // ... more products
    ]
  }
}
```

## Benefits

### Business Benefits
1. **Better Supplier Management**: Track exactly which supplier provides which products
2. **Price Comparison**: Can store different purchase prices from different suppliers
3. **Supplier Performance**: Track last supplied date, lead times
4. **Primary Supplier Selection**: Mark preferred suppliers for products
5. **Procurement Efficiency**: Easier purchase order creation

### Technical Benefits
1. **Scalable Design**: Proper many-to-many relationship
2. **Data Integrity**: Foreign key constraints prevent orphaned records
3. **Flexible**: Can add more fields later (e.g., discount, MOQ)
4. **Normalized**: No duplicate data in database

## Future Enhancements

### Possible Additions
1. **Purchase Price Tracking**: Show price history per supplier
2. **Supplier Comparison**: Compare prices across suppliers for same product
3. **Auto-Suggest**: Suggest supplier when creating PO based on product selection
4. **Lead Time Reports**: Analyze supplier delivery performance
5. **Minimum Order Quantity**: Set MOQ per supplier-product combination
6. **Discount Management**: Track supplier-specific discounts

### Advanced Features
1. **Primary Supplier Auto-Select**: When adding product to PO, auto-select primary supplier
2. **Supplier Product Catalog**: Separate page showing all products per supplier
3. **Product Suppliers View**: On product page, show all suppliers
4. **Supplier Rating**: Based on delivery performance, quality, pricing
5. **Contract Management**: Link supplier contracts to products

## Troubleshooting

### Products Not Showing in Checkbox List
- Check that products are loaded: Open browser console, check `products` array
- Ensure products have `isActive = true`
- Check database: `SELECT * FROM product WHERE is_active = 1`

### Selected Products Not Saving
- Check browser console for JavaScript errors
- Verify `productIds` is in the request payload (Network tab)
- Check backend logs for errors
- Ensure ProductRepository is properly injected

### Products Count Not Showing
- Refresh the supplier list after creating/updating
- Check API response includes `suppliedProducts` array
- Verify SupplierService `toResponse()` method includes products

### Database Migration Failed
- Check MySQL is running
- Verify database credentials in batch file
- Ensure `supplier` and `product` tables exist
- Check for existing `supplier_product` table: `DROP TABLE IF EXISTS supplier_product`

## Testing Checklist

- [ ] Can create supplier without products
- [ ] Can create supplier with multiple products
- [ ] Can edit supplier and add products
- [ ] Can edit supplier and remove products
- [ ] Product count displays correctly in table
- [ ] Search products works in supplier form
- [ ] Selected product counter updates
- [ ] Can view supplier products via API
- [ ] Database constraints work (can't add invalid product ID)
- [ ] Duplicate prevention works (can't add same product twice)

## File Changes Summary

### New Files Created
1. `database/create-supplier-products-table.sql`
2. `database/run-supplier-products-migration.bat`
3. `backend/.../entity/supplier/SupplierProduct.java`
4. `backend/.../repository/supplier/SupplierProductRepository.java`
5. `backend/.../dto/supplier/SupplierProductRequest.java`
6. `backend/.../dto/supplier/SupplierProductResponse.java`

### Files Modified
1. `backend/.../entity/supplier/Supplier.java` - Added relationship
2. `backend/.../entity/product/Product.java` - Added relationship
3. `backend/.../dto/supplier/SupplierRequest.java` - Added productIds
4. `backend/.../dto/supplier/SupplierResponse.java` - Added suppliedProducts
5. `backend/.../service/supplier/SupplierService.java` - Added product methods
6. `backend/.../controller/api/SupplierController.java` - Added endpoints
7. `backend/.../templates/suppliers.html` - Added product selection UI
8. `backend/.../static/js/suppliers.js` - Added product selection logic

## Conclusion

This implementation provides a professional, scalable solution for managing supplier-product relationships in your grocery system. The many-to-many design follows database normalization best practices and provides flexibility for future enhancements like price comparison, supplier performance tracking, and automated purchase order suggestions.
