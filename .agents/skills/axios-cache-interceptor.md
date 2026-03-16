# axios-cache-interceptor

A caching interceptor for [Axios](https://axios-http.com/) that prevents redundant network requests, handles concurrent request deduplication, and supports HTTP caching standards.

- **npm**: `axios-cache-interceptor`
- **docs**: https://axios-cache-interceptor.js.org
- **llms.txt**: https://axios-cache-interceptor.js.org/llms.txt
- **repo**: https://github.com/arthurfiorette/axios-cache-interceptor

## Installation

```bash
npm install axios@^1 axios-cache-interceptor@^1
```

## Basic Setup

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create());

// Two simultaneous requests to the same URL: only ONE network call is made
const [res1, res2] = await Promise.all([
  axios.get('https://api.example.com/data'),
  axios.get('https://api.example.com/data')
]);

res1.cached; // false — came from the network
res2.cached; // true  — served from cache
```

`setupCache` modifies the axios instance in-place and returns it. Call it only once per instance.

## Response Object

Every response from a cached axios instance includes extra fields:

| Field      | Type      | Description                                         |
| ---------- | --------- | --------------------------------------------------- |
| `id`       | `string`  | Cache key used for this request                     |
| `cached`   | `boolean` | `true` if served from cache, `false` from network   |
| `stale`    | `boolean` | `true` if the returned data is from a stale entry   |

```ts
const response = await axios.get('/api/users');
console.log(response.id);     // e.g. "1234567890"
console.log(response.cached); // false (first call)
console.log(response.stale);  // false
```

## Global Configuration

All options passed to `setupCache` become the defaults for every request:

```ts
import { setupCache, buildMemoryStorage } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create(), {
  // Time-to-live in ms (default: 5 minutes). Also accepts a function.
  ttl: 1000 * 60 * 5,

  // HTTP methods to cache (default: ['get', 'head'])
  methods: ['get', 'head'],

  // Storage backend (default: buildMemoryStorage())
  storage: buildMemoryStorage(),

  // Respect Cache-Control / Expires headers from the server (default: true)
  interpretHeader: true,

  // ETag / If-None-Match revalidation (default: true)
  etag: true,

  // If-Modified-Since revalidation (default: true when etag is false)
  modifiedSince: false,

  // Vary header support (default: true) — disable at risk of cache poisoning
  vary: true,

  // Return stale cache on network errors (default: true)
  staleIfError: true
});
```

> **Tip:** Every option available per-request is also valid here as a global default.

## Per-Request Configuration

Override global settings for individual requests with a `cache` object:

```ts
// Disable cache for a single request
await axios.get('/api/live-feed', { cache: { enabled: false } });

// Custom TTL for an expensive endpoint
await axios.get('/api/heavy-report', {
  cache: { ttl: 1000 * 60 * 60 } // 1 hour
});

// Force a fresh network call (ignores existing cache, but still updates it)
await axios.get('/api/users', { cache: { override: true } });

// Assign a stable ID for easy invalidation later
await axios.get('/api/posts', { id: 'post-list' });
```

### `cache.enabled`

```ts
// Opt-in caching: disable globally, enable per request
const axios = setupCache(Axios.create(), { enabled: false });

