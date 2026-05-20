import type { Method } from 'axios';
import type { CacheAxiosResponse, CacheRequestConfig } from '../cache/axios.js';
import type { CacheProperties } from '../cache/cache.js';
import { Header } from '../header/headers.js';
import type {
  CachedResponse,
  MustRevalidateStorageValue,
  StaleStorageValue
} from '../storage/types.js';
import { createValidateStatus, isMethodIn, updateStaleRequest, createCacheResponse, type ConfigWithCache } from './util.js';

describe('Interceptor Utilities', () => {
  describe('createValidateStatus', () => {
    it('should return default validation function when oldValidate is undefined', () => {
      const validateStatus = createValidateStatus(undefined);
      
      expect(validateStatus(200)).toBe(true);  // Success status
      expect(validateStatus(299)).toBe(true);  // Success status
      expect(validateStatus(300)).toBe(false); // Redirect (not success)
      expect(validateStatus(400)).toBe(false); // Client error
      expect(validateStatus(500)).toBe(false); // Server error
      expect(validateStatus(304)).toBe(true);  // Special case: Not Modified
    });

    it('should return custom validation function when oldValidate is provided', () => {
      const oldValidate = (status: number) => status >= 400 && status < 500; // Custom rule
      const validateStatus = createValidateStatus(oldValidate);

      expect(validateStatus(200)).toBe(false); // Doesn't meet oldValidate condition
      expect(validateStatus(404)).toBe(true);  // Meets oldValidate condition
      expect(validateStatus(304)).toBe(true);  // Always true for 304 regardless of oldValidate
    });

    it('should handle oldValidate returning true for non-304 status', () => {
      const oldValidate = (status: number) => status >= 200 && status < 400;
      const validateStatus = createValidateStatus(oldValidate);

      expect(validateStatus(200)).toBe(true);  // Meets oldValidate condition
      expect(validateStatus(300)).toBe(true);  // Meets oldValidate condition
      expect(validateStatus(400)).toBe(false); // Doesn't meet oldValidate condition
      expect(validateStatus(304)).toBe(true);  // Always true for 304
    });
  });

  describe('isMethodIn', () => {
    it('should return true when method is in the list (case insensitive)', () => {
      const methods: Method[] = ['get', 'post', 'put']; // Methods should be in lowercase

      expect(isMethodIn('get', methods)).toBe(true);
      expect(isMethodIn('GET', methods)).toBe(true);
      expect(isMethodIn('post', methods)).toBe(true);
      expect(isMethodIn('Post', methods)).toBe(true);
      expect(isMethodIn('put', methods)).toBe(true);
    });

    it('should return false when method is not in the list', () => {
      const methods: Method[] = ['get', 'post']; // Methods should be in lowercase

      expect(isMethodIn('DELETE', methods)).toBe(false);
      expect(isMethodIn('PATCH', methods)).toBe(false);
      expect(isMethodIn('PUT', methods)).toBe(false);
    });

    it('should handle empty method list', () => {
      expect(isMethodIn('GET', [])).toBe(false);
      expect(isMethodIn('POST', [])).toBe(false);
    });

    it('should use default method "get" when method is undefined', () => {
      expect(isMethodIn(undefined, ['get', 'post'])).toBe(true);
    });

    it('should handle empty string as an empty string (not default to get)', () => {
      expect(isMethodIn('', ['get', 'post'])).toBe(false); // Empty string doesn't match 'get'
      expect(isMethodIn('', [''])).toBe(true); // Empty string matches array with empty string
    });

    it('should handle lowercase method names correctly', () => {
      const methods: Method[] = ['get', 'post'];

      expect(isMethodIn('GET', methods)).toBe(true);
      expect(isMethodIn('POST', methods)).toBe(true);
    });
  });

  describe('updateStaleRequest', () => {
    it('should handle when neither etag nor modifiedSince are set', () => {
      const cache: StaleStorageValue = {
        data: {
          headers: { [Header.ETag]: 'test-etag' }
        } as any,
        createdAt: Date.now()
      };
      
      const config: ConfigWithCache<any> = {
        headers: { 'existing-header': 'value' },
        cache: {}
      };
      
      updateStaleRequest(cache, config);
      
      expect(config.headers).toEqual({ 'existing-header': 'value' });
    });
  });

  describe('createCacheResponse', () => {
    it('should handle 304 Not Modified response with previous cache', () => {
      const response: CacheAxiosResponse<any, any> = {
        status: 304,
        data: 'new-data', // This should be replaced with cached data
        statusText: 'Not Modified',
        headers: { 'new-header': 'value' },
        config: {} as any
      };
      
      const previousCache: CachedResponse = {
        data: 'cached-data',
        status: 200,
        statusText: 'OK',
        headers: { 'cached-header': 'cached-value' }
      };
      
      const result = createCacheResponse(response, previousCache);
      
      expect(result).toBe(previousCache);
      expect(response.cached).toBe(true);
      expect(response.data).toBe('cached-data');
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.headers).toEqual({
        'cached-header': 'cached-value',
        'new-header': 'value'
      });
    });

    it('should return new response when status is not 304', () => {
      const response: CacheAxiosResponse<any, any> = {
        status: 200,
        data: 'new-data',
        statusText: 'OK',
        headers: { 'new-header': 'value' },
        config: {} as any
      };
      
      const result = createCacheResponse(response);
      
      expect(result).toEqual({
        data: 'new-data',
        status: 200,
        statusText: 'OK',
        headers: { 'new-header': 'value' }
      });
    });

    it('should handle 304 without previous cache (should create new response)', () => {
      const response: CacheAxiosResponse<any, any> = {
        status: 304,
        data: 'new-data',
        statusText: 'Not Modified',
        headers: { 'new-header': 'value' },
        config: {} as any
      };
      
      const result = createCacheResponse(response);
      
      expect(result).toEqual({
        data: 'new-data',
        status: 304,
        statusText: 'Not Modified',
        headers: { 'new-header': 'value' }
      });
    });

    it('should merge headers properly when handling 304 response', () => {
      const response: CacheAxiosResponse<any, any> = {
        status: 304,
        data: 'new-data',
        statusText: 'Not Modified',
        headers: { 
          'new-header': 'new-value',
          'conflicting-header': 'new-conflict-value' // This should override cached value
        },
        config: {} as any
      };
      
      const previousCache: CachedResponse = {
        data: 'cached-data',
        status: 200,
        statusText: 'OK',
        headers: { 
          'cached-header': 'cached-value',
          'conflicting-header': 'cached-conflict-value' // This should be overridden
        }
      };
      
      const result = createCacheResponse(response, previousCache);
      
      expect(response.headers).toEqual({
        'cached-header': 'cached-value',
        'new-header': 'new-value',
        'conflicting-header': 'new-conflict-value' // Actually cached value takes precedence in the merged object
      });
      expect(response.headers).toEqual({
        'cached-header': 'cached-value',
        'new-header': 'new-value',
        'conflicting-header': 'new-conflict-value'
      });
    });
    
    it('should preserve original response unchanged when status is not 304', () => {
      const originalResponse: CacheAxiosResponse<any, any> = {
        status: 201,
        data: 'created-data',
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        config: {} as any
      };
      
      const result = createCacheResponse(originalResponse);
      
      expect(result).toEqual({
        data: 'created-data',
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' }
      });
    });
  });
});