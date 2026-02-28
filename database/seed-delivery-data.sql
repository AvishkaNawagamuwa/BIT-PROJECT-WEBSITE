-- Sampath Grocery System - Delivery Module Seed Data
-- This file adds sample drivers and vehicles for testing

USE sampath_grocery;

-- ============================================
-- SAMPLE DRIVERS
-- ============================================

INSERT INTO Driver (driver_code, full_name, phone, license_number, license_expiry_date, is_active, created_by) VALUES
('DRV-00001', 'Rohan Silva', '0771234567', 'B1234567', '2025-12-31', TRUE, 1),
('DRV-00002', 'Priya Fernando', '0769876543', 'B2345678', '2025-06-30', TRUE, 1),
('DRV-00003', 'Kasun Perera', '0775555555', 'B3456789', '2026-03-15', TRUE, 1),
('DRV-00004', 'Nuwan Bandara', '0763333333', 'B4567890', '2024-12-31', FALSE, 1),
('DRV-00005', 'Dinesh Kumar', '0777777777', 'B5678901', '2025-09-20', TRUE, 1);

-- ============================================
-- SAMPLE VEHICLES
-- ============================================

INSERT INTO Vehicle (vehicle_code, vehicle_number, vehicle_type, make, model, year, fuel_type, capacity, insurance_exp_date, license_exp_date, is_active, created_by) VALUES
('VEH-00001', 'CAB-1234', 'VAN', 'Toyota', 'Hiace', 2020, 'DIESEL', 1000.00, '2024-12-31', '2025-06-30', TRUE, 1),
('VEH-00002', 'WP-ABC-5678', 'TRUCK', 'Isuzu', 'Elf', 2019, 'DIESEL', 2000.00, '2024-11-30', '2025-05-15', TRUE, 1),
('VEH-00003', 'KY-XYZ-9012', 'VAN', 'Nissan', 'Caravan', 2021, 'DIESEL', 800.00, '2025-03-31', '2025-08-20', TRUE, 1),
('VEH-00004', 'GE-DEF-3456', 'MOTORCYCLE', 'Honda', 'CBR', 2022, 'PETROL', 50.00, '2024-10-15', '2025-04-10', TRUE, 1),
('VEH-00005', 'CP-GHI-7890', 'VAN', 'Toyota', 'KDH', 2020, 'DIESEL', 1200.00, '2025-01-31', '2025-07-25', FALSE, 1);

-- ============================================
-- Verification
-- ============================================

-- Check inserted data
SELECT 'Drivers:' AS Info, COUNT(*) AS Count FROM Driver;
SELECT 'Vehicles:' AS Info, COUNT(*) AS Count FROM Vehicle;

-- List all drivers
SELECT driver_id, driver_code, full_name, phone, license_number, is_active FROM Driver;

-- List all vehicles
SELECT vehicle_id, vehicle_code, vehicle_number, vehicle_type, make, model, is_active FROM Vehicle;

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
