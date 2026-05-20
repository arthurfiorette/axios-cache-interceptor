import { buildKeyGenerator, defaultKeyGenerator } from './key-generator.js';
import type { CacheRequestConfig } from '../cache/axios.js';

describe('key-generator', () => {
  describe('buildKeyGenerator', () => {
    it('should generate a key based on the custom generator function', () => {
      const customGenerator = buildKeyGenerator((request) => ({
        url: request.url,
        method: request.method
      }));

      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET'
      };

      const key = customGenerator(request);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should return the request id if present', () => {
      const customGenerator = buildKeyGenerator((request) => ({
        url: request.url,
        method: request.method
      }));

      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET',
        id: 'custom-id'
      };

      const key = customGenerator(request);
      expect(key).toBe('custom-id');
    });

    it('should handle string keys directly', () => {
      const stringKeyGenerator = buildKeyGenerator((request) => `custom-${request.url}`);

      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET'
      };

      const key = stringKeyGenerator(request);
      expect(key).toBe('custom-/api/users');
    });

    it('should handle numeric keys directly', () => {
      const numericKeyGenerator = buildKeyGenerator((request) => 12345);

      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET'
      };

      const key = numericKeyGenerator(request);
      expect(key).toBe('12345');
    });

    it('should hash complex objects', () => {
      const complexGenerator = buildKeyGenerator((request) => ({
        url: request.url,
        method: request.method,
        data: request.data,
        params: request.params
      }));

      const request1: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'John' },
        params: { active: true }
      };

      const request2: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'John' },
        params: { active: true }
      };

      const key1 = complexGenerator(request1);
      const key2 = complexGenerator(request2);

      expect(typeof key1).toBe('string');
      expect(typeof key2).toBe('string');
      expect(key1).toBe(key2); // Same requests should generate same key
    });

    it('should handle different objects generating different hashes', () => {
      const complexGenerator = buildKeyGenerator((request) => ({
        url: request.url,
        method: request.method,
        data: request.data
      }));

      const request1: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'John' }
      };

      const request2: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'Jane' }
      };

      const key1 = complexGenerator(request1);
      const key2 = complexGenerator(request2);

      expect(key1).not.toBe(key2); // Different requests should generate different keys
    });
  });

  describe('defaultKeyGenerator', () => {
    it('should generate keys based on url, method, params and data', () => {
      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET',
        params: { limit: 10 },
        data: { name: 'John' }
      };

      const key = defaultKeyGenerator(request);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should normalize method to lowercase', () => {
      const request1: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET'
      };

      const request2: CacheRequestConfig = {
        url: '/api/users',
        method: 'get'
      };

      const key1 = defaultKeyGenerator(request1);
      const key2 = defaultKeyGenerator(request2);

      expect(key1).toBe(key2); // Same method in different cases should generate same key
    });

    it('should handle undefined request properties gracefully', () => {
      const request: CacheRequestConfig = {};

      const key = defaultKeyGenerator(request);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should remove trailing slashes from url and baseURL to avoid different keys', () => {
      const request1: CacheRequestConfig = {
        baseURL: 'https://api.example.com/',
        url: '/users/'
      };

      const request2: CacheRequestConfig = {
        baseURL: 'https://api.example.com',
        url: '/users'
      };

      const key1 = defaultKeyGenerator(request1);
      const key2 = defaultKeyGenerator(request2);

      expect(key1).toBe(key2); // Trailing slashes should be normalized
    });

    it('should properly concatenate baseURL and url', () => {
      const requestWithBaseURL: CacheRequestConfig = {
        baseURL: 'https://api.example.com',
        url: 'users'
      };

      const requestWithoutSlash: CacheRequestConfig = {
        baseURL: 'https://api.example.com',
        url: '/users'
      };

      const key1 = defaultKeyGenerator(requestWithBaseURL);
      const key2 = defaultKeyGenerator(requestWithoutSlash);

      // Both should normalize to the same concatenated URL and produce same hash
      expect(key1).toBe(key2);
    });

    it('should handle params correctly', () => {
      // Test with params
      const requestWithParams: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET',
        params: { page: 1, limit: 10 }
      };

      // Test without params
      const requestWithoutParams: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET',
        params: undefined
      };

      const keyWithParams = defaultKeyGenerator(requestWithParams);
      const keyWithoutParams = defaultKeyGenerator(requestWithoutParams);

      // Requests with different params should generate different keys
      expect(keyWithParams).not.toBe(keyWithoutParams);
    });

    it('should handle data correctly', () => {
      // Test with data
      const requestWithData: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: { name: 'John', age: 30 }
      };

      // Test without data
      const requestWithoutData: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        data: undefined
      };

      const keyWithData = defaultKeyGenerator(requestWithData);
      const keyWithoutData = defaultKeyGenerator(requestWithoutData);

      // Requests with different data should generate different keys
      expect(keyWithData).not.toBe(keyWithoutData);
    });

    it('should generate different keys for different methods', () => {
      const getRequest: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET'
      };

      const postRequest: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST'
      };

      const getKey = defaultKeyGenerator(getRequest);
      const postKey = defaultKeyGenerator(postRequest);

      expect(getKey).not.toBe(postKey);
    });

    it('should generate same key for same requests', () => {
      const request1: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        params: { id: 1 },
        data: { name: 'John' }
      };

      const request2: CacheRequestConfig = {
        url: '/api/users',
        method: 'POST',
        params: { id: 1 },
        data: { name: 'John' }
      };

      const key1 = defaultKeyGenerator(request1);
      const key2 = defaultKeyGenerator(request2);

      expect(key1).toBe(key2);
    });
  });

  describe('edge cases', () => {
    it('should handle null or undefined params and data', () => {
      const request: CacheRequestConfig = {
        url: '/api/users',
        method: 'GET',
        params: undefined,
        data: undefined
      };

      const key = defaultKeyGenerator(request);
      expect(typeof key).toBe('string');
    });

    it('should handle empty strings for url and baseURL', () => {
      const request: CacheRequestConfig = {
        url: '',
        baseURL: ''
      };

      const key = defaultKeyGenerator(request);
      expect(typeof key).toBe('string');
    });

    it('should handle different param ordering producing same hash', () => {
      const genKey = (params: Record<string, any>) => {
        const request: CacheRequestConfig = {
          url: '/api/users',
          method: 'GET',
          params: params
        };
        return defaultKeyGenerator(request);
      };

      // The order of properties in objects should not matter for hashing
      const key1 = genKey({ a: 1, b: 2 });
      const key2 = genKey({ b: 2, a: 1 });

      expect(key1).toBe(key2);
    });
  });
});