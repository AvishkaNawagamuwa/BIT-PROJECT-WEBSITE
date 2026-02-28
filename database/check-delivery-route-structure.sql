-- Check the actual structure of delivery route tables in the database
USE sampath_grocery;

-- Check if old delivery_routes table exists
SHOW TABLES LIKE '%delivery%route%';

-- Check structure of DeliveryRoute table
DESCRIBE DeliveryRoute;

-- Check structure of delivery_routes table (if it exists)
DESCRIBE delivery_routes;
