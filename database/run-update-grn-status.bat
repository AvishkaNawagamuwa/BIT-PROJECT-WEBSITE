@echo off
echo ========================================
echo  Update GRN Status Enum Migration
echo ========================================
echo.
echo This will update GRN status to simplified workflow:
echo   - RECEIVED (default)
echo   - PARTIALLY_RECEIVED
echo.
pause

mysql -u root -p sampath_grocery < update-grn-status-enum.sql

echo.
echo ========================================
echo  Migration Complete!
echo ========================================
pause
