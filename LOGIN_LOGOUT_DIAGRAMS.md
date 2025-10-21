# Login and Logout System Diagrams

## 1. Sequence Diagram - Login

```mermaid
sequenceDiagram
    actor User
    participant LoginPage as LoginPage<br/>(Boundary)
    participant AuthController as AuthController<br/>(Control)
    participant Entity as User/AuthResponse<br/>(Entity)
    participant DB as Supabase DB

    User->>LoginPage: Enter credentials & select role
    LoginPage->>AuthController: login(username, password, role_code)
    AuthController->>DB: Query user_details by username & role_code
    DB-->>AuthController: User data with role info
    AuthController->>Entity: Check if user exists and is_active
    AuthController->>DB: Query password from users table
    DB-->>AuthController: Password hash
    AuthController->>Entity: verify_password()
    Entity-->>AuthController: Valid/Invalid
    AuthController->>DB: Update last_login
    AuthController->>Entity: create_access_token()
    Entity-->>AuthController: JWT Token
    AuthController-->>LoginPage: AuthResponse(success, token, user data)
    LoginPage-->>User: Store token & redirect to dashboard
```

## 2. Sequence Diagram - Logout

```mermaid
sequenceDiagram
    actor User
    participant Dashboard as Dashboard<br/>(Boundary)
    participant AuthController as AuthController<br/>(Control)
    participant Storage as Browser Storage

    User->>Dashboard: Click Logout
    Dashboard->>AuthController: logout()
    AuthController->>Storage: Clear token from localStorage
    Storage-->>AuthController: Token removed
    AuthController-->>Dashboard: Success response
    Dashboard-->>User: Redirect to login page
```

## 3. BCE Class Diagram

```mermaid
classDiagram
    %% Boundary Layer
    class LoginPage {
        <<Boundary>>
        -string username
        -string password
        -string role_code
        -string error
        +handleLogin()
        +handleRoleChange()
        +displayError()
        +redirectToDashboard()
    }

    class DashboardPage {
        <<Boundary>>
        -User currentUser
        -string token
        +displayUserInfo()
        +handleLogout()
        +renderContent()
    }

    %% Control Layer
    class AuthController {
        <<Control>>
        -SupabaseClient supabase
        -string SECRET_KEY
        -string ALGORITHM
        +login(username, password, role_code) AuthResponse
        +logout() Response
        +verify_password(plain_password, hashed_password) bool
        +create_access_token(data) string
        +verify_token(token) dict
        +get_current_user(token) User
    }

    %% Entity Layer
    class User {
        <<Entity>>
        -int id
        -string username
        -int role_id
        -string role_code
        -string role_name
        -string full_name
        -string email
        -bool is_active
        -datetime created_at
        -datetime last_login
        +from_db(data) User
        +to_dict() dict
        +is_admin() bool
        +is_csr() bool
        +is_pin() bool
        +is_platform() bool
    }

    class Role {
        <<Entity>>
        -int id
        -string role_code
        -string role_name
        -string description
        +from_db(data) Role
        +to_dict() dict
    }

    class AuthResponse {
        <<Entity>>
        -bool success
        -string message
        -string token
        -User user
        +to_dict() dict
    }

    %% Relationships
    LoginPage ..> AuthController : uses
    DashboardPage ..> AuthController : uses
    AuthController ..> User : creates/manages
    AuthController ..> AuthResponse : creates
    User --> Role : has
    AuthResponse --> User : contains
```

## 4. Database Conceptual Schema (ER Diagram)

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o| USER_DETAILS : "joined in"
    ROLES ||--o| USER_DETAILS : "joined in"

    ROLES {
        serial id PK
        varchar role_code UK
        varchar role_name
        text description
        timestamp created_at
    }

    USERS {
        serial id PK
        integer role_id FK
        varchar username UK "NOT NULL"
        varchar password
        varchar full_name
        varchar email UK "NOT NULL"
        boolean is_active "DEFAULT TRUE"
        timestamp created_at "DEFAULT NOW()"
        timestamp last_login
    }

    USER_DETAILS {
        integer id "FROM users"
        varchar username
        integer role_id
        varchar role_code "FROM roles"
        varchar role_name "FROM roles"
        varchar full_name
        varchar email
        boolean is_active
        timestamp created_at
        timestamp last_login
    }
```

## 5. Entity Class Diagram

```mermaid
classDiagram
    class Role {
        <<Entity>>
        -int id
        -string role_code
        -string role_name
        -string description
        -datetime created_at
        +__init__(...)
        +from_db(data) Role
        +to_dict() dict
        +__repr__() string
    }

    class User {
        <<Entity>>
        -int id
        -string username
        -int role_id
        -string role_code
        -string role_name
        -string full_name
        -string email
        -bool is_active
        -datetime created_at
        -datetime last_login
        +__init__(...)
        +from_db(data) User
        +to_dict() dict
        +is_admin() bool
        +is_csr() bool
        +is_pin() bool
        +is_platform() bool
        +has_role(role) bool
        +__repr__() string
    }

    class AuthResponse {
        <<Entity>>
        -bool success
        -string message
        -Optional~string~ token
        -Optional~User~ user
        +__init__(...)
        +to_dict() dict
        +__repr__() string
    }

    Role "1" --> "*" User : assigned to
    User "1" --> "0..1" AuthResponse : contains
```

## 6. Key Design Patterns and Principles

### BCE (Boundary-Control-Entity) Pattern
- **Boundary**: LoginPage, DashboardPage (UI components)
- **Control**: AuthController (business logic)
- **Entity**: User, Role, AuthResponse (data models)

### Security Features
1. **Password Hashing**: Bcrypt with salt
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Login validates role_code
4. **Active Status Check**: Suspended users cannot log in

### Database Design
- **Normalization**: Separate roles and users tables (3NF)
- **View**: user_details for efficient querying
- **Indexes**: username, email (unique), role_id (foreign key)
- **Constraints**: NOT NULL, UNIQUE, DEFAULT values

### Authentication Flow
1. User submits credentials with role selection
2. Backend queries user_details view (username + role_code)
3. Validates password hash using bcrypt
4. Checks if user is_active
5. Updates last_login timestamp
6. Generates JWT token with user claims
7. Returns AuthResponse with token and user data
8. Frontend stores token in localStorage
9. Token used for subsequent authenticated requests

### Logout Flow
1. User clicks logout button
2. Frontend calls logout function
3. Token removed from localStorage
4. User redirected to login page
5. No server-side session invalidation (stateless JWT)

---

## How to View These Diagrams

### Option 1: GitHub (Best)
- Push this file to your GitHub repository
- GitHub automatically renders Mermaid diagrams in `.md` files
- View directly on GitHub web interface

### Option 2: VS Code with Mermaid Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Press `Ctrl+Shift+V` to preview

### Option 3: Online Mermaid Editor
- Copy the Mermaid code blocks
- Paste into https://mermaid.live
- View and export diagrams

### Option 4: Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i LOGIN_LOGOUT_DIAGRAMS.md -o diagrams.pdf
```
