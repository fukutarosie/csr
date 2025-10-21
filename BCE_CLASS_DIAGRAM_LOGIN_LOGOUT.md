# BCE Class Diagram - User Admin Login & Logout

> **Last Updated**: December 2024  
> **Controllers**: `login_controller.py`, `logout_controller.py`  
> **Architecture**: BCE Pattern with separate controllers per use case

## Overview
This document describes the BCE (Boundary-Control-Entity) architecture for User Admin authentication (login and logout functionality).

The authentication system follows the BCE pattern with dedicated controllers:
- **LoginController** (`src/controller/login_controller.py`): Handles login use case with JWT token generation
- **LogoutController** (`src/controller/logout_controller.py`): Handles logout use case (client-side token removal)

---

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BOUNDARY LAYER (Frontend)                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐         ┌──────────────────────────────────┐
│   <<Boundary>>                   │         │   <<Boundary>>                   │
│   LoginPage                      │         │   UserAdminDashboard             │
├──────────────────────────────────┤         ├──────────────────────────────────┤
│ - username: string               │         │ - user: User                     │
│ - password: string               │         │ - showLogoutConfirm: boolean     │
│ - role: string                   │         ├──────────────────────────────────┤
│ - error: string                  │         │ + handleLogoutClick()            │
│ - loading: boolean               │         │ + confirmLogout()                │
│ - mounted: boolean               │         │ + cancelLogout()                 │
├──────────────────────────────────┤         │ + render()                       │
│ + handleLogin(e: Event)          │         └──────────────────────────────────┘
│ + setUsername(value: string)     │                       │
│ + setPassword(value: string)     │                       │ uses
│ + setRole(value: string)         │                       ▼
│ + render()                       │         ┌──────────────────────────────────┐
└──────────────────────────────────┘         │   <<Controller>>                 │
              │                              │   AuthController (Frontend)      │
              │ uses                         ├──────────────────────────────────┤
              ▼                              │ - USER_STORAGE_KEY: string       │
┌──────────────────────────────────┐         │ - API_BASE_URL: string           │
│   <<Controller>>                 │         ├──────────────────────────────────┤
│   AuthController (Frontend)      │         │ + login(credentials)             │
├──────────────────────────────────┤         │ + logout()                       │
│ - USER_STORAGE_KEY: string       │         │ + isAuthenticated(): boolean     │
│ - API_BASE_URL: string           │         │ + getCurrentUser(): User         │
├──────────────────────────────────┤         │ + setUser(user: User)            │
│ + login(credentials)             │         │ + getUserDashboardRoute()        │
│ + logout()                       │         │ + getUserRole(): string          │
│ + isAuthenticated(): boolean     │         │ + verifySession(): boolean       │
│ + getCurrentUser(): User         │         └──────────────────────────────────┘
│ + setUser(user: User)            │
│ + getUserDashboardRoute()        │
│ + getUserRole(): string          │
│ + verifySession(): boolean       │
└──────────────────────────────────┘
              │
              │ HTTP POST/GET
              ▼

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTROL LAYER (Backend)                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│   <<API Endpoint>>                       │
│   FastAPI Main Application               │
├──────────────────────────────────────────┤
│ + POST /api/login                        │
│ + GET /api/verify/{user_id}              │
├──────────────────────────────────────────┤
│ + login(request: LoginRequest)           │
│ + verify_user(user_id: int)              │
└──────────────────────────────────────────┘
              │
              │ calls
              ▼
