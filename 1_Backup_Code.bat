@echo off
echo ========================================
echo        System Code Backup Tool
echo ========================================
echo.
echo Backing up your current code...
git add .
git commit -m "user manual backup"
echo.
echo ========================================
echo Backup Complete! You can safely modify code now.
echo ========================================
pause
