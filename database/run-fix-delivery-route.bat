@echo off
REM Batch script to fix the DeliveryRoute table structure

echo ================================================
echo   Fix DeliveryRoute Table Structure
echo ================================================
echo.

REM Configuration
set DB_HOST=localhost  
set DB_PORT=3306
set DB_NAME=sampath_grocery
set DB_USER=root

REM Prompt for password
set /p DB_PASSWORD="Enter MySQL root password: "

echo.
echo Connecting to MySQL and fixing DeliveryRoute table...
echo.

mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < fix-delivery-route-table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   ✅ DeliveryRoute Table Fixed Successfully!
    echo ================================================
    echo.
    echo The table structure now matches the entity.
    echo You can now restart your application.
    echo.
) else (
    echo.
    echo ================================================
    echo   ❌ Error fixing table
    echo ================================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
