# BCE Layer Documentation

## Architecture Overview

This project follows the Boundary-Control-Entity (BCE) architectural pattern for both frontend and backend applications.

---

## Frontend Architecture

### Boundary Layer

**Purpose:** User Interface and Interaction

**Components:**
- `src/app/src/app/page.jsx` - Login page
- `src/app/src/app/dashboard/admin/page.jsx` - Admin dashboard
- `src/app/src/app/dashboard/csr/page.jsx` - CSR dashboard
- `src/app/src/app/dashboard/pin/page.jsx` - PIN dashboard
- `src/app/src/app/dashboard/platform/page.jsx` - Platform dashboard

**Characteristics:**
- Handles user input and output
- Renders UI components
- Delegates business logic to Control layer
- No direct API calls or business logic

---

### Control Layer

**Purpose:** Business Logic and Coordination

**Auth Controllers:**
- `src/app/src/controllers/auth/loginController.js`
- `src/app/src/controllers/auth/logoutController.js`
- `src/app/src/controllers/auth/tokenController.js`
- `src/app/src/controllers/auth/sessionController.js`

**User Controllers:**
- `src/app/src/controllers/user/createUserController.js`
- `src/app/src/controllers/user/viewUserController.js`
- `src/app/src/controllers/user/updateUserController.js`
- `src/app/src/controllers/user/deleteUserController.js`
- `src/app/src/controllers/user/roleController.js`

**Characteristics:**
- Contains business logic
- Coordinates between Boundary and Entity
- Makes API calls
- Manages application state
- Handles validation and error handling

---

### Entity Layer

**Purpose:** Data Management

**Implementation:**
- localStorage operations (via tokenController and sessionController)
- Client-side data models
- Data serialization/deserialization

**Characteristics:**
- Manages data persistence
- Handles data storage operations
- No business logic
- No UI concerns

---

## Backend Architecture

### Boundary Layer

**Purpose:** API Interface

**Implementation:**
- `src/main.py` - FastAPI routes

**Endpoints:**
- POST `/api/login`
- POST `/api/refresh`
- GET `/api/verify/{user_id}`
- GET `/api/users`
- POST `/api/users`
- PUT `/api/users/{user_id}`
- GET `/api/roles`

**Characteristics:**
- HTTP request/response handling
- Request validation
- Response formatting
- No business logic

---

### Control Layer

**Purpose:** Business Logic

**Controllers:**
- `src/controller/auth_controller.py`
- `src/controller/user_account_controller.py`
- `src/controller/create_user_account_controller.py`
- `src/controller/view_user_account_controller.py`
- `src/controller/update_user_account_controller.py`
- `src/controller/suspend_user_account_controller.py`

**Characteristics:**
- Implements business rules
- Coordinates with Entity layer
- Handles validation
- Manages workflows

---

### Entity Layer

**Purpose:** Data Models and Operations

**Models:**
- `src/entity/user.py`
- `src/entity/role.py`
- `src/entity/auth_response.py`

**Characteristics:**
- Defines data structures
- Database operations
- Data transformation
- No HTTP handling
- No UI concerns

---

## Layer Interaction Patterns

### Pattern 1: User Authentication

```
User enters login credentials
    ↓
[BOUNDARY] page.jsx captures input
    ↓
[CONTROL] loginController.login()
    ↓
[CONTROL] Makes API call to backend
    ↓
[BOUNDARY] Backend /api/login receives request
    ↓
[CONTROL] auth_controller.py processes authentication
    ↓
[ENTITY] user.py queries database
    ↓
[ENTITY] Returns user data
    ↓
[CONTROL] auth_controller.py generates tokens
    ↓
[BOUNDARY] Returns HTTP response
    ↓
[CONTROL] loginController receives response
    ↓
[CONTROL] tokenController stores tokens
    ↓
[ENTITY] localStorage saves data
    ↓
[BOUNDARY] page.jsx redirects user
```

### Pattern 2: Data Retrieval

```
User views dashboard
    ↓
[BOUNDARY] Dashboard page loads
    ↓
[CONTROL] viewUserController.getAllUsers()
    ↓
[CONTROL] Makes authenticated API call
    ↓
[BOUNDARY] Backend /api/users receives request
    ↓
[CONTROL] user_account_controller.py processes request
    ↓
[ENTITY] user.py queries database
    ↓
[ENTITY] Returns user list
    ↓
[CONTROL] user_account_controller.py formats response
    ↓
[BOUNDARY] Returns HTTP response
    ↓
[CONTROL] viewUserController parses response
    ↓
[BOUNDARY] Dashboard displays data
```

---

## Dependency Rules

### Rule 1: Inward Dependencies
Dependencies always point inward:
```
BOUNDARY depends on → CONTROL depends on → ENTITY
```

### Rule 2: No Skip Layers
Boundary cannot directly access Entity:
```
✓ BOUNDARY → CONTROL → ENTITY
✗ BOUNDARY → ENTITY (skips Control)
```

### Rule 3: No Reverse Dependencies
Inner layers don't depend on outer layers:
```
✓ Control can use Entity
✗ Entity cannot use Control
✗ Entity cannot use Boundary
```

---

## Testing Strategy

### Controller Tests
**Location:** `src/app/src/controllers/__tests__/`

**Coverage:** 86 tests, 100% coverage

**Approach:**
- Unit test each controller in isolation
- Mock external dependencies
- Test both success and error paths
- Validate BCE compliance

---

## Benefits Achieved

### Separation of Concerns
Each layer has clear, distinct responsibilities.

### Testability
Controllers can be tested independently with mocked dependencies.

### Maintainability
Changes to one layer minimally impact other layers.

### Scalability
New features follow established patterns.

### Team Collaboration
Clear boundaries enable parallel development.

---

## Conclusion

This application demonstrates proper implementation of the BCE architectural pattern with clear separation of Boundary, Control, and Entity layers across both frontend and backend components.

