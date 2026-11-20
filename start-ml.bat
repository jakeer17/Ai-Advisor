@echo off
title AI Advisor - Python ML Service (Port 8000)
color 0B
echo ============================================
echo   AI Advisor - Python FastAPI ML Service
echo   Running on http://localhost:8000
echo ============================================
echo.
cd /d "d:\AI Advisor\ml-service"
call venv\Scripts\activate.bat
uvicorn main:app --reload --port 8000
pause

