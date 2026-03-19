-- Add Fulfillment Type columns to Orders table
-- Supports both PICKUP and DELIVERY fulfillment options for online orders

-- Check if columns already exist before adding (for safety)
ALTER TABLE Orders
ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(20) DEFAULT 'PICKUP' AFTER order_type,
ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255) AFTER fulfillment_type,
ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100) AFTER delivery_address,
ADD COLUMN IF NOT EXISTS delivery_phone VARCHAR(20) AFTER delivery_city;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_fulfillment_type ON Orders(fulfillment_type);
CREATE INDEX IF NOT EXISTS idx_delivery_city ON Orders(delivery_city);

-- Add check constraint to ensure valid fulfillment types
ALTER TABLE Orders 
ADD CONSTRAINT chk_fulfillment_type CHECK (fulfillment_type IN ('PICKUP', 'DELIVERY'));

-- Update existing orders to have default PICKUP fulfillment type (if null)
UPDATE Orders SET fulfillment_type = 'PICKUP' WHERE fulfillment_type IS NULL;

-- Make fulfillment_type NOT NULL
ALTER TABLE Orders MODIFY fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'PICKUP';

COMMIT;
