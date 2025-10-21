"""
Generate comprehensive documentation for the CSR System
"""

import os

# Create docs directory if it doesn't exist
if not os.path.exists("docs"):
    os.makedirs("docs")

# USE CASE DESCRIPTIONS
use_case_content = """# Use Case Descriptions - CSR System

## Table of Contents
1. [UC-001: User Login](#uc-001-user-login)
2. [UC-002: User Logout](#uc-002-user-logout)
3. [UC-003: Create User Account](#uc-003-create-user-account)
4. [UC-004: View User Account](#uc-004-view-user-account)
5. [UC-005: Update User Account](#uc-005-update-user-account)
6. [UC-006: Suspend User Account](#uc-006-suspend-user-account)
7. [UC-007: Search User Accounts](#uc-007-search-user-accounts)
8. [UC-008: View All Users](#uc-008-view-all-users)
9. [UC-009: Access Role-Based Dashboard](#uc-009-access-role-based-dashboard)
10. [UC-010: Refresh Authentication Token](#uc-010-refresh-authentication-token)

---

## UC-001: User Login

### Description
Allows a user to authenticate into the system by providing their username, password, and selecting their role. Upon successful authentication, the user receives JWT tokens and is redirected to their role-specific dashboard.

### Actors
- **Primary Actor**: User (User Admin, PIN, CSR Rep, Platform Management)
- **Secondary Actor**: Authentication System (Backend API)

### Preconditions
- User has valid credentials
- User account is active (not suspended)
- Backend system is operational
- Database is accessible

### Postconditions
- User is authenticated
- JWT access token and refresh token are generated
- User session is created in localStorage
- User's last login timestamp is updated
- User is redirected to role-specific dashboard

### Main Flow
1. User navigates to login page (`/`)
2. System displays login form with username, password, and role selection fields
3. User enters username
4. User enters password
5. User selects role from dropdown (USER_ADMIN, PIN, CSR_REP, or PLATFORM_MGMT)
6. User clicks "Sign In" button
7. System validates input fields are not empty
8. System sends POST request to `/api/login` with credentials
9. Backend AuthController retrieves user from database using username and role_code
10. Backend verifies user exists and role matches
11. Backend checks if user account is active
12. Backend verifies password using bcrypt
13. Backend updates user's last_login timestamp
14. Backend generates JWT access token and refresh token
15. Backend returns success response with user data and tokens
16. Frontend stores tokens and user data in localStorage
17. Frontend retrieves dashboard route from user data
18. System redirects user to role-specific dashboard

### Alternative Flows

#### 3a. Invalid Username
- System displays error: "Invalid username, password, or role"
- Use case returns to step 2

#### 4a. Invalid Password
- Backend password verification fails
- System displays error: "Invalid username or password"
- Use case returns to step 2

#### 5a. Role Mismatch
- User's assigned role doesn't match selected role
- System displays error: "Invalid username, password, or role"
- Use case returns to step 2

#### 6a. Account Suspended
- Backend detects user account is inactive
- System displays error: "Account has been suspended. Please contact administrator."
- Use case terminates

#### 8a. Backend Connection Failure
- Frontend cannot reach backend API
- System displays error: "Failed to connect to server. Make sure the backend is running."
- Use case returns to step 2

### Business Rules
- BR-001: Password must match stored hashed password
- BR-002: User role must match selected role
- BR-003: User account must be active
- BR-004: JWT tokens expire after configured duration
- BR-005: Password comparison supports both hashed (bcrypt) and plain text for backward compatibility

### Special Requirements
- SR-001: Password must be transmitted securely (HTTPS in production)
- SR-002: Passwords must be hashed using bcrypt
- SR-003: Login form must prevent submission while processing
- SR-004: Error messages must not reveal whether username or password is incorrect
- SR-005: JWT tokens must include user ID and role in claims

### BCE Mapping
- **Boundary**: `LoginPage` (page.jsx), `authController.js`
- **Control**: `AuthController.py`, `login()` method
- **Entity**: `User`, `Role`, `AuthResponse`

---

## UC-002: User Logout

### Description
Allows an authenticated user to terminate their session and clear authentication data from the client.

### Actors
- **Primary Actor**: Authenticated User
- **Secondary Actor**: None (client-side operation)

### Preconditions
- User is authenticated
- User has valid session data in localStorage

### Postconditions
- User session is terminated
- All authentication tokens are removed from localStorage
- User data is cleared from client
- User is redirected to login page

### Main Flow
1. User clicks "Logout" button on dashboard
2. Frontend authController.logout() is called
3. System removes access token from localStorage
4. System removes refresh token from localStorage
5. System removes user data from localStorage
6. System redirects user to login page (`/`)

### Alternative Flows
None - logout is a client-side operation that always succeeds

### Business Rules
- BR-006: Logout only clears client-side data
- BR-007: Server-side session/token invalidation is not required (stateless JWT)

### Special Requirements
- SR-006: Logout must be accessible from all authenticated pages
- SR-007: Logout must clear all authentication-related data

### BCE Mapping
- **Boundary**: Dashboard pages, `authController.js`
- **Control**: `authController.logout()` method
- **Entity**: None

---

## UC-003: Create User Account

### Description
Allows a User Admin to create a new user account in the system with specified credentials and role assignment.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: CreateUserAccountController (Backend)

### Preconditions
- Actor is authenticated as User Admin
- Actor has valid JWT token with USER_ADMIN role
- Username is not already taken

### Postconditions
- New user account is created in database
- Password is hashed and stored securely
- User is assigned to specified role
- User account is active by default

### Main Flow
1. User Admin navigates to user management section
2. User Admin clicks "Create User" button
3. System displays user creation form
4. User Admin enters username
5. User Admin enters password
6. User Admin enters full name
7. User Admin enters email
8. User Admin selects role from dropdown
9. User Admin submits form
10. Frontend sends POST request to `/api/users` with JWT token
11. Backend validates JWT token and checks USER_ADMIN role
12. CreateUserAccountController checks if username exists
13. CreateUserAccountController hashes password using bcrypt
14. CreateUserAccountController inserts user into database with is_active=True
15. Backend returns success response with created user data
16. System displays success message
17. System refreshes user list

### Alternative Flows

#### 11a. Unauthorized Role
- JWT token doesn't contain USER_ADMIN role
- Backend returns 403 Forbidden
- System displays error: "Forbidden: insufficient role"
- Use case terminates

#### 12a. Username Already Exists
- Database already contains user with same username
- Backend returns 409 Conflict
- System displays error: "Username already exists"
- Use case returns to step 3

#### 14a. Database Insertion Fails
- Database constraint violation or error occurs
- Backend returns 400 Bad Request
- System displays error message
- Use case returns to step 3

### Business Rules
- BR-008: Only User Admin can create user accounts
- BR-009: Username must be unique
- BR-010: Password must be hashed before storage
- BR-011: New accounts are active by default
- BR-012: Role ID must reference valid role in roles table

### Special Requirements
- SR-008: Form must validate all required fields
- SR-009: Password strength requirements should be enforced (future enhancement)
- SR-010: Email format should be validated

### BCE Mapping
- **Boundary**: User Admin Dashboard, User Management UI
- **Control**: `CreateUserAccountController`, `create_user()` method
- **Entity**: `User`, `Role`

---

## BCE Framework in CSR System

The CSR System follows the Boundary-Control-Entity (BCE) architectural pattern:

### Boundary Layer (User Interface)
- **Frontend Components**: Login Page, Dashboards, Forms
- **Files**: `src/app/src/app/page.jsx`, `src/app/src/controllers/authController.js`
- **Responsibility**: Handle user interactions, display data, capture input

### Control Layer (Business Logic)
- **Backend Controllers**: AuthController, UserAccountController, etc.
- **Files**: `src/controller/auth_controller.py`, `src/controller/user_account_controller.py`
- **Responsibility**: Process requests, enforce business rules, coordinate operations

### Entity Layer (Data Models)
- **Data Models**: User, Role, AuthResponse
- **Files**: `src/entity/user.py`, `src/entity/role.py`, `src/entity/auth_response.py`
- **Responsibility**: Represent business objects, encapsulate data

---

_For detailed sequence diagrams and class diagrams, see:_
- `SEQUENCE_DIAGRAMS.md`
- `BCE_CLASS_DIAGRAM.md`
- `DATA_PERSISTENCE.md`
"""

