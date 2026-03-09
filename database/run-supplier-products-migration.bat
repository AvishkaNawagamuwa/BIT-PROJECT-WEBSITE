@echo off
REM Run supplier_product table creation migration
REM සප්ලායර්-නිෂ්පාදන සම්බන්ධතා වගුව නිර්මාණය කිරීම

echo.
echo ====================================================
echo   Supplier-Product Relationship Migration
echo   සප්ලායර්-නිෂ්පාදන සම්බන්ධතා Migration
echo ====================================================
echo.

REM Database configuration
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=sampath_grocery_db
set DB_USER=root
set DB_PASS=1234

echo Connecting to database: %DB_NAME%
echo Database server: %DB_HOST%:%DB_PORT%
echo.

REM Run the SQL migration
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% < create-supplier-products-table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Migration completed successfully!
    echo [සාර්ථකයි] Migration සාර්ථකව සිදු කරන ලදී!
    echo.
) else (
    echo.
    echo [ERROR] Migration failed! Check the error messages above.
    echo [දෝෂයකි] Migration අසාර්ථක විය! ඉහත දෝෂ පණිවිඩ පරීක්ෂා කරන්න.
    echo.
)

pause
