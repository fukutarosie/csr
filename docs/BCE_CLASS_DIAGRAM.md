# BCE Class Diagram - CSR System

## Overview
The CSR System follows the **Boundary-Control-Entity (BCE)** architectural pattern, providing clear separation of concerns across three distinct layers.

## Complete System Architecture

```mermaid
classDiagram
    %% ============================================
    %% BOUNDARY LAYER (Frontend - User Interface)
    %% ============================================
    
    class LoginPage {
        <<Boundary>>
        -username: string
        -password: string
        -role: string
        -error: string
        -loading: boolean
        +handleLogin(event)
        +render()
    }
    
    class AdminDashboard {
        <<Boundary>>
        -currentUser: User
        -usersList: User[]
        -searchQuery: string
        +viewUsers()
        +createUser()
        +editUser(userId)
        +deleteUser(userId)
        +searchUsers(query)
        +logout()
        +render()
    }
    
    class PINDashboard {
        <<Boundary>>
        -currentUser: User
        +render()
        +logout()
    }
    
    class CSRDashboard {
        <<Boundary>>
        -currentUser: User
        +render()
        +logout()
    }
    
    class PlatformDashboard {
        <<Boundary>>
        -currentUser: User
        +render()
        +logout()
    }
    
    class AuthControllerJS {
        <<Boundary - Control>>
        -USER_STORAGE_KEY: string
        -ACCESS_TOKEN_KEY: string
        -REFRESH_TOKEN_KEY: string
        +login(credentials): Promise
        +logout()
        +isAuthenticated(): boolean
        +getCurrentUser(): User
        +getUserDashboardRoute(): string
        +setUser(user)
        +getAccessToken(): string
        +setAccessToken(token)
        +refreshAccessToken(): Promise
        +authenticatedFetch(url, options): Promise
    }
    
    class UserControllerJS {
        <<Boundary - Control>>
        +getAllUsers(): Promise
        +getUserById(id): Promise
        +createUser(userData): Promise
        +updateUser(id, userData): Promise
        +deleteUser(id): Promise
        +searchUsers(query): Promise
    }
    
    %% ============================================
    %% CONTROL LAYER (Backend - Business Logic)
    %% ============================================
    
    class FastAPIApp {
        <<Control>>
        +app: FastAPI
        +security_scheme: HTTPBearer
        +post_login(request)
        +post_refresh(request)
        +get_verify(user_id)
        +post_users(request)
        +get_users()
        +get_user(user_id)
        +put_user(user_id, request)
        +delete_user(user_id)
        +post_search(request)
        +get_roles()
    }
    
    class AuthController {
        <<Control>>
        -supabase: Client
        +login(username, password, role_code): AuthResponse
        +verify_user(user_id): boolean
        +get_user_by_id(user_id): User
        -hash_password(password): string
        -verify_password(plain, hashed): boolean
    }
    
    class CreateUserAccountController {
        <<Control>>
        -supabase: Client
        +create_user(username, password, full_name, email, role_id): dict
        -hash_password(password): string
    }
    
    class ViewUserAccountController {
        <<Control>>
        -supabase: Client
        +get_user(user_id): User
        +get_all_users(): List[User]
        +search_users(query): List[User]
        +get_all_roles(): List[dict]
    }
    
    class UpdateUserAccountController {
        <<Control>>
        -supabase: Client
        +update_user(user_id, full_name, email, role_id, is_active): dict
    }
    
    class SuspendUserAccountController {
        <<Control>>
        -supabase: Client
        +suspend_user(user_id): dict
    }
    
    class JWTUtils {
        <<Control>>
        +create_access_token(subject, extra): string
        +create_refresh_token(subject): string
        +decode_token(token): dict
        -_create_token(subject, token_type, expiry, extra): string
    }
    
    %% ============================================
    %% ENTITY LAYER (Data Models)
    %% ============================================
    
    class User {
        <<Entity>>
        +id: int
        +username: string
        +full_name: string
        +email: string
        +role_id: int
        +role_name: string
        +role_code: string
        +dashboard_route: string
        +is_active: boolean
        +last_login: datetime
        +to_dict(): dict
        +from_db(data): User
    }
    
    class Role {
        <<Entity>>
        +id: int
        +role_name: string
        +role_code: string
        +dashboard_route: string
        +description: string
        +to_dict(): dict
        +from_db(data): Role
    }
    
    class AuthResponse {
        <<Entity>>
        +success: boolean
        +message: string
        +user: User
    }
    
    %% ============================================
    %% DATABASE (Persistence)
    %% ============================================
    
    class SupabaseClient {
        <<Database>>
        +table(name): Query
        +from_(view): Query
        +rpc(function, params): Result
    }
    
    class UsersTable {
        <<Database Table>>
        +id: serial PRIMARY KEY
        +username: varchar(50) UNIQUE
        +password: text
        +email: varchar(100)
        +full_name: varchar(100)
        +role_id: int FK
        +is_active: boolean
        +last_login: timestamp
        +created_at: timestamp
    }
    
    class RolesTable {
        <<Database Table>>
        +id: serial PRIMARY KEY
        +role_name: varchar(50) UNIQUE
        +role_code: varchar(20) UNIQUE
        +description: text
        +dashboard_route: varchar(100)
        +created_at: timestamp
    }
    
    class UserDetailsView {
        <<Database View>>
        +id: int
        +username: string
        +email: string
        +full_name: string
        +is_active: boolean
        +last_login: timestamp
        +role_name: string
        +role_code: string
        +dashboard_route: string
        +created_at: timestamp
    }
    
    %% ============================================
    %% RELATIONSHIPS - BOUNDARY TO CONTROL
    %% ============================================
    
    LoginPage --> AuthControllerJS : uses
    AdminDashboard --> AuthControllerJS : uses
    AdminDashboard --> UserControllerJS : uses
    PINDashboard --> AuthControllerJS : uses
    CSRDashboard --> AuthControllerJS : uses
    PlatformDashboard --> AuthControllerJS : uses
    
    AuthControllerJS --> FastAPIApp : HTTP calls
    UserControllerJS --> FastAPIApp : HTTP calls
    
    %% ============================================
    %% RELATIONSHIPS - CONTROL TO CONTROL
    %% ============================================
    
    FastAPIApp --> AuthController : delegates
    FastAPIApp --> CreateUserAccountController : delegates
    FastAPIApp --> ViewUserAccountController : delegates
    FastAPIApp --> UpdateUserAccountController : delegates
    FastAPIApp --> SuspendUserAccountController : delegates
    FastAPIApp --> JWTUtils : uses
    
    AuthController --> JWTUtils : uses for tokens
    
    %% ============================================
    %% RELATIONSHIPS - CONTROL TO ENTITY
    %% ============================================
    
    AuthController --> User : creates
    AuthController --> AuthResponse : returns
    CreateUserAccountController --> User : creates
    ViewUserAccountController --> User : queries
    UpdateUserAccountController --> User : modifies
    SuspendUserAccountController --> User : modifies
    
    %% ============================================
    %% RELATIONSHIPS - CONTROL TO DATABASE
    %% ============================================
    
    AuthController --> SupabaseClient : uses
    CreateUserAccountController --> SupabaseClient : uses
    ViewUserAccountController --> SupabaseClient : uses
    UpdateUserAccountController --> SupabaseClient : uses
    SuspendUserAccountController --> SupabaseClient : uses
    
    SupabaseClient --> UsersTable : queries
    SupabaseClient --> RolesTable : queries
    SupabaseClient --> UserDetailsView : queries
    
    %% ============================================
    %% RELATIONSHIPS - DATABASE RELATIONSHIPS
    %% ============================================
    
    UsersTable --> RolesTable : role_id FK
    UserDetailsView --> UsersTable : joins
    UserDetailsView --> RolesTable : joins
    
    %% ============================================
    %% ENTITY RELATIONSHIPS
    %% ============================================
    
    User --> Role : has
    AuthResponse --> User : contains
```

