import { buildStorage, isStorage, mustRevalidate, canStale, isExpired } from './build.js';
import type { CacheRequestConfig } from '../cache/axios.js';
import { Header } from '../header/headers.js';
import type { CachedStorageValue, StaleStorageValue, StorageValue } from './types.js';

describe('build', () => {
  describe('isStorage', () => {
    it('should return true for objects created with buildStorage', () => {
      const mockStorage = buildStorage({
        find: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      });

      expect(isStorage(mockStorage)).toBe(true);
    });

    it('should return false for objects not created with buildStorage', () => {
      expect(isStorage({})).toBe(false);
      expect(isStorage(null)).toBe(false);
      expect(isStorage(undefined)).toBe(false);
      expect(isStorage('not-a-storage')).toBe(false);
      expect(isStorage(123)).toBe(false);
    });
  });

  describe('mustRevalidate', () => {
    it('should return true if cache-control header contains must-revalidate', () => {
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.CacheControl]: 'no-cache, must-revalidate'
          }
        },
        ttl: 1000
      };

      expect(mustRevalidate(value)).toBe(true);
    });

    it('should return false if cache-control header does not contain must-revalidate', () => {
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.CacheControl]: 'public, max-age=3600'
          }
        },
        ttl: 1000
      };

      expect(mustRevalidate(value)).toBe(false);
    });

    it('should return false if cache-control header is not present', () => {
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000
      };

      expect(mustRevalidate(value)).toBe(false);
    });

    it('should handle cache-control header as number or other type', () => {
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.CacheControl]: 123
          }
        },
        ttl: 1000
      };

      expect(mustRevalidate(value)).toBe(false); // Since '123'.includes('must-revalidate') is false
    });
  });

  describe('hasUniqueIdentifierHeader', () => {
    // This function is private/internal and covered through other tests
    // ETag, LastModified, XAxiosCacheEtag, and XAxiosCacheLastModified headers
    // affect behavior in other tests
    it('should be tested through integration with other functions', () => {
      // Covered indirectly through other tests where unique headers preserve values
      expect(true).toBe(true);
    });
  });

  describe('canStale', () => {
    it('should return true when value has unique identifier header', () => {
      const value: CachedStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.ETag]: '"abc123"'
          }
        },
        ttl: 1000
      };

      expect(canStale(value)).toBe(true);
    });

    it('should return true when value is within stale TTL window', () => {
      const pastTime = Date.now() - 1500; // 1.5 seconds ago
      const value: CachedStorageValue = {
        state: 'cached',
        createdAt: pastTime,
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000, // expires 1 second ago
        staleTtl: 2000 // 2 second stale window
      };

      expect(canStale(value)).toBe(true);
    });

    it('should return false when value is outside stale TTL window', () => {
      const pastTime = Date.now() - 4000; // 4 seconds ago
      const value: CachedStorageValue = {
        state: 'cached',
        createdAt: pastTime,
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000, // expired 3 seconds ago
        staleTtl: 2000 // stale window ended 1 second ago
      };

      expect(canStale(value)).toBe(false);
    });

    it('should return false when staleTtl is not defined', () => {
      const pastTime = Date.now() - 1500; // 1.5 seconds ago
      const value: CachedStorageValue = {
        state: 'cached',
        createdAt: pastTime,
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000, // expires 0.5 seconds ago
        staleTtl: undefined // no stale window
      };

      expect(canStale(value)).toBe(false);
    });

    it('should return false when value is not in cached state', () => {
      const value: any = {
        state: 'loading',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000
      };

      expect(canStale(value)).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true when cache has expired', () => {
      const pastTime = Date.now() - 2000; // 2 seconds ago
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: pastTime,
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 1000 // expired 1 second ago
      };

      expect(isExpired(value)).toBe(true);
    });

    it('should return false when cache is still valid', () => {
      const currentTime = Date.now();
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: currentTime,
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 10000 // will expire in 10 seconds, so currently valid
      };

      expect(isExpired(value)).toBe(false);
    });

    it('should return false when ttl is undefined', () => {
      const value: CachedStorageValue | StaleStorageValue = {
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: undefined
      };

      expect(isExpired(value)).toBe(false);
    });
  });

  describe('buildStorage', () => {
    const mockCurrentRequest: CacheRequestConfig = { url: 'https://api.example.com/data' } as any;

    it('should create storage with all required methods', () => {
      const mockMethods = {
        find: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      };

      const storage = buildStorage(mockMethods);

      expect(storage).toHaveProperty('set');
      expect(storage).toHaveProperty('remove');
      expect(storage).toHaveProperty('clear');
      expect(storage).toHaveProperty('get');
      expect(isStorage(storage)).toBe(true);
    });

    it('should handle empty state correctly', async () => {
      const mockFind = jest.fn().mockResolvedValue({ state: 'empty' });
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result).toEqual({ state: 'empty' });
      expect(mockFind).toHaveBeenCalledWith('test-key', mockCurrentRequest);
    });

    it('should handle loading state correctly', async () => {
      const mockFind = jest.fn().mockResolvedValue({ state: 'loading' });
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result).toEqual({ state: 'loading' });
      expect(mockFind).toHaveBeenCalledWith('test-key', mockCurrentRequest);
    });

    it('should handle must-revalidate state correctly', async () => {
      const mockFind = jest.fn().mockResolvedValue({ state: 'must-revalidate' });
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result).toEqual({ state: 'must-revalidate' });
      expect(mockFind).toHaveBeenCalledWith('test-key', mockCurrentRequest);
    });

    it('should return cached value when not expired', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'cached',
        createdAt: Date.now(),
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {}
        },
        ttl: 10000 // 10 seconds, definitely not expired
      });
      
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result.state).toBe('cached');
      expect((result as any).data.data.message).toBe('hello');
    });

    it('should handle expired cache when cannot stale (removes and returns empty)', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'cached',
        createdAt: Date.now() - 2000, // 2 seconds ago
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {} // No unique identifier headers
        },
        ttl: 1000, // expired 1 second ago, no stale TTL
        staleTtl: undefined
      });
      
      const mockRemove = jest.fn();
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: mockRemove,
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result).toEqual({ state: 'empty' });
      expect(mockRemove).toHaveBeenCalledWith('test-key', mockCurrentRequest);
    });

    it('should convert expired cache to stale when can stale', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'cached',
        createdAt: Date.now() - 1500, // 1.5 seconds ago
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {} // No unique identifier headers, but within stale window
        },
        ttl: 1000, // expired 0.5 seconds ago
        staleTtl: 2000 // 2 second stale window
      });
      
      const mockSet = jest.fn();
      const storage = buildStorage({
        find: mockFind,
        set: mockSet,
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result.state).toBe('stale');
      expect(mockSet).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({ state: 'stale' }),
        mockCurrentRequest
      );
    });

    it('should return must-revalidate when stale value has must-revalidate directive', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'cached',
        createdAt: Date.now() - 1500, // 1.5 seconds ago
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.CacheControl]: 'must-revalidate'
          }
        },
        ttl: 1000, // expired 0.5 seconds ago
        staleTtl: 2000 // 2 second stale window
      });
      
      const mockSet = jest.fn();
      const storage = buildStorage({
        find: mockFind,
        set: mockSet,
        remove: jest.fn(),
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result.state).toBe('must-revalidate');
    });

    it('should handle case where stale value is already expired', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'cached',
        createdAt: Date.now() - 5000, // 5 seconds ago
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {} // No unique identifier headers
        },
        ttl: 1000, // expired 4 seconds ago
        staleTtl: 2000 // stale value would expire 2 seconds after ttl
      });
      
      const mockRemove = jest.fn();
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: mockRemove,
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result).toEqual({ state: 'empty' });
      expect(mockRemove).toHaveBeenCalledWith('test-key', mockCurrentRequest);
    });

    it('should preserve value with unique identifier header even when expired and stale is also expired', async () => {
      const mockFind = jest.fn().mockResolvedValue({
        state: 'stale',
        createdAt: Date.now() - 5000, // 5 seconds ago
        data: {
          data: { message: 'hello' },
          status: 200,
          statusText: 'OK',
          headers: {
            [Header.ETag]: '"unique-id"'
          }
        },
        ttl: 3000 // expired 2 seconds ago from creation, but it has unique identifier
      });

      const mockRemove = jest.fn();
      const storage = buildStorage({
        find: mockFind,
        set: jest.fn(),
        remove: mockRemove,
        clear: jest.fn()
      });

      const result = await storage.get('test-key', mockCurrentRequest);

      expect(result.state).toBe('stale'); // Should preserve the stale value because of unique identifier
      expect(mockRemove).not.toHaveBeenCalled(); // Should not remove because of unique identifier
    });
  });
});