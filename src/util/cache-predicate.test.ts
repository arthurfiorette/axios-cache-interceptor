import type { CacheAxiosResponse } from '../cache/axios.js';
import { testCachePredicate, regexOrStringMatch } from './cache-predicate.js';

// Mock CacheAxiosResponse type for testing
interface MockCacheAxiosResponse<R = unknown, D = unknown> extends CacheAxiosResponse<R, D> {
  status: number;
  headers: Record<string, unknown>;
  data: R;
}

describe('testCachePredicate', () => {
  let mockResponse: MockCacheAxiosResponse;

  beforeEach(() => {
    mockResponse = {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=3600'
      },
      data: { message: 'test' },
    } as MockCacheAxiosResponse;
  });

  it('should return true when predicate is a function that returns true', async () => {
    const predicate = jest.fn().mockResolvedValue(true);
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
    expect(predicate).toHaveBeenCalledWith(mockResponse);
  });

  it('should return false when predicate is a function that returns false', async () => {
    const predicate = jest.fn().mockResolvedValue(false);
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
    expect(predicate).toHaveBeenCalledWith(mockResponse);
  });

  it('should return true when predicate object has no criteria', async () => {
    const predicate = {};
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
  });

  it('should return false when statusCheck returns false', async () => {
    const predicate = {
      statusCheck: jest.fn().mockResolvedValue(false),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
    expect(predicate.statusCheck).toHaveBeenCalledWith(200);
  });

  it('should return true when statusCheck returns true', async () => {
    const predicate = {
      statusCheck: jest.fn().mockResolvedValue(true),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
    expect(predicate.statusCheck).toHaveBeenCalledWith(200);
  });

  it('should return false when responseMatch returns false', async () => {
    const predicate = {
      responseMatch: jest.fn().mockResolvedValue(false),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
    expect(predicate.responseMatch).toHaveBeenCalledWith(mockResponse);
  });

  it('should return true when responseMatch returns true', async () => {
    const predicate = {
      responseMatch: jest.fn().mockResolvedValue(true),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
    expect(predicate.responseMatch).toHaveBeenCalledWith(mockResponse);
  });

  it('should return false when both statusCheck and responseMatch return false', async () => {
    const predicate = {
      statusCheck: jest.fn().mockResolvedValue(false),
      responseMatch: jest.fn().mockResolvedValue(false),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
    expect(predicate.statusCheck).toHaveBeenCalledWith(200);
    expect(predicate.responseMatch).not.toHaveBeenCalled(); // Short-circuits after statusCheck failure
  });

  it('should return true when both statusCheck and responseMatch return true', async () => {
    const predicate = {
      statusCheck: jest.fn().mockResolvedValue(true),
      responseMatch: jest.fn().mockResolvedValue(true),
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
    expect(predicate.statusCheck).toHaveBeenCalledWith(200);
    expect(predicate.responseMatch).toHaveBeenCalledWith(mockResponse);
  });

  it('should return false when containsHeaders has a header that fails the predicate', async () => {
    const predicate = {
      containsHeaders: {
        'content-type': (value: unknown) => value === 'text/html', // Will return false
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
  });

  it('should return true when containsHeaders has all headers that pass the predicate', async () => {
    const predicate = {
      containsHeaders: {
        'content-type': (value: unknown) => value === 'application/json', // Will return true
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
  });

  it('should handle headers with mixed case correctly', async () => {
    mockResponse.headers = {
      'Content-Type': 'application/json',
    };

    const predicate = {
      containsHeaders: {
        'Content-Type': (value: unknown) => value === 'application/json', // Should find the capitalized header
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);

    expect(result).toBe(true);
  });

  it('should handle case where header does not exist', async () => {
    const predicate = {
      containsHeaders: {
        'non-existent-header': (value: unknown) => value !== undefined, // Will return false since value will be undefined
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
  });

  it('should return false when multiple header predicates are provided and one fails', async () => {
    const predicate = {
      containsHeaders: {
        'content-type': (value: unknown) => value === 'application/json', // Passes
        'cache-control': (value: unknown) => value === 'private', // Fails
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
  });

  it('should return true when multiple header predicates all pass', async () => {
    const predicate = {
      containsHeaders: {
        'content-type': (value: unknown) => value === 'application/json', // Passes
        'cache-control': (value: unknown) => value === 'public, max-age=3600', // Passes
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
  });

  it('should work with combination of all predicate types', async () => {
    const predicate = {
      statusCheck: (status: number) => status === 200,
      responseMatch: (response: MockCacheAxiosResponse) => response.data.message === 'test',
      containsHeaders: {
        'content-type': (value: unknown) => value === 'application/json',
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(true);
  });

  it('should return false if any part of combined predicates fails', async () => {
    const predicate = {
      statusCheck: (status: number) => status === 201, // Fails
      responseMatch: (response: MockCacheAxiosResponse) => response.data.message === 'test', // Would pass
      containsHeaders: {
        'content-type': (value: unknown) => value === 'application/json', // Would pass
      }
    };
    const result = await testCachePredicate(mockResponse, predicate);
    
    expect(result).toBe(false);
  });
});

describe('regexOrStringMatch', () => {
  it('should return true when string pattern is found in URL', () => {
    const result = regexOrStringMatch('api/users', 'https://example.com/api/users');
    expect(result).toBe(true);
  });

  it('should return false when string pattern is not found in URL', () => {
    const result = regexOrStringMatch('api/admin', 'https://example.com/api/users');
    expect(result).toBe(false);
  });

  it('should return true when regex pattern matches URL', () => {
    const result = regexOrStringMatch(/\/users\/\d+/, 'https://example.com/users/123');
    expect(result).toBe(true);
  });

  it('should return false when regex pattern does not match URL', () => {
    const result = regexOrStringMatch(/\/admin\/\d+/, 'https://example.com/users/123');
    expect(result).toBe(false);
  });

  it('should reset regex lastIndex to ensure consistent behavior', () => {
    const regex = /test/g;
    regex.lastIndex = 5; // Set an initial lastIndex

    // The function should reset the regex internally before using it
    const result1 = regexOrStringMatch(regex, 'test string');
    expect(result1).toBe(true);

    // Test again to ensure consistent behavior regardless of previous state
    const result2 = regexOrStringMatch(regex, 'test string');
    expect(result2).toBe(true);
  });

  it('should handle stateful regex correctly across multiple calls', () => {
    const regex = /(a)b\1/g;

    // Manipulate the regex state first
    regex.lastIndex = 10;

    const result1 = regexOrStringMatch(regex, 'aba');
    expect(result1).toBe(true);

    // Second call should work the same way regardless of previous execution
    const result2 = regexOrStringMatch(regex, 'aba');
    expect(result2).toBe(true); // Should behave consistently
  });

  it('should handle complex regex patterns', () => {
    const result = regexOrStringMatch(/^https?:\/\/[\w.-]+\/api\/v\d+/, 'https://api.example.com/api/v1/users');
    expect(result).toBe(true);
  });
});