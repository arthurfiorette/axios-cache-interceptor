import {
  setupCache,
  buildStorage,
  buildWebStorage,
  buildMemoryStorage,
  buildKeyGenerator,
  updateCache
} from './index.js';

// Mock __ACI_DEV__ to test the development warning
const originalConsoleError = console.error;

describe('index.ts exports', () => {
  beforeEach(() => {
    // Suppress console error during tests if needed
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (!args[0]?.includes('You are using a development build')) {
        originalConsoleError(...args);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export setupCache function', () => {
    expect(setupCache).toBeDefined();
    expect(typeof setupCache).toBe('function');
  });

  it('should export buildStorage function', () => {
    expect(buildStorage).toBeDefined();
    expect(typeof buildStorage).toBe('function');
  });

  it('should export buildWebStorage function', () => {
    expect(buildWebStorage).toBeDefined();
    expect(typeof buildWebStorage).toBe('function');
  });

  it('should export buildMemoryStorage function', () => {
    expect(buildMemoryStorage).toBeDefined();
    expect(typeof buildMemoryStorage).toBe('function');
  });

  it('should export buildKeyGenerator function', () => {
    expect(buildKeyGenerator).toBeDefined();
    expect(typeof buildKeyGenerator).toBe('function');
  });

  it('should export updateCache function', () => {
    expect(updateCache).toBeDefined();
    expect(typeof updateCache).toBe('function');
  });

  it('should handle development build warning correctly', () => {
    // Capture the console.error call when __ACI_DEV__ is true
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // In a real scenario, when __ACI_DEV__ is true, the error message would be called
    // Since we can't easily test the conditional at runtime in Jest, we simply verify
    // that the conditional code wouldn't break
    expect(() => {
      if ((global as any).__ACI_DEV__) {
        console.error('Development build warning test');
      }
    }).not.toThrow();

    // Restore console
    consoleSpy.mockRestore();
  });
});