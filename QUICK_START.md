# 🚀 Quick Start - Multi-Role Login System

## 📋 Database Setup (MUST DO FIRST!)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to: **SQL Editor**

2. **Run Database Setup**
   - Open file: `src/backend/database_setup.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click **RUN** ▶️

✅ This creates roles, users, and test accounts

---

## 🖥️ Start Backend

```bash
cd src/backend
.\venv\Scripts\activate
python main.py
```

✅ Backend runs on: **http://localhost:8000**

---

## 🌐 Start Frontend

```bash
cd src/app
npm run dev
```

✅ Frontend runs on: **http://localhost:3000**

---

## 🧪 Test Accounts

Open **http://localhost:3000** and try:

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| 🔷 **User Admin** | `admin` | `admin123` | Purple dashboard |
| 🔵 **PIN** | `pin_user` | `pin123` | Blue/cyan dashboard |
| 🟢 **CSR Rep** | `csr_rep` | `csr123` | Green/teal dashboard |
| 🟣 **Platform Mgmt** | `platform_mgr` | `platform123` | Purple/pink dashboard |

---

## ✅ Expected Behavior

1. **Login** with any test account
2. **Auto-redirect** to role-specific dashboard
3. **See personalized** content for that role
4. **Logout** returns to login page
5. **Try different** accounts to see different dashboards

---

## 🎯 What Each Dashboard Shows

### 👤 User Admin (`/dashboard/admin`)
- Total users, active sessions, system health
- User management cards
- Settings and logs access

### 💡 PIN (`/dashboard/pin`)
- Active projects counter
- Ideas submitted tracker
- Innovation pipeline
- Project review cards

### 📞 CSR Rep (`/dashboard/csr`)
- Active tickets queue
- Resolved tickets today
- Average response time
- Customer rating
- Ticket management

### 🖥️ Platform Management (`/dashboard/platform`)
- Server uptime percentage
- Active users count
- API requests metrics
- Storage usage
- System health bars

---

## 🔧 If Something Goes Wrong

### Backend won't start?
```bash
cd src/backend
pip install -r requirements.txt
python main.py
```

### Frontend won't start?
```bash
cd src/app
npm install
npm run dev
```

### Login fails?
- ✅ Check backend is running (port 8000)
- ✅ Verify database setup was completed
- ✅ Check browser console (F12)

### Wrong dashboard after login?
- Clear browser storage: F12 → Console → `localStorage.clear()`
- Refresh page and login again

---

## 📖 Full Documentation

Read **MULTI_ROLE_SETUP.md** for:
- Complete architecture details
- Database schema explanation
- Security features
- API endpoints
- Troubleshooting guide

---

**Status**: ✅ All files created and ready to use!

**Architecture**: ✅ Follows BCE Framework (Boundary-Control-Entity)

