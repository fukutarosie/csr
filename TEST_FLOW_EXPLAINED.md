# 🔍 Test Flow Explained - Visual Walkthrough

Let's walk through `loginController.test.js` step by step with visual diagrams!

---

## 📁 Test File Structure

```
loginController.test.js
│
├── 📦 Imports (Lines 5-7)
│   └── Import the code we want to test
│
├── 🎭 Mocks (Lines 10-14)
│   └── Create fake versions of dependencies
│
├── 🏗️ Setup (Lines 17-21)
│   └── beforeEach - Clean slate for each test
│
└── 🧪 Test Suites (Lines 23-215)
    ├── describe('login') - 4 tests
    ├── describe('isLoggedIn') - 2 tests
    ├── describe('getCurrentUser') - 2 tests
    └── describe('getDashboardRoute') - 2 tests
```

---

## 🎯 Test #1: Successful Login (Lines 38-73)

### **Visual Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  TEST: "should successfully login with valid credentials"   │
└─────────────────────────────────────────────────────────────┘

STEP 1: ARRANGE (Setup)
═══════════════════════
┌──────────────────┐
│ Create fake data │
└────────┬─────────┘
         │
         ├─► mockCredentials { username, password, role_code }
         ├─► mockUser { id, username, full_name, ... }
         └─► mockResponse { success: true, user, tokens }

┌──────────────────┐
│ Mock fetch call  │
└────────┬─────────┘
         │
         └─► fetch.mockResolvedValueOnce({
               ok: true,
               json: async () => mockResponse
             })
         
         When fetch is called, return our fake response ✅


STEP 2: ACT (Execute)
═══════════════════════
┌──────────────────────────────────────────┐
│ const result = await loginController     │
│              .login(mockCredentials)     │
└──────────────┬───────────────────────────┘
               │
               └─► Call the REAL loginController
                   (But it uses our FAKE fetch and dependencies!)


STEP 3: ASSERT (Verify)
═══════════════════════

Check 1: Was fetch called correctly?
┌─────────────────────────────────────────────┐
│ expect(fetch).toHaveBeenCalledWith(         │
│   'http://localhost:8000/api/login',        │
│   { method: 'POST', body: credentials }     │
│ )                                           │
└─────────────────────────────────────────────┘
✅ YES - Correct API endpoint with correct data


Check 2: Was access token stored?
┌─────────────────────────────────────────────┐
│ expect(tokenController.setAccessToken)      │
│   .toHaveBeenCalledWith('mock_access_token')│
└─────────────────────────────────────────────┘
✅ YES - Token was saved


Check 3: Was refresh token stored?
┌─────────────────────────────────────────────┐
│ expect(tokenController.setRefreshToken)     │
│   .toHaveBeenCalledWith('mock_refresh_token')│
└─────────────────────────────────────────────┘
✅ YES - Refresh token was saved


Check 4: Was user data stored?
┌─────────────────────────────────────────────┐
│ expect(sessionController.setUser)           │
│   .toHaveBeenCalledWith(mockUser)           │
└─────────────────────────────────────────────┘
✅ YES - User data was saved


Check 5: Was correct result returned?
┌─────────────────────────────────────────────┐
│ expect(result).toEqual({                    │
│   success: true,                            │
│   message: 'Login successful',              │
│   user: mockUser                            │
│ })                                          │
└─────────────────────────────────────────────┘
✅ YES - Correct result


