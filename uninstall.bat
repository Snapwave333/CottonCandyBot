@echo off
setlocal enabledelayedexpansion

:: ==========================================
::   Cotton Candy Bot Uninstaller
:: ==========================================

set "APP_NAME=CottonCandyBot"
set "INSTALL_DIR=%~dp0"

echo [1/4] Requesting elevation...
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b 0
)

echo [2/4] Removing shortcuts...
if exist "%Public%\Desktop\%APP_NAME%.lnk" del "%Public%\Desktop\%APP_NAME%.lnk"

echo [3/4] Removing registry entries...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\%APP_NAME%" /f >nul 2>&1

echo [4/4] Removing application files...
:: Note: This script is running from the directory we are trying to delete. 
:: We need to schedule the directory removal after the script exits.
echo [INFO] Cleanup scheduled...
start /b "" cmd /c "timeout /t 2 >nul & rmdir /S /Q \"%INSTALL_DIR%\""

echo.
echo ==========================================
echo   Uninstallation Complete!
echo ==========================================
echo Cotton Candy Bot has been removed from your system.
pause
exit /b 0
