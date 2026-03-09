@echo off
echo ========================================
echo Fixing Products with unit_id = 0
echo ========================================
echo.

set /p MYSQL_USER="Enter MySQL username (default: root): " || set MYSQL_USER=root
set /p MYSQL_PASSWORD="Enter MySQL password: "
set /p DB_NAME="Enter database name (default: sampath_grocery): " || set DB_NAME=sampath_grocery

echo.
echo Running fix for products with unit_id = 0...
echo.

mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < fix-product-unit-zero.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Fix applied successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Error occurred during fix!
    echo ========================================
)

echo.
pause
