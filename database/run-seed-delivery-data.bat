@echo off
echo ====================================
echo Sampath Grocery - Delivery Seed Data
echo ====================================
echo.
echo Running seed data script...
echo.

mysql -u root -p sampath_grocery < seed-delivery-data.sql

echo.
echo ====================================
echo Seed data inserted successfully!
echo ====================================
echo.
pause
