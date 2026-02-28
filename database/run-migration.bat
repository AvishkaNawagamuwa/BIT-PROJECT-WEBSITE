@echo off
echo Running database migration to remove unnecessary employee fields...
echo Removing: department, hired_date, employment_type, salary
echo.

REM Update path to your MySQL installation
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p12345678 sampath_grocery -e "ALTER TABLE Employee DROP COLUMN department, DROP COLUMN hired_date, DROP COLUMN employment_type, DROP COLUMN salary; SELECT 'Migration completed successfully!' AS status;"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo Please check if MySQL is installed at the path above.
    echo Or run the SQL manually in MySQL Workbench:
    echo.
    echo USE sampath_grocery;
    echo ALTER TABLE Employee 
    echo     DROP COLUMN department,
    echo     DROP COLUMN hired_date,
    echo     DROP COLUMN employment_type,
    echo     DROP COLUMN salary;
    echo.
) else (
    echo.
    echo SUCCESS: Unnecessary columns removed from Employee table!
    echo Employee table now only has essential fields for exam.
)

pause
