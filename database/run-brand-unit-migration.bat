@echo off
echo =====================================================
echo Running Brand and Unit Migration
echo =====================================================
mysql -u root -p sampath_grocery_db < create-brand-unit-tables.sql
echo.
echo Migration completed!
echo.
pause
