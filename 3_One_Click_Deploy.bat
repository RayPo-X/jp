@echo off
echo ========================================
echo        One-Click Deploy and Backup
echo ========================================
echo.
echo Step 1: Saving your current code...
git add .
git commit -m "chore: auto backup before deploy"
echo.
echo Step 2: Uploading source code to GitHub...
git push origin main
echo.
echo Step 3: Deploying website to public web page...
call npm run deploy
echo.
echo ========================================
echo All Done! Code is backed up and Website is LIVE!
echo ========================================
pause
