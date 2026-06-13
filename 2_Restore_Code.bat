@echo off
echo ========================================
echo        Time Machine: Restore Code
echo ========================================
echo.
echo WARNING: This will DELETE all un-backed-up changes!
echo It will forcefully rewind the code to the last backup.
echo.
echo If you are sure, press any key to continue.
echo If you want to CANCEL, close this window.
echo.
pause

echo.
echo Starting time machine...
git reset --hard HEAD~1
echo.
echo ========================================
echo Restore Complete! Code is back to previous version.
echo Please refresh your browser.
echo ========================================
pause
