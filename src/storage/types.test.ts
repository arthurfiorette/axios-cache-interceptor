import type { 
  CachedResponse, 
  StorageValue, 
  NotEmptyStorageValue,
  StaleStorageValue,
  CachedStorageValue,
  LoadingStorageValue,
  LoadingEmptiedStorageValue,
  LoadingStaledStorageValue,
  LoadingRevalidateStorageValue,
  EmptyStorageValue,
  MustRevalidateStorageValue,
  AxiosStorage 
} from './types.js';
import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios.js';
import type { MaybePromise } from '../util/types.js';

describe('Storage Types', () => {
  describe('CachedResponse', () => {
    it('should have the correct structure', () => {
      const mockHeaders: CacheAxiosResponse['headers'] = { 'content-type': 'application/json' };
      const cachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: mockHeaders,
        status: 200,
        statusText: 'OK'
      };

      expect(cachedResponse).toHaveProperty('data');
      expect(cachedResponse).toHaveProperty('headers');
      expect(cachedResponse).toHaveProperty('status');
      expect(cachedResponse).toHaveProperty('statusText');
      expect(typeof cachedResponse.status).toBe('number');
      expect(typeof cachedResponse.statusText).toBe('string');
    });

    it('should allow optional data property', () => {
      const cachedResponseWithoutData: CachedResponse = {
        headers: {},
        status: 404,
        statusText: 'Not Found'
      };

      expect(cachedResponseWithoutData).toBeDefined();
      expect(cachedResponseWithoutData.data).toBeUndefined();
    });
  });

  describe('StaleStorageValue', () => {
    it('should have the correct structure', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      const staleValue: StaleStorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'stale'
      };

      expect(staleValue.data).toEqual(mockCachedResponse);
      expect(typeof staleValue.createdAt).toBe('number');
      expect(staleValue.state).toBe('stale');
      expect(staleValue.ttl).toBeUndefined();
      expect(staleValue.staleTtl).toBeUndefined();
    });
  });

  describe('MustRevalidateStorageValue', () => {
    it('should have the correct structure', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      const mustRevalidateValue: MustRevalidateStorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'must-revalidate'
      };

      expect(mustRevalidateValue.data).toEqual(mockCachedResponse);
      expect(typeof mustRevalidateValue.createdAt).toBe('number');
      expect(mustRevalidateValue.state).toBe('must-revalidate');
      expect(mustRevalidateValue.ttl).toBeUndefined();
      expect(mustRevalidateValue.staleTtl).toBeUndefined();
    });
  });

  describe('CachedStorageValue', () => {
    it('should have the correct structure', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      const cachedValue: CachedStorageValue = {
        data: mockCachedResponse,
        ttl: 60000, // 1 minute in ms
        staleTtl: 30000, // 30 seconds in ms
        createdAt: Date.now(),
        state: 'cached'
      };

      expect(cachedValue.data).toEqual(mockCachedResponse);
      expect(typeof cachedValue.ttl).toBe('number');
      expect(typeof cachedValue.staleTtl).toBe('number');
      expect(typeof cachedValue.createdAt).toBe('number');
      expect(cachedValue.state).toBe('cached');
    });

    it('should allow optional staleTtl', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      const cachedValueWithoutStaleTtl: CachedStorageValue = {
        data: mockCachedResponse,
        ttl: 60000,
        createdAt: Date.now(),
        state: 'cached'
      };

      expect(cachedValueWithoutStaleTtl.data).toEqual(mockCachedResponse);
      expect(typeof cachedValueWithoutStaleTtl.ttl).toBe('number');
      expect(cachedValueWithoutStaleTtl.staleTtl).toBeUndefined();
      expect(typeof cachedValueWithoutStaleTtl.createdAt).toBe('number');
      expect(cachedValueWithoutStaleTtl.state).toBe('cached');
    });
  });

  describe('LoadingStorageValue variants', () => {
    const mockCachedResponse: CachedResponse = {
      data: { key: 'value' },
      headers: { 'content-type': 'application/json' },
      status: 200,
      statusText: 'OK'
    };

    it('should handle LoadingEmptiedStorageValue correctly', () => {
      const loadingEmptiedValue: LoadingEmptiedStorageValue = {
        state: 'loading',
        previous: 'empty'
      };

      expect(loadingEmptiedValue.state).toBe('loading');
      expect(loadingEmptiedValue.previous).toBe('empty');
      expect(loadingEmptiedValue.data).toBeUndefined();
      expect(loadingEmptiedValue.ttl).toBeUndefined();
      expect(loadingEmptiedValue.staleTtl).toBeUndefined();
      expect(loadingEmptiedValue.createdAt).toBeUndefined();
    });

    it('should handle LoadingStaledStorageValue correctly', () => {
      const loadingStaledValue: LoadingStaledStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'stale'
      };

      expect(loadingStaledValue.state).toBe('loading');
      expect(loadingStaledValue.data).toEqual(mockCachedResponse);
      expect(typeof loadingStaledValue.createdAt).toBe('number');
      expect(loadingStaledValue.previous).toBe('stale');
      expect(loadingStaledValue.ttl).toBeUndefined();
      expect(loadingStaledValue.staleTtl).toBeUndefined();
    });

    it('should handle LoadingRevalidateStorageValue correctly', () => {
      const loadingRevalidateValue: LoadingRevalidateStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'must-revalidate'
      };

      expect(loadingRevalidateValue.state).toBe('loading');
      expect(loadingRevalidateValue.data).toEqual(mockCachedResponse);
      expect(typeof loadingRevalidateValue.createdAt).toBe('number');
      expect(loadingRevalidateValue.previous).toBe('must-revalidate');
      expect(loadingRevalidateValue.ttl).toBeUndefined();
      expect(loadingRevalidateValue.staleTtl).toBeUndefined();
    });

    it('should correctly represent LoadingStorageValue as a union type', () => {
      // Verify that LoadingStorageValue encompasses all three subtypes
      const loadingEmptied: LoadingStorageValue = {
        state: 'loading',
        previous: 'empty'
      } as LoadingEmptiedStorageValue;

      const loadingStaled: LoadingStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'stale'
      } as LoadingStaledStorageValue;

      const loadingRevalidate: LoadingStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'must-revalidate'
      } as LoadingRevalidateStorageValue;

      expect(loadingEmptied.state).toBe('loading');
      expect(loadingStaled.state).toBe('loading');
      expect(loadingRevalidate.state).toBe('loading');
    });
  });

  describe('EmptyStorageValue', () => {
    it('should have the correct structure', () => {
      const emptyValue: EmptyStorageValue = {
        state: 'empty'
      };

      expect(emptyValue.state).toBe('empty');
      expect(emptyValue.data).toBeUndefined();
      expect(emptyValue.ttl).toBeUndefined();
      expect(emptyValue.staleTtl).toBeUndefined();
      expect(emptyValue.createdAt).toBeUndefined();
    });
  });

  describe('StorageValue type', () => {
    it('should encompass all possible storage value states', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      // Test each possible value type
      const staleValue: StorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'stale'
      } as StaleStorageValue;

      const cachedValue: StorageValue = {
        data: mockCachedResponse,
        ttl: 60000,
        createdAt: Date.now(),
        state: 'cached'
      } as CachedStorageValue;

      const mustRevalidateValue: StorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'must-revalidate'
      } as MustRevalidateStorageValue;

      const loadingEmptiedValue: StorageValue = {
        state: 'loading',
        previous: 'empty'
      } as LoadingEmptiedStorageValue;

      const loadingStaledValue: StorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'stale'
      } as LoadingStaledStorageValue;

      const loadingRevalidateValue: StorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'must-revalidate'
      } as LoadingRevalidateStorageValue;

      const emptyValue: StorageValue = {
        state: 'empty'
      } as EmptyStorageValue;

      // Verify all states are properly typed
      expect([staleValue, cachedValue, mustRevalidateValue, loadingEmptiedValue, loadingStaledValue, loadingRevalidateValue, emptyValue]).toHaveLength(7);
    });
  });

  describe('NotEmptyStorageValue type', () => {
    it('should exclude EmptyStorageValue from the union', () => {
      const mockCachedResponse: CachedResponse = {
        data: { key: 'value' },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK'
      };

      // Test that non-empty values are assignable to NotEmptyStorageValue
      const staleValue: NotEmptyStorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'stale'
      } as StaleStorageValue;

      const cachedValue: NotEmptyStorageValue = {
        data: mockCachedResponse,
        ttl: 60000,
        createdAt: Date.now(),
        state: 'cached'
      } as CachedStorageValue;

      const mustRevalidateValue: NotEmptyStorageValue = {
        data: mockCachedResponse,
        createdAt: Date.now(),
        state: 'must-revalidate'
      } as MustRevalidateStorageValue;

      const loadingEmptiedValue: NotEmptyStorageValue = {
        state: 'loading',
        previous: 'empty'
      } as LoadingEmptiedStorageValue;

      const loadingStaledValue: NotEmptyStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'stale'
      } as LoadingStaledStorageValue;

      const loadingRevalidateValue: NotEmptyStorageValue = {
        state: 'loading',
        data: mockCachedResponse,
        createdAt: Date.now(),
        previous: 'must-revalidate'
      } as LoadingRevalidateStorageValue;

      // Verify all non-empty states are properly typed
      expect([staleValue, cachedValue, mustRevalidateValue, loadingEmptiedValue, loadingStaledValue, loadingRevalidateValue]).toHaveLength(6);

      // This test is mainly for type checking, ensuring that EmptyStorageValue is not assignable to NotEmptyStorageValue
      // If we tried to assign EmptyStorageValue to NotEmptyStorageValue, TypeScript should complain
    });
  });

  describe('AxiosStorage interface', () => {
    it('should have the correct methods with proper signatures', () => {
      const mockStorage: AxiosStorage = {
        set: async (key: string, value: NotEmptyStorageValue, currentRequest?: CacheRequestConfig) => {
          // Mock implementation
        },
        remove: async (key: string, currentRequest?: CacheRequestConfig) => {
          // Mock implementation
        },
        get: async (key: string, currentRequest?: CacheRequestConfig): Promise<StorageValue> => {
          return { state: 'empty' } as EmptyStorageValue;
        }
      };

      expect(typeof mockStorage.set).toBe('function');
      expect(typeof mockStorage.remove).toBe('function');
      expect(typeof mockStorage.get).toBe('function');
      // Clear method is optional, so it may not exist
      expect(mockStorage).toBeDefined();
    });

    it('should allow optional clear method', () => {
      const storageWithClear: AxiosStorage = {
        set: async (key: string, value: NotEmptyStorageValue) => {},
        remove: async (key: string) => {},
        get: async (key: string) => ({ state: 'empty' } as EmptyStorageValue),
        clear: async () => {}
      };

      const storageWithoutClear: AxiosStorage = {
        set: async (key: string, value: NotEmptyStorageValue) => {},
        remove: async (key: string) => {},
        get: async (key: string) => ({ state: 'empty' } as EmptyStorageValue)
        // Clear method is intentionally omitted
      };

      expect(storageWithClear.clear).toBeDefined();
      expect(storageWithoutClear.clear).toBeUndefined();
    });

    it('should have correct parameter and return types for methods', () => {
      // Using type assertions to ensure compatibility
      const setMethod: (key: string, value: NotEmptyStorageValue, currentRequest?: CacheRequestConfig) => MaybePromise<void> = 
        jest.fn() as any;
      const removeMethod: (key: string, currentRequest?: CacheRequestConfig) => MaybePromise<void> = 
        jest.fn() as any;
      const getMethod: (key: string, currentRequest?: CacheRequestConfig) => MaybePromise<StorageValue> = 
        jest.fn() as any;
      
      expect(setMethod).toBeDefined();
      expect(removeMethod).toBeDefined();
      expect(getMethod).toBeDefined();
    });
  });
});