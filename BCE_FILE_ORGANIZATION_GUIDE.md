# 🗂️ BCE File Organization Guide

## 📊 Current vs Proposed Structure

---

## ❌ CURRENT STRUCTURE (Mixed)

```
CSR-System/
├── src/
│   ├── app/                          ← Frontend (Next.js)
│   │   └── src/
│   │       ├── app/                  ← ⚠️ BOUNDARY (UI Pages)
│   │       │   ├── page.jsx          (Login page)
│   │       │   ├── layout.jsx
│   │       │   └── dashboard/
│   │       │       ├── admin/page.jsx
│   │       │       ├── csr/page.jsx
│   │       │       ├── pin/page.jsx
│   │       │       └── platform/page.jsx
│   │       │
│   │       └── controllers/          ← ⚠️ CONTROL (but not clearly labeled)
│   │           ├── auth/
│   │           ├── user/
│   │           ├── authController.js
│   │           └── userController.js
│   │
│   ├── controller/                   ← Backend Python Controllers
│   │   ├── auth_controller.py
│   │   ├── user_account_controller.py
│   │   └── ...
│   │
│   ├── entity/                       ← Backend Python Entities
│   │   ├── user.py
│   │   ├── role.py
│   │   └── auth_response.py
│   │
│   ├── security/
│   │   └── jwt_utils.py
│   │
│   └── main.py                       ← Backend entry point
```

**Issues:**
- ❌ Not clear where Boundary/Control/Entity starts
- ❌ Frontend controllers not labeled as "control"
- ❌ No clear Entity layer in frontend
- ❌ Mixed naming (some singular, some plural)

---

## ✅ PROPOSED STRUCTURE (Clear BCE)

```
CSR-System/
│
├── src/
│   │
│   ├── frontend/                     ← FRONTEND APPLICATION
│   │   │
│   │   ├── boundary/                 ✅ BOUNDARY LAYER (UI)
│   │   │   ├── pages/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.jsx          (Login UI)
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── admin/
│   │   │   │   │   │   └── page.jsx      (Admin Dashboard UI)
│   │   │   │   │   ├── csr/
│   │   │   │   │   │   └── page.jsx      (CSR Dashboard UI)
│   │   │   │   │   ├── pin/
│   │   │   │   │   │   └── page.jsx      (PIN Dashboard UI)
│   │   │   │   │   └── platform/
│   │   │   │   │       └── page.jsx      (Platform Dashboard UI)
│   │   │   │   └── layout.jsx
│   │   │   │
│   │   │   └── components/               (Reusable UI components)
│   │   │       ├── forms/
│   │   │       │   ├── LoginForm.jsx
│   │   │       │   └── UserForm.jsx
│   │   │       ├── layout/
│   │   │       │   ├── Header.jsx
│   │   │       │   ├── Sidebar.jsx
│   │   │       │   └── Footer.jsx
│   │   │       └── common/
│   │   │           ├── Button.jsx
│   │   │           ├── Input.jsx
│   │   │           └── Modal.jsx
│   │   │
│   │   ├── control/                  ✅ CONTROL LAYER (Business Logic)
│   │   │   ├── auth/
│   │   │   │   ├── loginController.js
│   │   │   │   ├── logoutController.js
│   │   │   │   ├── tokenController.js
│   │   │   │   ├── sessionController.js
│   │   │   │   └── index.js              (Exports)
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── createUserController.js
│   │   │   │   ├── viewUserController.js
│   │   │   │   ├── updateUserController.js
│   │   │   │   ├── deleteUserController.js
│   │   │   │   ├── roleController.js
│   │   │   │   └── index.js              (Exports)
│   │   │   │
│   │   │   └── __tests__/                (Controller tests)
│   │   │       ├── auth/
│   │   │       │   ├── loginController.test.js
│   │   │       │   ├── logoutController.test.js
│   │   │       │   ├── tokenController.test.js
│   │   │       │   └── sessionController.test.js
│   │   │       └── user/
│   │   │           ├── createUserController.test.js
│   │   │           └── updateUserController.test.js
│   │   │
│   │   ├── entity/                   ✅ ENTITY LAYER (Data Models)
│   │   │   ├── models/
│   │   │   │   ├── User.js               (User data model)
│   │   │   │   ├── Role.js               (Role data model)
│   │   │   │   └── AuthResponse.js       (Auth response model)
│   │   │   │
│   │   │   └── storage/                  (Client-side data persistence)
│   │   │       ├── LocalStorageService.js
│   │   │       └── SessionStorageService.js
│   │   │
│   │   ├── config/                       (Configuration)
│   │   │   ├── api.config.js
│   │   │   └── routes.config.js
│   │   │
│   │   ├── utils/                        (Utilities)
│   │   │   ├── validation.js
│   │   │   └── formatting.js
│   │   │
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── backend/                      ← BACKEND APPLICATION
│       │
│       ├── boundary/                 ✅ BOUNDARY LAYER (API Endpoints)
│       │   ├── routes/
│       │   │   ├── auth_routes.py        (Auth endpoints)
│       │   │   ├── user_routes.py        (User endpoints)
│       │   │   └── __init__.py
│       │   │
│       │   └── schemas/                  (Request/Response schemas)
│       │       ├── auth_schema.py
│       │       └── user_schema.py
│       │
│       ├── control/                  ✅ CONTROL LAYER (Business Logic)
│       │   ├── auth/
│       │   │   ├── auth_controller.py
│       │   │   └── __init__.py
│       │   │
│       │   ├── user/
│       │   │   ├── create_user_controller.py
│       │   │   ├── view_user_controller.py
│       │   │   ├── update_user_controller.py
│       │   │   ├── delete_user_controller.py
│       │   │   └── __init__.py
│       │   │
│       │   └── __init__.py
│       │
│       ├── entity/                   ✅ ENTITY LAYER (Data Models)
│       │   ├── models/
│       │   │   ├── user.py               (User entity)
│       │   │   ├── role.py               (Role entity)
│       │   │   └── __init__.py
│       │   │
│       │   ├── responses/
│       │   │   ├── auth_response.py
│       │   │   └── __init__.py
│       │   │
│       │   └── __init__.py
│       │
│       ├── infrastructure/               (Supporting services)
│       │   ├── database/
│       │   │   ├── connection.py
│       │   │   └── migrations/
│       │   ├── security/
│       │   │   ├── jwt_utils.py
│       │   │   └── password_utils.py
│       │   └── config/
│       │       └── settings.py
│       │
│       ├── tests/
│       │   ├── test_auth.py
│       │   └── test_users.py
│       │
│       ├── main.py                       (FastAPI app)
│       ├── requirements.txt
│       └── database_setup.sql
│
├── docs/                                 (Documentation)
│   ├── CONTROLLER_ARCHITECTURE.md
│   ├── USE_CASE_DESCRIPTIONS.md
│   └── ...
│
└── scripts/                              (Utility scripts)
    └── ...
```

