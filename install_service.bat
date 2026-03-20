@echo off
:: ============================================================
::  DocConverter — LaTeX OCR Service Installer (Windows)
::  Installs Texify as a Windows background service that
::  starts automatically on login via Task Scheduler.
::
::  Usage: Double-click install_service.bat
::         or run in Command Prompt as Administrator
:: ============================================================

setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "SERVER_SCRIPT=%SCRIPT_DIR%latex_server.py"
set "TASK_NAME=DocConverter LaTeX OCR"
set "LOG_DIR=%USERPROFILE%\AppData\Local\DocConverter\Logs"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   DocConverter — LaTeX OCR Service Setup     ║
echo ║   Windows Edition                            ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ── Step 1: Check Python ──────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    where python3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ✗ Python not found.
        echo   Please install Python 3 from https://python.org
        echo   Make sure to check "Add Python to PATH" during installation.
        pause
        exit /b 1
    )
    set "PYTHON_BIN=python3"
) else (
    set "PYTHON_BIN=python"
)

for /f "tokens=*" %%i in ('!PYTHON_BIN! --version 2^>^&1') do set PYTHON_VER=%%i
echo ✓ Python: !PYTHON_BIN! (!PYTHON_VER!)

:: ── Step 2: Verify server script exists ───────────────────
if not exist "%SERVER_SCRIPT%" (
    echo ✗ Server script not found: %SERVER_SCRIPT%
    pause
    exit /b 1
)
echo ✓ Server script: %SERVER_SCRIPT%

:: ── Step 3: Install dependencies ─────────────────────────
echo.
echo Installing Python dependencies (texify + Pillow)...
!PYTHON_BIN! -m pip install texify Pillow -q
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies.
    echo   Try running: python -m pip install texify Pillow
    pause
    exit /b 1
)
echo ✓ Dependencies installed

:: ── Step 4: Create log directory ──────────────────────────
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo ✓ Log directory: %LOG_DIR%

:: ── Step 5: Create Task Scheduler entry ───────────────────
echo.
echo Creating Windows Task Scheduler entry...

:: Remove existing task if present
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Create new task — runs at login, hidden window
schtasks /create ^
    /tn "%TASK_NAME%" ^
    /tr "!PYTHON_BIN! \"%SERVER_SCRIPT%\"" ^
    /sc onlogon ^
    /ru "%USERNAME%" ^
    /rl limited ^
    /f ^
    /it >nul 2>&1

if %errorlevel% neq 0 (
    echo ✗ Failed to create scheduled task.
    echo   Try running this script as Administrator.
) else (
    echo ✓ Task Scheduler entry created
)

:: ── Step 6: Start the service now ─────────────────────────
echo.
echo Starting service...
start /min "" !PYTHON_BIN! "%SERVER_SCRIPT%"
echo ✓ Service started in background

:: ── Step 7: Wait and verify ───────────────────────────────
echo.
echo Waiting for server to start...
echo (First run downloads the Texify model ~500MB, please wait)
echo.

set READY=false
for /l %%i in (1,1,12) do (
    timeout /t 5 /nobreak >nul
    curl -s --max-time 2 http://localhost:8765/health >nul 2>&1
    if !errorlevel! equ 0 (
        set READY=true
        echo ✓ Server is running at http://localhost:8765
        goto :done_waiting
    )
    set /a elapsed=%%i*5
    echo   Waiting... !elapsed!s
)

:done_waiting
echo.
if "!READY!"=="true" (
    echo ╔══════════════════════════════════════════════╗
    echo ║   ✓ Installation Complete!                   ║
    echo ║                                              ║
    echo ║   The LaTeX OCR server will now start        ║
    echo ║   automatically every time you log in.       ║
    echo ║                                              ║
    echo ║   Open DocConverter in Chrome and use        ║
    echo ║   the Math OCR tab — it's ready!             ║
    echo ╚══════════════════════════════════════════════╝
) else (
    echo ╔══════════════════════════════════════════════╗
    echo ║   ⏳ Service is still starting...            ║
    echo ║                                              ║
    echo ║   The model is downloading (~500MB).         ║
    echo ║   Please wait a few minutes, then click      ║
    echo ║   'Retry' in the Math OCR tab.               ║
    echo ║                                              ║
    echo ║   Logs: %%USERPROFILE%%\AppData\Local\DocConverter\ ║
    echo ╚══════════════════════════════════════════════╝
)

echo.
echo To uninstall: run uninstall_service.bat
echo.
pause
