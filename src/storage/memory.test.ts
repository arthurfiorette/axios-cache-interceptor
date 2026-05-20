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
  });