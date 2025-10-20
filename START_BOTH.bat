@echo off
echo.
echo ========================================
echo   STARTING ALL SERVERS
echo ========================================
echo.
echo Starting Backend...
start "BACKEND" cmd /k "cd src && call venv\Scripts\activate.bat && python main.py"
timeout /t 3 >nul
echo Starting Frontend...
start "FRONTEND" cmd /k "cd src\app && npm run dev"
echo.
echo ========================================
echo   SERVERS STARTING IN NEW WINDOWS
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.