---

## Layer Descriptions

### 🎨 Boundary Layer (Frontend)

**Purpose**: User interface and user interaction

**Components**:
- **Pages**: LoginPage, AdminDashboard, PINDashboard, CSRDashboard, PlatformDashboard
- **Frontend Controllers**: AuthControllerJS, UserControllerJS

**Responsibilities**:
- Render UI components
- Capture user input
- Display data
- Make API calls
- Manage client-side state (localStorage)
- Handle routing and navigation

**Technologies**: Next.js 14, React, Tailwind CSS, JavaScript

---

### ⚙️ Control Layer (Backend)

**Purpose**: Business logic and request processing

**Components**:
- **FastAPI Application**: Main API entry point, routing, middleware
- **Controllers**: AuthController, CreateUserAccountController, ViewUserAccountController, UpdateUserAccountController, SuspendUserAccountController
- **Utilities**: JWTUtils

**Responsibilities**:
- Process HTTP requests
- Validate input data
- Enforce business rules
- Manage authentication and authorization
- Coordinate between boundary and entity layers
- Generate JWT tokens
- Handle password hashing

**Technologies**: Python 3.10+, FastAPI, Uvicorn, bcrypt, PyJWT

---

### 💾 Entity Layer (Data Models)

**Purpose**: Data representation and persistence

