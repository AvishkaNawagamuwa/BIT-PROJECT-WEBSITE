@echo off
echo ====================================================
echo Running PO Receiving Quantity Migration
echo ====================================================

REM Replace with your actual MySQL credentials
set DB_USER=root
set DB_PASS=root
set DB_NAME=sampath_grocery

echo.
echo Executing migration script...
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < add-received-quantity-to-po-items.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Migration completed successfully!
) else (
    echo.
    echo ✗ Migration failed. Please check the error messages above.
)

echo.
pause
