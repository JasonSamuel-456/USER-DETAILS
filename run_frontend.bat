@echo off
title User Details Frontend (React + Vite)
echo ========================================================
echo   Starting User Details Frontend (React)
echo ========================================================
cd /d "%~dp0\frontend"

echo Starting Vite development server on http://localhost:5173 ...
call npm run dev
pause
