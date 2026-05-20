import type { AxiosInterceptorManager } from 'axios';
import type { CacheAxiosResponse, InternalCacheRequestConfig } from '../cache/axios.js';
import type { AxiosInterceptor, RequestInterceptor, ResponseInterceptor } from './build';

describe('Build Interceptor Types', () => {
  // Mock types to test with
  type MockRequestConfig = InternalCacheRequestConfig<unknown, unknown>;
  type MockResponse = CacheAxiosResponse<unknown, unknown>;

  describe('AxiosInterceptor', () => {
    it('should have onFulfilled method that transforms input to output of same type', () => {
      const mockInterceptor: AxiosInterceptor<MockRequestConfig> = {
        onFulfilled: (value: MockRequestConfig) => {
          // Should return the same type or a promise of the same type
          return value;
        },
      };

      expect(mockInterceptor.onFulfilled).toBeDefined();
      expect(typeof mockInterceptor.onFulfilled).toBe('function');
    });

    it('should optionally have onRejected method for error handling', () => {
      const mockInterceptor: AxiosInterceptor<MockRequestConfig> = {
        onFulfilled: (value: MockRequestConfig) => value,
        onRejected: (error: Record<string, unknown>) => {
          // Should return the same type or a promise of the same type
          throw error;
        },
      };

      expect(mockInterceptor.onRejected).toBeDefined();
      expect(typeof mockInterceptor.onRejected).toBe('function');
    });

    it('should handle promise returns in onFulfilled', async () => {
      const mockInterceptor: AxiosInterceptor<MockRequestConfig> = {
        onFulfilled: async (value: MockRequestConfig) => {
          // Simulate async transformation
          await new Promise(resolve => setTimeout(resolve, 0));
          return value;
        },
      };

      const mockConfig: MockRequestConfig = { url: 'test' } as MockRequestConfig;
      const result = await mockInterceptor.onFulfilled(mockConfig);
      expect(result).toEqual(mockConfig);
    });

    it('should handle promise returns in onRejected', async () => {
      const mockInterceptor: AxiosInterceptor<MockRequestConfig> = {
        onFulfilled: (value: MockRequestConfig) => value,
        onRejected: async (error: Record<string, unknown>) => {
          // Simulate async error handling that returns the config
          await new Promise(resolve => setTimeout(resolve, 0));
          return { url: 'fallback' } as MockRequestConfig;
        },
      };

      const mockError = { message: 'test error' };
      const result = await mockInterceptor.onRejected!(mockError);
      expect((result as MockRequestConfig).url).toBe('fallback');
    });
  });

  describe('RequestInterceptor', () => {
    it('should be compatible with InternalCacheRequestConfig type', () => {
      const requestInterceptor: RequestInterceptor = {
        onFulfilled: (value: InternalCacheRequestConfig<unknown, unknown>) => {
          // Verify the type is correctly applied
          expect(value).toBeDefined();
          return value;
        },
      };

      expect(requestInterceptor.onFulfilled).toBeDefined();
    });

    it('should handle request config transformations', () => {
      const requestInterceptor: RequestInterceptor = {
        onFulfilled: (config: InternalCacheRequestConfig<unknown, unknown>) => {
          // Example: Add a custom header
          return {
            ...config,
            headers: {
              ...(config.headers || {}),
              'X-Custom-Header': 'test',
            },
          };
        },
      };

      const mockConfig: InternalCacheRequestConfig<unknown, unknown> = {
        url: 'https://api.example.com/data',
        headers: { 'Content-Type': 'application/json' },
      } as InternalCacheRequestConfig<unknown, unknown>;

      const transformedConfig = requestInterceptor.onFulfilled(mockConfig);
      expect(transformedConfig.headers?.['X-Custom-Header']).toBe('test');
    });
  });

  describe('ResponseInterceptor', () => {
    it('should be compatible with CacheAxiosResponse type', () => {
      const responseInterceptor: ResponseInterceptor = {
        onFulfilled: (response: CacheAxiosResponse<unknown, unknown>) => {
          // Verify the type is correctly applied
          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          return response;
        },
      };

      expect(responseInterceptor.onFulfilled).toBeDefined();
    });

    it('should handle response transformations', () => {
      const responseInterceptor: ResponseInterceptor = {
        onFulfilled: (response: CacheAxiosResponse<unknown, unknown>) => {
          // Example: Add metadata to response
          return {
            ...response,
            config: response.config,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            request: response.request,
            responseTime: Date.now(),
          } as CacheAxiosResponse<unknown, unknown>;
        },
      };

      const mockResponse: CacheAxiosResponse<unknown, unknown> = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: 'test' } as any,
        request: {},
      } as CacheAxiosResponse<unknown, unknown>;

      const transformedResponse = responseInterceptor.onFulfilled(mockResponse);
      expect(transformedResponse).toBeDefined();
    });

    it('should handle response error case in onRejected', () => {
      const responseInterceptor: ResponseInterceptor = {
        onFulfilled: (response: CacheAxiosResponse<unknown, unknown>) => response,
        onRejected: (error: Record<string, unknown>) => {
          // Example: Create a mock response in case of error
          return {
            data: { error: true },
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: {} as any,
            request: {},
          } as CacheAxiosResponse<unknown, unknown>;
        },
      };

      const mockError = { message: 'Network error' };
      const fallbackResponse = responseInterceptor.onRejected!(mockError);
      expect((fallbackResponse as CacheAxiosResponse<unknown, unknown>).status).toBe(500);
    });
  });

  describe('Type Compatibility', () => {
    it('should confirm RequestInterceptor extends AxiosInterceptor with correct generic type', () => {
      // This test verifies that the type definitions are consistent
      const testFunction = (interceptor: AxiosInterceptor<InternalCacheRequestConfig<unknown, unknown>>) => {
        return interceptor;
      };

      const requestInterceptor: RequestInterceptor = {
        onFulfilled: (value: InternalCacheRequestConfig<unknown, unknown>) => value,
      };

      // This should compile without errors if types are compatible
      const result = testFunction(requestInterceptor);
      expect(result).toEqual(requestInterceptor);
    });

    it('should confirm ResponseInterceptor extends AxiosInterceptor with correct generic type', () => {
      // This test verifies that the type definitions are consistent
      const testFunction = (interceptor: AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>) => {
        return interceptor;
      };

      const responseInterceptor: ResponseInterceptor = {
        onFulfilled: (value: CacheAxiosResponse<unknown, unknown>) => value,
      };

      // This should compile without errors if types are compatible
      const result = testFunction(responseInterceptor);
      expect(result).toEqual(responseInterceptor);
    });
  });
});