RESULT: ✅ TEST PASSES
═══════════════════════
All 5 checks passed! The login function works correctly!
```

---

## 🚫 Test #2: Invalid Credentials (Lines 75-98)

### **Visual Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  TEST: "should return error for invalid credentials"        │
└─────────────────────────────────────────────────────────────┘

STEP 1: ARRANGE (Setup)
═══════════════════════
┌──────────────────┐
│ Create fake data │
└────────┬─────────┘
         │
         └─► mockResponse {
               success: false,
               message: 'Invalid username or password'
             }

┌──────────────────┐
│ Mock fetch call  │
└────────┬─────────┘
         │
         └─► fetch.mockResolvedValueOnce({
               ok: false,  ← ❌ API call FAILED
               json: async () => mockResponse
             })


STEP 2: ACT (Execute)
═══════════════════════
┌──────────────────────────────────────────┐
│ const result = await loginController     │
│              .login(mockCredentials)     │
└──────────────┬───────────────────────────┘
               │
               └─► Login attempt with invalid credentials


STEP 3: ASSERT (Verify)
═══════════════════════

Check 1: Tokens should NOT be stored
┌─────────────────────────────────────────────┐
│ expect(tokenController.setAccessToken)      │
│   .not.toHaveBeenCalled()                   │
│ expect(tokenController.setRefreshToken)     │
│   .not.toHaveBeenCalled()                   │
└─────────────────────────────────────────────┘
✅ CORRECT - No tokens stored (login failed)


Check 2: User should NOT be stored
┌─────────────────────────────────────────────┐
│ expect(sessionController.setUser)           │
│   .not.toHaveBeenCalled()                   │
└─────────────────────────────────────────────┘
✅ CORRECT - No user data stored (login failed)


Check 3: Error message should be returned
┌─────────────────────────────────────────────┐
│ expect(result).toEqual({                    │
│   success: false,                           │
│   message: 'Invalid username or password'   │
│ })                                          │
└─────────────────────────────────────────────┘
✅ CORRECT - User gets error message


RESULT: ✅ TEST PASSES
═══════════════════════
Login correctly rejects invalid credentials!
```

---

## 🌐 Test #3: Network Error (Lines 100-112)

### **Visual Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  TEST: "should handle network errors gracefully"            │
└─────────────────────────────────────────────────────────────┘

STEP 1: ARRANGE (Setup)
═══════════════════════
┌──────────────────┐
│ Mock fetch call  │
└────────┬─────────┘
         │
         └─► fetch.mockRejectedValueOnce(
               new Error('Network error')
             )
         
         Simulate network failure! 🔥


STEP 2: ACT (Execute)
═══════════════════════
┌──────────────────────────────────────┐
│ const result = await loginController │
│              .login(mockCredentials) │
└──────────────┬───────────────────────┘
               │
               └─► Network error occurs!
               
        ┌───────────────┐
        │ Does app crash? │
        └────────┬────────┘
                 │
                 └─► NO! Error is caught ✅


STEP 3: ASSERT (Verify)
═══════════════════════

Check: User-friendly error message shown?
┌─────────────────────────────────────────────┐
│ expect(result).toEqual({                    │
│   success: false,                           │
│   message: 'Failed to connect to server...' │
│ })                                          │
└─────────────────────────────────────────────┘
✅ CORRECT - User sees helpful error


