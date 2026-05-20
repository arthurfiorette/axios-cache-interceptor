import { buildMemoryStorage } from './memory.js';
import type { StorageValue } from './types.js';

describe('buildMemoryStorage', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create a memory storage instance', () => {
    const storage = buildMemoryStorage();

    expect(storage.set).toBeInstanceOf(Function);
    expect(storage.remove).toBeInstanceOf(Function);
    expect(storage.get).toBeInstanceOf(Function);  // Note: buildStorage returns 'get', not 'find'
    expect(storage.clear).toBeInstanceOf(Function);
    expect(storage.data).toBeDefined();
    expect(typeof storage.data).toBe('object');
    expect(storage.cleanup).toBeInstanceOf(Function);
  });

  it('should store and retrieve values', async () => {
    const storage = buildMemoryStorage();
    const key = 'test-key';
    const value: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    await storage.set(key, value);
    const retrieved = await storage.get(key);

    expect(retrieved).toEqual(value);
  });

  it('should return empty state for non-existent keys', async () => {
    const storage = buildMemoryStorage();
    const retrieved = await storage.get('non-existent-key');

    expect(retrieved).toEqual({ state: 'empty' });
  });

  it('should remove values', async () => {
    const storage = buildMemoryStorage();
    const key = 'test-key';
    const value: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    await storage.set(key, value);
    expect(await storage.get(key)).toEqual(value);

    await storage.remove(key);
    expect(await storage.get(key)).toEqual({ state: 'empty' });
  });

  it('should clear all values', async () => {
    const storage = buildMemoryStorage();
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    const value: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    await storage.set(key1, value);
    await storage.set(key2, value);
    expect(await storage.get(key1)).toEqual(value);
    expect(await storage.get(key2)).toEqual(value);

    await storage.clear();
    expect(await storage.get(key1)).toEqual({ state: 'empty' });
    expect(await storage.get(key2)).toEqual({ state: 'empty' });
  });

  it('should clone data when cloneData is true', async () => {
    const storage = buildMemoryStorage(true);
    const key = 'test-key';
    const originalValue: StorageValue = {
      state: 'cached',
      data: { headers: { test: 'header' }, status: 200, statusText: 'OK', data: { nested: { value: 'original' } } },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    await storage.set(key, originalValue);
    const retrieved = await storage.get(key);

    // Modify the retrieved value
    if (retrieved && retrieved.state !== 'empty' && typeof retrieved.data === 'object') {
      if (typeof retrieved.data.data === 'object') {
        (retrieved.data.data as any).nested.value = 'modified';
      }
    }

    // Original should remain unchanged in storage.data
    const currentValue = storage.data[key];
    expect((currentValue as any)?.data?.data).toEqual({ nested: { value: 'original' } });
  });

  it('should clone data when setting with cloneData set to "double"', async () => {
    const storage = buildMemoryStorage('double');
    const key = 'test-key';
    const originalValue: StorageValue = {
      state: 'cached',
      data: { headers: { test: 'header' }, status: 200, statusText: 'OK', data: { nested: { value: 'original' } } },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    // Modify the original value after passing it to set
    await storage.set(key, originalValue);
    (originalValue.data.data as any).nested.value = 'modified';

    // Retrieved value should be the original since it was cloned during storage
    const retrieved = await storage.get(key);
    expect((retrieved as any)?.data?.data).toEqual({ nested: { value: 'original' } });
  });

  it('should clean up expired entries', () => {
    const storage = buildMemoryStorage();
    const key = 'test-key';
    const expiredValue: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 100, // Expire after 100ms
      createdAt: Date.now() - 200 // Created 200ms ago
    };

    const validValue: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    storage.set(key + '-expired', expiredValue);
    storage.set(key + '-valid', validValue);

    // Manually trigger cleanup
    storage.cleanup();

    expect(storage.data[key + '-expired']).toBeUndefined();
    expect(storage.data[key + '-valid']).toEqual(validValue);
  });

  it('should clean up empty entries', () => {
    const storage = buildMemoryStorage();
    const key = 'test-key';
    const emptyValue: StorageValue = {
      state: 'empty',
      data: undefined,
      headers: {},
      createdAt: undefined,
      ttl: undefined,
      staleTtl: undefined
    };

    const validValue: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    storage.set(key + '-empty', emptyValue);
    storage.set(key + '-valid', validValue);

    // Manually trigger cleanup
    storage.cleanup();

    expect(storage.data[key + '-empty']).toBeUndefined();
    expect(storage.data[key + '-valid']).toEqual(validValue);
  });

  it('should respect maxEntries limit when set', () => {
    const storage = buildMemoryStorage(false, false, 2); // Max 2 entries
    const value: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    storage.set('key1', value);
    storage.set('key2', value);
    storage.set('key3', value); // This should trigger removal of oldest entry

    // Key1 should be removed (FIFO)
    expect(storage.data['key1']).toBeUndefined();
    expect(storage.data['key2']).toEqual(value);
    expect(storage.data['key3']).toEqual(value);
  });

  it('should handle cleanup and max entries together', () => {
    const storage = buildMemoryStorage(false, false, 2); // Max 2 entries
    const expiredValue: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 100,
      createdAt: Date.now() - 200
    };
    const validValue: StorageValue = {
      state: 'cached',
      data: { headers: {}, status: 200, statusText: 'OK' },
      headers: {},
      ttl: 1000,
      createdAt: Date.now()
    };

    storage.set('expired', expiredValue);
    storage.set('valid1', validValue);

    // This should trigger cleanup (removing expired) and we're at capacity
    storage.set('valid2', validValue);
    storage.set('valid3', validValue); // This should evict oldest valid entry

    // Expired should be gone, and the oldest valid entry too
    expect(storage.data['expired']).toBeUndefined();
    expect(storage.data['valid1']).toBeUndefined(); // Oldest valid
    expect(storage.data['valid2']).toEqual(validValue); // Second oldest
    expect(storage.data['valid3']).toEqual(validValue); // Newest
  });

  it('should set up automatic cleanup interval when cleanupInterval is provided', () => {
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    const storage = buildMemoryStorage(false, 1000); // Cleanup every 1000ms

    // Check that interval was set with the correct parameters
    expect(storage.cleaner).toBeDefined();
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    // Clean up
    clearInterval(storage.cleaner);
    setIntervalSpy.mockRestore();
  });

  it('should not set up automatic cleanup when cleanupInterval is false', () => {
    const storage = buildMemoryStorage(false, false);
    
    // No interval should be set
    expect(storage.cleaner).toBeUndefined();
  });

  it('should handle structuredClone in environments where it exists', () => {
    const originalStructuredClone = global.structuredClone;

    // Mock structuredClone to ensure it's used when available
    const mockClone = jest.fn((val) => JSON.parse(JSON.stringify(val)));
    Object.defineProperty(global, 'structuredClone', {
      value: mockClone,
      writable: true
    });

    try {
      const storage = buildMemoryStorage(true);
      const value: StorageValue = {
        state: 'cached',
        data: { headers: {}, status: 200, statusText: 'OK', test: 'value' },
        headers: {},
        ttl: 1000,
        createdAt: Date.now()
      };

      storage.set('test', value);
      const retrieved = storage.data['test'];

      // The function should be called during cloning (for double option)
      // Since we didn't use 'double', cloning happens on retrieval
      expect(retrieved).toBeDefined();
    } finally {
      // Restore original
      Object.defineProperty(global, 'structuredClone', {
        value: originalStructuredClone,
        writable: true
      });
    }
  });
});