@echo off
setlocal enabledelayedexpansion

:: ==========================================
::   Cotton Candy Bot v2.1.0-beta Installer
:: ==========================================
:: Specifications:
:: - Admin Elevation
:: - Program Files Deployment
:: - Registry Registration
:: - Shortcut Creation
:: - Rollback Mechanism
:: - Persistent Logging
:: ==========================================

set "APP_NAME=CottonCandyBot"
set "APP_VERSION=2.1.0-beta"
set "INSTALL_DIR=%ProgramFiles%\%APP_NAME%"
set "LOG_FILE=%TEMP%\ccb_install.log"
set "SILENT_MODE=0"
set "EXIT_CODE=0"

:: Check for silent switch
if /i "%~1"=="/S" set "SILENT_MODE=1"

echo [%DATE% %TIME%] Starting installation v%APP_VERSION% > "%LOG_FILE%"

:: 1. Elevation Check
echo [1/8] Verifying privileges...
net session >nul 2>&1
if %errorlevel% neq 0 (
    if "%SILENT_MODE%"=="1" (
        echo [ERROR] Admin privileges required for silent installation. >> "%LOG_FILE%"
        exit /b 1
    )
    echo [INFO] Requested elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b 0
)

:: 2. System Checks
echo [2/8] Performing system checks...
:: OS Version (Win 10/11)
for /f "tokens=4-5 delims=. " %%i in ('ver') do set "OS_VER=%%i.%%j"
echo [INFO] OS Version: %OS_VER% >> "%LOG_FILE%"

:: Node.js Check
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. >> "%LOG_FILE%"
    if "%SILENT_MODE%"=="0" (
        echo [ERROR] Node.js is required. Please install it from https://nodejs.org/
        pause
    )
    exit /b 1
)

:: Disk Space Check (approx 500MB)
:: Simplified check using fsutil
fsutil volume diskfree c: | findstr "free" >> "%LOG_FILE%"

:: 3. Prepare Directory
echo [3/8] Preparing installation directory...
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%" || (set "EXIT_CODE=3" & goto :ROLLBACK)
)
echo [INFO] Target: %INSTALL_DIR% >> "%LOG_FILE%"

:: 4. Deploy Files
echo [4/8] Deploying application files...
set "SRC_DIR=%~dp0"
xcopy "%SRC_DIR%*" "%INSTALL_DIR%\" /E /H /Y /I >> "%LOG_FILE%" 2>&1 || (set "EXIT_CODE=4" & goto :ROLLBACK)

:: 5. Registry Registration
echo [5/8] Registering application...
set "REG_KEY=HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\%APP_NAME%"
reg add "%REG_KEY%" /v "DisplayName" /d "%APP_NAME%" /f >nul
reg add "%REG_KEY%" /v "DisplayVersion" /d "%APP_VERSION%" /f >nul
reg add "%REG_KEY%" /v "Publisher" /d "Snapwave333" /f >nul
reg add "%REG_KEY%" /v "UninstallString" /d "\"%INSTALL_DIR%\uninstall.bat\"" /f >nul
reg add "%REG_KEY%" /v "InstallLocation" /d "%INSTALL_DIR%" /f >nul
reg add "%REG_KEY%" /v "DisplayIcon" /d "%INSTALL_DIR%\assets\branding-kit\icon.ico" /f >nul

:: 6. Create Shortcuts
echo [6/8] Creating shortcuts...
powershell -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut('%Public%\Desktop\%APP_NAME%.lnk');$s.TargetPath='%INSTALL_DIR%\start.bat';$s.WorkingDirectory='%INSTALL_DIR%';$s.IconLocation='%INSTALL_DIR%\assets\branding-kit\icon.ico';$s.Save()" >> "%LOG_FILE%" 2>&1

:: 7. Install Dependencies
echo [7/8] Installing dependencies (this may take a few minutes)...
pushd "%INSTALL_DIR%"
call npm install --production --legacy-peer-deps >> "%LOG_FILE%" 2>&1 || (popd & set "EXIT_CODE=7" & goto :ROLLBACK)
popd

:: 8. Finalize
echo [8/8] Finalizing installation...
copy "%LOG_FILE%" "%INSTALL_DIR%\install.log" >nul

echo.
echo ==========================================
echo   Installation Successful!
echo ==========================================
if "%SILENT_MODE%"=="0" (
    echo [INFO] You can now launch Cotton Candy Bot from your Desktop.
    echo [INFO] Log file saved to %INSTALL_DIR%\install.log
    pause
)
exit /b 0

:ROLLBACK
echo.
echo [FATAL] Installation failed (Code: %EXIT_CODE%). Initiating rollback...
echo [FATAL] Failure occurred. >> "%LOG_FILE%"
if exist "%INSTALL_DIR%" (
    echo [INFO] Cleaning up %INSTALL_DIR%...
    rmdir /S /Q "%INSTALL_DIR%" >> "%LOG_FILE%" 2>&1
)
reg delete "%REG_KEY%" /f >nul 2>&1
echo [INFO] Rollback complete.
if "%SILENT_MODE%"=="0" pause
exit /b %EXIT_CODE%
