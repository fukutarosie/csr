# CSR-System — Run Guide (Windows)

This document explains only how to run the backend (FastAPI) and frontend (Next.js) in development.

## Prerequisites (first run)

- Python 3.10+ and Node.js 18+
- Backend virtual environment exists at `src/venv`

Install dependencies if not already installed:

```powershell
# Backend deps
cd src
pip install -r .\requirements.txt

# Frontend deps
cd .\app
npm install
```

## Start using scripts (recommended)

From the project root (`CSR-System`):

```powershell

.\START_BOTH.bat

# Or start individually
.\START_BACKEND.bat
.\START_FRONTEND.bat
```

URLs:
- Backend API: http://localhost:8000 (health: http://localhost:8000/api/health)
- Frontend: http://localhost:3000 (or http://localhost:3001 if 3000 is busy)

## Start manually (two terminals)

Backend (FastAPI):
```powershell
cd src
.\venv\Scripts\python.exe .\main.py
```

Frontend (Next.js):
```powershell
cd src\app
npm run dev
```

Stop with Ctrl+C in each window.

## Notes

- CORS is configured for http://localhost:3000 and http://localhost:3001.
- Ensure `src/.env` contains any required environment variables.
## 📁 Project Structure
