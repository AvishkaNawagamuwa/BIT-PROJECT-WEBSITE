@echo off
REM ============================================
REM BARCODE MIGRATION - Batch Execution Script
REM Adds barcode support to product_batch table
REM ============================================

echo.
echo ============================================
echo Sampath Grocery - Barcode Migration Script
echo ============================================
echo.

REM Set connection parameters - Update with your MySQL credentials
set MYSQL_USER=root
set MYSQL_PASSWORD=your_password
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set DATABASE=sampath_grocery

echo Starting barcode migration...
echo.

REM Execute the migration SQL script
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -h %MYSQL_HOST% -P %MYSQL_PORT% %DATABASE% < add-barcode-to-product-batch.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo SUCCESS: Barcode migration completed!
    echo ============================================
    echo.
    echo Table structure updated with:
    echo - barcode column (VARCHAR(100), NULLABLE, UNIQUE)
    echo - Indexes for search performance
    echo.
) else (
    echo.
    echo ERROR: Migration failed!
    echo Please check your MySQL connection settings
    echo.
    pause
)

pause