await axios.get('/api/realtime');         // NOT cached
await axios.get('/api/slow-report', {
  cache: { enabled: true, ttl: 600_000 } // cached
});
```

### `cache.ttl`

Accepts a number (milliseconds) or a function that receives the response:

```ts
await axios.get('/api/data', {
  cache: {
    ttl: (response) => {
      // Cache premium users' data longer
      return response.data.premium ? 1000 * 60 * 30 : 1000 * 60 * 5;
    }
  }
});
```

The TTL is only applied when the response is **first cached**. Subsequent requests return the cached value until it expires.

### `cache.cachePredicate`

Control which responses should be cached:

```ts
await axios.get('/api/data', {
  cache: {
    cachePredicate: {
      // Only cache these status codes (default: standard 2xx/3xx codes)
      statusCheck: (status) => status >= 200 && status < 300,

      // Only cache if the response body passes this test
      responseMatch: ({ data }) => data.cacheable === true,

      // Never cache URLs matching these patterns
      ignoreUrls: [/\/admin/, '/internal'],

      // Only cache URLs matching these patterns
      allowUrls: ['weekly', /public/]
    }
  }
});
```

### `cache.staleIfError`

Serve stale cache when a network error or unexpected status code occurs:

```ts
await axios.get('/api/data', {
  cache: {
    staleIfError: true, // default — returns stale data on any error

    // Or use a predicate for fine-grained control
    staleIfError: (response, cache, error) => !response // only for network errors
  }
});
```

### `cache.hydrate`

Immediately supply stale data to the UI while the network refreshes it:

```ts
const response = await axios.get('/api/posts', {
  cache: {
    hydrate: (staleCache) => {
      // Called instantly with old data before the network responds
      renderUI(staleCache.data);
    }
  }
});

// After network resolves, re-render with fresh data
renderUI(response.data);
```

`hydrate` is **not called** when the response is served directly from a valid cache (no network involved).

## Cache Invalidation

### After a mutation — `cache.update`

```ts
// POST creates a post and invalidates the list cache
await axios.post('/api/posts', newPostData, {
  cache: {
    update: {
      'post-list': 'delete' // Forces next GET /api/posts to hit the network
    }
  }
});
```

Update cache programmatically instead of deleting:

```ts
await axios.post('/api/posts', newPostData, {
  cache: {
    update: {
      'post-list': (cachedList, createResponse) => {
        if (cachedList.state !== 'cached') return 'ignore';
        cachedList.data.posts.push(createResponse.data);
        return cachedList; // return updated cache value
      }
    }
  }
});
```

### From external sources

```ts
// Remove a single cache entry
await axios.storage.remove('post-list');

// Wipe the entire cache
await axios.storage.clear?.();
```

## Storage Backends

### Memory Storage (default)

```ts
import { buildMemoryStorage } from 'axios-cache-interceptor';

const storage = buildMemoryStorage(
  /* cloneData        */ false,        // clone responses to prevent mutation
  /* cleanupInterval  */ 5 * 60_000,  // run cleanup every 5 min (false to disable)
  /* maxEntries       */ 1024,         // max number of entries (false to disable)
  /* maxStaleAge      */ 60 * 60_000  // remove stale entries older than 1 hour
);
```

### Web Storage (browser only)

```ts
import { buildWebStorage } from 'axios-cache-interceptor';

// Persists across page reloads
setupCache(axios, {
  storage: buildWebStorage(localStorage, 'axios-cache:')
});

// Cleared when tab closes
setupCache(axios, {
  storage: buildWebStorage(sessionStorage, 'axios-cache:')
});
```

### Custom Storage (e.g. Redis)

```ts
import { buildStorage, canStale } from 'axios-cache-interceptor';
import { createClient } from 'redis';

const client = createClient();

const redisStorage = buildStorage({
  find(key) {
    return client
      .get(`cache:${key}`)
      .then((v) => v && JSON.parse(v));
  },

  set(key, value, req) {
    const ttlMs =
      value.state === 'loading'
        ? (req?.cache && typeof req.cache.ttl === 'number' ? req.cache.ttl : 60_000)
        : (value.state === 'stale' && value.ttl) || (value.state === 'cached' && !canStale(value))
        ? value.createdAt + value.ttl!
        : Date.now() + 60 * 60_000;

    return client.set(`cache:${key}`, JSON.stringify(value), { PXAT: ttlMs });
  },

  remove(key) {
    return client.del(`cache:${key}`);
  }
});
```

`buildStorage` wraps your implementation with the full storage contract. Implement `find`, `set`, and `remove`; `clear` is optional.

## HTTP Caching Standards

### ETag / If-None-Match

Enabled by default. On revalidation the library sends `If-None-Match` with the stored ETag. A `304 Not Modified` response extends the cached entry without re-downloading the body.

```ts
// Disable ETag handling globally
setupCache(axios, { etag: false });

