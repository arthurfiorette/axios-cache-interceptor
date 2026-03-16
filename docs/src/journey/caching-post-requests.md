# Caching POST Requests

Learn how to enable caching for POST, PUT, and other HTTP methods.

## Why Cache Mutations?

By default, only GET and HEAD requests are cached. However, caching POST requests can be useful for:

- Idempotent operations (search queries, reporting)
- Heavy computation endpoints
- Preventing duplicate form submissions
- Rate-limited APIs

## Enable POST Caching Globally

Configure which HTTP methods to cache:

```ts
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(instance, {
  methods: ['get', 'head', 'post']
});

// Now POST requests are cached
const response = await axios.post('/api/search', { query: 'axios' });
console.log(response.cached); // true on second call
```

## Enable POST Caching Per-Request

Cache specific POST requests only:

```ts
// Global config: only GET/HEAD cached
const axios = setupCache(instance);

// Enable cache for this specific POST
const response = await axios.post('/api/search', { query: 'axios' }, {
  cache: {
    methods: ['post']
  }
});
```

## Cache Key Generation

POST requests with different bodies get different cache keys:

```ts
// Different cache entries
const res1 = await axios.post('/api/search', { query: 'axios' });
const res2 = await axios.post('/api/search', { query: 'react' });

console.log(res1.id !== res2.id); // true - different cache keys
```

The request body is included in cache key generation by default.

## Idempotent POST Example

Search endpoint that should be cached:

```ts
const axios = setupCache(instance, {
  methods: ['get', 'post'],
  cachePredicate: {
    // Only cache POST for search endpoint
    responseMatch: (response) => {
      return response.config.url?.includes('/search');
    }
  }
});

// This POST is cached
await axios.post('/api/search', { query: 'axios' });

// This POST is NOT cached (different URL)
await axios.post('/api/users', { name: 'John' });
```

## Custom Cache ID for POST

Use custom IDs for predictable cache keys:

```ts
await axios.post('/api/search', { query: 'axios' }, {
  id: 'search-axios', // Custom cache key
  cache: { methods: ['post'] }
});

// Later, invalidate by ID
await axios.storage.remove('search-axios');
```

## Preventing Duplicate Submissions

Use request deduplication to prevent duplicate form submissions:

```ts
const submitForm = async (formData) => {
  const response = await axios.post('/api/submit', formData, {
    cache: {
      methods: ['post'],
      ttl: 5000 // Short TTL to prevent duplicates within 5 seconds
    }
  });
  return response;
};

// If clicked multiple times rapidly, only one request is made
const [res1, res2] = await Promise.all([
  submitForm({ name: 'John' }),
  submitForm({ name: 'John' })
]);

console.log(res1.cached); // false
console.log(res2.cached); // true - deduplication in action
```

## When NOT to Cache POST

Do not cache POST requests that:
- Modify server state (create, update, delete)
- Are non-idempotent
- Contain sensitive data
- Need to execute every time

## Invalidate on Mutation

When caching GET requests, invalidate them after POST mutations:

```ts
// Cache GET requests
const axios = setupCache(instance);

// Get users (cached)
await axios.get('/api/users', { id: 'users-list' });

// Create new user - invalidate the list
await axios.post('/api/users', userData, {
  cache: {
    update: {
      'users-list': 'delete' // Invalidate users list
    }
  }
});
```

## Next Steps

- [Invalidate on Mutation](/journey/invalidate-on-mutation.md) - Cache invalidation strategies
- [Custom Cache Keys](/concepts/cache-keys.md) - How IDs are generated
- [Cache Predicate](/api/cache-predicate.md) - Fine-tune which responses to cache