---

## 📋 Migration Plan

### **Step 1: Create New Directory Structure**

```bash
# Frontend
mkdir -p src/frontend/boundary/pages
mkdir -p src/frontend/boundary/components
mkdir -p src/frontend/control/auth
mkdir -p src/frontend/control/user
mkdir -p src/frontend/entity/models
mkdir -p src/frontend/entity/storage
mkdir -p src/frontend/config
mkdir -p src/frontend/utils

# Backend
mkdir -p src/backend/boundary/routes
mkdir -p src/backend/boundary/schemas
mkdir -p src/backend/control/auth
mkdir -p src/backend/control/user
mkdir -p src/backend/entity/models
mkdir -p src/backend/entity/responses
mkdir -p src/backend/infrastructure/database
mkdir -p src/backend/infrastructure/security
mkdir -p src/backend/infrastructure/config
```

---

### **Step 2: Move Frontend Files**

#### **BOUNDARY Layer** (UI Components)

```bash
# Move pages
mv src/app/src/app/page.jsx → src/frontend/boundary/pages/login/page.jsx
mv src/app/src/app/layout.jsx → src/frontend/boundary/pages/layout.jsx
mv src/app/src/app/dashboard/admin/page.jsx → src/frontend/boundary/pages/dashboard/admin/page.jsx
mv src/app/src/app/dashboard/csr/page.jsx → src/frontend/boundary/pages/dashboard/csr/page.jsx
mv src/app/src/app/dashboard/pin/page.jsx → src/frontend/boundary/pages/dashboard/pin/page.jsx
mv src/app/src/app/dashboard/platform/page.jsx → src/frontend/boundary/pages/dashboard/platform/page.jsx
```

#### **CONTROL Layer** (Controllers)

