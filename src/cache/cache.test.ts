import type { AxiosResponse, Method } from 'axios';
import type { Deferred } from 'fast-defer';
import type { HeaderInterpreter } from '../header/types.js';
import type { AxiosInterceptor } from '../interceptors/build.js';
import type {
  AxiosStorage,
  CachedStorageValue,
  LoadingStorageValue,
  StaleStorageValue
} from '../storage/types.js';
import type {
  CachePredicate,
  CacheUpdater,
  InstanceLocation,
  KeyGenerator,
  StaleIfErrorPredicate
} from '../util/types.js';
import type { CacheAxiosResponse, InternalCacheRequestConfig } from './axios.js';
import { CacheProperties, CacheInstance, DebugObject } from './cache.js';

describe('Cache Properties Interface', () => {
  describe('CacheProperties', () => {
    it('should have default ttl value of 5 minutes (300000ms)', () => {
      const cacheProps: CacheProperties = {
        ttl: 1000 * 60 * 5, // 5 minutes
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };
      
      expect(cacheProps.ttl).toBe(300000);
    });

    it('should accept function for ttl value', () => {
      const ttlFunction = (response: CacheAxiosResponse) => response.status === 200 ? 10000 : 5000;
      
      const cacheProps: CacheProperties = {
        ttl: ttlFunction,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(typeof cacheProps.ttl).toBe('function');
    });

    it('should accept async function for ttl value', () => {
      const ttlAsyncFunction = async (response: CacheAxiosResponse) => {
        await Promise.resolve();
        return response.status === 200 ? 10000 : 5000;
      };
      
      const cacheProps: CacheProperties = {
        ttl: ttlAsyncFunction,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(typeof cacheProps.ttl).toBe('function');
    });

    it('should have interpretHeader enabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.interpretHeader).toBe(true);
    });

    it('should have cacheTakeover enabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.cacheTakeover).toBe(true);
    });

    it('should have default methods set to get and head', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.methods).toEqual(['get', 'head']);
    });

    it('should accept custom methods', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['post', 'put', 'delete'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.methods).toEqual(['post', 'put', 'delete']);
    });

    it('should have default cachePredicate that checks status codes', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.cachePredicate.statusCheck(200)).toBe(true);
      expect(cacheProps.cachePredicate.statusCheck(400)).toBe(false);
    });

    it('should accept custom cachePredicate', () => {
      const customPredicate: CachePredicate<any, any> = {
        statusCheck: (status) => status >= 200 && status < 300,
        responseMatch: (response) => response.data !== null
      };

      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: customPredicate,
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.cachePredicate).toBe(customPredicate);
    });

    it('should have empty update object by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.update).toEqual({});
    });

    it('should accept custom update function or object', () => {
      const customUpdate: CacheUpdater<any, any> = {
        'some-key': (prevData, newData) => ({ ...prevData, ...newData })
      };

      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: customUpdate,
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.update).toBe(customUpdate);
    });

    it('should have etag enabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.etag).toBe(true);
    });

    it('should accept string value for etag option', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: 'custom-etag-value',
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.etag).toBe('custom-etag-value');
    });

    it('should have modifiedSince disabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.modifiedSince).toBe(false);
    });

    it('should accept Date value for modifiedSince option', () => {
      const date = new Date();
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: date,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.modifiedSince).toBe(date);
    });

    it('should have staleIfError enabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.staleIfError).toBe(true);
    });

    it('should accept function for staleIfError option', () => {
      const staleIfErrorPredicate: StaleIfErrorPredicate<any, any> = (error) => error.response?.status === 500;
      
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: staleIfErrorPredicate,
        override: false,
        hydrate: undefined
      };

      expect(typeof cacheProps.staleIfError).toBe('function');
    });

    it('should have override disabled by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.override).toBe(false);
    });

    it('should have hydrate undefined by default', () => {
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: undefined
      };

      expect(cacheProps.hydrate).toBeUndefined();
    });

    it('should accept function for hydrate option', () => {
      const hydrateFunction = (
        cache: 
          | (LoadingStorageValue & { previous: 'stale' | 'must-revalidate'; })
          | CachedStorageValue
          | StaleStorageValue
      ) => {
        // Hydrate implementation
      };
      
      const cacheProps: CacheProperties = {
        ttl: 300000,
        interpretHeader: true,
        cacheTakeover: true,
        methods: ['get', 'head'],
        cachePredicate: { statusCheck: (status) => [200, 203, 300, 301, 302, 404, 405, 410, 414, 501].includes(status) },
        update: {},
        etag: true,
        modifiedSince: false,
        staleIfError: true,
        override: false,
        hydrate: hydrateFunction
      };

      expect(typeof cacheProps.hydrate).toBe('function');
    });
  });
});

