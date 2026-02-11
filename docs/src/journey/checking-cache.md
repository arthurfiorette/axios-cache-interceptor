# Checking Cache Status

Learn how to verify if a request was cached and understand response properties.

## Response Properties

Every cached Axios response includes additional properties:

```ts
const response = await axios.get('/api/users');

console.log(response.cached);  // boolean: was this served from cache?
console.log(response.stale);   // boolean: is the cached data stale?
console.log(response.id);      // string: the cache key for this request
```

## Understanding `cached`

The `cached` property indicates whether the response came from cache:

```ts
// First request
const res1 = await axios.get('/api/users');
console.log(res1.cached); // false - fetched from network

// Second request (within TTL)
const res2 = await axios.get('/api/users');
console.log(res2.cached); // true - served from cache
```

## Understanding `stale`

The `stale` property indicates if cached data has expired but can be revalidated:

```ts
const response = await axios.get('/api/users');

if (response.stale) {
  console.log('Data is stale but was returned anyway');
  console.log('Background revalidation may be happening');
}
```

Stale responses can occur with:
- `stale-while-revalidate` header
- `staleIfError` configuration
- ETag-based revalidation

## Understanding `id`

The `id` property is the unique cache key for the request:

```ts
const response = await axios.get('/api/users');
console.log(response.id); // e.g., "1847392847"

// Use the ID to manually manage cache
await axios.storage.remove(response.id);
```

## Checking Storage State

Inspect the cache storage directly:

```ts
const response = await axios.get('/api/users');
const cached = await axios.storage.get(response.id);

console.log(cached.state); // 'empty' | 'cached' | 'stale' | 'loading'

if (cached.state === 'cached') {
  console.log(cached.data);      // The cached response data
  console.log(cached.createdAt); // When it was cached
  console.log(cached.ttl);       // Time to live
}
```

## Complete Example

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create());

async function checkCacheStatus() {
  // First request
  const res1 = await axios.get('/api/users');
  console.log('Request 1:', {
    cached: res1.cached,     // false
    stale: res1.stale,       // false
    id: res1.id              // "1847392847"
  });

  // Check storage
  const cache1 = await axios.storage.get(res1.id);
  console.log('Storage state:', cache1.state); // "cached"

  // Second request (from cache)
  const res2 = await axios.get('/api/users');
  console.log('Request 2:', {
    cached: res2.cached,     // true
    stale: res2.stale,       // false
    id: res2.id              // "1847392847" (same as res1)
  });
}

checkCacheStatus();
```

## Debugging Cache Behavior

Enable debug mode to see detailed cache operations:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: (msg) => {
    console.log(`[${msg.id}] ${msg.msg}`, msg.data);
  }
});
```

This logs:
- Cache hits and misses
- Concurrent request deduplication
- Header interpretation
- Storage operations

## Next Steps

- [Invalidate on Mutation](/journey/invalidate-on-mutation.md) - Clear cache programmatically
- [Debugging Issues](/journey/debugging-issues.md) - Systematic debugging approach
- [Storage States](/concepts/storage-states.md) - Understand cache state machine
- [Response Object API](/api/response-object.md) - Complete property reference