**Components**:
- **Entity Models**: User, Role, AuthResponse
- **Database**: Supabase PostgreSQL
- **Tables**: users, roles
- **Views**: user_details

**Responsibilities**:
- Define data structures
- Encapsulate business objects
- Provide data conversion methods (to_dict, from_db)
- Represent database schema
- Ensure data integrity through constraints

**Technologies**: Supabase (PostgreSQL), Pydantic models

---

## Key Design Patterns

### 1. Separation of Concerns
Each layer has distinct responsibilities and doesn't directly depend on implementation details of other layers.

### 2. Dependency Flow
```
Boundary → Control → Entity
```
Dependencies flow in one direction, maintaining clean architecture.

### 3. Entity Independence
Entity classes are pure data models with no dependencies on other layers.

### 4. Control Layer Mediation
All business logic is centralized in control layer controllers, making it easy to modify without affecting UI or data structures.

### 5. View Pattern (Database)
The `user_details` view pre-joins user and role data, simplifying queries and improving performance.

---

## Authentication Flow (BCE Mapping)

```
User Input (Boundary) 
    ↓
LoginPage.handleLogin() (Boundary)
    ↓
AuthControllerJS.login() (Boundary-Control)
    ↓
FastAPIApp.post_login() (Control)
    ↓
AuthController.login() (Control)
    ↓
SupabaseClient.query() (Control → Database)
    ↓
UserDetailsView (Database)
    ↓
User.from_db() (Entity)
    ↓
JWTUtils.create_tokens() (Control)
    ↓
AuthResponse (Entity)
    ↓
Return to Frontend (Boundary)
```

---

## CRUD Operations (BCE Mapping)

### Create User
```
AdminDashboard (Boundary)
    → UserControllerJS (Boundary-Control)
    → FastAPIApp (Control)
    → CreateUserAccountController (Control)
    → SupabaseClient (Database)
    → UsersTable (Database)
    → User (Entity)
```

### Read User
```
AdminDashboard (Boundary)
    → UserControllerJS (Boundary-Control)
    → FastAPIApp (Control)
    → ViewUserAccountController (Control)
    → SupabaseClient (Database)
    → UserDetailsView (Database)
    → User (Entity)
```

### Update User
```
AdminDashboard (Boundary)
    → UserControllerJS (Boundary-Control)
    → FastAPIApp (Control)
    → UpdateUserAccountController (Control)
    → SupabaseClient (Database)
    → UsersTable (Database)
```

