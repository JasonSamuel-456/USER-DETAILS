@echo off
title User Details Project Launcher
echo ========================================================
echo   Launching Full Stack Project (React + FastAPI + MySQL)
echo ========================================================
echo.
echo Starting Backend in separate window...
start "User Details Backend (FastAPI)" cmd /k "%~dp0run_backend.bat"

timeout /t 2 >nul

echo Starting Frontend in separate window...
start "User Details Frontend (React)" cmd /k "%~dp0run_frontend.bat"

echo.
echo ========================================================
echo   Both services initiated:
echo   - Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo   - Frontend: http://localhost:5173
echo ========================================================
