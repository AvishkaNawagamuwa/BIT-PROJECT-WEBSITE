@echo off
REM Fix Order Status Lookup Table
REM Runs the SQL migration to create OrderStatus table and seed it

echo ========================================
echo Running Order Status Table Migration...
echo ========================================

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 < fix-order-status-table.sql

if errorlevel 1 (
    echo [ERROR] Migration failed!
    pause
    exit /b 1
) else (
    echo [SUCCESS] Order Status table created and seeded successfully!
)

pause
