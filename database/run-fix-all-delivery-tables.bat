@echo off
REM Batch script to fix all delivery tables comprehensively

echo ================================================
echo   FIX: Delivery Module Database Tables
echo ================================================
echo.
echo This will:
echo   1. Drop all existing delivery-related tables
echo   2. Recreate them with correct structure
echo   3. Match the entity definitions exactly
echo.
echo WARNING: This will delete all delivery data!
echo.

set /p CONFIRM="Type YES to continue: "
if not "%CONFIRM%"=="YES" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.

REM Configuration
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=sampath_grocery
set DB_USER=root

REM Prompt for password
set /p DB_PASSWORD="Enter MySQL root password: "

echo.
echo Fixing delivery tables in MySQL...
echo.

REM Try to find MySQL in common installation paths
set MYSQL_CMD=mysql
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo MySQL not found in PATH, trying common paths...
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
        set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
    ) else (
        echo ERROR: MySQL not found!
        echo Please add MySQL to your PATH or check the installation.
        pause
        exit /b 1
    )
)

%MYSQL_CMD% -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < fix-all-delivery-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   ✅ SUCCESS!
    echo ================================================
    echo.
    echo All delivery tables have been fixed!
    echo.
    echo Next steps:
    echo   1. Restart your Spring Boot application
    echo   2. Run the seed data script (optional)
    echo      - run-seed-delivery-data.bat
    echo.
) else (
    echo.
    echo ================================================
    echo   ❌ ERROR!
    echo ================================================
    echo.
    echo Check the error messages above.
    echo.
)

pause
