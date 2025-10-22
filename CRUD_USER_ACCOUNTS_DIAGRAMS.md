# CRUD User Accounts System Diagrams

## 1. Sequence Diagram - Create User Account

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as AdminPage<br/>(Boundary)
    participant CreateController as CreateUserAccountController<br/>(Control)
    participant Entity as User<br/>(Entity)
    participant DB as Supabase DB

    Admin->>AdminPage: Click "Create User"
    AdminPage->>Admin: Display user form
    Admin->>AdminPage: Enter user details (username, password, email, role, etc.)
    AdminPage->>CreateController: create_user(user_data)
    CreateController->>DB: Check if username exists
    DB-->>CreateController: Username check result
    alt Username exists
        CreateController-->>AdminPage: Error: Username already exists
        AdminPage-->>Admin: Display error message
    else Username available
        CreateController->>Entity: Hash password using bcrypt
        Entity-->>CreateController: Hashed password
        CreateController->>DB: INSERT INTO users (username, password, email, role_id, etc.)
        DB-->>CreateController: New user record with ID
        CreateController->>Entity: Create User object from DB data
        Entity-->>CreateController: User entity
        CreateController-->>AdminPage: Success response with user data
        AdminPage-->>Admin: Display success message & refresh user list
    end
```

## 2. Sequence Diagram - View User Accounts

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as AdminPage<br/>(Boundary)
    participant ViewController as ViewUserAccountController<br/>(Control)
    participant Entity as User<br/>(Entity)
    participant DB as Supabase DB

    Admin->>AdminPage: Navigate to User Management
    AdminPage->>ViewController: get_all_users()
    ViewController->>DB: SELECT * FROM user_details ORDER BY created_at DESC
    DB-->>ViewController: List of user records
    ViewController->>Entity: Convert DB records to User objects
    Entity-->>ViewController: List of User entities
    ViewController-->>AdminPage: User list with role info
    AdminPage-->>Admin: Display user table with search/filter

    Admin->>AdminPage: Enter search query
    AdminPage->>ViewController: search_users(query)
    ViewController->>DB: SELECT * FROM user_details WHERE username/email/full_name ILIKE query
    DB-->>ViewController: Filtered user records
    ViewController->>Entity: Convert to User objects
    Entity-->>ViewController: Filtered User entities
    ViewController-->>AdminPage: Filtered user list
    AdminPage-->>Admin: Display filtered results
```

## 3. Sequence Diagram - Update User Account

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as AdminPage<br/>(Boundary)
    participant UpdateController as UpdateUserAccountController<br/>(Control)
    participant Entity as User<br/>(Entity)
    participant DB as Supabase DB

    Admin->>AdminPage: Click "Edit" on user row
    AdminPage->>UpdateController: get_user_by_id(user_id)
    UpdateController->>DB: SELECT * FROM user_details WHERE id = user_id
    DB-->>UpdateController: User record
    UpdateController->>Entity: Create User object
    Entity-->>UpdateController: User entity
    UpdateController-->>AdminPage: User data
    AdminPage-->>Admin: Display pre-filled edit form

    Admin->>AdminPage: Modify user details & submit
    AdminPage->>UpdateController: update_user(user_id, updated_data)
    UpdateController->>DB: Check if new username/email conflicts with other users
    DB-->>UpdateController: Conflict check result
    alt Conflict exists
        UpdateController-->>AdminPage: Error: Username/Email already exists
        AdminPage-->>Admin: Display error message
    else No conflict
        alt Password changed
            UpdateController->>Entity: Hash new password
            Entity-->>UpdateController: Hashed password
        end
        UpdateController->>DB: UPDATE users SET ... WHERE id = user_id
        DB-->>UpdateController: Updated user record
        UpdateController->>Entity: Create updated User object
        Entity-->>UpdateController: Updated User entity
        UpdateController-->>AdminPage: Success response with updated data
        AdminPage-->>Admin: Display success message & refresh user list
    end
