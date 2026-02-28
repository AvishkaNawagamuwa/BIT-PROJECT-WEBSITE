@echo off
REM Batch script to run Phase 6 Delivery Management database migration
REM Windows batch file for MySQL

echo ================================================
echo   Phase 6: Delivery Management - DB Migration
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
echo Connecting to MySQL...
echo Host: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Run the migration
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < phase6-delivery-migration.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   ✅ MIGRATION SUCCESSFUL
    echo ================================================
    echo.
    echo The following tables have been created:
    echo   1. Driver
    echo   2. Vehicle
    echo   3. Delivery
    echo   4. DeliveryRoute
    echo   5. DeliveryRouteItem
    echo   6. DeliveryStatusHistory
    echo   7. DriverAttendance
    echo.
    echo You can now start the Spring Boot application!
    echo ================================================
) else (
    echo.
    echo ================================================
    echo   ❌ MIGRATION FAILED
    echo ================================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   - Wrong password
    echo   - MySQL server not running
    echo   - Database 'sampath_grocery' doesn't exist
    echo   - Required tables (Employee, User, Order) don't exist
    echo.
    echo ================================================
)

echo.
pause
