@echo off
title Push Project to GitHub
echo ========================================================
echo   Deploy User Details Project to Your GitHub Profile
echo ========================================================
echo.
cd /d "%~dp0"

for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set EXISTING_REMOTE=%%a

if not "%EXISTING_REMOTE%"=="" (
    echo Current GitHub Remote: %EXISTING_REMOTE%
    echo.
    set /p CHOICE="Push to this existing repository? (Y/N): "
    if /i "%CHOICE%"=="Y" (
        echo Pushing to GitHub on branch main...
        git push -u origin main
        goto finish
    )
)

echo Paste your GitHub repository URL below.
echo Example: https://github.com/your-username/user-details.git
echo.
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL provided. Aborted.
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Connecting and pushing to GitHub...
git push -u origin main

:finish
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   SUCCESS! Project has been deployed to your GitHub!
    echo ========================================================
) else (
    echo [NOTICE] If Git Credential Manager appeared, complete the browser sign-in and run this script again.
)
pause