```

## 4. Sequence Diagram - Suspend User Account

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as AdminPage<br/>(Boundary)
    participant SuspendController as SuspendUserAccountController<br/>(Control)
    participant Entity as User<br/>(Entity)
    participant DB as Supabase DB

    Admin->>AdminPage: Click "Suspend/Activate" button
    AdminPage->>Admin: Show confirmation dialog
    Admin->>AdminPage: Confirm action

    AdminPage->>SuspendController: suspend_user(user_id) or activate_user(user_id)
    SuspendController->>DB: SELECT * FROM users WHERE id = user_id
    DB-->>SuspendController: User record
    alt User not found
        SuspendController-->>AdminPage: Error: User not found
        AdminPage-->>Admin: Display error message
    else User exists
        SuspendController->>DB: UPDATE users SET is_active = false/true WHERE id = user_id
        DB-->>SuspendController: Updated record
        SuspendController->>Entity: Create User object with updated status
        Entity-->>SuspendController: User entity
        SuspendController-->>AdminPage: Success response
        AdminPage-->>Admin: Display success message & update user status in table
    end
```

## 5. Sequence Diagram - Search User Account

```mermaid
sequenceDiagram
    actor Admin
    participant AdminPage as AdminPage<br/>(Boundary)
    participant ViewController as ViewUserAccountController<br/>(Control)
    participant Entity as User<br/>(Entity)
    participant DB as Supabase DB

    Admin->>AdminPage: Enter search query
    AdminPage->>ViewController: search_users(query)
    ViewController->>DB: SELECT * FROM user_details WHERE username ILIKE query OR email ILIKE query OR full_name ILIKE query
    DB-->>ViewController: Filtered user records
    ViewController->>Entity: Convert to User objects
    Entity-->>ViewController: Filtered User entities
    ViewController-->>AdminPage: Filtered user list
    AdminPage-->>Admin: Display filtered results
```

## Notes

- The sequence diagrams above match the BCE class diagram in `BCE_CLASS_DIAGRAM_LOGIN_LOGOUT.md`.
- Use these diagrams as a reference when implementing, testing, or documenting the user management flows.


## 5. BCE Class Diagram - User Account Management

```mermaid
classDiagram
    %% Boundary Layer
    class AdminPage {
        <<Boundary>>
        -User[] userList
        -string searchQuery
        -User selectedUser
        -bool showCreateForm
        -bool showEditForm
        +displayUserTable()
        +handleSearch(query)
        +handleCreateUser()
        +handleEditUser(userId)
        +handleSuspendUser(userId)
        +displayCreateForm()
        +displayEditForm()
        +showSuccessMessage()
        +showErrorMessage()
        +refreshUserList()
    }

    %% Control Layer
    class CreateUserAccountController {
        <<Control>>
        -SupabaseClient supabase
        +create_user(user_data) User
        -check_username_exists(username) bool
        -check_email_exists(email) bool
        -hash_password(password) string
        -validate_user_data(user_data) bool
    }

    class ViewUserAccountController {
        <<Control>>
        -SupabaseClient supabase
        +get_all_users() List~User~
        +get_user_by_id(user_id) User
        +search_users(query) List~User~
        +filter_by_role(role_code) List~User~
        +filter_by_status(is_active) List~User~
        -build_search_query(query) dict
    }

    class UpdateUserAccountController {
        <<Control>>
        -SupabaseClient supabase
        +update_user(user_id, user_data) User
        +get_user_by_id(user_id) User
        -check_username_conflict(user_id, username) bool
        -check_email_conflict(user_id, email) bool
        -hash_password_if_changed(password) string
        -validate_update_data(user_data) bool
    }

    class SuspendUserAccountController {
        <<Control>>
        -SupabaseClient supabase
        +suspend_user(user_id) User
        +activate_user(user_id) User
        +get_user_by_id(user_id) User
        -update_user_status(user_id, is_active) bool
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

    class Role {
        <<Entity>>
        -int id
        -string role_code
        -string role_name
        -string description
        +from_db(data) Role
        +to_dict() dict
    }

    class UserResponse {
        <<Entity>>
        -bool success
        -string message
        -User user
        -List~User~ users
        +to_dict() dict
    }

    %% Relationships
    AdminPage ..> CreateUserAccountController : uses
    AdminPage ..> ViewUserAccountController : uses
    AdminPage ..> UpdateUserAccountController : uses
    AdminPage ..> SuspendUserAccountController : uses
    
    CreateUserAccountController ..> User : creates
    ViewUserAccountController ..> User : retrieves
    UpdateUserAccountController ..> User : modifies
    SuspendUserAccountController ..> User : updates status
    
    CreateUserAccountController ..> UserResponse : returns
    ViewUserAccountController ..> UserResponse : returns
    UpdateUserAccountController ..> UserResponse : returns
    SuspendUserAccountController ..> UserResponse : returns
    
    User --> Role : has
    UserResponse --> User : contains
```

