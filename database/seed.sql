-- Sampath Grocery System - Seed Data
-- PHASE 1: Initial data for roles, users, and employees

USE sampath_grocery;

-- ============================================
-- SEED DATA - PHASE 1
-- ============================================

-- Default Roles
INSERT INTO Role (role_name, permissions, description, is_active) VALUES
('ROLE_SUPER_ADMIN', 
 '["ALL"]', 
 'Super Administrator with full system access',
 TRUE),
 
('ROLE_MANAGER', 
 '["MANAGE_PRODUCTS", "MANAGE_INVENTORY", "MANAGE_ORDERS", "MANAGE_SUPPLIERS", "VIEW_REPORTS", "MANAGE_EMPLOYEES", "APPROVE_REORDERS", "MANAGE_CUSTOMERS", "MANAGE_DELIVERIES"]', 
 'Shop Manager with comprehensive access',
 TRUE),
 
('ROLE_CASHIER', 
 '["PROCESS_SALES", "VIEW_PRODUCTS", "VIEW_CUSTOMERS", "MANAGE_ORDERS", "VIEW_INVENTORY", "PROCESS_PAYMENTS"]', 
 'Cashier - Point of Sale operations',
 TRUE),
 
('ROLE_STOREKEEPER', 
 '["MANAGE_INVENTORY", "MANAGE_PRODUCTS", "CREATE_REORDERS", "VIEW_STOCK_ALERTS", "UPDATE_BATCHES", "CREATE_GRN"]', 
 'Storekeeper - Inventory management',
 TRUE),
 
('ROLE_DELIVERY', 
 '["VIEW_DELIVERIES", "UPDATE_DELIVERY_STATUS", "VIEW_ORDERS", "VIEW_CUSTOMERS"]', 
 'Delivery Driver - Route and delivery management',
 TRUE),
 
('ROLE_CUSTOMER', 
 '["VIEW_PRODUCTS", "PLACE_ORDER", "VIEW_ORDER_HISTORY", "MANAGE_PROFILE", "VIEW_LOYALTY_POINTS"]', 
 'Customer - Online store access and ordering',
 TRUE);

-- Default Super Admin User
-- Password: Admin@123 (BCrypt hash - change this in production!)
INSERT INTO User (username, password, email, role_id, is_active, is_verified) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye/JSmq8cPLy2zDf2XqF8W7lOPO3bVW3y', 'admin@sampathgrocery.lk', 1, TRUE, TRUE);

-- Default Admin Employee
INSERT INTO Employee (employee_code, user_id, full_name, phone, address, city, designation, department, hired_date, employment_type, salary, is_active, created_by) VALUES
('EMP-00001', 1, 'System Administrator', '0112345678', 'No. 259, Waragoda Road, Kelaniya', 'Kelaniya', 'System Administrator', 'IT', CURDATE(), 'FULL_TIME', 50000.00, TRUE, 1);

