
# BCE Class Diagram & Sequence Diagrams (Updated)

This document contains the updated BCE Class Diagram and the sequence diagrams for the main user functions implemented in the codebase.

## BCE Class Diagram (Mermaid)

```mermaid
classDiagram
    %% Boundary Layer
    class LoginPage {
      <<Boundary>>
      +string username
      +string password
      +string role
      +bool loading
      +string error
      +handleLogin()
    }

    class UserAdminDashboard {
      <<Boundary>>
      +User user
      +displayUserTable()
      +openEditModal(userId)
      +openCreateModal()
    }

    %% Control Layer (Frontend Controllers)
    class AuthControllerFrontend {
      <<Control>>
      +login(credentials)
      +logout()
      +isAuthenticated()
      +getCurrentUser()
    }

    class CreateUserControllerFrontend {
      <<Control>>
      +createUser(userData)
    }

    class ViewUserControllerFrontend {
      <<Control>>
      +getAllUsers()
      +getUserById(id)
      +searchUsers(query)
    }

    class UpdateUserControllerFrontend {
      <<Control>>
      +updateUser(id, data)
    }

    class SuspendUserControllerFrontend {
      <<Control>>
      +toggleUserStatus(id)
    }

    %% Control Layer (Backend Controllers)
    class AuthControllerBackend {
      <<Control>>
      +login(username, password)
      +verify_user(id)
    }

    class CreateUserControllerBackend {
      <<Control>>
      +create_user(...)
    }

    class ViewUserControllerBackend {
      <<Control>>
      +get_all_users()
      +get_user_by_id(id)
      +search_users(query)
    }

    class UpdateUserControllerBackend {
      <<Control>>
      +update_user(id, data)
    }

    class SuspendUserControllerBackend {
      <<Control>>
      +toggle_status(id)
    }

    %% Entity Layer
    class User {
      <<Entity>>
      +int id
      +string username
      +string full_name
      +string email
      +int role_id
      +string role_name
      +bool is_active
      +to_dict()
    }

    class Role {
      <<Entity>>
      +int id
      +string role_name
      +string role_code
      +to_dict()
    }

    class AuthResponse {
      <<Entity>>
      +bool success
      +string message
      +User user
    }

    %% Relationships
    LoginPage ..> AuthControllerFrontend : uses
    UserAdminDashboard ..> ViewUserControllerFrontend : uses
    UserAdminDashboard ..> CreateUserControllerFrontend : uses
    UserAdminDashboard ..> UpdateUserControllerFrontend : uses
    UserAdminDashboard ..> SuspendUserControllerFrontend : uses

    AuthControllerFrontend ..> AuthControllerBackend : calls
    CreateUserControllerFrontend ..> CreateUserControllerBackend : calls
    ViewUserControllerFrontend ..> ViewUserControllerBackend : calls
    UpdateUserControllerFrontend ..> UpdateUserControllerBackend : calls
    SuspendUserControllerFrontend ..> SuspendUserControllerBackend : calls

    CreateUserControllerBackend ..> User : creates
    ViewUserControllerBackend ..> User : reads
    UpdateUserControllerBackend ..> User : updates
    SuspendUserControllerBackend ..> User : updates

    User --> Role : has
    AuthControllerBackend ..> AuthResponse : returns
```

## Sequence Diagrams (Mermaid)

### 1) User Login

