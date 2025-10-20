# Running the Application

## Current Status

✅ **Text removed** from login page (3 directories reference)  
✅ **Backend** environment configured correctly  
✅ **Frontend** files and dependencies ready  
✅ **Servers** opened in separate PowerShell windows  

## Server Locations

### Backend (FastAPI)
- **Directory**: `src/`
- **Start Command**: `.\venv\Scripts\python.exe main.py`
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health

### Frontend (Next.js)
- **Directory**: `src/app/`
- **Start Command**: `npm run dev`
- **URL**: http://localhost:3000

## How to Start

Two PowerShell windows should already be open running:
1. **Backend Server** - Shows FastAPI/Uvicorn logs
2. **Frontend Server** - Shows Next.js development server logs

If you need to restart them manually:

### Option 1: Using Start Scripts
```powershell
# Backend
cd src
.\start.bat

# Frontend (in another terminal)
cd src\app
.\start.bat
```

### Option 2: Manual Start
```powershell
# Backend
cd src
.\venv\Scripts\Activate.ps1
python main.py

# Frontend (in another terminal)
cd src\app
npm run dev
```

## Test Accounts

After opening http://localhost:3000, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| User Admin | admin | admin123 |
| PIN | pin_user | pin123 |
| CSR Rep | csr_rep | csr123 |
| Platform Management | platform_mgr | platform123 |

## Troubleshooting

### Backend won't start
1. Check if `.env` file exists in `src/` directory
2. Verify Supabase credentials in `.env`
3. Ensure virtual environment is activated
4. Check port 8000 is not already in use

### Frontend won't start
1. Check if `node_modules` exists in `src/app/`
2. Run `npm install` if needed
3. Check port 3000 is not already in use

### Database Connection Issues
1. Verify Supabase URL and Key in `src/.env`
2. Check if database tables are created (see `src/database_setup.sql`)
3. Ensure test users exist in the database

## Next Steps

1. ✅ Open http://localhost:3000 in your browser
2. ✅ Login with any test account
3. ✅ You'll be redirected to the role-specific dashboard
4. ✅ Test the logout confirmation modal

---

**Note**: Keep both PowerShell windows open while using the application. Press `Ctrl+C` in each window to stop the servers.


