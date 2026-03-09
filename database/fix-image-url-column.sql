-- Fix image_url column size to support base64 images
-- Base64 images can be very large (100KB+), need MEDIUMTEXT or LONGTEXT

ALTER TABLE product 
MODIFY COLUMN image_url LONGTEXT NULL;
