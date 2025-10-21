/**
 * Jest Setup File
 * Global test configuration and mocks
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Mock window if not defined
if (typeof window === 'undefined') {
  global.window = {
    localStorage: localStorageMock
  };
}

// Mock fetch globally
global.fetch = jest.fn();

// Suppress console errors in tests (optional)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();

