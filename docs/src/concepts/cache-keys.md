# Cache Keys

How request IDs are generated and used as cache keys.

## Default Generation

By default, cache keys are generated from:

1. HTTP method (lowercase)
2. Base URL (normalized)
3. URL path (normalized)
4. Query parameters
5. Request body (for POST/PUT)
6. Vary headers (if applicable)

### Example

```ts
// Request
axios.get('https://api.example.com/users', {
  params: { page: 1, limit: 10 }
});

// Generated ID considers:
// - method: "get"
// - baseURL: "https://api.example.com"
// - url: "/users"
// - params: { page: 1, limit: 10 }
// - data: undefined

// Result: "1847392847" (32-bit hash)
```

## Custom IDs

Specify your own cache key:

```ts
await axios.get('/api/users', {
  id: 'users-list'
});

// Cache key is exactly "users-list"
```

Benefits:
- Predictable keys
- Easy invalidation
- Human-readable
- No collision risk

## Hash Collisions

The default generator uses 32-bit hashing:

- Fast and efficient
- Collision risk at ~77,000 unique requests
- Acceptable for most use cases

For large-scale applications with persistent storage, use custom IDs or stronger hashing.

## Custom Generator

Implement your own key generation:

```ts
import { setupCache, buildKeyGenerator } from 'axios-cache-interceptor';
import { createHash } from 'crypto';

const customGenerator = buildKeyGenerator((request) => {
  // Use SHA-256 for no collisions
  const str = JSON.stringify({
    method: request.method,
    url: request.url,
    params: request.params,
    data: request.data
  });

  return createHash('sha256').update(str).digest('hex');
});

const axios = setupCache(instance, {
  generateKey: customGenerator
});
```

## Vary Header Impact

When server sends Vary header, those headers are included in the key:

```ts
// Request 1
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-A' }
});
// Server responds: Vary: Authorization
// Key includes: url + method + {authorization: 'Bearer token-A'}

// Request 2
await axios.get('/api/profile', {
  headers: { authorization: 'Bearer token-B' }
});
// Different key due to different Authorization header
```

## Retrieving the ID

Get the cache key from the response:

```ts
const response = await axios.get('/api/users');
console.log(response.id); // "1847392847"

// Use for manual cache management
await axios.storage.remove(response.id);
```

## Next Steps

- [Vary Header Handling](/concepts/vary-header-handling.md) - Headers in cache keys
- [Request Deduplication](/concepts/request-deduplication.md) - ID matching
- [Key Generator API](/api/key-generator.md) - Custom generation
