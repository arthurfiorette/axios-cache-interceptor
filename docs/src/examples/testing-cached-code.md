# Testing Cached Code

Strategies for testing applications that use axios-cache-interceptor.

## Basic Testing

Test cache behavior:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

describe('Cache Behavior', () => {
  let axios;

  beforeEach(() => {
    axios = setupCache(Axios.create());
  });

  it('should cache GET requests', async () => {
    const res1 = await axios.get('https://api.example.com/users');
    const res2 = await axios.get('https://api.example.com/users');

    expect(res1.cached).toBe(false);
    expect(res2.cached).toBe(true);
  });

  it('should invalidate cache after mutation', async () => {
    // Cache initial data
    await axios.get('/api/users', { id: 'users-list' });

    // Mutate and invalidate
    await axios.post('/api/users', { name: 'John' }, {
      cache: {
        update: { 'users-list': 'delete' }
      }
    });

    // Check cache was deleted
    const cache = await axios.storage.get('users-list');
    expect(cache.state).toBe('empty');
  });
});
```

## Mocking Axios

Mock the adapter while keeping cache behavior:

```ts
import { setupCache } from 'axios-cache-interceptor';
import MockAdapter from 'axios-mock-adapter';
import Axios from 'axios';

const instance = Axios.create();
const axios = setupCache(instance);
const mock = new MockAdapter(instance);

// Mock API responses
mock.onGet('/api/users').reply(200, [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]);

// Test caching with mocked data
it('should cache mocked responses', async () => {
  const res1 = await axios.get('/api/users');
  const res2 = await axios.get('/api/users');

  expect(res1.cached).toBe(false);
  expect(res2.cached).toBe(true);
  expect(mock.history.get.length).toBe(1); // Only one network call
});
```

## Testing Storage

Test storage implementation:

```ts
import { buildStorage } from 'axios-cache-interceptor';

describe('Custom Storage', () => {
  it('should store and retrieve values', async () => {
    const storage = buildStorage({ /* implementation */ });

    const value = {
      state: 'cached' as const,
      data: { users: [] },
      ttl: 60000,
      createdAt: Date.now()
    };

    await storage.set('test-key', value);
    const retrieved = await storage.get('test-key');

    expect(retrieved).toEqual(value);
  });

  it('should return undefined for missing keys', async () => {
    const storage = buildStorage({ /* implementation */ });
    const result = await storage.get('nonexistent');

    expect(result).toBeUndefined();
  });
});
```

## Testing TTL

Mock time for TTL tests:

```ts
import { vi } from 'vitest';

it('should expire after TTL', async () => {
  const axios = setupCache(Axios.create(), {
    ttl: 5000 // 5 seconds
  });

  // First request
  const res1 = await axios.get('/api/users');
  expect(res1.cached).toBe(false);

  // Second request immediately - cached
  const res2 = await axios.get('/api/users');
  expect(res2.cached).toBe(true);

  // Advance time past TTL
  vi.useFakeTimers();
  vi.advanceTimersByTime(6000);

  // Third request - expired, new network call
  const res3 = await axios.get('/api/users');
  expect(res3.cached).toBe(false);

  vi.useRealTimers();
});
```

## Testing Concurrent Requests

Test deduplication:

```ts
it('should deduplicate concurrent requests', async () => {
  const mock = new MockAdapter(instance);
  mock.onGet('/api/users').reply(200, [{ id: 1 }]);

  const [res1, res2, res3] = await Promise.all([
    axios.get('/api/users'),
    axios.get('/api/users'),
    axios.get('/api/users')
  ]);

  expect(res1.cached).toBe(false);
  expect(res2.cached).toBe(true);
  expect(res3.cached).toBe(true);
  expect(mock.history.get.length).toBe(1); // Only one network call
});
```

## Testing Cache Invalidation

Test update logic:

```ts
it('should update cache programmatically', async () => {
  const mock = new MockAdapter(instance);
  mock.onGet('/api/users').reply(200, []);
  mock.onPost('/api/users').reply(200, { id: 1, name: 'John' });

  // Cache empty list
  await axios.get('/api/users', { id: 'users-list' });

  // Create user with programmatic update
  await axios.post('/api/users', { name: 'John' }, {
    cache: {
      update: {
        'users-list': (cache, response) => {
          if (cache.state === 'cached') {
            cache.data.push(response.data);
            return cache;
          }
          return 'ignore';
        }
      }
    }
  });

  // Check cache was updated
  const cache = await axios.storage.get('users-list');
  expect(cache.state).toBe('cached');
  expect(cache.data.length).toBe(1);
});
```

## Testing Error Handling

Test staleIfError:

```ts
it('should return stale cache on error', async () => {
  const mock = new MockAdapter(instance);

  // First successful request
  mock.onGet('/api/users').replyOnce(200, [{ id: 1 }]);
  await axios.get('/api/users', {
    cache: { ttl: 0 } // Expire immediately
  });

  // Second request fails
  mock.onGet('/api/users').networkError();

  // Should return stale cache
  const response = await axios.get('/api/users', {
    cache: { staleIfError: true }
  });

  expect(response.data).toEqual([{ id: 1 }]);
  expect(response.stale).toBe(true);
});
```

## Integration Testing

Test with real API:

```ts
describe('API Integration', () => {
  it('should cache real API responses', async () => {
    const axios = setupCache(Axios.create({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }));

    const res1 = await axios.get('/users/1');
    const res2 = await axios.get('/users/1');

    expect(res1.cached).toBe(false);
    expect(res2.cached).toBe(true);
    expect(res1.data).toEqual(res2.data);
  }, { timeout: 10000 });
});
```

## Next Steps

- [React Integration](/examples/react-integration.md) - Testing React components
- [Debugging Guide](/journey/debugging-issues.md) - Debug test failures
- [Production Checklist](/journey/production-checklist.md) - Testing checklist