```bash
# Move controllers
mv src/app/src/controllers/auth/* → src/frontend/control/auth/
mv src/app/src/controllers/user/* → src/frontend/control/user/
mv src/app/src/controllers/__tests__ → src/frontend/control/__tests__/
```

#### **ENTITY Layer** (Create new models)

```bash
# Create new entity files
# (We'll create these - frontend doesn't have explicit entities yet)
```

---

### **Step 3: Move Backend Files**

#### **BOUNDARY Layer** (API Routes)

```bash
# Extract routes from main.py into boundary/routes/
# Create auth_routes.py
# Create user_routes.py
```

#### **CONTROL Layer** (Controllers)

```bash
# Move controllers
mv src/controller/auth_controller.py → src/backend/control/auth/auth_controller.py
mv src/controller/user_account_controller.py → src/backend/control/user/user_account_controller.py
mv src/controller/create_user_account_controller.py → src/backend/control/user/create_user_controller.py
mv src/controller/view_user_account_controller.py → src/backend/control/user/view_user_controller.py
mv src/controller/update_user_account_controller.py → src/backend/control/user/update_user_controller.py
mv src/controller/suspend_user_account_controller.py → src/backend/control/user/delete_user_controller.py
```

#### **ENTITY Layer** (Data Models)

```bash
# Move entities
mv src/entity/user.py → src/backend/entity/models/user.py
mv src/entity/role.py → src/backend/entity/models/role.py
mv src/entity/auth_response.py → src/backend/entity/responses/auth_response.py
```

#### **INFRASTRUCTURE Layer** (Supporting Services)

```bash
# Move infrastructure
mv src/security/jwt_utils.py → src/backend/infrastructure/security/jwt_utils.py
mv src/database_setup.sql → src/backend/infrastructure/database/schema.sql
```

---

## 📂 What Goes Where?

### **BOUNDARY Layer**

#### **Frontend Boundary:**
```
✅ Put here:
- Page components (page.jsx)
- Layout components (layout.jsx)
- UI components (Button, Modal, Form)
- Styling (CSS, Tailwind classes)
- User interaction handlers (onClick, onChange)

❌ Don't put here:
- API calls
- Business logic
- Data storage
- Validation logic (except UI feedback)
```

**Example:**
```javascript
// ✅ GOOD - In boundary/pages/login/page.jsx
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    // ✅ Delegate to controller
    const result = await loginController.login({ username, password });
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* UI elements */}
    </form>
  );
}
```

#### **Backend Boundary:**
```
✅ Put here:
- API route definitions (@app.post, @app.get)
- Request/Response schemas (Pydantic models)
- Request validation
- Response formatting
- HTTP status codes

❌ Don't put here:
- Business logic
- Database queries
- Password hashing
- Token generation
```

**Example:**
```python
# ✅ GOOD - In boundary/routes/auth_routes.py
from fastapi import APIRouter, HTTPException
from ..schemas.auth_schema import LoginRequest, LoginResponse

router = APIRouter()

@router.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # ✅ Delegate to controller
    result = await auth_controller.login(
        request.username,
        request.password,
        request.role_code
    )
    
    if not result.success:
        raise HTTPException(status_code=401, detail=result.message)
    
    return LoginResponse(
        success=True,
        user=result.user,
        access_token=result.access_token,
        refresh_token=result.refresh_token
    )
```

---

### **CONTROL Layer**

#### **Frontend Control:**
```
✅ Put here:
- API calls (fetch, axios)
- Business logic coordination
- State management
- Token management
- Session management
- Client-side validation
- Error handling

❌ Don't put here:
- UI rendering (JSX)
- Database operations
- Styling
```

**Example:**
```javascript
// ✅ GOOD - In control/auth/loginController.js
export const loginController = {
  async login(credentials) {
    // Business logic
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Coordinate with other controllers
      tokenController.setAccessToken(data.access_token);
      sessionController.setUser(data.user);
    }
    
    return data;
  }
};
```

#### **Backend Control:**
```
✅ Put here:
- Business logic
- Workflow orchestration
- Calling entity methods
- Data transformation
- Validation logic
- Error handling
- Service coordination

❌ Don't put here:
- Database models
- HTTP handling
- JWT secret keys
```

