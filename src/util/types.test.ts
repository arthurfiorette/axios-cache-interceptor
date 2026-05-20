import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios.js';
import type { CachedStorageValue, LoadingStorageValue, StorageValue } from '../storage/types.js';
import {
  type CachePredicate,
  type CachePredicateObject,
  type InstanceLocation,
  type KeyGenerator,
  type MaybePromise,
  type StaleIfErrorPredicate,
  type CacheUpdater,
  type CacheUpdaterFn,
  type CacheUpdaterRecord
} from './types.js';

// Helper function to simulate a promise for testing MaybePromise
async function asyncValue<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

describe('Types Utility Tests', () => {
  describe('MaybePromise', () => {
    it('should handle synchronous values', () => {
      const syncValue: MaybePromise<string> = 'hello';
      expect(syncValue).toBe('hello');
    });

    it('should handle Promise values', async () => {
      const promiseValue: MaybePromise<string> = asyncValue('world');
      await expect(Promise.resolve(promiseValue)).resolves.toBe('world');
    });

    it('should handle PromiseLike values', async () => {
      const promiseLikeValue: MaybePromise<number> = {
        then: (resolve) => resolve(42)
      };
      
      await expect(Promise.resolve(promiseLikeValue)).resolves.toBe(42);
    });
  });

  describe('InstanceLocation', () => {
    it('should only accept client or server values', () => {
      const clientLocation: InstanceLocation = 'client';
      const serverLocation: InstanceLocation = 'server';
      
      expect(clientLocation).toBe('client');
      expect(serverLocation).toBe('server');
    });
  });

  describe('CachePredicateObject', () => {
    it('should accept statusCheck function', () => {
      const predicate: CachePredicateObject<string, number> = {
        statusCheck: (status: number) => status >= 200 && status < 300
      };
      
      expect(predicate.statusCheck).toBeDefined();
      expect(typeof predicate.statusCheck).toBe('function');
    });

    it('should accept containsHeaders object', () => {
      const predicate: CachePredicateObject<string, number> = {
        containsHeaders: {
          'content-type': (header) => header?.includes('application/json')
        }
      };
      
      expect(predicate.containsHeaders).toBeDefined();
      expect(predicate.containsHeaders!['content-type']).toBeDefined();
    });

    it('should accept responseMatch function', () => {
      const predicate: CachePredicateObject<string, number> = {
        responseMatch: (res: CacheAxiosResponse<string, number>) => res.data === 'success'
      };
      
      expect(predicate.responseMatch).toBeDefined();
      expect(typeof predicate.responseMatch).toBe('function');
    });

    it('should accept ignoreUrls array', () => {
      const predicate: CachePredicateObject<string, number> = {
        ignoreUrls: ['/api/ignore', /\/ignore\/.*/]
      };
      
      expect(predicate.ignoreUrls).toEqual(['/api/ignore', /\/ignore\/.*/]);
    });

    it('should accept allowUrls array', () => {
      const predicate: CachePredicateObject<string, number> = {
        allowUrls: ['/api/allow', /\/allow\/.*/]
      };
      
      expect(predicate.allowUrls).toEqual(['/api/allow', /\/allow\/.*/]);
    });
  });

  describe('CachePredicate', () => {
    it('should accept CachePredicateObject', () => {
      const predicate: CachePredicate<string, number> = {
        statusCheck: (status: number) => status >= 200 && status < 300
      };
      
      expect(predicate).toBeDefined();
    });

    it('should accept responseMatch function directly', () => {
      const predicate: CachePredicate<string, number> = (res: CacheAxiosResponse<string, number>) => res.data === 'success';
      
      expect(predicate).toBeDefined();
      expect(typeof predicate).toBe('function');
    });
  });

  describe('KeyGenerator', () => {
    it('should be a function that takes CacheRequestConfig and returns string', () => {
      const keyGen: KeyGenerator<string, number> = (options: CacheRequestConfig<string, number>) => {
        return options.url || 'default-key';
      };
      
      const mockOptions: CacheRequestConfig<string, number> = { url: '/api/test' };
      const result = keyGen(mockOptions);
      
      expect(result).toBe('/api/test');
    });
  });

  describe('StaleIfErrorPredicate', () => {
    it('should accept number value', () => {
      const predicate: StaleIfErrorPredicate<string, number> = 300; // 5 minutes
      
      expect(predicate).toBe(300);
    });

    it('should accept boolean value', () => {
      const predicate: StaleIfErrorPredicate<string, number> = true;
      
      expect(predicate).toBe(true);
    });

    it('should accept function that returns MaybePromise<number | boolean>', async () => {
      const predicate: StaleIfErrorPredicate<string, number> = (
        networkResponse: CacheAxiosResponse<string, number> | undefined,
        cache: LoadingStorageValue & { previous: 'stale' },
        error: Record<string, unknown>
      ) => {
        return networkResponse ? 60 : false;
      };
      
      const mockResponse: CacheAxiosResponse<string, number> = {
        data: 'test',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/test' }
      } as CacheAxiosResponse<string, number>;
      
      const mockCache: LoadingStorageValue & { previous: 'stale' } = {
        previous: 'stale',
        state: 'loading'
      } as LoadingStorageValue & { previous: 'stale' };
      
      const mockError: Record<string, unknown> = {};
      
      const result = predicate(mockResponse, mockCache, mockError);
      
      if (typeof result === 'object' && result !== null && 'then' in result) {
        await expect(Promise.resolve(result)).resolves.toBe(60);
      } else {
        expect(result).toBe(60);
      }
    });
  });

  describe('CacheUpdater', () => {
    it('should accept CacheUpdaterFn', () => {
      const updater: CacheUpdaterFn<string, number> = (response: CacheAxiosResponse<string, number>) => {
        // Perform update logic
        return Promise.resolve();
      };
      
      expect(updater).toBeDefined();
      expect(typeof updater).toBe('function');
    });

    it('should accept CacheUpdaterRecord', () => {
      const record: CacheUpdaterRecord<string, number> = {
        'request-id-1': 'delete',
        'request-id-2': (cached: Exclude<StorageValue, LoadingStorageValue>, response: CacheAxiosResponse<string, number>) => {
          return {
            data: response.data,
            status: response.status,
            headers: response.headers,
            state: 'cached'
          } as CachedStorageValue;
        }
      };
      
      expect(record['request-id-1']).toBe('delete');
      expect(record['request-id-2']).toBeDefined();
    });

    it('should allow mixed CacheUpdater with function and record', () => {
      const updater: CacheUpdater<string, number> = {
        'update-id': (cached: Exclude<StorageValue, LoadingStorageValue>, response: CacheAxiosResponse<string, number>) => {
          return 'delete';
        }
      };
      
      expect(updater).toBeDefined();
    });
  });
});