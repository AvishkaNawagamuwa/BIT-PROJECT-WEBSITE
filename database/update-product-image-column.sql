-- Update product.image_url column to support base64 images
-- Base64 images are much larger than 500 characters, so we need TEXT type

USE sampath_grocery;

-- Change image_url column from VARCHAR(500) to TEXT
ALTER TABLE product 
MODIFY COLUMN image_url TEXT;

SELECT 'Product image_url column updated successfully!' AS message;
