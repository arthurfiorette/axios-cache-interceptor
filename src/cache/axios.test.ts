import type {
  CacheAxiosResponse,
  CacheRequestConfig,
  InternalCacheRequestConfig,
  AxiosCacheInstance
} from './axios';

// Mock axios types to avoid making network requests
interface MockAxiosInstance {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
  head: jest.Mock;
  options: jest.Mock;
  defaults: any;
  interceptors: {
    request: any;
    response: any;
  };
  request: jest.Mock;
  getUri: jest.Mock;
}

// Mock axios.create
const mockAxiosCreate = (): MockAxiosInstance => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  defaults: {
    headers: {
      common: {}
    },
    cache: {
      ttl: 60000
    }
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  request: jest.fn(),
  getUri: jest.fn()
});

describe('Axios Cache Types', () => {
  describe('CacheAxiosResponse', () => {
    it('should extend AxiosResponse with cache-specific properties', () => {
      // Create a mock response that satisfies the CacheAxiosResponse interface
      const mockResponse: CacheAxiosResponse<string, { test: string }> = {
        data: 'test data',
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {
          url: '/test',
          method: 'GET',
          headers: { 'content-type': 'application/json' }
        } as InternalCacheRequestConfig<string, { test: string }>,
        id: 'test-id',
        cached: false,
        stale: undefined
      };

      expect(mockResponse.data).toBe('test data');
      expect(mockResponse.status).toBe(200);
      expect(mockResponse.id).toBe('test-id');
      expect(mockResponse.cached).toBe(false);
      expect('stale' in mockResponse).toBe(true);
    });

    it('should allow stale property to be optional', () => {
      const responseWithoutStale: CacheAxiosResponse = {
        data: 'test',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalCacheRequestConfig,
        id: 'test-id',
        cached: true
        // Note: stale is not provided, which should be valid
      };

      expect(responseWithoutStale.stale).toBeUndefined();
    });
  });

  describe('CacheRequestConfig', () => {
    it('should extend AxiosRequestConfig with cache-specific properties', () => {
      const config: CacheRequestConfig<string, { payload: string }> = {
        url: '/api/test',
        method: 'POST',
        data: { payload: 'data' },
        id: 'custom-id',
        cache: {
          ttl: 60000,
          cacheTakeover: true
        }
      };

      expect(config.url).toBe('/api/test');
      expect(config.method).toBe('POST');
      expect(config.id).toBe('custom-id');
      expect(config.cache).toBeDefined();
      expect((config.cache as any).ttl).toBe(60000);
    });

    it('should allow disabling cache with false', () => {
      const config: CacheRequestConfig = {
        url: '/api/test',
        cache: false
      };

      expect(config.cache).toBe(false);
    });

    it('should accept partial cache properties', () => {
      const config: CacheRequestConfig = {
        url: '/api/test',
        cache: {
          ttl: 5000
        }
      };

      expect(config.cache).toBeDefined();
      expect((config.cache as any).ttl).toBe(5000);
      expect((config.cache as any).cacheTakeover).toBeUndefined(); // Should be optional
    });
  });

  describe('InternalCacheRequestConfig', () => {
    it('should extend CacheRequestConfig with typed headers', () => {
      const config: InternalCacheRequestConfig<string, { test: string }> = {
        url: '/api/test',
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'value'
        },
        id: 'internal-test-id'
      };

      expect(config.url).toBe('/api/test');
      expect(config.headers).toBeDefined();
      expect(config.id).toBe('internal-test-id');
    });
  });

  describe('AxiosCacheInstance', () => {
    it('should provide extended axios methods with cache capabilities', async () => {
      // Mock an axios instance that implements AxiosCacheInstance
      const mockAxiosInstance = mockAxiosCreate();

      const mockCacheInstance: AxiosCacheInstance = {
        ...mockAxiosInstance,
        get: jest.fn().mockResolvedValue({
          data: 'test',
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as InternalCacheRequestConfig,
          id: 'mock-id',
          cached: false
        }),
        defaults: {
          ...mockAxiosInstance.defaults,
          cache: {
            ttl: 60000
          }
        },
        interceptors: mockAxiosInstance.interceptors,
        getUri: jest.fn().mockReturnValue('/test-uri'),
        request: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        head: jest.fn().mockResolvedValue({}),
        options: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValue({}),
        postForm: jest.fn().mockResolvedValue({}),
        put: jest.fn().mockResolvedValue({}),
        putForm: jest.fn().mockResolvedValue({}),
        patch: jest.fn().mockResolvedValue({})
      };

      // Test that the instance is defined
      expect(mockCacheInstance).toBeDefined();
      expect(mockCacheInstance.get).toBeDefined();
      expect(mockCacheInstance.post).toBeDefined();
      expect(mockCacheInstance.getUri).toBeDefined();

      // Test functionality without making network calls
      const response1 = await mockCacheInstance.get('/test', {
        id: 'test-id',
        cache: { ttl: 30000 }
      });
      expect(response1).toBeDefined();
      expect(mockCacheInstance.get).toHaveBeenCalledWith('/test', {
        id: 'test-id',
        cache: { ttl: 30000 }
      });

      const response2 = await mockCacheInstance.post('/test', { data: 'payload' }, {
        id: 'post-id',
        cache: false
      });
      expect(response2).toBeDefined();
      expect(mockCacheInstance.post).toHaveBeenCalledWith('/test', { data: 'payload' }, {
        id: 'post-id',
        cache: false
      });

      const uri = mockCacheInstance.getUri({ url: '/test' });
      expect(uri).toBe('/test-uri');
    });

    it('should have properly typed generic methods', () => {
      const mockAxiosInstance = mockAxiosCreate();
      const instance: AxiosCacheInstance = {
        ...mockAxiosInstance,
        get: jest.fn().mockResolvedValue({ data: 'test' }),
        post: jest.fn().mockResolvedValue({ data: 123 }),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: null }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        head: jest.fn().mockResolvedValue({ data: {} }),
        options: jest.fn().mockResolvedValue({ data: {} }),
        defaults: mockAxiosInstance.defaults,
        interceptors: mockAxiosInstance.interceptors,
        request: jest.fn().mockResolvedValue({ data: {} }),
        getUri: jest.fn(),
        postForm: jest.fn().mockResolvedValue({ data: {} }),
        putForm: jest.fn().mockResolvedValue({ data: {} }),
        patchForm: jest.fn().mockResolvedValue({ data: {} })
      };

      // These should compile without type errors and return properly typed promises
      const getCall = instance.get<string>('/test', {
        id: 'typed-get',
        cache: { ttl: 10000 }
      });
      expect(getCall).toBeDefined();

      const postCall = instance.post<number, { input: string }>('/test', { input: 'value' }, {
        id: 'typed-post'
      });
      expect(postCall).toBeDefined();

      const requestCall = instance.request<{ result: string }>({
        url: '/test',
        id: 'typed-request'
      });
      expect(requestCall).toBeDefined();
    });

    it('should have interceptors with proper typing', () => {
      const mockInterceptors = {
        request: {
          use: jest.fn(),
          eject: jest.fn()
        },
        response: {
          use: jest.fn(),
          eject: jest.fn()
        }
      };

      const instance = {
        interceptors: mockInterceptors
      } as AxiosCacheInstance;

      // These should work without type errors
      instance.interceptors.request.use(
        (config: InternalCacheRequestConfig) => Promise.resolve(config),
        (error: any) => Promise.reject(error)
      );

      instance.interceptors.response.use(
        (response: Partial<CacheAxiosResponse> & { data: any; status: number; headers: any }) => Promise.resolve(response),
        (error: any) => Promise.reject(error)
      );

      expect(instance.interceptors.request.use).toHaveBeenCalled();
      expect(instance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should have properly typed form methods', () => {
      const mockAxiosInstance = mockAxiosCreate();
      const instance: AxiosCacheInstance = {
        ...mockAxiosInstance,
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: {} }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        head: jest.fn().mockResolvedValue({ data: {} }),
        options: jest.fn().mockResolvedValue({ data: {} }),
        defaults: mockAxiosInstance.defaults,
        interceptors: mockAxiosInstance.interceptors,
        request: jest.fn().mockResolvedValue({ data: {} }),
        getUri: jest.fn(),
        postForm: jest.fn().mockResolvedValue({ data: {} }),
        putForm: jest.fn().mockResolvedValue({ data: {} }),
        patchForm: jest.fn().mockResolvedValue({ data: {} })
      };

      // These should compile without type errors
      const postFormPromise = instance.postForm<string>('/form', { field: 'value' }, {
        id: 'post-form-id'
      });
      expect(postFormPromise).toBeDefined();

      const putFormPromise = instance.putForm<string>('/form', { field: 'value' }, {
        id: 'put-form-id'
      });
      expect(putFormPromise).toBeDefined();

      const patchFormPromise = instance.patchForm<string>('/form', { field: 'value' }, {
        id: 'patch-form-id'
      });
      expect(patchFormPromise).toBeDefined();
    });
  });

  describe('Generic Type Compatibility', () => {
    it('should maintain type safety across generic parameters', () => {
      // Define a specific response type
      interface ApiResponse {
        id: number;
        name: string;
        timestamp: Date;
      }

      // Define a specific request type
      interface ApiRequest {
        query: string;
        filters: Record<string, string>;
      }

      // This should work with proper typing
      const config: CacheRequestConfig<ApiResponse, ApiRequest> = {
        url: '/api/search',
        method: 'POST',
        data: {
          query: 'search term',
          filters: { category: 'tech' }
        },
        id: 'search-request',
        cache: {
          ttl: 30000
        }
      };

      // Response should be properly typed
      const response: CacheAxiosResponse<ApiResponse, ApiRequest> = {
        data: {
          id: 1,
          name: 'Test Item',
          timestamp: new Date()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as InternalCacheRequestConfig<ApiResponse, ApiRequest>,
        id: 'search-response',
        cached: true
      };

      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Test Item');
      expect(response.cached).toBe(true);
    });

    it('should handle promise return types correctly', () => {
      const mockAxiosInstance = mockAxiosCreate();
      const instance: AxiosCacheInstance = {
        ...mockAxiosInstance,
        get: jest.fn().mockResolvedValue({ data: 'test result' }),
        post: jest.fn().mockResolvedValue({ data: 42 }),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: null }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        head: jest.fn().mockResolvedValue({ data: {} }),
        options: jest.fn().mockResolvedValue({ data: {} }),
        defaults: mockAxiosInstance.defaults,
        interceptors: mockAxiosInstance.interceptors,
        request: jest.fn().mockResolvedValue({ data: {} }),
        getUri: jest.fn(),
        postForm: jest.fn().mockResolvedValue({ data: {} }),
        putForm: jest.fn().mockResolvedValue({ data: {} }),
        patchForm: jest.fn().mockResolvedValue({ data: {} })
      };

      const getPromise: Promise<CacheAxiosResponse<string>> = instance.get<string>('/test');
      const postPromise: Promise<CacheAxiosResponse<number, { data: string }>> =
        instance.post<number, { data: string }>('/test', { data: 'value' });

      expect(getPromise).toBeDefined();
      expect(postPromise).toBeDefined();
    });
  });
});