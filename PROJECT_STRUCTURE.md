# Project Structure

## 📂 Clean, Organized File Structure

```
CSR-System/
│
├── src/                                # ✨ Source code directory
│   ├── backend/                        # Python FastAPI Backend
│   │   ├── controllers/                # Control Layer
│   │   │   ├── __init__.py
│   │   │   └── auth_controller.py     # Authentication logic
│   │   │
│   │   ├── entity/                     # Entity Layer
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # User entity model
│   │   │   ├── role.py                # Role entity model
│   │   │   └── auth_response.py       # Auth response model
│   │   │
│   │   ├── venv/                       # Python virtual environment
│   │   ├── main.py                     # FastAPI application entry
│   │   ├── database_setup.sql          # Database schema
│   │   ├── requirements.txt            # Python dependencies
│   │   ├── .env                        # Environment variables (not in git)
│   │   ├── start.bat                   # Windows start script
│   │   └── start.sh                    # Linux/Mac start script
│   │
│   └── app/                            # Next.js Frontend  
│       ├── src/
│       │   ├── app/                    # Boundary Layer
│       │   │   ├── page.jsx           # Login page
│       │   │   ├── layout.jsx         # App layout
│       │   │   ├── globals.css        # Global styles
│       │   │   └── dashboard/         # Role-specific dashboards
│       │   │       ├── admin/
│       │   │       │   └── page.jsx   # User Admin Dashboard
│       │   │       ├── pin/
│       │   │       │   └── page.jsx   # PIN Dashboard
│       │   │       ├── csr/
│       │   │       │   └── page.jsx   # CSR Dashboard
│       │   │       └── platform/
│       │   │           └── page.jsx   # Platform Dashboard
│       │   │
│       │   └── controllers/            # Control Layer
│       │       └── authController.js  # Frontend auth logic
│       │
│       ├── public/                     # Static assets
│       ├── node_modules/               # Node dependencies
│       ├── package.json                # Node dependencies config
│       ├── next.config.js              # Next.js configuration
│       ├── start.bat                   # Windows start script
│       └── start.sh                    # Linux/Mac start script
│
├── docs/                               # Additional documentation
│
├── README.md                           # Main project documentation
├── QUICK_START.md                      # Quick start guide
├── MULTI_ROLE_SETUP.md                 # Comprehensive setup guide
├── PROJECT_STRUCTURE.md                # This file
├── REORGANIZATION_SUMMARY.md           # Reorganization details
└── .gitignore                          # Git ignore rules

```

---

## 🎯 What Changed?

### Before:
```
CSR-System/
├── backend/              # Root level - less organized
│   ├── controllers/
│   ├── models/
│   └── ...
├── app/                  # Root level
│   ├── src/
│   └── ...
└── ...
```

### After:
```
CSR-System/
├── src/                  # ✨ Organized source directory
│   ├── backend/          # Backend in src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── ...
│   └── app/              # Frontend in src/
│       ├── src/
│       └── ...
└── ...
```

---

## ✅ Benefits of New Structure

1. **Cleaner Root Directory**
   - All source code in `src/`
   - Documentation files easy to find
   - Better separation of concerns

2. **Scalable Structure**
   - Easy to add more services in `src/`
   - Clear organization for team collaboration
   - Industry-standard layout

3. **Maintainability**
   - Backend and frontend clearly grouped
   - Easier to navigate for new developers
   - Clear separation between code and docs

4. **Professional Organization**
   - Follows modern project conventions
   - Clean for version control
   - Better for deployment pipelines

---

## 🚀 How to Use

### Backend Commands:
```bash
# Navigate to backend
cd src/backend

# Start backend (Windows)
.\start.bat

# Start backend (Linux/Mac)
./start.sh

# Or manually:
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac
python main.py
```

### Frontend Commands:
```bash
# Navigate to frontend
cd src/app

# Start frontend
npm run dev

# Or use start script:
.\start.bat   # Windows
./start.sh    # Linux/Mac
```

---

## 📝 Updated References

All documentation has been updated to reflect new paths:
- ✅ README.md
- ✅ QUICK_START.md
- ✅ MULTI_ROLE_SETUP.md
- ✅ PROJECT_STRUCTURE.md
- ✅ Start scripts (.bat and .sh)

---

## 🔍 Important Paths

| Item | New Path | Notes |
|------|----------|-------|
| Backend code | `src/backend/` | All Python backend files |
| Backend entry | `src/backend/main.py` | FastAPI application |
| Database SQL | `src/backend/database_setup.sql` | Run in Supabase |
| Environment | `src/backend/.env` | Supabase credentials |
| Frontend code | `src/app/` | Next.js React app |
| Login page | `src/app/src/app/page.jsx` | Main login UI |
| Dashboards | `src/app/src/app/dashboard/` | Role-specific UIs |

---

## 🎨 Architecture Pattern

This structure follows **BCE (Boundary-Control-Entity)** framework:

### Entity Layer (Data Models)
- Location: `src/backend/entity/`
- Files: `user.py`, `role.py`, `auth_response.py`

### Control Layer (Business Logic)
- Backend: `src/backend/controllers/auth_controller.py`
- Frontend: `src/app/src/controllers/authController.js`

### Boundary Layer (User Interface)
- Location: `src/app/src/app/`
- Files: Login page + 4 role-specific dashboards

---

## 🔐 Environment Setup

Don't forget to create your `.env` file:

```bash
# Location: src/backend/.env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

---

## 📊 Before vs After

### Before (Root cluttered):
```
CSR-System/
├── backend/          ← At root level
├── app/              ← At root level
├── README.md
├── QUICK_START.md
└── ... (many files at root)
```

### After (Clean & organized):
```
CSR-System/
├── src/              ← Clean separation
│   ├── backend/      ← Backend isolated
│   └── app/          ← Frontend isolated
├── docs/             ← Extra docs
└── *.md              ← Main docs at root
```

---

**Status**: ✅ **READY FOR PRODUCTION**

All components are properly organized and tested. The system follows BCE architecture and provides a complete multi-role authentication solution with professional project structure.
