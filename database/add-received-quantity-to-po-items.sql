-- =====================================================
-- Add received_quantity field to purchase order items
-- Supports partial receiving workflow
-- =====================================================

USE sampath_grocery;

-- Add received_quantity column to reorder_item table
ALTER TABLE reorder_item
    ADD COLUMN IF NOT EXISTS received_quantity INT NOT NULL DEFAULT 0
    COMMENT 'Cumulative quantity received across all approved GRNs'
    AFTER quantity;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_reorder_item_received 
    ON reorder_item(request_id, received_quantity);

-- Verify the change
DESCRIBE reorder_item;

SELECT 'Migration completed: received_quantity column added to reorder_item table' AS status;