### Delete (Suspend) User
```
AdminDashboard (Boundary)
    → UserControllerJS (Boundary-Control)
    → FastAPIApp (Control)
    → SuspendUserAccountController (Control)
    → SupabaseClient (Database)
    → UsersTable (Database)
```

---

## Security Mechanisms

### Password Security
- **Hashing**: bcrypt with salt
- **Storage**: Only hashed passwords stored
- **Verification**: Secure comparison using bcrypt.checkpw()

### Authentication
- **JWT Tokens**: Stateless authentication
- **Access Token**: Short-lived (60 minutes)
- **Refresh Token**: Longer-lived for token renewal
- **Claims**: User ID and role embedded in token

### Authorization
- **Role-Based Access Control (RBAC)**: Each endpoint checks user role
- **Token Validation**: Every protected endpoint validates JWT
- **Route Protection**: User Admin role required for user management

---

## Data Flow Example: User Login

1. **Boundary**: User enters credentials in LoginPage
2. **Boundary**: LoginPage calls AuthControllerJS.login()
3. **Boundary→Control**: AuthControllerJS sends POST /api/login
4. **Control**: FastAPIApp receives request
5. **Control**: FastAPIApp calls AuthController.login()
6. **Control→Entity**: AuthController queries database for user
7. **Entity**: User entity created from database row
8. **Control**: AuthController verifies password (bcrypt)
9. **Control**: AuthController generates JWT tokens (JWTUtils)
10. **Control**: AuthController creates AuthResponse entity
11. **Control→Boundary**: FastAPI returns response with tokens
12. **Boundary**: AuthControllerJS stores tokens in localStorage
13. **Boundary**: LoginPage redirects to role-specific dashboard

---

## Benefits of BCE Architecture

### Maintainability
- Changes to UI don't affect business logic
- Business rules centralized in controllers
- Database schema changes isolated to entity layer

### Testability
- Each layer can be tested independently
- Mock objects easily created for interfaces
- Clear boundaries for unit and integration tests

### Scalability
- Frontend and backend can scale independently
- Stateless JWT enables horizontal scaling
- Database can be optimized separately

### Flexibility
- Easy to add new roles or user types
- New features added without major refactoring
- Technology stack can be changed per layer

---

## File Structure Mapping

### Boundary Layer Files
```
src/app/src/app/
├── page.jsx                    # LoginPage
├── dashboard/
│   ├── admin/page.jsx         # AdminDashboard
│   ├── pin/page.jsx           # PINDashboard
│   ├── csr/page.jsx           # CSRDashboard
│   └── platform/page.jsx      # PlatformDashboard
└── src/controllers/
    ├── authController.js       # AuthControllerJS
    └── userController.js       # UserControllerJS
```

### Control Layer Files
```
src/
├── main.py                     # FastAPIApp
├── controller/
│   ├── auth_controller.py      # AuthController
│   ├── create_user_account_controller.py
│   ├── view_user_account_controller.py
│   ├── update_user_account_controller.py
│   └── suspend_user_account_controller.py
└── security/
    └── jwt_utils.py            # JWTUtils
```

### Entity Layer Files
```
src/entity/
├── user.py                     # User
├── role.py                     # Role
└── auth_response.py            # AuthResponse
```

### Database Schema
```
src/database_setup.sql
├── roles table
├── users table
└── user_details view
```

---

## Conclusion

The BCE architecture in the CSR System provides:
- ✅ Clear separation of concerns
- ✅ Maintainable and testable codebase
- ✅ Scalable architecture
- ✅ Secure authentication and authorization
- ✅ Flexible and extensible design

This pattern makes the system professional, organized, and ready for growth.

---

_For detailed documentation, see:_
- `USE_CASE_DESCRIPTIONS.md` - All use cases
- `SEQUENCE_DIAGRAMS.md` - Interaction flows
- `DATA_PERSISTENCE.md` - Database schemas
