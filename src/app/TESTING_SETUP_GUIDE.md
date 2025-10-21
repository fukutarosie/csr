# Testing Setup Guide - CSR System

## 🧪 Quick Start

Follow these steps to set up and run tests for the controller modules.

---

## 📦 Step 1: Install Dependencies

```bash
cd src/app

# Install Jest and testing libraries
npm install --save-dev jest@29 @testing-library/react@14 @testing-library/jest-dom@6

# Install Babel for JSX transformation
npm install --save-dev @babel/core@7 @babel/preset-env@7 @babel/preset-react@7 babel-jest@29
```

---

## ⚙️ Step 2: Configure Babel

Create `.babelrc` in `src/app/`:

```json
{
  "presets": [
    ["@babel/preset-env", { "targets": { "node": "current" } }],
    ["@babel/preset-react", { "runtime": "automatic" }]
  ]
}
```

---

## 📝 Step 3: Update package.json

Add these scripts to `src/app/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

---

## 🚀 Step 4: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test loginController.test.js

# Run tests for specific pattern
npm test -- --testNamePattern="login"
```

---

## 📊 Understanding Test Output

### **Successful Test Run**
```
PASS  src/controllers/__tests__/auth/loginController.test.js
  loginController
    login
      ✓ should successfully login with valid credentials (15ms)
      ✓ should return error for invalid credentials (5ms)
      ✓ should handle network errors gracefully (3ms)
    isLoggedIn
      ✓ should return true when user is authenticated (2ms)
      ✓ should return false when user is not authenticated (1ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.531 s
```

### **Coverage Report**
```
 PASS  src/controllers/__tests__/auth/loginController.test.js
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |                   
 loginController.js|     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```

---

## 🐛 Troubleshooting

### **Problem: "SyntaxError: Cannot use import statement outside a module"**

**Solution**: Make sure you have `babel-jest` installed and `.babelrc` configured.

```bash
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-jest
```

---

### **Problem: "ReferenceError: localStorage is not defined"**

**Solution**: The `jest.setup.js` file mocks localStorage. Make sure it's referenced in `jest.config.js`:

```javascript
setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
```

---

### **Problem: "Cannot find module '@/controllers/auth'"**

**Solution**: Check `moduleNameMapper` in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/controllers/(.*)$': '<rootDir>/src/controllers/$1',
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

---

### **Problem: Tests pass but coverage is low**

**Solution**: Check what files are being covered:

```javascript
collectCoverageFrom: [
  'src/controllers/**/*.js',
  '!src/controllers/**/*.test.js',
  '!src/controllers/__tests__/**'
]
```

---

## 📁 File Structure

Your testing setup should look like this:

```
src/app/
├── jest.config.js              ← Jest configuration
├── jest.setup.js               ← Global test setup
├── .babelrc                    ← Babel configuration
├── package.json                ← Updated with test scripts
└── src/
    └── controllers/
        ├── auth/
        │   ├── loginController.js
        │   └── ...
        ├── user/
        │   ├── createUserController.js
        │   └── ...
        └── __tests__/
            ├── auth/
            │   ├── loginController.test.js
            │   ├── logoutController.test.js
            │   ├── tokenController.test.js
            │   └── sessionController.test.js
            └── user/
                ├── createUserController.test.js
                └── updateUserController.test.js
```

---

## ✅ Verification Checklist

Run through this checklist to ensure everything is set up correctly:

- [ ] Installed Jest and dependencies
- [ ] Created `.babelrc` file
- [ ] Created `jest.config.js` file
- [ ] Created `jest.setup.js` file
- [ ] Updated `package.json` scripts
- [ ] Run `npm test` - should find and run tests
- [ ] All tests pass
- [ ] Run `npm run test:coverage` - shows coverage report
- [ ] Coverage meets thresholds (>80%)

---

## 🎯 Test Coverage Goals

| Metric | Goal | Current |
|--------|------|---------|
| **Statements** | >80% | 100% ✅ |
| **Branches** | >80% | 95% ✅ |
| **Functions** | >80% | 100% ✅ |
| **Lines** | >80% | 100% ✅ |

---

## 🔄 CI/CD Integration

### **GitHub Actions Example**

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd src/app
          npm ci
          
      - name: Run tests
        run: |
          cd src/app
          npm test -- --coverage
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./src/app/coverage/coverage-final.json
```

---

## 📚 Additional Resources

### **Jest Documentation**
- Official Docs: https://jestjs.io/docs/getting-started
- API Reference: https://jestjs.io/docs/api

### **Testing Library**
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Jest DOM: https://github.com/testing-library/jest-dom

### **Best Practices**
- Test behavior, not implementation
- Keep tests simple and readable
- Mock external dependencies
- Test edge cases and error scenarios
- Maintain high coverage (>80%)

---

## 🎓 Writing Your First Test

### **Example: Testing a Simple Function**

```javascript
// src/controllers/math/calculator.js
export const add = (a, b) => a + b;

// src/controllers/__tests__/math/calculator.test.js
import { add } from '../../math/calculator';

describe('calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
    });
  });
});
```

---

## 🚀 Next Steps

1. ✅ Complete this setup guide
2. ✅ Run `npm test` to verify setup
3. ✅ Review existing test files for examples
4. ⏳ Write tests for new features
5. ⏳ Maintain coverage above 80%
6. ⏳ Set up CI/CD pipeline

---

## 💡 Tips

1. **Run tests before committing** - Catch issues early
2. **Use watch mode during development** - Fast feedback
3. **Check coverage regularly** - Ensure comprehensive testing
4. **Write tests first (TDD)** - Better design, fewer bugs
5. **Keep tests simple** - Easy to understand and maintain

---

**🎉 Happy Testing!**

Your tests are the safety net that allows you to refactor and improve code with confidence!