```mermaid
sequenceDiagram
    actor User
    participant LoginPage as LoginPage (Boundary)
    participant AuthFrontend as AuthController (Frontend)
    participant API as FastAPI
    participant AuthBackend as AuthController (Backend)
    participant DB as Supabase
    participant UserEntity as User (Entity)

    User->>LoginPage: Enter credentials + role
    LoginPage->>AuthFrontend: login(credentials)
    AuthFrontend->>API: POST /api/login {username,password}
    API->>AuthBackend: login(request)
    AuthBackend->>DB: SELECT user FROM user_details WHERE username = ...
    DB-->>AuthBackend: user row
    AuthBackend->>AuthBackend: verify password, check is_active
    alt success
      AuthBackend->>DB: UPDATE users SET last_login = now()
      AuthBackend->>UserEntity: from_db(row)
      AuthBackend-->>API: AuthResponse(success,user)
      API-->>AuthFrontend: 200 {success,user}
      AuthFrontend-->>LoginPage: store user (localStorage)
      LoginPage-->>User: redirect to dashboard
    else failure
      AuthBackend-->>API: AuthResponse(failure,message)
      API-->>AuthFrontend: 400 {message}
      AuthFrontend-->>LoginPage: show error
    end
```

### 2) User Logout

```mermaid
sequenceDiagram
    actor User
    participant Dashboard as UserAdminDashboard
    participant AuthFrontend as AuthController (Frontend)

    User->>Dashboard: Click Logout
    Dashboard->>AuthFrontend: logout()
    AuthFrontend-->>Dashboard: clear storage, redirect to login
```

### 3) Create User (User Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as UserAdminDashboard (Boundary)
    participant CreateFrontend as CreateUserController (Frontend)
    participant API as FastAPI
    participant CreateBackend as CreateUserController (Backend)
    participant DB as Supabase
    participant UserEntity as User

    Admin->>AdminPage: Click Create -> submit form
    AdminPage->>CreateFrontend: createUser(formData)
    CreateFrontend->>API: POST /api/users {formData}
    API->>CreateBackend: create_user(request)
    CreateBackend->>DB: Check username/email uniqueness
    DB-->>CreateBackend: uniqueness result
    alt unique
      CreateBackend->>CreateBackend: hash password
      CreateBackend->>DB: INSERT INTO users (...)
      DB-->>CreateBackend: new user row
      CreateBackend->>UserEntity: from_db(row)
      CreateBackend-->>API: {success,user}
      API-->>CreateFrontend: 201 {success,user}
      CreateFrontend-->>AdminPage: success, refresh list
    else conflict
      CreateBackend-->>API: {success:false,message}
      API-->>CreateFrontend: 400 {message}
      CreateFrontend-->>AdminPage: show error
    end
```

### 4) View User Account (User Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as UserAdminDashboard
    participant ViewFrontend as ViewUserController (Frontend)
    participant API as FastAPI
    participant ViewBackend as ViewUserController (Backend)
    participant DB as Supabase

    Admin->>AdminPage: Open user management
    AdminPage->>ViewFrontend: getAllUsers()
    ViewFrontend->>API: GET /api/users
    API->>ViewBackend: get_all_users()
    ViewBackend->>DB: SELECT * FROM user_details ORDER BY created_at DESC
    DB-->>ViewBackend: rows
    ViewBackend-->>API: {success, users}
    API-->>ViewFrontend: {success, users}
    ViewFrontend-->>AdminPage: render table
```

### 5) Update User Account (User Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as UserAdminDashboard
    participant UpdateFrontend as UpdateUserController (Frontend)
    participant API as FastAPI
    participant UpdateBackend as UpdateUserController (Backend)
    participant DB as Supabase

    Admin->>AdminPage: Click Edit -> open modal
    AdminPage->>API: GET /api/users/{id} (optional) to prefill
    API->>UpdateBackend: get_user_by_id(id)
    UpdateBackend->>DB: SELECT FROM user_details WHERE id = id
    DB-->>UpdateBackend: row
    UpdateBackend-->>API: {success,user}
    API-->>AdminPage: prefill form

    Admin->>AdminPage: Submit updated data
    AdminPage->>UpdateFrontend: updateUser(id,data)
    UpdateFrontend->>API: PUT /api/users/{id} {data}
    API->>UpdateBackend: update_user(id,data)
    UpdateBackend->>DB: Check conflicts (username/email)
    DB-->>UpdateBackend: conflict check
    alt no conflict
      UpdateBackend->>DB: UPDATE users SET ... WHERE id = id
      DB-->>UpdateBackend: updated row
      UpdateBackend-->>API: {success, user}
      API-->>UpdateFrontend: {success, user}
      UpdateFrontend-->>AdminPage: close modal, refresh list
    else conflict
      UpdateBackend-->>API: {success:false,message}
      API-->>UpdateFrontend: {message}
      UpdateFrontend-->>AdminPage: show error
    end
