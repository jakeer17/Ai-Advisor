@echo off
title AI Advisor - Deploy to Vercel
color 0B
cls
echo ========================================================
echo    AI Business Advisor - 1-Click Vercel Deployer
echo ========================================================
echo.
echo  Deploying client to Vercel...
echo  (If not logged in, it will open your browser to confirm)
echo.
cd /d "%~dp0client"
npx vercel --prod
echo.
echo ========================================================
echo  Deployment complete! Copy the Production URL above.
echo ========================================================
pause
