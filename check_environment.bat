@echo off
echo Checking environment setup...

REM Check frontend environment
if not exist "src\app\.env.local" (
    echo Creating frontend environment file...
    (
        echo # Frontend Environment Variables
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
        echo NEXT_PUBLIC_APP_ENV=development
    ) > "src\app\.env.local"
    echo Frontend .env.local created!
) else (
    echo Frontend .env.local exists
)

REM Check backend environment
if not exist "src\.env" (
    echo Creating backend environment file...
    (
        echo # Backend Environment Variables
        echo SUPABASE_URL=your_supabase_url_here
        echo SUPABASE_KEY=your_supabase_key_here
        echo JWT_SECRET=your_jwt_secret_here
        echo JWT_ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=60
        echo REFRESH_TOKEN_EXPIRE_DAYS=7
    ) > "src\.env"
    echo Backend .env created! Please update with your Supabase credentials.
) else (
    echo Backend .env exists
)

echo.
echo Environment check complete!
echo If this is your first time running the app, please:
echo 1. Update src\.env with your Supabase credentials
echo 2. Restart both frontend and backend servers
echo.