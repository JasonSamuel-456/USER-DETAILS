@echo off
title User Details Backend (FastAPI)
echo ========================================================
echo   Starting User Details API Backend (FastAPI + MySQL)
echo ========================================================
cd /d "%~dp0\backend"

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Creating venv...
    python -m venv venv
    venv\Scripts\python.exe -m pip install -r requirements.txt
)

echo Starting Uvicorn server on http://localhost:8000 ...
echo Swagger UI docs available at: http://localhost:8000/docs
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
