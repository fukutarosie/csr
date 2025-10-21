# Sequence Diagrams - CSR System (BCE Framework)

All sequence diagrams follow the BCE (Boundary-Control-Entity) architectural pattern.

## Table of Contents
1. [Login Sequence](#1-login-sequence-diagram)
2. [Logout Sequence](#2-logout-sequence-diagram)
3. [Create User Account with JWT](#3-create-user-account-sequence-with-jwt-authentication)
4. [View User Account with JWT](#4-view-user-account-sequence-with-jwt-authentication)
5. [Update User Account with Token Refresh](#5-update-user-account-sequence-with-automatic-token-refresh)
6. [Suspend User Account with JWT](#6-suspend-user-account-sequence-with-jwt-authentication)
7. [Search Users with JWT](#7-search-users-sequence-with-jwt-authentication)
8. [Token Refresh Mechanism](#8-automatic-token-refresh-mechanism)

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

## 3. Create User Account Sequence (with JWT Authentication)

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
    UserCtrl->>UserCtrl: Get JWT access token from localStorage
    UserCtrl->>API: POST /api/users<br/>Authorization: Bearer <access_token>
    API->>API: Extract JWT from Authorization header
    API->>API: Validate JWT signature & expiry
    API->>API: Extract role claim from token
    API->>API: Check role === "USER_ADMIN"
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
- **JWT token required in Authorization header**
- **Token validation: signature, expiry, and role claim**
- **Role-based authorization: Only USER_ADMIN allowed**
- Password hashing with bcrypt before storage
- Username uniqueness validation
- Entity created in database

---

## 4. View User Account Sequence (with JWT Authentication)

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
    UserCtrl->>UserCtrl: Get JWT token from localStorage
    UserCtrl->>API: GET /api/users/{userId}<br/>Authorization: Bearer <token>
    API->>API: Validate JWT token (signature & expiry)
    API->>API: Verify USER_ADMIN role claim
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
- **JWT token validated before data retrieval**
- **Role-based access control via token claims**
- Uses user_details view for joined data
- Entity object created from DB data
- Sensitive data (password) not returned

---

## 5. Update User Account Sequence (with Automatic Token Refresh)

```mermaid
sequenceDiagram
    participant UserAdmin as User Admin
    participant AdminUI as <<Boundary>><br/>Admin Dashboard
    participant UserCtrl as <<Control>><br/>userController.js
    participant AuthCtrl as <<Control>><br/>authController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant UpdateCtrl as <<Control>><br/>UpdateUserAccountController
    participant DB as <<Entity>><br/>Database
    participant LocalStorage as localStorage

    UserAdmin->>AdminUI: View user details
    UserAdmin->>AdminUI: Click "Edit"
    AdminUI->>AdminUI: Show editable form
    UserAdmin->>AdminUI: Modify fields
    UserAdmin->>AdminUI: Submit
    AdminUI->>UserCtrl: updateUser(userId, updates)
    UserCtrl->>AuthCtrl: authenticatedFetch(url, data)
    AuthCtrl->>LocalStorage: Get access token
    AuthCtrl->>API: PUT /api/users/{userId}<br/>Authorization: Bearer <token>
    API->>API: Validate JWT signature & expiry
    
    alt Token Expired
        API-->>AuthCtrl: 401 Unauthorized
        AuthCtrl->>LocalStorage: Get refresh token
        AuthCtrl->>API: POST /api/refresh<br/>{refresh_token}
        API->>API: Validate refresh token
        API-->>AuthCtrl: {access_token: new_token}
        AuthCtrl->>LocalStorage: Store new access token
        AuthCtrl->>API: PUT /api/users/{userId}<br/>Authorization: Bearer <new_token>
        API->>API: Validate new JWT & check USER_ADMIN
    else Token Valid
        API->>API: Check USER_ADMIN role claim
    end
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
- **Demonstrates automatic token refresh on expiry**
- **Frontend detects 401 and refreshes token transparently**
- **User experience uninterrupted during token refresh**
- Only modified fields are updated
- Role validation required via JWT claims
- Entity persistence in database

---

## 6. Suspend User Account Sequence (with JWT Authentication)

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
    UserCtrl->>UserCtrl: Get JWT token from localStorage
    UserCtrl->>API: DELETE /api/users/{userId}<br/>Authorization: Bearer <token>
    API->>API: Validate JWT (signature, expiry, claims)
    API->>API: Require USER_ADMIN role
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
- **JWT token authentication required**
- **Only USER_ADMIN role authorized**
- Soft delete (is_active flag)
- **Suspended user cannot login (fails UC-001 step 11)**
- **Suspended user's existing tokens remain valid until expiry**
- Confirmation required
- User record preserved in database

---

## 7. Search Users Sequence (with JWT Authentication)

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
    UserCtrl->>UserCtrl: Get JWT token from localStorage
    UserCtrl->>API: POST /api/users/search<br/>Authorization: Bearer <token>
    API->>API: Validate JWT token
    API->>API: Check USER_ADMIN role claim
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
- **JWT authentication on search operations**
- **Token validated before query execution**
- Case-insensitive search (ILIKE)
- Searches multiple fields
- Deduplicates results
- Entity objects created from search results

---

## 8. Automatic Token Refresh Mechanism

This mechanism is integrated into all user management operations (UC-003 through UC-008) to ensure uninterrupted access when the access token expires.

```mermaid
sequenceDiagram
    participant User as User Admin
    participant UI as <<Boundary>><br/>Admin UI
    participant AuthCtrl as <<Control>><br/>authController.js
    participant API as <<Control>><br/>FastAPI Backend
    participant JWT as <<Control>><br/>JWT Utils
    participant LocalStorage as localStorage

    Note over User,LocalStorage: Any API Operation (Create, View, Update, etc.)
    
    User->>UI: Perform action (e.g., Create User)
    UI->>AuthCtrl: authenticatedFetch(url, data)
    AuthCtrl->>LocalStorage: Get access_token
    LocalStorage-->>AuthCtrl: access_token
    AuthCtrl->>API: API Request<br/>Authorization: Bearer <access_token>
    
    alt Access Token Valid
        API->>API: Validate token successfully
        API->>API: Process request
        API-->>AuthCtrl: 200 OK + data
        AuthCtrl-->>UI: Success
        UI-->>User: Show result
    else Access Token Expired (401)
        API->>API: Detect token expiry
        API-->>AuthCtrl: 401 Unauthorized
        Note over AuthCtrl: Automatic Refresh Triggered
        AuthCtrl->>LocalStorage: Get refresh_token
        LocalStorage-->>AuthCtrl: refresh_token
        
        alt Refresh Token Available
            AuthCtrl->>API: POST /api/refresh<br/>{refresh_token}
            API->>JWT: decode_token(refresh_token)
            JWT->>JWT: Validate signature & expiry
            
            alt Refresh Token Valid
                JWT-->>API: Valid payload (user_id)
                API->>JWT: create_access_token(user_id, role)
                JWT-->>API: New access_token
                API-->>AuthCtrl: 200 OK {access_token}
                AuthCtrl->>LocalStorage: Store new access_token
                Note over AuthCtrl: Retry Original Request
                AuthCtrl->>API: Retry API Request<br/>Authorization: Bearer <new_token>
                API->>API: Validate new token
                API->>API: Process request
                API-->>AuthCtrl: 200 OK + data
                AuthCtrl-->>UI: Success (transparent to user)
                UI-->>User: Show result (no interruption)
            else Refresh Token Invalid/Expired
                API-->>AuthCtrl: 401 Unauthorized
                AuthCtrl->>AuthCtrl: logout()
                AuthCtrl->>LocalStorage: Clear all tokens
                AuthCtrl-->>UI: Redirect to login
                UI-->>User: "Session expired, please login"
            end
        else No Refresh Token
            AuthCtrl->>AuthCtrl: logout()
            AuthCtrl->>LocalStorage: Clear all data
            AuthCtrl-->>UI: Redirect to login
            UI-->>User: "Please login"
        end
    end
```

**Key Points**:
- **Fully automatic** - user never sees session expiry
- **Transparent refresh** - happens in background
- **60-minute access tokens** - short-lived for security
- **7-day refresh tokens** - longer session duration
- **Graceful fallback** - logout if refresh fails
- **Integrated into all operations** - consistent across UC-003 to UC-008

**Token Lifecycle**:
1. **Login** (UC-001): Both tokens created
2. **First 60 minutes**: Access token used directly
3. **After 60 minutes**: Access token expires
4. **Auto-refresh**: New access token obtained using refresh token
5. **Continue**: Operations proceed without user noticing
6. **After 7 days**: Refresh token expires, user must re-login

**Security Benefits**:
- Short-lived access tokens minimize exposure
- Refresh token required for renewal
- Invalid/expired refresh tokens force re-authentication
- Stateless tokens enable horizontal scaling

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
