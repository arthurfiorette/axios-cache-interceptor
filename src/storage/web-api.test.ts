import { buildWebStorage } from './web-api.js';
import type { StorageValue } from './types.js';
import { isExpired, canStale } from './build.js';

// Mock Storage implementation for testing
class MockStorage implements Storage {
  private store: { [key: string]: string } = {};

  constructor() {
    // Define a non-enumerable length property to match localStorage
    Object.defineProperty(this, 'length', {
      get: () => Object.keys(this.store).length,
      enumerable: false
    });
  }

  clear(): void {
    // Remove all enumerable properties that are keys
    Object.keys(this).forEach(key => {
      if (this.hasOwnProperty(key)) {
        delete (this as any)[key];
      }
    });
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
    delete (this as any)[key];
  }

  setItem(key: string, value: string): void {
    // Simulate storage quota exceeded error for testing
    const keys = Object.keys(this.store).filter(k => k !== 'length'); // exclude length property
    if (keys.length >= 5 && !(key in this.store)) {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    }
    this.store[key] = value;
    // Make the key enumerable so for...in can iterate over it like localStorage
    Object.defineProperty(this, key, {
      value,
      enumerable: true,
      configurable: true
    });
  }
}

describe('buildWebStorage', () => {
  let mockStorage: MockStorage;
  let storage: ReturnType<typeof buildWebStorage>;

  beforeEach(() => {
    mockStorage = new MockStorage();
    storage = buildWebStorage(mockStorage, 'test-prefix-');
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('clear', () => {
    it('should clear only items with the specified prefix', () => {
      // Add items with our prefix
      mockStorage.setItem('test-prefix-key1', JSON.stringify({ data: 'value1' }));
      mockStorage.setItem('test-prefix-key2', JSON.stringify({ data: 'value2' }));

      // Add an item without our prefix
      mockStorage.setItem('other-prefix-key3', JSON.stringify({ data: 'value3' }));

      storage.clear();

      expect(mockStorage.getItem('test-prefix-key1')).toBeNull();
      expect(mockStorage.getItem('test-prefix-key2')).toBeNull();
      expect(mockStorage.getItem('other-prefix-key3')).not.toBeNull();
    });

    it('should handle no own property keys gracefully', () => {
      // Override the for-in loop behavior to test edge cases
      const storageWithNoKeys = {
        ...mockStorage,
        // Manually define a storage without enumerable properties
        [Symbol.iterator]: function* () {
          // Empty iterator
        }
      };

      const storageWithoutEnumerableKeys = buildWebStorage(storageWithNoKeys as any, 'test-prefix-');
      storageWithoutEnumerableKeys.clear(); // Should not throw
    });

    it('should handle empty storage gracefully', () => {
      storage.clear();
      // Should not throw an error
    });
  });

  describe('get', () => {
    it('should get and return stored value', async () => {
      const expectedValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'hello' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      const key = 'test-key';
      mockStorage.setItem('test-prefix-' + key, JSON.stringify(expectedValue));

      const result = await storage.get(key);
      expect(result).toEqual(expectedValue);
    });

    it('should return empty state for non-existent key', async () => {
      const result = await storage.get('non-existent-key');
      expect(result).toEqual({ state: 'empty' });
    });

    it('should parse JSON correctly', async () => {
      const complexValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: { 'content-type': 'application/json' },
          status: 200,
          statusText: 'OK',
          data: {
            nested: { object: true },
            array: [1, 2, 3],
            string: 'test'
          }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      const key = 'complex-key';
      mockStorage.setItem('test-prefix-' + key, JSON.stringify(complexValue));

      const result = await storage.get(key);
      expect(result).toEqual(complexValue);
    });

    it('should handle expired values', async () => {
      const expiredValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now() - 20000, // old creation time
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'expired' }
        },
        expires: Date.now() - 10000, // already expired
        ttl: -10000
      };

      const key = 'expired-key';
      mockStorage.setItem('test-prefix-' + key, JSON.stringify(expiredValue));

      const result = await storage.get(key);
      // Expired items should be removed and return 'empty'
      expect(result).toEqual({ state: 'empty' });
      expect(mockStorage.getItem('test-prefix-' + key)).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove the specified key', () => {
      const key = 'test-key';
      mockStorage.setItem('test-prefix-' + key, JSON.stringify({ data: 'value' }));

      storage.remove(key);

      expect(mockStorage.getItem('test-prefix-' + key)).toBeNull();
    });

    it('should not throw error when removing non-existent key', () => {
      expect(() => {
        storage.remove('non-existent-key');
      }).not.toThrow();
    });
  });

  describe('set', () => {
    it('should set a value in storage', async () => {
      const key = 'test-key';
      const value: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'hello' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      await storage.set(key, value);

      const storedValue = mockStorage.getItem('test-prefix-' + key);
      expect(storedValue).not.toBeNull();
      expect(JSON.parse(storedValue!)).toEqual(value);
    });

    it('should handle storage full scenario by removing expired values', async () => {
      const expiredValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now() - 20000, // old creation time
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'expired' }
        },
        expires: Date.now() - 10000, // already expired
        ttl: -10000
      };

      const validValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'valid' }
        },
        expires: Date.now() + 10000, // not expired
        ttl: 10000
      };

      // Mock isExpired and canStale for testing
      const buildModule = require('./build.js');
      jest.spyOn(buildModule, 'isExpired').mockReturnValue(true);
      jest.spyOn(buildModule, 'canStale').mockReturnValue(false);

      // Fill storage nearly to capacity
      for (let i = 0; i < 4; i++) {
        mockStorage.setItem(`test-prefix-key${i}`, JSON.stringify(validValue));
      }

      // Add an expired item
      mockStorage.setItem('test-prefix-expired', JSON.stringify(expiredValue));

      // This should trigger cleanup of expired items when storage is full
      await storage.set('new-key', validValue);

      expect(mockStorage.getItem('test-prefix-expired')).toBeNull();
      expect(mockStorage.getItem('test-prefix-new-key')).not.toBeNull();
    });

    it('should handle storage full scenario by removing oldest values when no expired items exist', async () => {
      const oldValue: StorageValue = {
        state: 'cached',
        createdAt: 100000, // old timestamp
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'old' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      const newValue: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'new' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      // Fill storage to capacity
      for (let i = 0; i < 5; i++) {
        mockStorage.setItem(`test-prefix-key${i}`, JSON.stringify(newValue));
      }

      // Try to set another item - this should remove the oldest items
      await storage.set('new-key', oldValue);

      // Since all items are valid (not expired), the oldest one should be removed
      expect(mockStorage.getItem('test-prefix-new-key')).not.toBeNull();
    });

    it('should clear the target key if storage is completely full and no items can be removed', async () => {
      const value: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'test' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      // First, populate storage with items using direct access to bypass capacity
      (mockStorage as any).store['test-prefix-any-key'] = JSON.stringify(value);
      Object.defineProperty(mockStorage, 'test-prefix-any-key', {
        value: JSON.stringify(value),
        enumerable: true,
        configurable: true
      });

      // Add other items to fill up "storage"
      for (let i = 0; i < 6; i++) {
        (mockStorage as any).store[`test-prefix-key${i}`] = JSON.stringify(value);
        Object.defineProperty(mockStorage, `test-prefix-key${i}`, {
          value: JSON.stringify(value),
          enumerable: true,
          configurable: true
        });
      }

      // Now spy on setItem to always throw
      const mockSetItemSpy = jest.spyOn(MockStorage.prototype, 'setItem');
      mockSetItemSpy.mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      // This should trigger the error handling and remove the target key
      await storage.set('any-key', value);

      // The behavior in the original code is to remove the target key in the final catch block
      expect(mockStorage.getItem('test-prefix-any-key')).toBeNull();
    });
  });

  describe('default prefix', () => {
    it('should use default prefix when none provided', async () => {
      // Create a fresh mock storage for this test
      const freshMockStorage = new MockStorage();

      // Temporarily modify capacity for this test since internal operations might
      // require more space than initially expected
      (freshMockStorage as any).setItem = function(key: string, value: string) {
        // Allow unlimited storage for this specific test
        this.store[key] = value;
        Object.defineProperty(this, key, {
          value,
          enumerable: true,
          configurable: true
        });
      };

      const defaultStorage = buildWebStorage(freshMockStorage); // no prefix provided

      const value: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'hello' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      // Check if we can store the item
      await defaultStorage.set('test-key', value);

      const storedItem = freshMockStorage.getItem('axios-cache-test-key');
      expect(storedItem).not.toBeNull();
    });
  });

  describe('prefix collision prevention', () => {
    it('should not interfere with other storage items with different prefixes', async () => {
      const value: StorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'ours' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      };

      const otherValue = JSON.stringify({
        state: 'cached',
        createdAt: Date.now(),
        data: {
          headers: {},
          status: 200,
          statusText: 'OK',
          data: { message: 'theirs' }
        },
        expires: Date.now() + 10000,
        ttl: 10000
      });

      // Add item with our prefix through our storage interface
      await storage.set('our-key', value);
      // Add item with different prefix directly to the underlying storage
      // Bypass capacity check by setting directly in the store
      (mockStorage as any).store['other-prefix-their-key'] = otherValue;
      // Make sure this key is enumerable too
      Object.defineProperty(mockStorage, 'other-prefix-their-key', {
        value: otherValue,
        enumerable: true,
        configurable: true
      });

      // Clear our storage
      storage.clear();

      // Our key should be gone, but the other prefix key should remain
      expect(mockStorage.getItem('test-prefix-our-key')).toBeNull();
      expect(mockStorage.getItem('other-prefix-their-key')).not.toBeNull();
    });
  });

  describe('internal "is-storage" property', () => {
    it('should have the internal identifier', () => {
      expect((storage as any)['is-storage']).toBe(1);
    });
  });
});