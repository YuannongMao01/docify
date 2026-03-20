@echo off
:: DocConverter — Uninstall LaTeX OCR background service (Windows)

set "TASK_NAME=DocConverter LaTeX OCR"

echo.
echo Uninstalling DocConverter LaTeX OCR service...

schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Task Scheduler entry removed
) else (
    echo   Service not found (already uninstalled?)
)

:: Kill any running python latex_server.py processes
taskkill /f /fi "WINDOWTITLE eq latex_server*" >nul 2>&1
taskkill /f /im pythonw.exe >nul 2>&1

echo ✓ Done. The LaTeX OCR server will no longer start automatically.
echo.
pause
