# Use Case Descriptions - CSR System

## Table of Contents
1. [UC-001: User Login](#uc-001-user-login)
2. [UC-002: User Logout](#uc-002-user-logout)
3. [UC-003: Create User Account](#uc-003-create-user-account)
4. [UC-004: View User Account](#uc-004-view-user-account)
5. [UC-005: Update User Account](#uc-005-update-user-account)
6. [UC-006: Suspend User Account](#uc-006-suspend-user-account)
7. [UC-007: Search User Accounts](#uc-007-search-user-accounts)
8. [UC-008: View All Users](#uc-008-view-all-users)
9. [JWT Token-Based Authentication](#jwt-token-based-authentication)

---

## UC-001: User Login

### Description
Allows a user to authenticate into the system by providing their username, password, and selecting their role. Upon successful authentication, the user receives JWT tokens (access token and refresh token) and is redirected to their role-specific dashboard. This use case establishes the authenticated session that secures all subsequent operations.

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
- **JWT access token** is generated and stored (expires in 60 minutes)
- **JWT refresh token** is generated and stored (for token renewal)
- User session data is stored in localStorage
- User's last login timestamp is updated in database
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
14. **Backend generates JWT access token with claims (user_id, role)**
15. **Backend generates JWT refresh token for session renewal**
16. Backend returns success response with user data and **both tokens**
17. **Frontend stores both tokens in localStorage**
18. **Frontend stores user data including dashboard route**
19. System redirects user to role-specific dashboard

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
- **No tokens are generated**
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
- **BR-004: JWT access token expires after 60 minutes**
- **BR-005: JWT refresh token used for automatic token renewal**
- **BR-006: JWT tokens include user ID and role in claims**
- BR-007: Password comparison supports both hashed (bcrypt) and plain text for backward compatibility

### JWT Token Details
- **Access Token**:
  - Contains: user_id (subject), role_code, expiry (60 minutes)
  - Used for: All API requests requiring authentication
  - Stored in: localStorage (key: 'access_token')
  
- **Refresh Token**:
  - Contains: user_id (subject), token_type='refresh', longer expiry
  - Used for: Obtaining new access token when expired
  - Stored in: localStorage (key: 'refresh_token')

### Special Requirements
- SR-001: Password must be transmitted securely (HTTPS in production)
- SR-002: Passwords must be hashed using bcrypt
- SR-003: Login form must prevent submission while processing
- SR-004: Error messages must not reveal whether username or password is incorrect
- **SR-005: JWT tokens must be securely generated and validated**
- **SR-006: Token expiry must be enforced on all protected endpoints**

### BCE Mapping
- **Boundary**: `LoginPage` (page.jsx), `authController.js`
- **Control**: `AuthController.py`, `login()` method, `JWTUtils`
- **Entity**: `User`, `Role`, `AuthResponse`

---

## UC-002: User Logout

### Description
Allows an authenticated user to terminate their session by clearing all authentication data from the client, including JWT tokens and user information.

### Actors
- **Primary Actor**: Authenticated User
- **Secondary Actor**: None (client-side operation)

### Preconditions
- User is authenticated
- User has valid JWT tokens in localStorage
- User has valid session data in localStorage

### Postconditions
- User session is terminated
- **JWT access token is removed from localStorage**
- **JWT refresh token is removed from localStorage**
- User data is cleared from localStorage
- User is redirected to login page

### Main Flow
1. User clicks "Logout" button on dashboard
2. Frontend authController.logout() is called
3. **System removes access token from localStorage**
4. **System removes refresh token from localStorage**
5. System removes user data from localStorage
6. System redirects user to login page (`/`)

### Alternative Flows
None - logout is a client-side operation that always succeeds

### Business Rules
- BR-008: Logout only clears client-side data
- **BR-009: Server-side token invalidation not required (stateless JWT)**
- **BR-010: Expired tokens naturally become invalid without manual revocation**

### JWT Token Handling
- **Token Removal**: Both access and refresh tokens cleared from localStorage
- **Server Impact**: None - stateless JWT means no server-side session to terminate
- **Security Note**: Tokens remain technically valid until expiry, but without storage, user cannot use them

### Special Requirements
- SR-007: Logout must be accessible from all authenticated pages
- SR-008: Logout must clear all authentication-related data
- **SR-009: Logout must remove all token data to prevent reuse**

### BCE Mapping
- **Boundary**: Dashboard pages, `authController.js`
- **Control**: `authController.logout()` method
- **Entity**: None

---

## UC-003: Create User Account

### Description
Allows a User Admin to create a new user account in the system with specified credentials and role assignment. This operation requires authentication via JWT token with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: CreateUserAccountController (Backend)

### Preconditions
- **Actor is authenticated (has valid JWT access token)**
- **Actor's JWT token contains USER_ADMIN role claim**
- **JWT token has not expired**
- Username is not already taken

### Postconditions
- New user account is created in database
- Password is hashed and stored securely
- User is assigned to specified role
- User account is active by default

### Main Flow
1. User Admin navigates to user management section (requires valid JWT token)
2. User Admin clicks "Create User" button
3. System displays user creation form
4. User Admin enters username
5. User Admin enters password
6. User Admin enters full name
7. User Admin enters email
8. User Admin selects role from dropdown
9. User Admin submits form
10. **Frontend includes JWT access token in Authorization header**
11. **Backend validates JWT token signature and expiry**
12. **Backend extracts role claim from JWT token**
13. **Backend verifies role claim is USER_ADMIN**
14. CreateUserAccountController checks if username exists
15. CreateUserAccountController hashes password using bcrypt
16. CreateUserAccountController inserts user into database with is_active=True
17. Backend returns success response with created user data
18. System displays success message
19. System refreshes user list

### Alternative Flows

#### 10a. No JWT Token Provided
- Frontend doesn't include token in request
- Backend returns 401 Unauthorized
- System redirects to login page
- Use case terminates

#### 11a. JWT Token Expired
- Backend detects token expiry
- Backend returns 401 Unauthorized
- **Frontend attempts automatic token refresh using refresh token**
- If refresh succeeds: Retry request with new access token
- If refresh fails: Redirect to login page
- Use case terminates

#### 11b. Invalid JWT Token
- Token signature is invalid or malformed
- Backend returns 401 Unauthorized
- Frontend redirects to login page
- Use case terminates

#### 13a. Unauthorized Role (Not USER_ADMIN)
- **JWT token contains different role (PIN, CSR_REP, or PLATFORM_MGMT)**
- Backend returns 403 Forbidden
- System displays error: "Forbidden: insufficient role"
- Use case terminates

#### 14a. Username Already Exists
- Database already contains user with same username
- Backend returns 409 Conflict
- System displays error: "Username already exists"
- Use case returns to step 3

#### 15a. Database Insertion Fails
- Database constraint violation or error occurs
- Backend returns 400 Bad Request
- System displays error message
- Use case returns to step 3

### Business Rules
- **BR-011: Only users with USER_ADMIN role can create user accounts**
- **BR-012: JWT token must be valid and not expired**
- **BR-013: Role-based authorization enforced via JWT claims**
- BR-014: Username must be unique
- BR-015: Password must be hashed before storage
- BR-016: New accounts are active by default
- BR-017: Role ID must reference valid role in roles table

### JWT Token Flow
1. **Request**: `POST /api/users` with `Authorization: Bearer <access_token>`
2. **Validation**: Backend extracts token, verifies signature, checks expiry
3. **Authorization**: Backend reads role claim from token payload
4. **Enforcement**: Backend requires `role = "USER_ADMIN"` to proceed

### Special Requirements
- SR-010: Form must validate all required fields
- **SR-011: All user management endpoints protected by JWT authentication**
- **SR-012: Role claim in JWT token enforced on every request**
- SR-013: Password strength requirements should be enforced (future enhancement)
- SR-014: Email format should be validated

### BCE Mapping
- **Boundary**: User Admin Dashboard, User Management UI
- **Control**: `CreateUserAccountController`, `create_user()` method, `require_role()` middleware
- **Entity**: `User`, `Role`

---

## UC-004: View User Account

### Description
Allows a User Admin to view detailed information about a specific user account. Requires authentication via JWT token with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: ViewUserAccountController (Backend)

### Preconditions
- **Actor is authenticated (has valid JWT access token)**
- **Actor's JWT token contains USER_ADMIN role claim**
- User account exists in database

### Postconditions
- User account details are displayed
- No data is modified

### Main Flow
1. User Admin is on user management page
2. User Admin clicks on specific user or enters user ID
3. **Frontend sends GET request to `/api/users/{user_id}` with JWT token in Authorization header**
4. **Backend validates JWT token and extracts claims**
5. **Backend verifies USER_ADMIN role from token**
6. ViewUserAccountController queries user_details view
7. Backend retrieves user with role information
8. Backend returns user data including:
   - User ID, Username, Full name, Email
   - Role name and code, Dashboard route
   - Active status, Last login timestamp
9. Frontend displays user information in detail view

### Alternative Flows

#### 3a. JWT Token Missing or Invalid
- **Token validation fails**
- Backend returns 401 Unauthorized
- **Frontend attempts token refresh**
- If refresh succeeds: Retry with new token
- If refresh fails: Redirect to login
- Use case terminates

#### 5a. Unauthorized Role
- **JWT token doesn't contain USER_ADMIN role**
- Backend returns 403 Forbidden
- System displays error: "Insufficient permissions"
- Use case terminates

#### 6a. User Not Found
- No user exists with specified ID
- Backend returns 404 Not Found
- System displays error: "User not found"
- Use case terminates

### Business Rules
- **BR-018: Only USER_ADMIN can view user account details**
- **BR-019: Valid JWT token required for all read operations**
- BR-020: User details include role information from joined tables

### JWT Token Usage
- **Authorization Header**: `Authorization: Bearer <access_token>`
- **Token Validation**: Every request validates token before processing
- **Role Enforcement**: `require_role("USER_ADMIN")` middleware checks claim
- **Automatic Refresh**: Frontend handles token expiry transparently

### Special Requirements
- SR-015: Sensitive data (password) must not be returned
- SR-016: Display must show user-friendly role names
- **SR-017: Token expiry handled gracefully with automatic refresh**

### BCE Mapping
- **Boundary**: User Admin Dashboard, User Detail View
- **Control**: `ViewUserAccountController`, `get_user()` method, JWT validation
- **Entity**: `User`, `Role`

---

## UC-005: Update User Account

### Description
Allows a User Admin to modify an existing user account's information, including name, email, role, and active status. Requires JWT authentication with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: UpdateUserAccountController (Backend)

### Preconditions
- **Actor is authenticated with valid JWT access token**
- **JWT token contains USER_ADMIN role claim**
- User account exists
- At least one field is modified

### Postconditions
- User account is updated with new information
- Updated data is persisted in database
- Changes are immediately visible

### Main Flow
1. User Admin views user account details
2. User Admin clicks "Edit" button
3. System displays editable form with current values
4. User Admin modifies one or more fields (full name, email, role, active status)
5. User Admin submits form
6. **Frontend sends PUT request to `/api/users/{user_id}` with JWT token**
7. **Backend validates JWT token and verifies USER_ADMIN role**
8. UpdateUserAccountController validates at least one field changed
9. UpdateUserAccountController updates user record in database
10. Backend returns success response with updated user data
11. System displays success message
12. System refreshes user display with new information

### Alternative Flows

#### 6a. JWT Token Expired
- **Backend detects expired token**
- Returns 401 Unauthorized
- **Frontend intercepts 401 response**
- **Frontend uses refresh token to get new access token**
- **Frontend retries PUT request with new access token**
- Use case continues from step 7

#### 7a. Unauthorized Role
- **JWT role claim is not USER_ADMIN**
- Backend returns 403 Forbidden
- System displays error: "Insufficient permissions"
- Use case terminates

#### 8a. No Fields Modified
- All fields have same values as before
- Backend returns error: "No fields to update"
- Use case returns to step 3

#### 9a. Invalid Role ID
- Specified role_id doesn't exist in roles table
- Database foreign key constraint fails
- Backend returns 400 Bad Request
- System displays error message
- Use case returns to step 3

### Business Rules
- **BR-021: Only USER_ADMIN can update user accounts**
- **BR-022: Each request must include valid JWT token**
- **BR-023: Token refresh automatic when access token expires**
- BR-024: At least one field must be modified
- BR-025: Role must reference valid role in roles table
- BR-026: Username cannot be changed

### JWT Token Lifecycle in Update Operation
1. **Initial Request**: User Admin submits update with current access token
2. **Token Validation**: Backend verifies signature, expiry, and role claim
3. **If Expired**: Frontend detects 401, uses refresh token automatically
4. **New Token**: Fresh access token obtained from `/api/refresh` endpoint
5. **Retry**: Original update request sent again with new token
6. **Success**: Update proceeds with valid authentication

### Special Requirements
- SR-018: Form should validate email format
- **SR-019: Token refresh must be transparent to user**
- **SR-020: Multiple concurrent requests handled gracefully**
- SR-021: Confirmation should be required for deactivating users
- SR-022: Changes should be auditable (future enhancement)

### BCE Mapping
- **Boundary**: User Admin Dashboard, Edit User Form
- **Control**: `UpdateUserAccountController`, `update_user()` method, `authenticatedFetch()`
- **Entity**: `User`, `Role`

---

## UC-006: Suspend User Account

### Description
Allows a User Admin to suspend (deactivate) a user account, preventing the user from logging in. Requires JWT authentication with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: SuspendUserAccountController (Backend)

### Preconditions
- **Actor is authenticated with valid JWT access token**
- **JWT token contains USER_ADMIN role claim**
- User account exists
- User account is currently active

### Postconditions
- User account is_active flag is set to False
- **Suspended user cannot log in (will fail at authentication)**
- **Suspended user's existing JWT tokens remain valid until expiry**
- User record preserved in database (soft delete)

### Main Flow
1. User Admin views user account details
2. User Admin clicks "Suspend" or "Delete" button
3. System displays confirmation dialog
4. User Admin confirms suspension
5. **Frontend sends DELETE request to `/api/users/{user_id}` with JWT token**
6. **Backend validates JWT token and verifies USER_ADMIN role**
7. SuspendUserAccountController sets is_active=False for user
8. Backend returns success response
9. System displays success message
10. System updates user list showing suspended status

### Alternative Flows

#### 5a. JWT Token Invalid
- **Token validation fails**
- Backend returns 401 Unauthorized
- **Frontend attempts token refresh**
- If successful: Retry suspension with new token
- If failed: Redirect to login
- Use case terminates

#### 6a. Unauthorized Role
- **JWT token doesn't contain USER_ADMIN role**
- Backend returns 403 Forbidden
- System displays error: "Insufficient permissions"
- Use case terminates

#### 7a. User Already Suspended
- User's is_active is already False
- Backend still returns success (idempotent operation)
- System displays appropriate message

#### 8a. User Not Found
- No user exists with specified ID
- Backend returns 404 Not Found
- System displays error: "User not found or suspend failed"

### Business Rules
- **BR-027: Only USER_ADMIN can suspend user accounts**
- **BR-028: Valid JWT token required for suspension**
- BR-029: Suspension is a soft delete (sets flag, doesn't remove record)
- **BR-030: Suspended users fail login due to is_active check (UC-001 step 11)**
- **BR-031: Existing JWT tokens of suspended user still valid until natural expiry**
- BR-032: User Admin accounts can be suspended (no special protection)

### JWT Token Impact on Suspended Users
- **Immediate Effect**: is_active flag set to False in database
- **Login Prevention**: New login attempts fail at step 11 of UC-001
- **Active Sessions**: Suspended user's current tokens remain valid
- **Token Expiry**: When token expires (60 minutes), user cannot refresh
- **Security Note**: For immediate revocation, token blacklist required (future enhancement)

### Special Requirements
- SR-023: Confirmation must be required before suspension
- SR-024: Suspended status must be clearly visible in user list
- SR-025: Unsuspend functionality should exist (via Update User Account)
- **SR-026: Consider implementing token revocation list for immediate effect**

### BCE Mapping
- **Boundary**: User Admin Dashboard, User Management UI
- **Control**: `SuspendUserAccountController`, `suspend_user()` method
- **Entity**: `User`

---

## UC-007: Search User Accounts

### Description
Allows a User Admin to search for user accounts by username, full name, or email address. Requires JWT authentication with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: ViewUserAccountController (Backend)

### Preconditions
- **Actor is authenticated with valid JWT access token**
- **JWT token contains USER_ADMIN role claim**

### Postconditions
- Matching user accounts are displayed
- Search is case-insensitive
- No data is modified

### Main Flow
1. User Admin navigates to user management page
2. System displays search box
3. User Admin enters search query (partial or complete)
4. User Admin initiates search
5. **Frontend sends POST request to `/api/users/search` with query and JWT token**
6. **Backend validates JWT token and verifies USER_ADMIN role**
7. ViewUserAccountController searches across username, full_name, and email fields
8. Backend removes duplicate results (same user ID)
9. Backend returns list of matching users with role information
10. Frontend displays search results
11. User Admin can click on result to view details

### Alternative Flows

#### 3a. Empty Search Query
- User submits empty or whitespace-only query
- Backend returns all users
- Use case continues to step 10

#### 5a. JWT Token Expired During Search
- **Backend returns 401 Unauthorized**
- **Frontend detects expiry**
- **Frontend uses refresh token to obtain new access token**
- **Frontend automatically retries search with new token**
- Use case continues from step 6

#### 6a. Unauthorized Role
- **JWT token doesn't contain USER_ADMIN role**
- Backend returns 403 Forbidden
- System displays error message
- Use case terminates

#### 9a. No Matches Found
- No users match search criteria
- Backend returns empty list
- System displays "No users found"

### Business Rules
- **BR-033: Only USER_ADMIN can search user accounts**
- **BR-034: All search requests require valid JWT token**
- BR-035: Search is case-insensitive (ILIKE in PostgreSQL)
- BR-036: Search performs partial matching
- BR-037: Empty search returns all users

### JWT Token in Search Operations
- **Authorization**: Every search validates JWT token
- **Role Check**: Middleware ensures USER_ADMIN role
- **Performance**: Token validation adds minimal overhead (<5ms)
- **Caching**: Token validation results not cached (security over performance)

### Special Requirements
- SR-027: Search should be reasonably performant
- **SR-028: Token validation must complete before query execution**
- SR-029: Search should highlight matching fields (future enhancement)
- SR-030: Search should support debouncing (future enhancement)

### BCE Mapping
- **Boundary**: User Admin Dashboard, Search UI
- **Control**: `ViewUserAccountController`, `search_users()` method, JWT middleware
- **Entity**: `User`, `Role`

---

## UC-008: View All Users

### Description
Allows a User Admin to retrieve and view a complete list of all user accounts in the system. Requires JWT authentication with USER_ADMIN role.

### Actors
- **Primary Actor**: User Admin
- **Secondary Actor**: ViewUserAccountController (Backend)

### Preconditions
- **Actor is authenticated with valid JWT access token**
- **JWT token contains USER_ADMIN role claim**

### Postconditions
- Complete list of users is displayed
- Users are ordered by ID
- No data is modified

### Main Flow
1. User Admin navigates to user management page
2. **Frontend sends GET request to `/api/users` with JWT token in Authorization header**
3. **Backend extracts and validates JWT token**
4. **Backend verifies USER_ADMIN role claim**
5. ViewUserAccountController queries user_details view
6. Backend retrieves all users ordered by ID
7. Backend returns list of users with role information
8. Frontend displays user list in table format with username, full name, email, role, active status, last login
9. User Admin can sort, filter, or interact with list

### Alternative Flows

#### 2a. No JWT Token in Request
- **Backend detects missing Authorization header**
- Backend returns 401 Unauthorized
- Frontend redirects to login page
- Use case terminates

#### 3a. JWT Token Expired
- **Backend validates token and detects expiry**
- Backend returns 401 Unauthorized with error message
- **Frontend intercepts 401 response**
- **Frontend calls `/api/refresh` with refresh token**
- **Frontend receives new access token**
- **Frontend retries GET /api/users with new token**
- Use case continues from step 3

#### 4a. Invalid Role
- **JWT token contains role other than USER_ADMIN**
- Backend returns 403 Forbidden
- System displays error: "Access denied - Admin privileges required"
- Use case terminates

#### 6a. No Users Exist
- Database contains no user records
- Backend returns empty list
- System displays "No users found"

### Business Rules
- **BR-038: Only USER_ADMIN role can view all users**
- **BR-039: JWT token validated on every request**
- **BR-040: Token refresh automatic and transparent**
- BR-041: Users are sorted by ID by default
- BR-042: All users are returned (no pagination currently)

### JWT Token-Based Access Control Flow
```
1. User Admin Request → Include JWT Token
2. Backend Middleware → Extract Token from Header
3. JWT Validation → Verify Signature & Expiry
4. Role Extraction → Read Claims from Token Payload
5. Authorization Check → Require role = "USER_ADMIN"
6. If Valid → Process Request
7. If Invalid → Return 401 or 403
8. If Expired → Frontend Refreshes Automatically
```

### Special Requirements
- SR-031: Large user lists should be paginated (future enhancement)
- SR-032: List should be sortable by different columns
- SR-033: List should show visual indicators for suspended accounts
- **SR-034: Token validation must be performant for frequent requests**
- **SR-035: Implement token caching if performance becomes issue**

### BCE Mapping
- **Boundary**: User Admin Dashboard, User List UI
- **Control**: `ViewUserAccountController`, `get_all_users()` method, `require_role()` middleware
- **Entity**: `User`, `Role`

---

## JWT Token-Based Authentication

### Overview
The CSR System uses **JWT (JSON Web Tokens)** as the primary authentication and authorization mechanism. JWTs provide stateless, secure authentication that enables all use cases (UC-001 through UC-008) to verify user identity and permissions without maintaining server-side sessions.

---

### Token Types

#### 1. Access Token
**Purpose**: Short-lived token for API authentication

| Property | Value |
|----------|-------|
| **Expiry** | 60 minutes |
| **Usage** | Included in every API request |
| **Claims** | user_id (subject), role_code, expiry |
| **Storage** | localStorage (key: 'access_token') |
| **Header** | `Authorization: Bearer <access_token>` |

**Example Claims**:
```json
{
  "sub": "5",
  "role": "USER_ADMIN",
  "exp": 1730378400,
  "iat": 1730374800,
  "type": "access"
}
```

#### 2. Refresh Token
**Purpose**: Long-lived token for obtaining new access tokens

| Property | Value |
|----------|-------|
| **Expiry** | 7 days (configurable) |
| **Usage** | Automatic token renewal |
| **Claims** | user_id (subject), token_type='refresh' |
| **Storage** | localStorage (key: 'refresh_token') |
| **Endpoint** | `POST /api/refresh` |

**Example Claims**:
```json
{
  "sub": "5",
  "type": "refresh",
  "exp": 1730979600,
  "iat": 1730374800
}
```

---

### Token Lifecycle

#### Phase 1: Login (UC-001)
1. User provides credentials
2. Backend validates credentials
3. Backend generates both access and refresh tokens
4. Tokens stored in localStorage
5. User redirected to dashboard

#### Phase 2: API Requests (UC-003 to UC-008)
1. Frontend includes access token in Authorization header
2. Backend validates token signature
3. Backend checks token expiry
4. Backend extracts role claim for authorization
5. Request processed if valid

#### Phase 3: Token Expiry
1. Access token expires after 60 minutes
2. Frontend detects 401 response
3. Frontend automatically calls `/api/refresh`
4. New access token obtained using refresh token
5. Original request retried with new token
6. **Process transparent to user - no interruption**

#### Phase 4: Logout (UC-002)
1. User clicks logout
2. Both tokens removed from localStorage
3. User redirected to login page
4. Tokens naturally expire (stateless)

---

### Token Validation Process

Every protected endpoint follows this validation sequence:

```
Request Received
    ↓
Extract Authorization Header
    ↓
Parse Bearer Token
    ↓
Verify JWT Signature (using secret key)
    ↓
Check Expiry (exp claim vs current time)
    ↓
Extract Claims (sub, role)
    ↓
Check Role Authorization
    ↓
IF ALL VALID → Process Request
IF ANY INVALID → Return 401/403
```

---

### Role-Based Authorization (RBAC)

JWT tokens include `role` claim for fine-grained access control:

| Role | Code | Access |
|------|------|--------|
| User Admin | USER_ADMIN | Full CRUD on user accounts (UC-003 to UC-008) |
| PIN | PIN | Dashboard access only |
| CSR Rep | CSR_REP | Dashboard access only |
| Platform Management | PLATFORM_MGMT | Dashboard access only |

**Enforcement**:
```python
# Backend - Python
def require_role(required_role: str):
    def _checker(claims = Depends(get_current_user_claims)):
        role = claims.get("role")
        if role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return claims
    return _checker

# Usage
@app.post("/api/users")
async def create_user(request, _claims = Depends(require_role("USER_ADMIN"))):
    # Only USER_ADMIN can access this endpoint
```

---

### Token Security Features

#### 1. Signature Verification
- All tokens signed with secret key
- Prevents token forgery
- Invalid signature = 401 Unauthorized

#### 2. Expiry Enforcement
- Access tokens expire in 60 minutes
- Refresh tokens expire in 7 days
- Expired tokens rejected automatically

#### 3. Role Claim Protection
- Role embedded in token at creation
- Cannot be modified without breaking signature
- Enforces least-privilege access

#### 4. Stateless Architecture
- No server-side session storage
- Tokens self-contained
- Horizontal scaling enabled

#### 5. HTTPS Transport (Production)
- Tokens transmitted over encrypted connection
- Prevents man-in-the-middle attacks
- Required for production deployment

---

### Automatic Token Refresh Mechanism

The frontend `authController.js` implements automatic token refresh:

```javascript
async authenticatedFetch(url, options = {}) {
    let token = this.getAccessToken();
    let response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    
    // If 401, try to refresh token
    if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
            // Retry with new token
            token = this.getAccessToken();
            response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });
        } else {
            // Refresh failed - logout user
            this.logout();
            window.location.href = '/';
        }
    }
    
    return response;
}
```

**Benefits**:
- User never interrupted by session expiry
- 60-minute sessions effectively extended
- Seamless user experience
- Security maintained (short-lived access tokens)

---

### Token Integration Across Use Cases

| Use Case | Token Usage | Role Required |
|----------|-------------|---------------|
| **UC-001: Login** | Tokens generated and stored | None (public) |
| **UC-002: Logout** | Tokens removed from storage | None (any authenticated) |
| **UC-003: Create User** | Token validated, USER_ADMIN checked | USER_ADMIN |
| **UC-004: View User** | Token validated, USER_ADMIN checked | USER_ADMIN |
| **UC-005: Update User** | Token validated, USER_ADMIN checked | USER_ADMIN |
| **UC-006: Suspend User** | Token validated, USER_ADMIN checked | USER_ADMIN |
| **UC-007: Search Users** | Token validated, USER_ADMIN checked | USER_ADMIN |
| **UC-008: View All Users** | Token validated, USER_ADMIN checked | USER_ADMIN |

---

### Token Revocation Considerations

**Current Implementation**: Stateless JWTs (no revocation)

**Implications**:
- Suspended users' tokens valid until natural expiry (max 60 minutes)
- Logout only clears client-side storage
- Compromised tokens usable until expiry

**Future Enhancements**:
1. **Token Blacklist**: Maintain revoked token IDs in Redis
2. **Database Check**: Verify user is_active on each request
3. **Shorter Expiry**: Reduce access token lifetime (e.g., 15 minutes)
4. **Token Versioning**: Include token_version in user table

---

### Security Best Practices

✅ **Implemented**:
- JWT tokens signed with secret key
- Short-lived access tokens (60 minutes)
- Longer-lived refresh tokens for renewal
- Role-based authorization via claims
- Automatic token refresh
- CORS restricted to frontend origin

⚠️ **Production Recommendations**:
- Use HTTPS for all communication
- Store JWT secret in secure environment variables
- Implement rate limiting on `/api/login`
- Add token revocation for critical actions
- Monitor for unusual token usage patterns
- Rotate JWT secret periodically

---

### Performance Impact

| Operation | Time | Impact |
|-----------|------|--------|
| Token Generation (Login) | ~50ms | One-time per session |
| Token Validation (Each Request) | ~2-5ms | Minimal overhead |
| Token Refresh | ~30ms | Every 60 minutes |
| Signature Verification | ~3ms | Every protected request |

**Optimization**:
- Token validation is lightweight
- No database lookups for auth (stateless)
- Caching not needed for tokens
- Scales horizontally without session storage

---

## System-Wide Considerations

### Security
- All passwords hashed using bcrypt before storage
- **JWT tokens used for stateless authentication**
- **Role-based access control enforced via JWT claims**
- CORS configured to allow only frontend origin
- Sensitive operations require USER_ADMIN role
- **Token expiry enforced on all protected endpoints**

### Error Handling
- User-friendly error messages displayed
- Technical errors logged server-side
- Network failures handled gracefully
- Form validation prevents invalid submissions
- **401 Unauthorized handled with automatic token refresh**
- **403 Forbidden indicates insufficient permissions**

### Performance
- Database queries use indexes on username and role_id
- User details view pre-joins role information
- Frontend caches user data in localStorage
- **JWT validation lightweight and fast (<5ms)**
- API responses are optimized

### Scalability
- **Stateless JWT authentication enables horizontal scaling**
- No server-side session storage required
- Database can be scaled independently
- API follows REST principles
- Frontend is decoupled from backend
- **Token-based auth supports distributed systems**

---

## Future Enhancements
1. Password reset functionality
2. Two-factor authentication (2FA)
3. Audit logging for all user account changes
4. User profile self-service
5. Advanced search filters
6. Pagination for large user lists
7. Email notifications for account changes
8. Password strength requirements
9. Account lockout after failed login attempts
10. **Token revocation and blacklist system**
11. **JWT secret rotation**
12. **Shorter token expiry times with automatic refresh**
