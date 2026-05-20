import type { CacheAxiosResponse } from '../cache/axios.js';
import type { AxiosStorage } from '../storage/types.js';
import type { CacheUpdater } from './types.js';
import { updateCache } from './update-cache.js';

// Mock types for testing
interface MockConfig {
  url?: string;
  method?: string;
}

interface MockData {
  id?: number;
  name?: string;
  value?: any;
}

describe('updateCache', () => {
  let mockStorage: jest.Mocked<AxiosStorage>;
  let mockResponse: CacheAxiosResponse<MockData, MockData>;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
    };

    mockResponse = {
      data: { id: 999, name: 'updated-data' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/test', method: 'GET' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call global cache updater function when cacheUpdater is a function', async () => {
    const globalUpdater = jest.fn();
    
    await updateCache(mockStorage, mockResponse, globalUpdater as CacheUpdater<MockData, MockData>);
    
    expect(globalUpdater).toHaveBeenCalledWith(mockResponse);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
    expect(mockStorage.remove).not.toHaveBeenCalled();
  });

  it('should delete cache entry when updater value is "delete"', async () => {
    const cacheUpdater = {
      'cache-key-1': 'delete',
    };

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    expect(mockStorage.remove).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(mockStorage.get).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  it('should skip updating cache if current state is "loading"', async () => {
    const cacheUpdater = {
      'cache-key-1': jest.fn().mockResolvedValue({ data: { id: 1 }, state: 'cached' }),
    };

    // Mock storage.get to return a "loading" state
    mockStorage.get.mockResolvedValue({
      data: null,
      headers: {},
      status: null,
      statusText: null,
      config: { url: '/api/cache-key-1' },
      state: 'loading',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    });

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(cacheUpdater['cache-key-1']).not.toHaveBeenCalled();
    expect(mockStorage.set).not.toHaveBeenCalled();
    expect(mockStorage.remove).not.toHaveBeenCalled();
  });

  it('should update cache with new value returned by updater function', async () => {
    const cacheUpdater = {
      'cache-key-1': async (currentValue: any, newData: any) => ({
        ...currentValue,
        data: { ...currentValue.data, ...newData.data },
      }),
    };

    const currentValue = {
      data: { id: 1, name: 'existing-data' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/cache-key-1' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    mockStorage.get.mockResolvedValue(currentValue);

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    // The updater combines current value with new data, so id comes from new data (999) and name from new data ('updated-data')
    expect(mockStorage.set).toHaveBeenCalledWith(
      'cache-key-1',
      expect.objectContaining({
        data: { id: 999, name: 'updated-data' }, // Updated with new data
        headers: {},
        status: 200,
        statusText: 'OK',
        config: { url: '/api/cache-key-1' },
        state: 'cached',
      }),
      mockResponse.config
    );
    expect(mockStorage.remove).not.toHaveBeenCalled();
  });

  it('should delete cache when updater returns "delete"', async () => {
    const cacheUpdater = {
      'cache-key-1': async () => 'delete' as const,
    };

    const currentValue = {
      data: { id: 1, name: 'existing-data' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/cache-key-1' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    mockStorage.get.mockResolvedValue(currentValue);

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(mockStorage.remove).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(mockStorage.set).not.toHaveBeenCalled();
  });

  it('should not update cache when updater returns "ignore"', async () => {
    const cacheUpdater = {
      'cache-key-1': async () => 'ignore' as const,
    };

    const currentValue = {
      data: { id: 1, name: 'existing-data' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/cache-key-1' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    mockStorage.get.mockResolvedValue(currentValue);

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(mockStorage.set).not.toHaveBeenCalled();
    expect(mockStorage.remove).not.toHaveBeenCalled();
  });

  it('should handle multiple cache keys with different update strategies', async () => {
    const cacheUpdater = {
      'cache-key-1': async (currentValue: any) => ({ ...currentValue, data: { ...currentValue.data, updated: true } }),
      'cache-key-2': 'delete',
      'cache-key-3': async () => 'ignore' as const,
    };

    const currentValue1 = {
      data: { id: 1, name: 'data1' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/cache-key-1' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    const currentValue3 = {
      data: { id: 3, name: 'data3' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/cache-key-3' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    mockStorage.get.mockImplementation((key: string) => {
      if (key === 'cache-key-1') return Promise.resolve(currentValue1);
      if (key === 'cache-key-3') return Promise.resolve(currentValue3);
      return Promise.resolve(null);
    });

    await updateCache(mockStorage, mockResponse, cacheUpdater);

    // Check that get was called for all keys except the 'delete' one
    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-1', mockResponse.config);
    expect(mockStorage.get).toHaveBeenCalledWith('cache-key-3', mockResponse.config);
    
    // Check that set was called only for 'cache-key-1'
    expect(mockStorage.set).toHaveBeenCalledWith(
      'cache-key-1',
      {
        ...currentValue1,
        data: { ...currentValue1.data, updated: true },
      },
      mockResponse.config
    );
    
    // Check that remove was called only for 'cache-key-2'
    expect(mockStorage.remove).toHaveBeenCalledWith('cache-key-2', mockResponse.config);
    
    // Set should have been called once, remove once
    expect(mockStorage.set).toHaveBeenCalledTimes(1);
    expect(mockStorage.remove).toHaveBeenCalledTimes(1);
  });

  it('should handle async operations properly', async () => {
    const asyncUpdater = async (currentValue: any, newData: any) => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 1));
      return {
        ...currentValue,
        data: { ...currentValue.data, value: newData.data.value || 'async-updated' },
      };
    };

    const cacheUpdater = {
      'async-cache-key': asyncUpdater,
    };

    const currentValue = {
      data: { id: 1, name: 'async-data' },
      headers: {},
      status: 200,
      statusText: 'OK',
      config: { url: '/api/async-key' },
      state: 'cached',
      createdAt: Date.now(),
      expires: Date.now() + 10000,
    };

    mockStorage.get.mockResolvedValue(currentValue);

    await updateCache(mockStorage, { ...mockResponse, data: { value: 'async-test' } }, cacheUpdater);

    expect(mockStorage.set).toHaveBeenCalledWith(
      'async-cache-key',
      {
        ...currentValue,
        data: { ...currentValue.data, value: 'async-test' },
      },
      mockResponse.config
    );
  });
});