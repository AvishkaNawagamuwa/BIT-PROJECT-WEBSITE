-- Update GRN status enum to simplified workflow
-- Only 2 statuses: RECEIVED, PARTIALLY_RECEIVED
-- Remove DRAFT, APPROVED, CANCELLED

-- Step 1: Update existing records to new status values
UPDATE grn 
SET status = 'RECEIVED' 
WHERE status IN ('APPROVED', 'DRAFT');

-- Step 2: Alter the enum to only include new values
ALTER TABLE grn 
MODIFY COLUMN status ENUM('RECEIVED', 'PARTIALLY_RECEIVED') NOT NULL DEFAULT 'RECEIVED';

-- Verify the change
SELECT 'GRN Status Updated Successfully' AS Result;
SELECT DISTINCT status FROM grn;
