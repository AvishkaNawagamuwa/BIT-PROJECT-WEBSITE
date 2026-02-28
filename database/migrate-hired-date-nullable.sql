-- Migration: Remove unnecessary fields from Employee table
-- Date: 2026-02-18
-- Reason: department, hired_date, employment_type, salary removed from employee form (not needed for exam demo)

USE sampath_grocery;

-- Drop the unnecessary columns
ALTER TABLE Employee 
    DROP COLUMN department,
    DROP COLUMN hired_date,
    DROP COLUMN employment_type,
    DROP COLUMN salary;

-- Verify the changes
DESCRIBE Employee;
