# 🧪 Understanding Tests - Complete Guide

## 📚 Table of Contents
1. [Test Basics](#test-basics)
2. [Test Anatomy](#test-anatomy)
3. [Mocking Explained](#mocking-explained)
4. [Reading Our Tests](#reading-our-tests)
5. [Common Patterns](#common-patterns)
6. [Writing Your Own Tests](#writing-your-own-tests)

---

## 🎯 Test Basics

### **What is a Unit Test?**

A unit test checks if a **single piece of code** (a function) works correctly in **isolation**.

```javascript
// The function we want to test
function add(a, b) {
  return a + b;
}

// The test that verifies it works
it('should add two numbers', () => {
  expect(add(2, 3)).toBe(5);  // ✅ Pass if true
});
```

### **Why Test?**

1. ✅ **Catch bugs early** - Before users see them
2. ✅ **Safe refactoring** - Change code confidently
3. ✅ **Documentation** - Tests show how code should work
4. ✅ **Prevent regressions** - Old bugs stay fixed

---

## 🔬 Test Anatomy

Every test follows the **AAA Pattern**:

### **1. Arrange** - Set up the test
### **2. Act** - Execute the code
### **3. Assert** - Verify the result

Let's break down a real example from our tests:

```javascript
it('should successfully login with valid credentials', async () => {
  // ========== ARRANGE ==========
  // Setup: Create fake data and mock responses
  const mockCredentials = {
    username: 'testuser',
    password: 'password123',
    role_code: 'USER_ADMIN'
  };

  const mockResponse = {
    success: true,
    user: { id: 1, username: 'testuser' },
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token'
  };

  // Mock the fetch call to return our fake response
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse
  });

  // ========== ACT ==========
  // Execute: Call the function we're testing
  const result = await loginController.login(mockCredentials);

  // ========== ASSERT ==========
  // Verify: Check if everything happened correctly
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:8000/api/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCredentials)
    }
  );
  expect(tokenController.setAccessToken).toHaveBeenCalledWith('mock_access_token');
  expect(result.success).toBe(true);
});
```

---

## 🎭 Mocking Explained

### **What is Mocking?**

**Mocking** = Creating fake versions of things so tests run in isolation.

### **Why Mock?**

We don't want our tests to:
- ❌ Call real APIs (slow, might fail)
- ❌ Depend on databases (unreliable)
- ❌ Use real localStorage (test isolation)
- ❌ Depend on other code (test one thing at a time)

### **What We Mock**

#### **1. Mock Functions**

```javascript
// Real code
function saveToDatabase(data) {
  return database.insert(data);  // We don't want to test the database!
}

// In test - mock the database
const mockDatabase = {
  insert: jest.fn().mockReturnValue({ id: 1, success: true })
};
```

#### **2. Mock Fetch (API Calls)**

```javascript
// Real code makes HTTP request
fetch('http://api.com/users');

// In test - fake the response
global.fetch = jest.fn();
fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ users: ['Alice', 'Bob'] })
});
```

#### **3. Mock localStorage**

```javascript
// Real code uses browser storage
localStorage.setItem('user', 'John');

// In test - fake storage
global.localStorage = {
  setItem: jest.fn(),
  getItem: jest.fn()
};
```

#### **4. Mock Dependencies**

```javascript
// Our code depends on tokenController
import { tokenController } from './tokenController';

// Mock it so we can control its behavior
jest.mock('./tokenController');

// Now we can make it return whatever we want
tokenController.getAccessToken.mockReturnValue('fake_token');
```

---

## 📖 Reading Our Tests

Let's walk through an actual test from `loginController.test.js`:

### **Test File Structure**

```javascript
// ========== IMPORTS ==========
import { loginController } from '../../auth/loginController';
import { tokenController } from '../../auth/tokenController';
import { sessionController } from '../../auth/sessionController';

// ========== MOCK DEPENDENCIES ==========
jest.mock('../../auth/tokenController');
jest.mock('../../auth/sessionController');
global.fetch = jest.fn();

// ========== TEST SUITE ==========
describe('loginController', () => {
  // This describes what we're testing
  
  // ========== SETUP (runs before each test) ==========
  beforeEach(() => {
    jest.clearAllMocks();  // Clean slate for each test
    fetch.mockClear();
  });

  // ========== TEST SUITES (groups of related tests) ==========
  describe('login', () => {
    // Group tests about the login function
    
    // ========== INDIVIDUAL TESTS ==========
    it('should successfully login with valid credentials', async () => {
      // Test implementation
    });

    it('should return error for invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

---

## 🔍 Breaking Down Specific Tests

### **Example 1: Success Case**

```javascript
it('should successfully login with valid credentials', async () => {
  // ========== ARRANGE ==========
  const mockCredentials = {
    username: 'testuser',
    password: 'password123',
    role_code: 'USER_ADMIN'
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    full_name: 'Test User',
    role_code: 'USER_ADMIN',
    dashboard_route: '/dashboard/admin'
  };

  const mockResponse = {
    success: true,
    message: 'Login successful',
    user: mockUser,
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token'
  };

  // Mock fetch to return success
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse
  });

  // ========== ACT ==========
  const result = await loginController.login(mockCredentials);

  // ========== ASSERT ==========
  
  // Check 1: Did we call the API correctly?
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:8000/api/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockCredentials)
    }
  );

  // Check 2: Did we store the access token?
  expect(tokenController.setAccessToken).toHaveBeenCalledWith('mock_access_token');

  // Check 3: Did we store the refresh token?
  expect(tokenController.setRefreshToken).toHaveBeenCalledWith('mock_refresh_token');

  // Check 4: Did we store the user data?
  expect(sessionController.setUser).toHaveBeenCalledWith(mockUser);

  // Check 5: Did we return the correct result?
  expect(result).toEqual({
    success: true,
    message: 'Login successful',
    user: mockUser
  });
});
```

**What this test verifies:**
1. ✅ API is called with correct credentials
2. ✅ Access token is stored
3. ✅ Refresh token is stored
4. ✅ User data is stored
5. ✅ Correct result is returned

---

### **Example 2: Error Case**

```javascript
it('should return error for invalid credentials', async () => {
  // ========== ARRANGE ==========
  const mockResponse = {
    success: false,
    message: 'Invalid username or password'
  };

  // Mock fetch to return error
  fetch.mockResolvedValueOnce({
    ok: false,  // ← Important: API call failed
    json: async () => mockResponse
  });

  // ========== ACT ==========
  const result = await loginController.login(mockCredentials);

  // ========== ASSERT ==========
  
  // Check 1: Should NOT store tokens (login failed)
  expect(tokenController.setAccessToken).not.toHaveBeenCalled();
  expect(tokenController.setRefreshToken).not.toHaveBeenCalled();
  
  // Check 2: Should NOT store user (login failed)
  expect(sessionController.setUser).not.toHaveBeenCalled();
  
  // Check 3: Should return error message
  expect(result).toEqual({
    success: false,
    message: 'Invalid username or password'
  });
});
```

**What this test verifies:**
1. ✅ No tokens stored when login fails
2. ✅ No user data stored when login fails
3. ✅ Error message is returned correctly

---

### **Example 3: Network Error**

```javascript
it('should handle network errors gracefully', async () => {
  // ========== ARRANGE ==========
  // Mock fetch to throw an error (network failure)
  fetch.mockRejectedValueOnce(new Error('Network error'));

  // ========== ACT ==========
  const result = await loginController.login(mockCredentials);

  // ========== ASSERT ==========
  expect(result).toEqual({
    success: false,
    message: 'Failed to connect to server. Make sure the backend is running.'
  });
});
```

**What this test verifies:**
1. ✅ App doesn't crash when network fails
2. ✅ User-friendly error message is shown

---

## 🎨 Common Test Patterns

### **Pattern 1: Test Success Path**

```javascript
it('should do the thing when everything works', async () => {
  // Mock successful scenario
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
  
  const result = await functionUnderTest();
  
  expect(result.success).toBe(true);
});
```

### **Pattern 2: Test Error Path**

```javascript
it('should handle errors when something fails', async () => {
  // Mock error scenario
  fetch.mockRejectedValueOnce(new Error('API Error'));
  
  const result = await functionUnderTest();
  
  expect(result.success).toBe(false);
});
```

### **Pattern 3: Test Validation**

```javascript
it('should reject invalid input', () => {
  const invalidData = { username: '' };  // Empty username
  
  const result = validateUserData(invalidData);
  
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Username is required');
});
```

### **Pattern 4: Test State Changes**

```javascript
it('should update local storage', () => {
  const user = { id: 1, name: 'John' };
  
  sessionController.setUser(user);
  
  expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
});
```

---

## 🧩 Jest Matchers (Expectations)

### **Common Matchers**

```javascript
// Equality
expect(value).toBe(5);                    // Exact match (primitive)
expect(obj).toEqual({ id: 1 });          // Deep equality (objects)

// Truthiness
expect(value).toBeTruthy();              // Is truthy
expect(value).toBeFalsy();               // Is falsy
expect(value).toBeNull();                // Is null
expect(value).toBeUndefined();           // Is undefined

// Numbers
expect(value).toBeGreaterThan(3);        // > 3
expect(value).toBeLessThan(10);          // < 10

// Strings
expect(string).toContain('hello');       // Contains substring
expect(string).toMatch(/pattern/);       // Matches regex

// Arrays
expect(array).toContain('item');         // Array includes item
expect(array).toHaveLength(5);           // Array has length 5

// Functions
expect(fn).toHaveBeenCalled();           // Function was called
expect(fn).toHaveBeenCalledWith('arg');  // Called with specific arg
expect(fn).toHaveBeenCalledTimes(2);     // Called exactly N times
expect(fn).not.toHaveBeenCalled();       // Function was NOT called
```

---

## 📝 Test Organization

### **Describe Blocks** (Test Suites)

```javascript
describe('loginController', () => {
  // All tests for loginController
  
  describe('login', () => {
    // All tests for the login function
    
    it('should work with valid data', () => { /* test */ });
    it('should fail with invalid data', () => { /* test */ });
  });
  
  describe('isLoggedIn', () => {
    // All tests for the isLoggedIn function
    
    it('should return true when authenticated', () => { /* test */ });
    it('should return false when not authenticated', () => { /* test */ });
  });
});
```

**Output:**
```
loginController
  login
    ✓ should work with valid data
    ✓ should fail with invalid data
  isLoggedIn
    ✓ should return true when authenticated
    ✓ should return false when not authenticated
```

---

## 🛠️ Setup and Teardown

```javascript
describe('My Tests', () => {
  // ========== RUNS ONCE BEFORE ALL TESTS ==========
  beforeAll(() => {
    console.log('Setting up test suite');
  });

  // ========== RUNS BEFORE EACH TEST ==========
  beforeEach(() => {
    jest.clearAllMocks();  // Reset all mocks
    localStorage.clear();   // Clear storage
  });

  // ========== RUNS AFTER EACH TEST ==========
  afterEach(() => {
    // Cleanup after each test
  });

  // ========== RUNS ONCE AFTER ALL TESTS ==========
  afterAll(() => {
    console.log('Tearing down test suite');
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

---

## 🎓 Real Example Walkthrough

Let's walk through `tokenController.test.js` step by step:

### **Setup Section**

```javascript
// ========== 1. IMPORTS ==========
import { tokenController } from '../../auth/tokenController';

// ========== 2. MOCK LOCALSTORAGE ==========
const localStorageMock = (() => {
  let store = {};  // Fake storage
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

global.localStorage = localStorageMock;  // Replace real localStorage
global.fetch = jest.fn();                 // Replace real fetch
```

### **Test: Set and Get Access Token**

```javascript
describe('Access Token Management', () => {
  it('should set access token', () => {
    // ========== ACT ==========
    tokenController.setAccessToken('test_access_token');

    // ========== ASSERT ==========
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'access_token',      // Key
      'test_access_token'  // Value
    );
  });

  it('should get access token', () => {
    // ========== ARRANGE ==========
    localStorageMock.setItem('access_token', 'test_access_token');

    // ========== ACT ==========
    const token = tokenController.getAccessToken();

    // ========== ASSERT ==========
    expect(token).toBe('test_access_token');
  });
});
```

### **Test: Token Refresh**

```javascript
describe('refreshAccessToken', () => {
  it('should successfully refresh access token', async () => {
    // ========== ARRANGE ==========
    localStorageMock.setItem('refresh_token', 'old_refresh_token');
    
    fetch.mockResolvedValueOnce({
      json: async () => ({ access_token: 'new_access_token' })
    });

    // ========== ACT ==========
    const result = await tokenController.refreshAccessToken();

    // ========== ASSERT ==========
    // Check 1: Called refresh API
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/refresh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'old_refresh_token' })
      }
    );
    
    // Check 2: Stored new token
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'access_token',
      'new_access_token'
    );
    
    // Check 3: Returned success
    expect(result).toBe(true);
  });

  it('should return false when no refresh token available', async () => {
    // ========== ARRANGE ==========
    // No refresh token set
    
    // ========== ACT ==========
    const result = await tokenController.refreshAccessToken();

    // ========== ASSERT ==========
    expect(fetch).not.toHaveBeenCalled();  // Shouldn't call API
    expect(result).toBe(false);             // Should return false
  });
});
```

---

## ✍️ Writing Your Own Tests

### **Step 1: Identify What to Test**

For a function like this:
```javascript
export function calculateDiscount(price, percentage) {
  if (price <= 0) return 0;
  if (percentage < 0 || percentage > 100) return price;
  return price * (1 - percentage / 100);
}
```

You need to test:
1. ✅ Normal case (price: 100, discount: 20% → 80)
2. ✅ Edge case (price: 0 → 0)
3. ✅ Edge case (negative price → 0)
4. ✅ Edge case (negative discount → original price)
5. ✅ Edge case (discount > 100 → original price)

### **Step 2: Write Tests**

```javascript
describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 20)).toBe(80);
  });

  it('should return 0 for zero price', () => {
    expect(calculateDiscount(0, 20)).toBe(0);
  });

  it('should return 0 for negative price', () => {
    expect(calculateDiscount(-100, 20)).toBe(0);
  });

  it('should return original price for negative discount', () => {
    expect(calculateDiscount(100, -10)).toBe(100);
  });

  it('should return original price for discount > 100', () => {
    expect(calculateDiscount(100, 150)).toBe(100);
  });
});
```

---

## 🎯 Best Practices

### **DO:**
- ✅ Test one thing per test
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Mock external dependencies
- ✅ Test both success and failure cases
- ✅ Test edge cases
- ✅ Keep tests simple and readable

### **DON'T:**
- ❌ Test multiple things in one test
- ❌ Depend on test execution order
- ❌ Use real APIs or databases
- ❌ Share state between tests
- ❌ Test implementation details
- ❌ Make tests complex

---

## 🔍 Debugging Tests

### **Test Fails - What to Check:**

1. **Read the error message:**
```
Expected: true
Received: false
```

2. **Check the assertion:**
```javascript
expect(result.success).toBe(true);  // What did we expect?
console.log(result);                // What did we actually get?
```

3. **Check the mocks:**
```javascript
console.log(fetch.mock.calls);  // What was fetch called with?
```

4. **Check the setup:**
```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Are mocks being cleared?
});
```

---

## 📚 Summary

### **Key Concepts:**

1. **Unit Test** = Test one function in isolation
2. **AAA Pattern** = Arrange, Act, Assert
3. **Mocking** = Fake external dependencies
4. **Describe** = Group related tests
5. **It** = Individual test case
6. **Expect** = Verify the result

### **Our Test Structure:**

```
Test File
  ├── Imports
  ├── Mocks (jest.mock, global.fetch, localStorage)
  ├── Describe Block (Test Suite)
  │   ├── beforeEach (Setup)
  │   ├── Test 1 (success case)
  │   ├── Test 2 (error case)
  │   └── Test 3 (edge case)
  └── More Describe Blocks...
```

---

## 🎉 You Now Understand Tests!

**Next Steps:**
1. ✅ Read through our test files
2. ✅ Try running the tests
3. ✅ Modify a test and see what happens
4. ✅ Write your own test

**Remember:**
- Tests = Safety net for your code
- Good tests = Confidence to refactor
- More tests = Fewer bugs

**Happy Testing! 🧪**

