-- සප්ලායර් නිෂ්පාදන සම්බන්ධතා වගුව
-- Supplier Products Relationship Table
-- Creates many-to-many relationship between suppliers and products

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS supplier_product;

-- Create supplier_product junction table
CREATE TABLE supplier_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary key',
    supplier_id INT NOT NULL COMMENT 'Foreign key to supplier table',
    product_id INT NOT NULL COMMENT 'Foreign key to product table',
    
    -- Optional supplier-specific product details
    supplier_product_code VARCHAR(50) NULL COMMENT 'Supplier specific product code',
    purchase_price DECIMAL(10,2) NULL COMMENT 'Purchase price from this supplier',
    lead_time_days INT NULL COMMENT 'Lead time in days for this supplier',
    minimum_order_qty INT NULL DEFAULT 1 COMMENT 'Minimum order quantity',
    is_primary_supplier BOOLEAN DEFAULT FALSE COMMENT 'Is this the primary/preferred supplier',
    last_supplied_date DATE NULL COMMENT 'Last date product was supplied',
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    created_by INT NULL COMMENT 'User who created this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    updated_by INT NULL COMMENT 'User who last updated this record',
    
    -- Foreign key constraints
    CONSTRAINT fk_supplier_product_supplier 
        FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    CONSTRAINT fk_supplier_product_product 
        FOREIGN KEY (product_id) REFERENCES product(product_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint to prevent duplicate supplier-product combinations
    CONSTRAINT uq_supplier_product UNIQUE (supplier_id, product_id),
    
    -- Indexes for performance
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary_supplier),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Supplier-Product relationship table for many-to-many mapping';

-- Sample data (optional - can be removed if not needed)
-- Insert some example relationships after suppliers and products exist

-- Example: Fresh Fruits Lanka supplies various fruits
-- INSERT INTO supplier_product (supplier_id, product_id, purchase_price, is_primary_supplier, status)
-- SELECT s.supplier_id, p.product_id, 400.00, TRUE, 'ACTIVE'
-- FROM supplier s, product p
-- WHERE s.supplier_code = 'SUP-00001' 
-- AND p.product_code = 'PROD-00005'; -- Fresh Red Apples

-- Add more relationships as needed

SELECT 'supplier_product table created successfully!' AS message;
