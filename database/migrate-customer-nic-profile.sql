-- Migration: Replace Gender + Date of Birth with NIC in Customer Management
-- Author: System
-- Date: 2026-03-17
-- Description: 
--   - Remove Gender and Date of Birth fields from CustomerProfile
--   - Add NIC (National ID Card) field to Customer entity
--   - This allows storing customer NIC directly in the main Customer table
--     while removing personal demographic fields from the profile

-- Step 1: Add NIC column to Customer table
ALTER TABLE Customer ADD COLUMN nic VARCHAR(20) UNIQUE;

-- Step 2: Remove gender and date_of_birth columns from CustomerProfile table
ALTER TABLE CustomerProfile DROP COLUMN IF EXISTS gender;
ALTER TABLE CustomerProfile DROP COLUMN IF EXISTS date_of_birth;

-- Step 3: Update metadata/audit (optional - uncomment if your schema supports this)
-- ALTER TABLE Customer MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE CustomerProfile MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verification queries (run to verify migration)
-- SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'Customer' AND COLUMN_NAME IN ('nic');

-- SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'CustomerProfile' AND COLUMN_NAME IN ('gender', 'date_of_birth');