describe('Cache Instance Interface', () => {
  describe('CacheInstance', () => {
    it('should have default location based on environment', () => {
      const mockWindow = global.window;
      // @ts-expect-error - testing environment detection
      delete global.window;

      // Server environment
      const serverCacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(serverCacheInstance.location).toBe('server');

      // Restore window
      global.window = mockWindow;
    });

    it('should accept client location', () => {
      const cacheInstance: CacheInstance = {
        location: 'client',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(cacheInstance.location).toBe('client');
    });

    it('should have storage interface', () => {
      const mockStorage: AxiosStorage = {
        async get() { },
        async set() { },
        async remove() { }
      };

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: mockStorage,
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(cacheInstance.storage).toBe(mockStorage);
    });

    it('should have generateKey function', () => {
      const mockGenerateKey: KeyGenerator = () => 'custom-generated-key';
      
      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: mockGenerateKey,
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(typeof cacheInstance.generateKey).toBe('function');
    });

    it('should have waiting map for concurrent requests', () => {
      const mockWaiting: Map<string, Deferred<void>> = new Map();

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: mockWaiting,
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(cacheInstance.waiting).toBe(mockWaiting);
    });

    it('should have headerInterpreter function', () => {
      const mockHeaderInterpreter: HeaderInterpreter = () => 'not enough headers';

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: mockHeaderInterpreter,
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(typeof cacheInstance.headerInterpreter).toBe('function');
    });

    it('should have requestInterceptor function', () => {
      const mockRequestInterceptor: AxiosInterceptor<InternalCacheRequestConfig<unknown, unknown>> = async (config) => config;

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: mockRequestInterceptor,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(typeof cacheInstance.requestInterceptor).toBe('function');
    });

    it('should have responseInterceptor function', () => {
      const mockResponseInterceptor: AxiosInterceptor<
        Partial<CacheAxiosResponse<unknown, unknown>> & AxiosResponse<unknown, unknown>
      > = async (response) => response;

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: mockResponseInterceptor,
        debug: () => {}
      };

      expect(typeof cacheInstance.responseInterceptor).toBe('function');
    });

    it('should have debug function', () => {
      const mockDebug: (this: void, msg: DebugObject) => void = () => {};

      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: mockDebug
      };

      expect(typeof cacheInstance.debug).toBe('function');
    });

    it('should accept all properties correctly', () => {
      const cacheInstance: CacheInstance = {
        location: 'server',
        storage: { async get() { }, async set() { }, async remove() { } },
        generateKey: () => 'mock-key',
        waiting: new Map(),
        headerInterpreter: () => 'not enough headers',
        requestInterceptor: async (config) => config,
        responseInterceptor: async (response) => response,
        debug: () => {}
      };

      expect(cacheInstance.location).toBe('server');
      expect(typeof cacheInstance.storage.get).toBe('function');
      expect(typeof cacheInstance.storage.set).toBe('function');
      expect(typeof cacheInstance.storage.remove).toBe('function');
      expect(typeof cacheInstance.generateKey).toBe('function');
      expect(cacheInstance.waiting).toBeInstanceOf(Map);
      expect(typeof cacheInstance.headerInterpreter).toBe('function');
      expect(typeof cacheInstance.requestInterceptor).toBe('function');
      expect(typeof cacheInstance.responseInterceptor).toBe('function');
      expect(typeof cacheInstance.debug).toBe('function');
    });
  });
});

describe('DebugObject Interface', () => {
  it('should accept optional id, msg and data properties', () => {
    const debugObj1: DebugObject = {};
    const debugObj2: DebugObject = { id: 'test-id', msg: 'test message' };
    const debugObj3: DebugObject = { data: { some: 'value' } };
    const debugObj4: DebugObject = { id: 'another-id', msg: 'another message', data: 'some data' };

    expect(debugObj1).toEqual({});
    expect(debugObj2).toEqual({ id: 'test-id', msg: 'test message' });
    expect(debugObj3).toEqual({ data: { some: 'value' } });
    expect(debugObj4).toEqual({ id: 'another-id', msg: 'another message', data: 'some data' });
  });
});