```

### 6) Suspend / Activate User Account (User Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as UserAdminDashboard
    participant SuspendFrontend as SuspendUserController (Frontend)
    participant API as FastAPI
    participant SuspendBackend as SuspendUserController (Backend)
    participant DB as Supabase

    Admin->>AdminPage: Click Suspend/Activate
    AdminPage->>SuspendFrontend: toggleUserStatus(id)
    SuspendFrontend->>API: PUT /api/users/{id} {is_active: false/true}
    API->>SuspendBackend: toggle_status(id)
    SuspendBackend->>DB: SELECT users WHERE id = id
    DB-->>SuspendBackend: row
    SuspendBackend->>DB: UPDATE users SET is_active = !current
    DB-->>SuspendBackend: updated row
    SuspendBackend-->>API: {success, user}
    API-->>SuspendFrontend: {success, user}
    SuspendFrontend-->>AdminPage: refresh list
```

### 7) Search User Account (User Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as UserAdminDashboard
    participant SearchFrontend as ViewUserController (Frontend)
    participant API as FastAPI
    participant SearchBackend as SearchUserController (Backend)
    participant DB as Supabase

    Admin->>AdminPage: Type search query
    AdminPage->>SearchFrontend: searchUsers(q)
    SearchFrontend->>API: GET /api/users?query=q
    API->>SearchBackend: search_users(q)
    SearchBackend->>DB: SELECT FROM user_details WHERE username ILIKE q OR email ILIKE q OR full_name ILIKE q
    DB-->>SearchBackend: rows
    SearchBackend-->>API: {success, users}
    API-->>SearchFrontend: {success, users}
    SearchFrontend-->>AdminPage: display results
```

---

### Notes & Mappings

- Boundary components: `LoginPage`, `UserAdminDashboard` (React/Next.js pages and modals)
- Frontend controllers: located under `src/app/src/controllers/*`
- Backend controllers: located under `src/controller/*.py`
- Entities: `src/entity/*.py` (`User`, `Role`, `AuthResponse`)
- Database access: Supabase client in backend controllers

This set of diagrams maps directly to the files in the repository. If you'd like, I can:

- write these diagrams into the other diagrams file (`CRUD_USER_ACCOUNTS_DIAGRAMS.md`) or split them into separate files per use case
- generate PNG/SVG exports of the Mermaid diagrams
- add/update a README section that references these diagrams and points to the corresponding files in the repo

13. **Navigation** → Redirect to dashboard

### **Logout Flow:**
1. **User Click** → UserAdminDashboard (Boundary)
2. **Confirmation** → Show modal
3. **Confirm Action** → AuthController.logout() (Frontend Control)
4. **Remove Data** → Delete from localStorage
5. **Navigation** → Redirect to login page

**Note**: Logout is entirely client-side! No backend API call or database update needed because authentication is stateless.

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
- AuthController.login() with valid credentials
- AuthController.login() with invalid credentials
- AuthController.login() with suspended account
- AuthController.logout() clears localStorage
- User.from_db() creates correct entity
- User.to_dict() serializes correctly

### **Integration Tests:**
- POST /api/login with valid user returns 200
- POST /api/login with invalid user returns 200 with success=false
- POST /api/login updates last_login in database
- GET /api/verify/{user_id} returns correct status

### **E2E Tests:**
- User can login with correct credentials
- User redirected to correct dashboard based on role
- User cannot login with incorrect password
- Suspended user cannot login
- User can logout successfully
- After logout, user redirected to login page

---

**End of BCE Class Diagram Documentation**
