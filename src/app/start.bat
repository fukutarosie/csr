@echo off
echo ====================================
echo Starting Next.js Frontend Server
echo ====================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Next.js on http://localhost:3000
echo Press Ctrl+C to stop
echo.

REM Start the development server
call npm run dev




