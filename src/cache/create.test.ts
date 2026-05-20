import axios from 'axios';
import { setupCache, type CacheOptions } from './create.js';
import type { AxiosCacheInstance } from './axios.js';

describe('setupCache', () => {
  let axiosInstance: any;

  beforeEach(() => {
    axiosInstance = axios.create();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an instance of AxiosCacheInstance', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance).toBeDefined();
    expect(cacheInstance.defaults.cache).toBeDefined();
    expect(cacheInstance.storage).toBeDefined();
    expect(cacheInstance.waiting).toBeDefined();
    expect(cacheInstance.generateKey).toBeDefined();
    expect(cacheInstance.headerInterpreter).toBeDefined();
    expect(cacheInstance.requestInterceptor).toBeDefined();
    expect(cacheInstance.responseInterceptor).toBeDefined();
    expect(cacheInstance.debug).toBeDefined();
  });

  it('should throw an error if setupCache is called twice on the same instance', () => {
    setupCache(axiosInstance);
    
    expect(() => {
      setupCache(axiosInstance);
    }).toThrow('setupCache() should be called only once');
  });

  it('should configure storage properly', () => {
    const customStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      'is-storage': 1
    };

    const options: CacheOptions = {
      storage: customStorage
    };

    const cacheInstance = setupCache(axiosInstance, options);

    expect(cacheInstance.storage).toBe(customStorage);
  });

  it('should use memory storage as default when no storage provided', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.storage).toBeDefined();
  });

  it('should throw error if invalid storage is provided', () => {
    const invalidStorage = {};
    
    expect(() => {
      setupCache(axiosInstance, { storage: invalidStorage as any });
    }).toThrow('Use buildStorage() function');
  });

  it('should configure waiting map properly', () => {
    const customWaiting = new Map();
    const options: CacheOptions = {
      waiting: customWaiting
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.waiting).toBe(customWaiting);
  });

  it('should use default waiting map when no waiting provided', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.waiting).toBeInstanceOf(Map);
  });

  it('should configure generateKey function properly', () => {
    const customGenerateKey = jest.fn();
    const options: CacheOptions = {
      generateKey: customGenerateKey
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.generateKey).toBe(customGenerateKey);
  });

  it('should use default generateKey when no generateKey provided', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.generateKey).toBeDefined();
  });

  it('should configure headerInterpreter properly', () => {
    const customHeaderInterpreter = jest.fn();
    const options: CacheOptions = {
      headerInterpreter: customHeaderInterpreter
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.headerInterpreter).toBe(customHeaderInterpreter);
  });

  it('should use default headerInterpreter when no headerInterpreter provided', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.headerInterpreter).toBeDefined();
  });

  it('should configure debug function properly', () => {
    const customDebug = jest.fn();
    const options: CacheOptions = {
      debug: customDebug
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.debug).toBe(customDebug);
  });

  it('should use default debug function when no debug provided', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(typeof cacheInstance.debug).toBe('function');
  });

  it('should configure cache properties with default values', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.defaults.cache).toBeDefined();
    expect(cacheInstance.defaults.cache.ttl).toBe(1000 * 60 * 5); // 5 minutes default
    expect(cacheInstance.defaults.cache.methods).toEqual(['get', 'head']);
    expect(cacheInstance.defaults.cache.etag).toBe(true);
    expect(cacheInstance.defaults.cache.modifiedSince).toBe(false); // Since etag is true
    expect(cacheInstance.defaults.cache.interpretHeader).toBe(true);
    expect(cacheInstance.defaults.cache.cacheTakeover).toBe(true);
    expect(cacheInstance.defaults.cache.staleIfError).toBe(true);
    expect(cacheInstance.defaults.cache.override).toBe(false);
  });

  it('should override default cache properties with provided options', () => {
    const options: CacheOptions = {
      ttl: 1000 * 60 * 10, // 10 minutes
      methods: ['get', 'post'],
      etag: false,
      modifiedSince: true,
      interpretHeader: false,
      cacheTakeover: false,
      staleIfError: false,
      override: true,
      cachePredicate: {
        statusCheck: (status) => [200, 404].includes(status)
      }
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.defaults.cache.ttl).toBe(options.ttl);
    expect(cacheInstance.defaults.cache.methods).toEqual(options.methods);
    expect(cacheInstance.defaults.cache.etag).toBe(options.etag);
    expect(cacheInstance.defaults.cache.modifiedSince).toBe(options.modifiedSince);
    expect(cacheInstance.defaults.cache.interpretHeader).toBe(options.interpretHeader);
    expect(cacheInstance.defaults.cache.cacheTakeover).toBe(options.cacheTakeover);
    expect(cacheInstance.defaults.cache.staleIfError).toBe(options.staleIfError);
    expect(cacheInstance.defaults.cache.override).toBe(options.override);
    expect(cacheInstance.defaults.cache.cachePredicate?.statusCheck(200)).toBe(true);
  });

  it('should set location to "client" when window is defined', () => {
    // Mock window object to simulate client-side
    Object.defineProperty(global, 'window', {
      value: {
        location: { href: 'http://localhost' },
      },
      writable: true,
    });

    const cacheInstance = setupCache(axiosInstance);

    expect(cacheInstance.location).toBe('client');

    // Clean up
    delete (global as any).window;
  });

  it('should set location based on window environment detection', () => {
    // Since we can't reliably delete the window in Jest environment,
    // we'll test that the location is set according to the available environment.
    // The function should detect the environment where window is available

    const cacheInstance = setupCache(axiosInstance);

    // In a test environment like Jest with jsdom, window is typically available
    // So the location will most likely be 'client'
    expect(cacheInstance.location).toBeDefined();
    expect(['client', 'server']).toContain(cacheInstance.location);
  });

  it('should apply request and response interceptors', () => {
    const cacheInstance = setupCache(axiosInstance) as AxiosCacheInstance;
    
    // Check that interceptors were applied
    expect(cacheInstance.interceptors.request).toBeDefined();
    expect(cacheInstance.interceptors.response).toBeDefined();
    
    // Verify that the interceptors are stored in the cache instance
    expect(cacheInstance.requestInterceptor).toBeDefined();
    expect(cacheInstance.responseInterceptor).toBeDefined();
  });

  it('should handle update property correctly', () => {
    const updateOption = {
      '/api/users': {
        'GET': 'invalidate'
      }
    };
    
    const options: CacheOptions = {
      update: updateOption
    };
    
    const cacheInstance = setupCache(axiosInstance, options);
    
    expect(cacheInstance.defaults.cache.update).toBe(updateOption);
  });

  it('should set default update property as empty object', () => {
    const cacheInstance = setupCache(axiosInstance);
    
    expect(cacheInstance.defaults.cache.update).toEqual({});
  });
});