┌──────────────────────────────────────────┐
│   <<Controller>>                         │
│   LoginController                        │
├──────────────────────────────────────────┤
│ - supabase: Client                       │
│ - SECRET_KEY: string                     │
│ - ALGORITHM: string                      │
├──────────────────────────────────────────┤
│ + __init__(supabase_client)              │
│ + hash_password(password: str): str      │
│ + verify_password(plain, hashed): bool   │
│ + create_access_token(data: dict): str   │
│ + login(username, password): AuthResponse│
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│   <<Controller>>                         │
│   LogoutController                       │
├──────────────────────────────────────────┤
│ + logout(): dict                         │
│ + logout_with_token_invalidation(): dict │
└──────────────────────────────────────────┘
              │
              │ uses/creates
              ▼

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  ENTITY LAYER                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐       ┌──────────────────────────────────┐
│   <<Entity>>                             │       │   <<Entity>>                     │
│   User                                   │       │   AuthResponse                   │
├──────────────────────────────────────────┤       ├──────────────────────────────────┤
│ - id: int                                │       │ - success: bool                  │
│ - username: string                       │◄──────┤ - message: string                │
│ - full_name: string                      │ has   │ - user: User                     │
│ - email: string                          │       └──────────────────────────────────┘
│ - role_id: int                           │
│ - role_name: string                      │       ┌──────────────────────────────────┐
│ - role_code: string                      │       │   <<Entity>>                     │
│ - dashboard_route: string                │       │   Role                           │
│ - is_active: bool                        │       ├──────────────────────────────────┤
│ - last_login: datetime                   │       │ - id: int                        │
├──────────────────────────────────────────┤       │ - role_name: string              │
│ + from_db(data: dict): User              │       │ - role_code: string              │
│ + to_dict(): dict                        │       │ - description: string            │
└──────────────────────────────────────────┘       │ - dashboard_route: string        │
              │                                     │ - created_at: datetime           │
              │ queries                             └──────────────────────────────────┘
              ▼

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  DATABASE LAYER                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐       ┌──────────────────────────────────┐
│   <<Database>>                           │       │   <<Database>>                   │
│   Supabase Client                        │       │   PostgreSQL                     │
├──────────────────────────────────────────┤       ├──────────────────────────────────┤
│ + table(name: string)                    │       │ Tables:                          │
│ + select(columns: string)                │       │ - users                          │
│ + insert(data: dict)                     │       │ - roles                          │
│ + update(data: dict)                     │       │                                  │
│ + delete()                               │       │ Views:                           │
│ + eq(column: string, value: any)         │       │ - user_details                   │
│ + execute()                              │       │   (joins users + roles)          │
└──────────────────────────────────────────┘       └──────────────────────────────────┘
```

---

## Sequence Diagram - Login Flow

```
User        LoginPage      AuthController    FastAPI      AuthController    Database      User
Browser     (Boundary)     (Frontend)        (API)        (Backend)        (Supabase)   (Entity)
  │             │              │                │               │               │           │
  │ Enter       │              │                │               │               │           │
  │ credentials │              │                │               │               │           │
  ├────────────►│              │                │               │               │           │
  │             │              │                │               │               │           │
  │             │ login()      │                │               │               │           │
  │             ├─────────────►│                │               │               │           │
  │             │              │                │               │               │           │
  │             │              │ POST /api/login│               │               │           │
  │             │              ├───────────────►│               │               │           │
  │             │              │                │               │               │           │
  │             │              │                │ login(user,pw)│               │           │
  │             │              │                ├──────────────►│               │           │
  │             │              │                │               │               │           │
  │             │              │                │               │ SELECT *      │           │
  │             │              │                │               ├──────────────►│           │
  │             │              │                │               │               │           │
  │             │              │                │               │ user_data     │           │
  │             │              │                │               │◄──────────────┤           │
  │             │              │                │               │               │           │
  │             │              │                │               │ Check active  │           │
  │             │              │                │               │ Verify password│          │
  │             │              │                │               │               │           │
  │             │              │                │               │ UPDATE        │           │
  │             │              │                │               │ last_login    │           │
  │             │              │                │               ├──────────────►│           │
  │             │              │                │               │               │           │
  │             │              │                │               │ from_db()     │           │
  │             │              │                │               ├──────────────────────────►│
  │             │              │                │               │               │           │
  │             │              │                │               │               │  User obj │
  │             │              │                │               │◄──────────────────────────┤
  │             │              │                │               │               │           │
  │             │              │                │ AuthResponse  │               │           │
  │             │              │                │ (User entity) │               │           │
  │             │              │                │◄──────────────┤               │           │
  │             │              │                │               │               │           │
  │             │              │                │ to_dict()     │               │           │
  │             │              │                ├──────────────────────────────────────────►│
  │             │              │                │               │               │           │
  │             │              │                │               │               │  dict     │
  │             │              │                │◄──────────────────────────────────────────┤
  │             │              │                │               │               │           │
  │             │              │ JSON Response  │               │               │           │
  │             │              │ {success,user} │               │               │           │
  │             │              │◄───────────────┤               │               │           │
  │             │              │                │               │               │           │
  │             │ response     │                │               │               │           │
  │             │◄─────────────┤                │               │               │           │
  │             │              │                │               │               │           │
  │             │ setUser()    │                │               │               │           │
  │             │ (localStorage)│               │               │               │           │
  │             ├─────────────►│                │               │               │           │
  │             │              │                │               │               │           │
  │ Redirect to │              │                │               │               │           │
  │ Dashboard   │              │                │               │               │           │
  │◄────────────┤              │                │               │               │           │
