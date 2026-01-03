@echo off
echo ==========================================
echo   Starting Cotton Candy Bot v2.1.0-beta
echo ==========================================
echo.

:: Check for .env file
if not exist ".env" (
    echo [ERROR] .env file not found. Please run install.bat first or create .env manually.
    pause
    exit /b 1
)

:: Start Backend
echo [1/2] Starting Backend Server (Port 3021)...
start "Cotton Candy Backend" node server/index.js

:: Start Frontend
echo [2/2] Starting Frontend Dashboard (Port 3000)...
:: In production, we assume 'npm run build' was already run by the packaging script
:: and 'next start' is the correct way to serve.
start "Cotton Candy Frontend" npm start

echo.
echo Success! The application is starting up.
echo Access the dashboard at: http://localhost:3000
echo.
echo To stop the bot, close the opened terminal windows.
echo.
pause