RESULT: ✅ TEST PASSES
═══════════════════════
App handles network errors gracefully!
```

---

## 🎭 How Mocking Works

### **Real World (Production):**

```
┌─────────────────┐
│ loginController │
└────────┬────────┘
         │
         ├─► fetch → Real API Server (http://localhost:8000)
         ├─► tokenController → Real localStorage
         └─► sessionController → Real localStorage
```

### **Test World:**

```
┌─────────────────┐
│ loginController │ (REAL CODE - This is what we're testing!)
└────────┬────────┘
         │
         ├─► fetch → FAKE (jest.fn) ← We control the response!
         ├─► tokenController → FAKE (jest.mock) ← We track calls!
         └─► sessionController → FAKE (jest.mock) ← We track calls!

Why?
• No need for real server ✅
• Tests run fast ✅
• Tests are reliable ✅
• We control what happens ✅
```

---

## 🔍 Understanding Mock Calls

### **Example: Tracking Function Calls**

```javascript
// In test setup
jest.mock('../../auth/tokenController');

// In test
tokenController.setAccessToken('my_token');

// Check if it was called
expect(tokenController.setAccessToken).toHaveBeenCalled();
// ✅ YES, it was called

// Check what it was called with
expect(tokenController.setAccessToken).toHaveBeenCalledWith('my_token');
// ✅ YES, called with 'my_token'

// Check how many times
expect(tokenController.setAccessToken).toHaveBeenCalledTimes(1);
// ✅ YES, called exactly once
```

### **Visual:**

```
┌──────────────────────────────────────┐
│  Your Code Calls:                    │
│  tokenController.setAccessToken(...)  │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Jest Records:                       │
│  • Function name ✓                   │
│  • Arguments passed ✓                │
│  • Number of times called ✓          │
│  • Order of calls ✓                  │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  In Test You Check:                  │
│  expect(...).toHaveBeenCalledWith    │
└──────────────────────────────────────┘
```

---

## 📊 Test Execution Flow

### **When you run `npm test`:**

```
1. Jest starts
   │
   ├─► Finds test files (__tests__/*.test.js)
   │
   ├─► For each test file:
   │   │
   │   ├─► Load imports
   │   ├─► Set up mocks
   │   ├─► Run beforeEach
   │   │
   │   ├─► For each test:
   │   │   │
   │   │   ├─► Execute ARRANGE
   │   │   ├─► Execute ACT
   │   │   ├─► Execute ASSERT
   │   │   │
   │   │   └─► ✅ Pass or ❌ Fail
   │   │
   │   └─► Run afterEach
   │
   └─► Report results
```

### **Test Output:**

```
 PASS  src/controllers/__tests__/auth/loginController.test.js
  loginController
    login
      ✓ should successfully login with valid credentials (15ms)
      ✓ should return error for invalid credentials (5ms)
      ✓ should handle network errors gracefully (3ms)
      ✓ should not store tokens if login fails (2ms)
    isLoggedIn
      ✓ should return true when user is authenticated (1ms)
      ✓ should return false when user is not authenticated (1ms)
    getCurrentUser
      ✓ should return current user when available (1ms)
      ✓ should return null when no user is logged in (1ms)
    getDashboardRoute
      ✓ should return dashboard route for logged in user (1ms)
      ✓ should return null when no user is logged in (1ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Time:        2.531 s
```

---

## 🎓 Key Concepts Recap

### **1. Mock = Fake Version**
```javascript
// Real
localStorage.setItem('key', 'value');  // Saves to browser

// Mock (in test)
localStorage.setItem('key', 'value');  // Just tracks the call
```

### **2. Arrange-Act-Assert**
```javascript
// ARRANGE: Set up
const input = 'test';
fetch.mockResolvedValueOnce({...});

// ACT: Do the thing
const result = myFunction(input);

// ASSERT: Check result
expect(result).toBe('expected');
```

### **3. Test Isolation**
```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Each test starts fresh!
});
```

### **4. What to Test**
```
✅ Happy path (everything works)
✅ Error path (things go wrong)
✅ Edge cases (unusual inputs)
✅ Validation (reject bad data)
```

---

## 💡 Quick Reference

### **Common Test Patterns:**

```javascript
// Check if function was called
expect(myFunction).toHaveBeenCalled();

// Check what it was called with
expect(myFunction).toHaveBeenCalledWith('arg1', 'arg2');

// Check it was NOT called
expect(myFunction).not.toHaveBeenCalled();

// Check return value
expect(result).toBe('value');
expect(result).toEqual({ key: 'value' });

// Check truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();

// Check array/string contains
expect(array).toContain('item');
expect(string).toContain('substring');
```

---

## 🎉 You Now Understand Testing!

**What You Learned:**
1. ✅ How tests are structured
2. ✅ What mocking means
3. ✅ How to read test code
4. ✅ What each test checks
5. ✅ Why tests are important

**Next Steps:**
1. Read through the test files
2. Try running `npm test`
3. Modify a test and see what happens
4. Write your own test!

**Remember:**
- Tests = Documentation that executes
- Good tests = Confidence in your code
- More tests = Fewer production bugs

**Happy Testing! 🧪**