## 6. Database Conceptual Schema - User Management

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o| USER_DETAILS : "joined in view"
    ROLES ||--o| USER_DETAILS : "joined in view"

    ROLES {
        serial id PK
        varchar role_code UK "ADMIN, CSR, PIN, PLATFORM"
        varchar role_name "Full role name"
        text description "Role description"
        timestamp created_at "Record creation time"
    }

    USERS {
        serial id PK
        integer role_id FK "References roles.id"
        varchar username UK "Unique username"
        varchar password "Bcrypt hashed password"
        varchar full_name "User full name"
        varchar email UK "Unique email"
        boolean is_active "Account status - DEFAULT TRUE"
        timestamp created_at "Account creation - DEFAULT NOW()"
        timestamp last_login "Last login timestamp"
    }

    USER_DETAILS {
        integer id "users.id"
        varchar username "users.username"
        integer role_id "users.role_id"
        varchar role_code "roles.role_code"
        varchar role_name "roles.role_name"
        varchar full_name "users.full_name"
        varchar email "users.email"
        boolean is_active "users.is_active"
        timestamp created_at "users.created_at"
        timestamp last_login "users.last_login"
    }
```

## 7. Entity Class Diagram - User Account Entities

```mermaid
classDiagram
    class Role {
        <<Entity>>
        -int id
        -string role_code
        -string role_name
        -string description
        -datetime created_at
        +__init__(id, role_code, role_name, description, created_at)
        +from_db(data: dict) Role
        +to_dict() dict
        +__repr__() string
        +__eq__(other) bool
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
        +from_db(data: dict) User
        +to_dict() dict
        +is_admin() bool
        +is_csr() bool
        +is_pin() bool
        +is_platform() bool
        +has_role(role: string) bool
        +is_suspended() bool
        +get_status() string
        +__repr__() string
        +__eq__(other) bool
    }

    class UserResponse {
        <<Entity>>
        -bool success
        -string message
        -Optional~User~ user
        -Optional~List~User~~ users
        -Optional~int~ total_count
        +__init__(success, message, user, users, total_count)
        +to_dict() dict
        +__repr__() string
        +is_successful() bool
    }

    class UserCreateData {
        <<Entity>>
        -string username
        -string password
        -string full_name
        -string email
        -int role_id
        +validate() bool
        +to_dict() dict
    }

    class UserUpdateData {
        <<Entity>>
        -Optional~string~ username
        -Optional~string~ password
        -Optional~string~ full_name
        -Optional~string~ email
        -Optional~int~ role_id
        -Optional~bool~ is_active
        +validate() bool
        +to_dict() dict
        +has_password_change() bool
    }

    Role "1" --> "*" User : assigned to
    User "0..*" --> "1" UserResponse : contains
    UserCreateData --> User : creates
    UserUpdateData --> User : updates
