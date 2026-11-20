@echo off
title AI Advisor - ALL SERVICES LAUNCHER
color 0F
cls
echo.
echo  ===============================================
echo    AI BUSINESS ADVISOR - Starting All Services
echo  ===============================================
echo.

REM Kill anything on our ports first
echo  Clearing ports 5000, 8000, 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "  2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "  2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "  2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo  [1/3] Launching Python ML Service on port 8000...
start "AI Advisor - ML Service (8000)" cmd /k "cd /d "d:\AI Advisor\ml-service" && "venv\Scripts\uvicorn.exe" main:app --reload --port 8000"
timeout /t 5 /nobreak >nul

echo  [2/3] Launching Node.js API Server on port 5000...
start "AI Advisor - Node Server (5000)" cmd /k "cd /d "d:\AI Advisor\server" && node server.js"
timeout /t 4 /nobreak >nul

echo  [3/3] Launching React Frontend on port 5173...
start "AI Advisor - React Client (5173)" cmd /k "cd /d "d:\AI Advisor\client" && npm run dev"
timeout /t 8 /nobreak >nul

echo.
echo  ===============================================
echo    All services started!
echo.
echo    ML Service : http://localhost:8000/docs
echo    API Server : http://localhost:5000
echo    Frontend   : http://localhost:5173
echo  ===============================================
echo.
echo  Opening browser...
start "" "http://localhost:5173"
echo.
echo  Press any key to close this launcher window.
pause >nul
