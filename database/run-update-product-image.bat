@echo off
echo Running Product Image Column Update...
echo.

mysql -u root -p < update-product-image-column.sql

echo.
echo Update completed!
pause
