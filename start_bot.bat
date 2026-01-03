@echo off
echo ==========================================
echo   Starting Cotton Candy Bot (Full Stack)
echo ==========================================

echo [1/2] Starting Backend Server (Port 3020)...
start "Cotton Candy Backend" npm run server:dev

echo [2/2] Starting Frontend Dashboard (Port 3000)...
start "Cotton Candy Frontend" npm run dev

echo.
echo Success! The application is starting up.
echo Access the dashboard at: http://localhost:3000
echo.
pause
