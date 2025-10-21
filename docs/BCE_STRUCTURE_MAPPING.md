# BCE Architecture Structure Mapping

## Overview

This document maps the current project structure to the Boundary-Control-Entity (BCE) architectural pattern.

---

## Architecture Layers

### Frontend Application

#### Boundary Layer (User Interface)
**Location:** `src/app/src/app/`

**Components:**
- `page.jsx` - Login page interface
- `layout.jsx` - Application layout
- `dashboard/admin/page.jsx` - Admin dashboard interface
- `dashboard/csr/page.jsx` - CSR dashboard interface
- `dashboard/pin/page.jsx` - PIN dashboard interface
- `dashboard/platform/page.jsx` - Platform dashboard interface

**Responsibilities:**
- User interaction handling
- Form rendering and input capture
- Display of data and error messages
- Navigation and routing
- UI state management

---

#### Control Layer (Business Logic)
**Location:** `src/app/src/controllers/`

**Auth Controllers:**
- `auth/loginController.js` - Authentication operations
- `auth/logoutController.js` - Logout operations
- `auth/tokenController.js` - JWT token management
- `auth/sessionController.js` - Session state management

**User Controllers:**
- `user/createUserController.js` - User creation logic
- `user/viewUserController.js` - User retrieval operations
- `user/updateUserController.js` - User update operations
- `user/deleteUserController.js` - User deletion operations
- `user/roleController.js` - Role management

**Responsibilities:**
- Coordinate between Boundary and Entity layers
- Business logic execution
- API communication
- Client-side validation
- State coordination
- Error handling

---

#### Entity Layer (Data)
**Location:** Implicit in localStorage operations within controllers

**Data Storage:**
- localStorage (managed by sessionController and tokenController)
- Session data
- Authentication tokens
- User information

**Responsibilities:**
- Data persistence in browser
- Data serialization/deserialization
- Client-side data management

---

### Backend Application

#### Boundary Layer (API Interface)
**Location:** `src/main.py` (API routes)

**Endpoints:**
- `/api/login` - Authentication endpoint
- `/api/refresh` - Token refresh endpoint
- `/api/verify/{user_id}` - Session verification
- `/api/users` - User management endpoints
- `/api/roles` - Role management endpoints

**Responsibilities:**
- HTTP request/response handling
- Request validation
- Response formatting
- Status code management
- CORS handling

---

#### Control Layer (Business Logic)
**Location:** `src/controller/`

**Controllers:**
- `auth_controller.py` - Authentication business logic
- `user_account_controller.py` - User account management
- `create_user_account_controller.py` - User creation logic
- `view_user_account_controller.py` - User retrieval logic
- `update_user_account_controller.py` - User update logic
- `suspend_user_account_controller.py` - User suspension logic

**Responsibilities:**
- Business rule enforcement
- Workflow orchestration
- Database query coordination
- Password verification
- Token generation
- Data validation

---

#### Entity Layer (Data Models)
**Location:** `src/entity/`

**Models:**
- `user.py` - User entity model
- `role.py` - Role entity model
- `auth_response.py` - Authentication response model

**Responsibilities:**
- Data structure definition
- Database operations
- Data transformation
- Business data rules
- Data serialization

---

## Layer Interaction Flow

### Example: User Login

```
User enters credentials
    ↓
[BOUNDARY] LoginPage.jsx
    ↓ delegates to
[CONTROL] loginController.js
    ↓ calls API
[BOUNDARY] FastAPI /api/login
    ↓ delegates to
[CONTROL] auth_controller.py
    ↓ queries
[ENTITY] User.py
    ↓ returns data
[CONTROL] auth_controller.py
    ↓ generates tokens
[CONTROL] auth_controller.py
    ↓ returns response
[BOUNDARY] FastAPI /api/login
    ↓ receives response
[CONTROL] loginController.js
    ↓ stores tokens
[ENTITY] localStorage (via tokenController)
    ↓ updates UI
[BOUNDARY] LoginPage.jsx redirects user
```

---

## Design Principles Applied

### Single Responsibility
Each controller handles one specific concern:
- loginController - authentication only
- tokenController - token management only
- sessionController - session state only

### Separation of Concerns
Clear separation between layers:
- UI components don't contain business logic
- Controllers don't render UI
- Entities focus on data operations

### Dependency Direction
```
BOUNDARY → CONTROL → ENTITY
```
Dependencies flow inward, with outer layers depending on inner layers.

---

## Testing Strategy

### Unit Tests
**Location:** `src/app/src/controllers/__tests__/`

**Coverage:** 86 tests, 100% coverage

**Test Structure:**
- Auth controllers: 60 tests
- User controllers: 26 tests

Each controller is tested in isolation with mocked dependencies.

---

## Benefits of This Architecture

### Maintainability
- Easy to locate functionality
- Clear separation of concerns
- Isolated changes

### Testability
- Controllers can be tested independently
- Mock external dependencies easily
- High test coverage achieved

### Scalability
- Easy to add new features
- Clear pattern for new functionality
- Modular structure supports growth

### Team Collaboration
- Clear boundaries between layers
- Multiple developers can work in parallel
- Reduced merge conflicts

---

## Conclusion

The current project structure follows BCE architectural principles with clear separation of Boundary (UI), Control (Business Logic), and Entity (Data) layers across both frontend and backend applications.

