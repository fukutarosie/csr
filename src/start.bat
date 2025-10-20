@echo off
echo ====================================
echo Starting FastAPI Backend Server
echo ====================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create src/backend/.env with your Supabase credentials.
    echo.
    echo Example:
    echo SUPABASE_URL=https://xxxxx.supabase.co
    echo SUPABASE_KEY=your_key_here
    echo.
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Checking dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop
echo.

REM Start the server
python main.py