```

## 8. Complete CRUD Operations Flow

```mermaid
flowchart TD
    Start([Admin User]) --> Action{Select Action}
    
    Action -->|Create| Create[Create User Account]
    Action -->|View/Search| View[View User Accounts]
    Action -->|Update| Update[Update User Account]
    Action -->|Suspend/Activate| Suspend[Suspend User Account]
    
    Create --> CreateForm[Fill User Form]
    CreateForm --> CreateValidate{Validate Data}
    CreateValidate -->|Invalid| CreateError[Show Error]
    CreateError --> CreateForm
    CreateValidate -->|Valid| CreateCheck{Username/Email Exists?}
    CreateCheck -->|Yes| CreateError
    CreateCheck -->|No| CreateHash[Hash Password]
    CreateHash --> CreateDB[Insert to Database]
    CreateDB --> CreateSuccess[Show Success & Refresh List]
    CreateSuccess --> End
    
    View --> ViewLoad[Load All Users]
    ViewLoad --> ViewDisplay[Display User Table]
    ViewDisplay --> ViewAction{User Action}
    ViewAction -->|Search| ViewSearch[Enter Search Query]
    ViewSearch --> ViewFilter[Filter Results]
    ViewFilter --> ViewDisplay
    ViewAction -->|Edit| Update
    ViewAction -->|Suspend| Suspend
    ViewAction -->|Done| End
    
    Update --> UpdateForm[Load & Display Edit Form]
    UpdateForm --> UpdateModify[Modify User Details]
    UpdateModify --> UpdateValidate{Validate Data}
    UpdateValidate -->|Invalid| UpdateError[Show Error]
    UpdateError --> UpdateModify
    UpdateValidate -->|Valid| UpdateCheck{Username/Email Conflict?}
    UpdateCheck -->|Yes| UpdateError
    UpdateCheck -->|No| UpdatePassword{Password Changed?}
    UpdatePassword -->|Yes| UpdateHash[Hash New Password]
    UpdatePassword -->|No| UpdateDB
    UpdateHash --> UpdateDB[Update Database]
    UpdateDB --> UpdateSuccess[Show Success & Refresh List]
    UpdateSuccess --> End
    
    Suspend --> SuspendConfirm{Confirm Action}
    SuspendConfirm -->|No| End
    SuspendConfirm -->|Yes| SuspendDB[Update is_active Status]
    SuspendDB --> SuspendSuccess[Show Success & Update Table]
    SuspendSuccess --> End
    
    End([End])
```

## 9. Key Features and Business Rules

### Create User Account
- **Validation Rules**:
  - Username: 3-50 characters, alphanumeric + underscore
  - Password: Minimum 8 characters
  - Email: Valid email format, unique
  - Role: Must be valid role_id from roles table
  - Full name: Required, 2-100 characters

- **Business Logic**:
  - Check username uniqueness before creation
  - Check email uniqueness before creation
  - Hash password using bcrypt (cost factor: 12)
  - Set is_active = true by default
  - Set created_at = NOW()
  - All fields except last_login are required

### View User Accounts
- **Features**:
  - Display all users with role information
  - Sort by created_at (newest first)
  - Search across username, email, full_name (case-insensitive)
  - Filter by role (ADMIN, CSR, PIN, PLATFORM)
  - Filter by status (Active/Suspended)
  - Display user status badge (Active/Suspended)

- **Search Logic**:
  - Multi-field search using ILIKE
  - Searches: username, email, full_name, role_name
  - Empty query returns all users
  - Results update in real-time

### Update User Account
- **Updatable Fields**:
  - Username (must remain unique)
  - Password (optional - only if changed)
  - Full name
  - Email (must remain unique)
  - Role (role_id)

- **Validation Rules**:
  - Cannot update to existing username (except own)
  - Cannot update to existing email (except own)
  - Password hash only if password field is provided
  - Must maintain at least one ADMIN user
  - Cannot change own role if only admin

### Suspend User Account
- **Suspend Logic**:
  - Set is_active = false
  - User cannot log in when suspended
  - Login returns "Account suspended" error
  - All user data preserved
  - Can be reactivated later

- **Activate Logic**:
  - Set is_active = true
  - User can log in again
  - Previous data and permissions restored

- **Business Rules**:
  - Cannot suspend own account
  - Must maintain at least one active ADMIN
  - Confirmation required before suspend/activate
  - Audit log of status changes (future enhancement)

## 10. Security Considerations

### Password Security
- Bcrypt hashing with salt (cost factor: 12)
- Plain text passwords never stored
- Password not returned in API responses
- Password only hashed on create/update if provided

### Access Control
- Only ADMIN role can perform CRUD operations
- JWT token required for all endpoints
- Token contains user_id and role_code
- Endpoints protected with `get_current_admin_user` dependency

### Data Validation
- Server-side validation for all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection (token-based auth)

### Error Handling
- User-friendly error messages
- No sensitive data in error responses
- Database errors logged server-side
- Unique constraint violations caught and handled

---

## How to View These Diagrams

### ✅ Best Option: GitHub
Push this file to your repository - GitHub automatically renders Mermaid diagrams beautifully!

### 📋 VS Code Extension
Install "Markdown Preview Mermaid Support" and press `Ctrl+Shift+V` to preview.

### 🌐 Online Viewer
Copy Mermaid code blocks to https://mermaid.live

### 📦 Export as Images
Use Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i CRUD_USER_ACCOUNTS_DIAGRAMS.md -o crud_diagrams.pdf
```