with open("docs/USE_CASE_DESCRIPTIONS.md", "w", encoding="utf-8") as f:
    f.write(use_case_content)

print("[OK] Created USE_CASE_DESCRIPTIONS.md")

# SEQUENCE DIAGRAMS
sequence_diagrams = """# Sequence Diagrams - CSR System (BCE Framework)

All sequence diagrams follow the BCE (Boundary-Control-Entity) architectural pattern.

## Table of Contents
1. [Login Sequence](#1-login-sequence-diagram)
2. [Logout Sequence](#2-logout-sequence-diagram)
3. [Create User Account](#3-create-user-account-sequence)
4. [View User Account](#4-view-user-account-sequence)
5. [Update User Account](#5-update-user-account-sequence)
6. [Suspend User Account](#6-suspend-user-account-sequence)
7. [Search Users](#7-search-users-sequence)
8. [Token Refresh](#8-token-refresh-sequence)

---

## 1. Login Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant LoginPage as <<Boundary>><br/>LoginPage
    participant AuthCtrl as <<Control>><br/>authController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant AuthController as <<Control>><br/>AuthController.py
    participant UserEntity as <<Entity>><br/>User
    participant DB as <<Entity>><br/>Database

    User->>LoginPage: Enter credentials & select role
    User->>LoginPage: Click "Sign In"
    LoginPage->>LoginPage: Validate inputs
    LoginPage->>AuthCtrl: login(username, password, role_code)
    AuthCtrl->>API: POST /api/login
    API->>AuthController: login(username, password, role_code)
    AuthController->>DB: Query user_details view<br/>WHERE username AND role_code
    DB-->>AuthController: Return user data
    AuthController->>AuthController: Check is_active
    alt Account Suspended
        AuthController-->>API: {success: false, message: "Account suspended"}
        API-->>AuthCtrl: 200 OK (suspended)
        AuthCtrl-->>LoginPage: Display error
        LoginPage-->>User: "Account suspended"
    else Account Active
        AuthController->>DB: Get password from users table
        DB-->>AuthController: Return hashed password
        AuthController->>AuthController: verify_password(plain, hashed)
        alt Password Invalid
            AuthController-->>API: {success: false}
            API-->>AuthCtrl: 200 OK (invalid)
            AuthCtrl-->>LoginPage: Display error
            LoginPage-->>User: "Invalid credentials"
        else Password Valid
            AuthController->>DB: UPDATE last_login
            AuthController->>UserEntity: from_db(user_data)
            UserEntity-->>AuthController: User object
            AuthController->>AuthController: Generate JWT tokens
            AuthController-->>API: {success: true, user, tokens}
            API-->>AuthCtrl: 200 OK + user + tokens
            AuthCtrl->>AuthCtrl: Store tokens & user in localStorage
            AuthCtrl-->>LoginPage: {success: true}
            LoginPage->>LoginPage: Get dashboard_route from user
            LoginPage-->>User: Redirect to dashboard
        end
    end
```

**Key Points**:
- BCE layers clearly separated
- Password verification uses bcrypt
- Role-based routing to dashboards
- JWT tokens issued on successful login

---

## 2. Logout Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Dashboard as <<Boundary>><br/>Dashboard Page
    participant AuthCtrl as <<Control>><br/>authController.js
    participant LocalStorage as localStorage

    User->>Dashboard: Click "Logout"
    Dashboard->>AuthCtrl: logout()
    AuthCtrl->>LocalStorage: Remove access_token
    AuthCtrl->>LocalStorage: Remove refresh_token
    AuthCtrl->>LocalStorage: Remove user data
    AuthCtrl-->>Dashboard: Logout complete
    Dashboard-->>User: Redirect to /login
```

**Key Points**:
- Client-side operation only
- Clears all authentication data
- Stateless JWT doesn't require server-side invalidation

---

## 3. Create User Account Sequence

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant CreateCtrl as <<Control>><br/>CreateUserAccountController
    participant User as <<Entity>><br/>User
    participant DB as <<Entity>><br/>Database

    UserAdmin->>AdminUI: Click "Create User"
    AdminUI->>AdminUI: Display form
    UserAdmin->>AdminUI: Fill form (username, password, etc.)
    UserAdmin->>AdminUI: Submit
    AdminUI->>UserCtrl: createUser(userData)
    UserCtrl->>API: POST /api/users<br/>(with JWT token)
    API->>API: Validate JWT & check USER_ADMIN role
    alt Unauthorized
        API-->>UserCtrl: 403 Forbidden
        UserCtrl-->>AdminUI: Show error
        AdminUI-->>UserAdmin: "Insufficient permissions"
    else Authorized
        API->>CreateCtrl: create_user(...)
        CreateCtrl->>DB: SELECT * FROM users<br/>WHERE username = ?
        DB-->>CreateCtrl: Check result
        alt Username Exists
            CreateCtrl-->>API: {success: false, message: "Username exists"}
            API-->>UserCtrl: 409 Conflict
            UserCtrl-->>AdminUI: Show error
            AdminUI-->>UserAdmin: "Username already exists"
        else Username Available
            CreateCtrl->>CreateCtrl: hash_password(password)
            CreateCtrl->>DB: INSERT INTO users<br/>(username, hashed_password, ...)
            DB-->>CreateCtrl: New user record
            CreateCtrl-->>API: {success: true, user}
            API-->>UserCtrl: 200 OK + user data
            UserCtrl-->>AdminUI: Success
            AdminUI-->>UserAdmin: "User created successfully"
            AdminUI->>AdminUI: Refresh user list
        end
    end
```

**Key Points**:
- Role-based authorization (USER_ADMIN only)
- Password hashing with bcrypt before storage
- Username uniqueness validation
- Entity created in database

---

## 4. View User Account Sequence

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant ViewCtrl as <<Control>><br/>ViewUserAccountController
    participant User as <<Entity>><br/>User
    participant DB as <<Entity>><br/>Database

    UserAdmin->>AdminUI: Click on user / Enter user ID
    AdminUI->>UserCtrl: getUserById(userId)
    UserCtrl->>API: GET /api/users/{userId}<br/>(with JWT token)
    API->>API: Validate JWT & check USER_ADMIN role
    API->>ViewCtrl: get_user(user_id)
    ViewCtrl->>DB: SELECT * FROM user_details<br/>WHERE id = ?
    DB-->>ViewCtrl: User record with role info
    alt User Not Found
        ViewCtrl-->>API: None
        API-->>UserCtrl: 404 Not Found
        UserCtrl-->>AdminUI: Show error
        AdminUI-->>UserAdmin: "User not found"
    else User Found
        ViewCtrl->>User: User.from_db(user_data)
        User-->>ViewCtrl: User object
        ViewCtrl-->>API: User object
        API->>User: user.to_dict()
        User-->>API: User dictionary
        API-->>UserCtrl: 200 OK + user data
        UserCtrl-->>AdminUI: Display user info
        AdminUI-->>UserAdmin: Show user details<br/>(name, email, role, status)
    end
```

**Key Points**:
- Uses user_details view for joined data
- Entity object created from DB data
- Sensitive data (password) not returned

---

## 5. Update User Account Sequence

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant UpdateCtrl as <<Control>><br/>UpdateUserAccountController
    participant DB as <<Entity>><br/>Database

    UserAdmin->>AdminUI: View user details
    UserAdmin->>AdminUI: Click "Edit"
    AdminUI->>AdminUI: Show editable form
    UserAdmin->>AdminUI: Modify fields
    UserAdmin->>AdminUI: Submit
    AdminUI->>UserCtrl: updateUser(userId, updates)
    UserCtrl->>API: PUT /api/users/{userId}<br/>(with JWT token)
    API->>API: Validate JWT & check USER_ADMIN role
    API->>UpdateCtrl: update_user(user_id, ...)
    UpdateCtrl->>UpdateCtrl: Validate at least one field changed
    alt No Changes
        UpdateCtrl-->>API: {success: false, message: "No fields to update"}
        API-->>UserCtrl: 400 Bad Request
        UserCtrl-->>AdminUI: Show error
        AdminUI-->>UserAdmin: "No changes detected"
    else Has Changes
        UpdateCtrl->>DB: UPDATE users SET ... WHERE id = ?
        DB-->>UpdateCtrl: Updated record
        alt Update Failed
            UpdateCtrl-->>API: {success: false}
            API-->>UserCtrl: 400 Bad Request
            UserCtrl-->>AdminUI: Show error
            AdminUI-->>UserAdmin: "Update failed"
        else Update Success
            UpdateCtrl-->>API: {success: true, user}
            API-->>UserCtrl: 200 OK + updated user
            UserCtrl-->>AdminUI: Success
            AdminUI-->>UserAdmin: "User updated successfully"
            AdminUI->>AdminUI: Refresh display
        end
    end
```

**Key Points**:
- Only modified fields are updated
- Role validation required
- Entity persistence in database

---

## 6. Suspend User Account Sequence

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant SuspendCtrl as <<Control>><br/>SuspendUserAccountController
    participant DB as <<Entity>><br/>Database

    UserAdmin->>AdminUI: View user details
    UserAdmin->>AdminUI: Click "Suspend"
    AdminUI->>AdminUI: Show confirmation dialog
    UserAdmin->>AdminUI: Confirm suspension
    AdminUI->>UserCtrl: deleteUser(userId)
    UserCtrl->>API: DELETE /api/users/{userId}<br/>(with JWT token)
    API->>API: Validate JWT & check USER_ADMIN role
    API->>SuspendCtrl: suspend_user(user_id)
    SuspendCtrl->>DB: UPDATE users<br/>SET is_active = FALSE<br/>WHERE id = ?
    DB-->>SuspendCtrl: Update result
    alt User Not Found
        SuspendCtrl-->>API: {success: false}
        API-->>UserCtrl: 404 Not Found
        UserCtrl-->>AdminUI: Show error
        AdminUI-->>UserAdmin: "User not found"
    else Suspension Success
        SuspendCtrl-->>API: {success: true}
        API-->>UserCtrl: 200 OK
        UserCtrl-->>AdminUI: Success
        AdminUI-->>UserAdmin: "User suspended"
        AdminUI->>AdminUI: Refresh user list
    end
```

**Key Points**:
- Soft delete (is_active flag)
- Confirmation required
- User record preserved in database

---

## 7. Search Users Sequence

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant ViewCtrl as <<Control>><br/>ViewUserAccountController
    participant User as <<Entity>><br/>User
    participant DB as <<Entity>><br/>Database

    UserAdmin->>AdminUI: Enter search query
    UserAdmin->>AdminUI: Click "Search"
    AdminUI->>UserCtrl: searchUsers(query)
    UserCtrl->>API: POST /api/users/search<br/>(with JWT token)
    API->>API: Validate JWT & check USER_ADMIN role
    API->>ViewCtrl: search_users(query)
    alt Empty Query
        ViewCtrl->>ViewCtrl: Return all users
    else Has Query
        ViewCtrl->>DB: SELECT * FROM user_details<br/>WHERE username ILIKE '%query%'
        ViewCtrl->>DB: SELECT * FROM user_details<br/>WHERE full_name ILIKE '%query%'
        ViewCtrl->>DB: SELECT * FROM user_details<br/>WHERE email ILIKE '%query%'
        DB-->>ViewCtrl: Multiple result sets
        ViewCtrl->>ViewCtrl: Merge & deduplicate by user ID
    end
    ViewCtrl->>User: Create User objects from results
    User-->>ViewCtrl: List of User objects
    ViewCtrl-->>API: List of users
    API-->>UserCtrl: 200 OK + users array
    UserCtrl-->>AdminUI: Display results
    AdminUI-->>UserAdmin: Show matching users
```

**Key Points**:
- Case-insensitive search (ILIKE)
- Searches multiple fields
- Deduplicates results
- Entity objects created from search results

---

## 8. Token Refresh Sequence

```mermaid
sequenceDiagram
    participant Frontend as <<Boundary>><br/>Frontend App
    participant AuthCtrl as <<Control>><br/>authController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant JWT as <<Control>><br/>JWT Utils
    participant LocalStorage as localStorage

    Frontend->>API: API call (with expired token)
    API-->>Frontend: 401 Unauthorized
    Frontend->>AuthCtrl: authenticatedFetch()
    AuthCtrl->>AuthCtrl: Detect 401 response
    AuthCtrl->>LocalStorage: Get refresh_token
    LocalStorage-->>AuthCtrl: refresh_token
    alt No Refresh Token
        AuthCtrl->>AuthCtrl: logout()
        AuthCtrl->>LocalStorage: Clear all tokens
        AuthCtrl-->>Frontend: Redirect to login
    else Has Refresh Token
        AuthCtrl->>API: POST /api/refresh<br/>{refresh_token}
        API->>JWT: decode_token(refresh_token)
        JWT-->>API: Payload
        alt Invalid/Expired Refresh Token
            API-->>AuthCtrl: 401 Unauthorized
            AuthCtrl->>AuthCtrl: logout()
            AuthCtrl-->>Frontend: Redirect to login
        else Valid Refresh Token
            API->>JWT: create_access_token(subject)
            JWT-->>API: New access token
            API-->>AuthCtrl: 200 OK + access_token
            AuthCtrl->>LocalStorage: Store new access_token
            AuthCtrl->>API: Retry original request<br/>(with new token)
            API-->>AuthCtrl: 200 OK + data
            AuthCtrl-->>Frontend: Success with data
        end
    end
```

**Key Points**:
- Automatic token refresh
- Transparent to user
- Logout on refresh failure
- Control layer handles token management

---

## BCE Architecture Summary

### Boundary Layer (Frontend)
- **Components**: LoginPage, Dashboards, Forms
- **Controllers**: authController.js, userController.js
- **Responsibilities**: UI, user input, API calls, state management

### Control Layer (Backend)
- **FastAPI**: Routes, middleware, validation
- **Controllers**: AuthController, CreateUserAccountController, ViewUserAccountController, UpdateUserAccountController, SuspendUserAccountController
- **Responsibilities**: Business logic, authorization, coordination

### Entity Layer (Data)
- **Models**: User, Role, AuthResponse
- **Database**: Supabase PostgreSQL (users, roles, user_details view)
- **Responsibilities**: Data representation, persistence

---

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (PyJWT), bcrypt
- **Architecture**: BCE (Boundary-Control-Entity)

---

_For detailed use cases, class diagrams, and data schemas, see:_
- `USE_CASE_DESCRIPTIONS.md`
- `BCE_CLASS_DIAGRAM.md`
- `DATA_PERSISTENCE.md`
"""

with open("docs/SEQUENCE_DIAGRAMS.md", "w", encoding="utf-8") as f:
    f.write(sequence_diagrams)

print("[OK] Created SEQUENCE_DIAGRAMS.md")

print("\n[SUCCESS] All documentation files created successfully!")
print("Files created in docs/:")
print("  - USE_CASE_DESCRIPTIONS.md")
print("  - SEQUENCE_DIAGRAMS.md")