```

---

## Sequence Diagram - Logout Flow

```
User        Dashboard      AuthController    FastAPI      AuthController    Database
Browser     (Boundary)     (Frontend)        (API)        (Backend)        (Supabase)
  │             │              │                │               │               │
  │ Click       │              │                │               │               │
  │ Logout      │              │                │               │               │
  ├────────────►│              │                │               │               │
  │             │              │                │               │               │
  │             │ Show         │                │               │               │
  │             │ Confirmation │                │               │               │
  │             │ Modal        │                │               │               │
  │◄────────────┤              │                │               │               │
  │             │              │                │               │               │
  │ Confirm     │              │                │               │               │
  ├────────────►│              │                │               │               │
  │             │              │                │               │               │
  │             │ logout()     │                │               │               │
  │             ├─────────────►│                │               │               │
  │             │              │                │               │               │
  │             │              │ Remove from    │               │               │
  │             │              │ localStorage   │               │               │
  │             │              │                │               │               │
  │             │ success      │                │               │               │
  │             │◄─────────────┤                │               │               │
  │             │              │                │               │               │
  │ Redirect to │              │                │               │               │
  │ Login Page  │              │                │               │               │
  │◄────────────┤              │                │               │               │
  │             │              │                │               │               │
  
Note: Logout is stateless - no backend call or database update required!
User session is managed entirely client-side via localStorage.
```

---

## Component Responsibilities

### **BOUNDARY LAYER (Frontend - React/Next.js)**

#### 1. **LoginPage** (`src/app/src/app/page.jsx`)
- **Purpose**: User interface for authentication
- **Attributes**:
  - `username`: string - stores username input
  - `password`: string - stores password input
  - `role`: string - stores selected role (USER_ADMIN, PIN, CSR_REP, PLATFORM_MGMT)
  - `error`: string - displays error messages
  - `loading`: boolean - shows loading state
  - `mounted`: boolean - prevents hydration mismatch
- **Methods**:
  - `handleLogin(e)`: Submits credentials to AuthController
  - `setUsername(value)`: Updates username state
  - `setPassword(value)`: Updates password state
  - `setRole(value)`: Updates role selection
  - `render()`: Renders login form UI

#### 2. **UserAdminDashboard** (`src/app/src/app/dashboard/admin/page.jsx`)
- **Purpose**: Main dashboard interface after login
- **Attributes**:
  - `user`: User object - current logged-in user
  - `showLogoutConfirm`: boolean - shows logout confirmation modal
- **Methods**:
  - `handleLogoutClick()`: Opens logout confirmation modal
  - `confirmLogout()`: Calls AuthController.logout() and redirects
  - `cancelLogout()`: Closes confirmation modal
  - `render()`: Renders dashboard UI

---

### **CONTROL LAYER**

#### 3. **AuthController (Frontend)** (`src/app/src/controllers/authController.js`)
- **Purpose**: Manages authentication state and API communication (client-side)
- **Attributes**:
  - `USER_STORAGE_KEY`: string = "user" - localStorage key
  - `API_BASE_URL`: string = "http://localhost:8000" - backend URL
- **Methods**:
  - `login(credentials)`: Promise<Object> - Authenticates user via backend API
    - Makes HTTP POST to `/api/login`
    - Stores user in localStorage on success
    - Returns `{success: boolean, message: string, user: Object}`
  - `logout()`: void - Removes user from localStorage
  - `isAuthenticated()`: boolean - Checks if user data exists in localStorage
  - `getCurrentUser()`: User|null - Retrieves user from localStorage
  - `setUser(user)`: void - Stores user in localStorage
  - `getUserDashboardRoute()`: string|null - Gets user's dashboard route
  - `getUserRole()`: string|null - Gets user's role code
  - `verifySession()`: Promise<boolean> - Verifies user exists in database

#### 4. **FastAPI Main** (`src/main.py`)
- **Purpose**: HTTP API endpoints
- **Endpoints**:
  - `POST /api/login`: Authenticates user
    - Input: `{username: string, password: string}`
    - Output: `{success: boolean, message: string, user: Object}`
  - `GET /api/verify/{user_id}`: Verifies user exists
    - Output: `{exists: boolean, user_id: int}`

#### 5. **LoginController (Backend)** (`src/controller/login_controller.py`)
- **Purpose**: Backend business logic for user authentication (Login use case)
- **Attributes**:
  - `supabase`: Client - Supabase database connection
  - `SECRET_KEY`: string - JWT secret key
  - `ALGORITHM`: string - JWT algorithm (HS256)
- **Methods**:
  - `__init__(supabase_client)`: Initializes with Supabase client
  - `hash_password(password: str)`: str - Hashes password with bcrypt
  - `verify_password(plain: str, hashed: str)`: bool - Verifies password against hash
  - `create_access_token(data: dict)`: str - Generates JWT access token
  - `login(username: str, password: str)`: AuthResponse
    - Queries database for user from user_details view
    - Checks if account is active (not suspended)
    - Verifies password using bcrypt
    - Updates last_login timestamp
    - Creates JWT token with user data
    - Creates and returns User entity wrapped in AuthResponse with token

#### 6. **LogoutController (Backend)** (`src/controller/logout_controller.py`)
- **Purpose**: Backend business logic for user logout (Logout use case)
- **Methods**:
  - `logout()`: dict - Returns success message for client-side logout
  - `logout_with_token_invalidation()`: dict - Returns success message (optional token blacklisting)
- **Note**: Logout is primarily client-side (removing token from localStorage). Backend controller provides optional endpoint for logging/audit purposes.

---

### **ENTITY LAYER (Data Models)**

#### 7. **User** (`src/entity/user.py`)
- **Purpose**: Represents a user in the system
- **Attributes**:
  - `id`: int - Primary key
  - `username`: string - Unique username
  - `full_name`: string - User's full name
  - `email`: string - Email address
  - `role_id`: int - Foreign key to roles table
  - `role_name`: string - Name of role (e.g., "User Admin")
  - `role_code`: string - Code of role (e.g., "USER_ADMIN")
  - `dashboard_route`: string - Route to dashboard (e.g., "/dashboard/admin")
  - `is_active`: bool - Whether account is active or suspended
  - `last_login`: datetime - Last login timestamp
- **Methods**:
  - `from_db(data: dict)`: User - Static factory method to create User from database dict
  - `to_dict()`: dict - Converts User object to dictionary for JSON serialization

#### 8. **AuthResponse** (`src/entity/auth_response.py`)
- **Purpose**: Wraps authentication result
- **Attributes**:
  - `success`: bool - Whether authentication succeeded
  - `message`: string - Response message (success or error)
  - `user`: User|None - User entity if successful, None if failed

#### 9. **Role** (`src/entity/role.py`)
- **Purpose**: Represents a user role
- **Attributes**:
  - `id`: int - Primary key
  - `role_name`: string - Display name (e.g., "User Admin")
  - `role_code`: string - Code identifier (e.g., "USER_ADMIN")
  - `description`: string - Role description
  - `dashboard_route`: string - Route to role's dashboard
  - `created_at`: datetime - Creation timestamp

---

### **DATABASE LAYER**

#### 10. **Supabase Client**
- **Purpose**: Database connection and query interface
- **Methods**:
  - `table(name)`: Selects a table
  - `select(columns)`: Selects columns
  - `insert(data)`: Inserts data
  - `update(data)`: Updates data
  - `delete()`: Deletes data
  - `eq(column, value)`: Filters by equality
  - `execute()`: Executes query

#### 11. **PostgreSQL Database**
- **Tables**:
  - `users`: Stores user accounts
    - Columns: id, username, password, email, full_name, role_id, is_active, last_login, created_at
  - `roles`: Stores user roles
    - Columns: id, role_name, role_code, description, dashboard_route, created_at
- **Views**:
  - `user_details`: JOIN of users and roles tables
    - Returns complete user information with role details

---

## Data Flow Summary

### **Login Flow:**
1. **User Input** → LoginPage (Boundary)
2. **UI Action** → AuthController.login() (Frontend Control)
3. **HTTP Request** → FastAPI POST /api/login (API)
4. **API Call** → LoginController.login() (Backend Control)
5. **Database Query** → Supabase SELECT from user_details
6. **Business Logic** → Validate credentials, check active status
7. **Database Update** → UPDATE last_login timestamp
8. **Entity Creation** → User.from_db() creates User entity
9. **JWT Token** → LoginController.create_access_token() generates JWT
10. **Response** → AuthResponse with User entity and JWT token
11. **Serialization** → User.to_dict() converts to JSON
12. **HTTP Response** → Return JSON to frontend
13. **Storage** → AuthController stores token in localStorage
14. **Navigation** → Redirect to dashboard

### **Logout Flow:**
1. **User Click** → UserAdminDashboard (Boundary)
2. **Confirmation** → Show modal
3. **Confirm Action** → AuthController.logout() (Frontend Control)
4. **Remove Data** → Delete token from localStorage
5. **Optional** → Call LogoutController.logout() for audit logging
6. **Navigation** → Redirect to login page

**Note**: Logout is primarily client-side! No backend API call or database update required because authentication uses JWT tokens (stateless).

---

## Key Design Patterns

1. **Singleton Pattern**: AuthController instances are singletons (one instance per app)
2. **Factory Pattern**: `User.from_db()` creates User entities from database data
3. **Repository Pattern**: Supabase client abstracts database operations
4. **MVC/BCE Pattern**: Separation of Boundary, Control, and Entity layers
5. **Stateless Authentication**: No server-side sessions; user data in localStorage

---

## Security Considerations

1. **Password Hashing**: Passwords stored as bcrypt hashes in database
2. **HTTPS**: All API communication should use HTTPS in production
4. **Input Validation**: Username and password validated before database query
5. **Account Suspension**: `is_active` flag prevents suspended users from logging in
6. **No Password in Response**: User password never returned to frontend

---

## Testing Points

### **Unit Tests:**
- LoginController.login() with valid credentials
- LoginController.login() with invalid credentials
- LoginController.login() with suspended account
- LoginController.verify_password() correctly validates passwords
- LoginController.create_access_token() generates valid JWT
- LogoutController.logout() returns success message
- AuthController.logout() (Frontend) clears localStorage
- User.from_db() creates correct entity
- User.to_dict() serializes correctly

### **Integration Tests:**
- POST /api/login with valid user returns 200 with JWT token
- POST /api/login with invalid user returns 200 with success=false
- POST /api/login updates last_login in database
- POST /api/logout (optional) returns success status

### **E2E Tests:**
- User can login with correct credentials and receive JWT token
- User redirected to correct dashboard based on role
- User cannot login with incorrect password
- Suspended user cannot login
- JWT token stored in localStorage after successful login
- User can logout successfully
- After logout, JWT token removed from localStorage
- After logout, user redirected to login page

---

**End of BCE Class Diagram Documentation**