// Disable per request
await axios.get('/api/data', { cache: { etag: false } });
```

### Vary Header

When the server responds with `Vary: Authorization`, the cache key automatically includes the `Authorization` header value so different users never share cached responses.

```ts
// ✅ Good — vary is true by default
await axios.get('/api/profile', { headers: { authorization: 'Bearer token-A' } });

// ❌ Dangerous — can cause cache poisoning
setupCache(axios, { vary: false });
```

### Cache-Control / Expires

When `interpretHeader: true` (default), server headers override the configured `ttl`:

| Server header               | Effect                                 |
| --------------------------- | -------------------------------------- |
| `Cache-Control: max-age=60` | TTL = 60 s                             |
| `Cache-Control: no-store`   | Not cached                             |
| `Cache-Control: no-cache`   | Not cached                             |
| `Expires: <date>`           | TTL = remaining time until that date   |
| `stale-while-revalidate=N`  | Serve stale for N s while revalidating |
| `stale-if-error=N`          | Use stale for N s on errors            |

Disable header interpretation for backends that always send `no-cache` / `no-store`:

```ts
await axios.get('/legacy-api', { cache: { interpretHeader: false } });
```

## Request ID / Cache Key

Each request gets a unique ID derived from `method + baseURL + url + params + data`. You can assign a custom stable ID to make cache management easier:

```ts
const response = await axios.get('/api/users', { id: 'user-list' });
response.id; // 'user-list'

// Later, invalidate by that ID
await axios.storage.remove('user-list');
```

For persistent caches with many unique keys, swap in a stronger hash:

```ts
import { buildKeyGenerator } from 'axios-cache-interceptor';
import { createHash } from 'crypto';

setupCache(axios, {
  generateKey: buildKeyGenerator(({ method, url, params }) =>
    createHash('sha256')
      .update(JSON.stringify([method, url, params]))
      .digest('hex')
  )
});
```

> The default 32-bit hash has a collision risk around 77,000 unique keys.

## Debugging

Use the development build for detailed logging:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(Axios.create(), {
  debug: ({ id, msg, data }) => console.log(`[${id}] ${msg}`, data)
});
```

The debug callback receives events for: cache hits/misses, concurrent request deduplication, header interpretation results, Vary mismatches, and error-handling decisions.

## TypeScript

```ts
import type {
  AxiosCacheInstance,    // Axios instance enhanced by setupCache()
  CacheAxiosResponse,    // Response type with .cached, .stale, .id
  CacheRequestConfig,    // Request config with optional .cache and .id
  CacheProperties,       // Shape of the cache option object
  AxiosStorage,          // Interface for custom storage adapters
  KeyGenerator,          // Type for custom key generator functions
  HeaderInterpreter      // Type for custom header interpreter functions
} from 'axios-cache-interceptor';
```

## Common Patterns

### Singleton instance

```ts
// api.ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

export const api = setupCache(Axios.create({ baseURL: '/api' }));
```

### Opt-in caching

```ts
const api = setupCache(Axios.create(), { enabled: false });

// Only these endpoints use cache
export const getReport = () =>
  api.get('/report', { cache: { enabled: true, ttl: 600_000 } });
```

### Post-mutation invalidation

```ts
const api = setupCache(Axios.create());

export const getUsers = () => api.get('/users', { id: 'user-list' });

export const deleteUser = (id: string) =>
  api.delete(`/users/${id}`, {
    cache: { update: { 'user-list': 'delete' } }
  });
```

### Persistent browser cache

```ts
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

export const api = setupCache(Axios.create(), {
  storage: buildWebStorage(localStorage, 'myapp:'),
  ttl: 1000 * 60 * 10 // 10 minutes
});
```