**Example:**
```python
# ✅ GOOD - In control/auth/auth_controller.py
class AuthController:
    async def login(self, username: str, password: str, role_code: str):
        # Business logic
        user = User.query_by_username(username)
        
        if not user:
            return AuthResponse(success=False, message="User not found")
        
        if not bcrypt.checkpw(password.encode('utf-8'), user.password):
            return AuthResponse(success=False, message="Invalid password")
        
        # Generate tokens
        access_token = create_access_token(user.to_dict())
        refresh_token = create_refresh_token(user.to_dict())
        
        # Update entity
        user.update_last_login()
        
        return AuthResponse(
            success=True,
            user=user,
            access_token=access_token,
            refresh_token=refresh_token
        )
```

---

### **ENTITY Layer**

#### **Frontend Entity:**
```
✅ Put here:
- Data models (User class, Role class)
- Data validation
- Data transformation
- LocalStorage operations
- SessionStorage operations
- Data serialization

❌ Don't put here:
- UI components
- API calls
- Business logic
```

**Example:**
```javascript
// ✅ GOOD - In entity/models/User.js
export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.fullName = data.full_name;
    this.roleCode = data.role_code;
    this.dashboardRoute = data.dashboard_route;
  }
  
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      full_name: this.fullName,
      role_code: this.roleCode,
      dashboard_route: this.dashboardRoute
    };
  }
  
  static fromJSON(json) {
    return new User(JSON.parse(json));
  }
}

// ✅ GOOD - In entity/storage/LocalStorageService.js
export const LocalStorageService = {
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user.toJSON()));
  },
  
  getUser() {
    const json = localStorage.getItem('user');
    return json ? User.fromJSON(json) : null;
  },
  
  removeUser() {
    localStorage.removeItem('user');
  }
};
```

#### **Backend Entity:**
```
✅ Put here:
- Database models (SQLAlchemy, Supabase)
- Data operations (CRUD)
- Data validation
- Data transformation
- Business data rules

❌ Don't put here:
- API routes
- HTTP handling
- Complex business workflows
```

**Example:**
```python
# ✅ GOOD - In entity/models/user.py
class User:
    def __init__(self, id, username, email, role_id, is_active=True):
        self.id = id
        self.username = username
        self.email = email
        self.role_id = role_id
        self.is_active = is_active
        self.last_login = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role_id': self.role_id,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    @staticmethod
    def from_db(data: dict):
        return User(
            id=data['id'],
            username=data['username'],
            email=data['email'],
            role_id=data['role_id'],
            is_active=data['is_active']
        )
    
    def update_last_login(self):
        from datetime import datetime
        self.last_login = datetime.now()
```

---

## 🎯 Quick Reference

### **Where does X go?**

| Component | Frontend | Backend |
|-----------|----------|---------|
| **UI Components** | `boundary/pages/` | ❌ N/A |
| **Forms** | `boundary/components/` | ❌ N/A |
| **API Routes** | ❌ N/A | `boundary/routes/` |
| **Request Schemas** | ❌ N/A | `boundary/schemas/` |
| **Controllers** | `control/auth/`, `control/user/` | `control/auth/`, `control/user/` |
| **Business Logic** | `control/` | `control/` |
| **Data Models** | `entity/models/` | `entity/models/` |
| **LocalStorage** | `entity/storage/` | ❌ N/A |
| **Database Models** | ❌ N/A | `entity/models/` |
| **Utilities** | `utils/` | `infrastructure/` |
| **Tests** | `control/__tests__/` | `tests/` |

---

## ✅ Benefits of This Structure

### **1. Clear Separation**
```
Anyone can instantly see:
- What's UI (boundary)
- What's logic (control)
- What's data (entity)
```

### **2. Easy to Find Things**
```
Need to modify login UI? → boundary/pages/login/
Need to modify login logic? → control/auth/loginController
Need to modify User model? → entity/models/user
```

### **3. Better Testing**
```
Test each layer independently:
- Test controllers without UI
- Test entities without controllers
- Test UI with mocked controllers
```

### **4. Scalable**
```
Add new features easily:
- New page → boundary/pages/
- New business logic → control/
- New data model → entity/models/
```

### **5. Professional**
```
Follows industry standards
Clean architecture principles
Easy for new developers to understand
```

---

## 🚀 Next Steps

1. **Review** this proposed structure
2. **Decide** if you want to reorganize now or later
3. **Execute** migration plan step by step
4. **Update** imports in all files
5. **Test** everything still works

Would you like me to:
1. Create the new directory structure?
2. Move files automatically?
3. Update all imports?
4. Create example entity files?

Let me know and I'll help you reorganize! 📂✨

