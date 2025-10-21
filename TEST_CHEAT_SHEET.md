# 🧪 Test Cheat Sheet - Quick Reference

## 🚀 Quick Commands

```bash
npm test                      # Run all tests
npm test -- --watch          # Watch mode (auto-rerun)
npm test -- --coverage       # With coverage report
npm test loginController     # Run specific test file
```

---

## 📝 Test Template

```javascript
describe('MyController', () => {
  beforeEach(() => {
    jest.clearAllMocks();  // Clean slate
  });

  describe('myFunction', () => {
    it('should do something when condition', () => {
      // ARRANGE - Setup
      const input = 'test';
      const expected = 'result';
      
      // ACT - Execute
      const result = myFunction(input);
      
      // ASSERT - Verify
      expect(result).toBe(expected);
    });
  });
});
```

---

## 🎭 Common Mocks

### **Mock Fetch**
```javascript
global.fetch = jest.fn();

// Success
fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'value' })
});

// Error
fetch.mockRejectedValueOnce(new Error('Network error'));
```

### **Mock localStorage**
```javascript
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
```

### **Mock Module**
```javascript
jest.mock('./myModule');
import { myModule } from './myModule';

// Make it return something
myModule.myFunction.mockReturnValue('fake result');
```

---

## ✅ Common Matchers

```javascript
// Equality
expect(value).toBe(5)                    // Exact match
expect(object).toEqual({ id: 1 })        // Deep equality

// Truthiness
expect(value).toBeTruthy()               // Is truthy
expect(value).toBeFalsy()                // Is falsy
expect(value).toBeNull()                 // Is null
expect(value).toBeUndefined()            // Is undefined

// Numbers
expect(value).toBeGreaterThan(3)         // > 3
expect(value).toBeLessThan(10)           // < 10

// Strings
expect(string).toContain('hello')        // Has substring
expect(string).toMatch(/pattern/)        // Matches regex

// Arrays
expect(array).toContain('item')          // Has item
expect(array).toHaveLength(5)            // Length is 5

// Functions
expect(fn).toHaveBeenCalled()            // Was called
expect(fn).toHaveBeenCalledWith('arg')   // Called with arg
expect(fn).toHaveBeenCalledTimes(2)      // Called N times
expect(fn).not.toHaveBeenCalled()        // NOT called
```

---

## 🔄 Setup & Teardown

```javascript
beforeAll(() => {
  // Runs once before all tests
});

beforeEach(() => {
  // Runs before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Runs after each test
});

afterAll(() => {
  // Runs once after all tests
});
```

---

## 📊 AAA Pattern

```javascript
it('test name', () => {
  // ========== ARRANGE ==========
  const input = 'data';
  const mock = jest.fn();
  
  // ========== ACT ==========
  const result = functionUnderTest(input);
  
  // ========== ASSERT ==========
  expect(result).toBe('expected');
  expect(mock).toHaveBeenCalled();
});
```

---

## 🎯 What to Test

```
✅ Happy path - Everything works
✅ Error path - Things go wrong
✅ Edge cases - Unusual inputs
✅ Validation - Bad data rejected
```

---

## 🐛 Debugging Tips

```javascript
// Print what was called
console.log(myMock.mock.calls);

// Print what was returned
console.log(myMock.mock.results);

// Print actual result
console.log('Result:', result);
```

---

## 📁 File Structure

```
src/controllers/
├── auth/
│   ├── loginController.js     ← Code
│   └── ...
└── __tests__/
    └── auth/
        ├── loginController.test.js  ← Tests
        └── ...
```

---

## 🎨 Test Naming

```javascript
// Good ✅
it('should return user when authenticated')
it('should throw error when password is invalid')
it('should save token to localStorage')

// Bad ❌
it('test 1')
it('works')
it('does stuff')
```

---

## 💡 Best Practices

```
DO:
✅ Test one thing per test
✅ Use descriptive names
✅ Mock external dependencies
✅ Keep tests simple
✅ Test both success and failure

DON'T:
❌ Test multiple things at once
❌ Depend on test order
❌ Use real APIs/databases
❌ Share state between tests
❌ Make tests complex
```

---

## 🔍 Reading Test Output

```
✓ Passed test
✗ Failed test

Expected: true
Received: false
  at Object.<anonymous> (test.js:10:5)
```

---

## 📈 Coverage Report

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
loginController.js |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|

Goal: >80% on all metrics
```

---

## 🚦 Test Status

```
PASS  ✅ All tests passed
FAIL  ❌ Some tests failed
```

---

## 🎓 Quick Examples

### **Test Success Case**
```javascript
it('should login successfully', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true })
  });
  
  const result = await login('user', 'pass');
  
  expect(result.success).toBe(true);
});
```

### **Test Error Case**
```javascript
it('should handle error', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));
  
  const result = await login('user', 'pass');
  
  expect(result.success).toBe(false);
});
```

### **Test Validation**
```javascript
it('should reject empty username', () => {
  const result = validate({ username: '' });
  
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Username required');
});
```

---

## 🎉 Remember

```
Tests = Safety Net 🛡️
Good Tests = Confidence 💪
More Tests = Fewer Bugs 🐛
```

---

**Keep this cheat sheet handy while writing tests!**

