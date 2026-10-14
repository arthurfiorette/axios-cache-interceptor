---
name: axios-cache-interceptor
description: Reference for axios-cache-interceptor, a caching interceptor for Axios that prevents redundant network requests, deduplicates concurrent requests and supports HTTP caching standards. Use when writing, configuring or debugging code that caches axios requests (setupCache, storages, cache.update, TTL, ETag, Vary).
---

# axios-cache-interceptor

A caching interceptor for [Axios](https://axios-http.com/) that prevents redundant network requests, deduplicates concurrent requests and supports HTTP caching standards.

- npm: `axios-cache-interceptor`
- docs: https://axios-cache-interceptor.js.org
- llms.txt: https://axios-cache-interceptor.js.org/llms.txt
- repo: https://github.com/arthurfiorette/axios-cache-interceptor

## Installation

```bash
npm install axios@^1 axios-cache-interceptor@^1
```

## Basic setup

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create());

// Two simultaneous requests to the same URL: only ONE network call is made
const [res1, res2] = await Promise.all([
  axios.get('https://api.example.com/data'),
  axios.get('https://api.example.com/data')
]);

res1.cached; // false: came from the network
res2.cached; // true: served from cache
```

`setupCache` modifies the axios instance in place and returns it. Call it only once per instance; a second call throws.

Calling `setupCache` on the default `Axios` export only caches requests made through that default instance. Instances created later with `Axios.create()` don't get the interceptors, and `setupCache` throws on them because they inherit `defaults.cache`. To share cached data between instances, call `setupCache` on each one with the same `storage`.

## Response object

Every response from a cached axios instance includes extra fields:

| Field    | Type                   | Description                                                                                         |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| `id`     | `string`               | Cache key used for this request                                                                     |
| `cached` | `boolean`              | `true` if served from cache (including `304 Not Modified`), `false` from network                    |
| `stale`  | `boolean \| undefined` | `true` if served from a stale entry, `false` for fresh cache hits, `undefined` for network responses |

```ts
const response = await axios.get('/api/users');
console.log(response.id);     // e.g. "1234567890"
console.log(response.cached); // false (first call)
console.log(response.stale);  // undefined (came from the network)
```

## Global configuration

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

  // If-Modified-Since revalidation (default: true only when etag is false)
  modifiedSince: false,

  // Vary header support (default: true). Disabling it risks cache poisoning.
  vary: true,

  // Return stale cache when revalidating it fails (default: true)
  staleIfError: true,

  // Adds no-cache request headers so the browser doesn't cache too (default: true)
  cacheTakeover: true,

  // Set to false to register the interceptors yourself (default: true)
  register: true
});
```

> **Tip:** Every option available per request is also valid here as a global default.

`cacheTakeover` adds `Cache-Control`, `Pragma` and `Expires` request headers. On CORS requests the server must allow them in `Access-Control-Allow-Headers`; otherwise set `cacheTakeover: false`.

## Per-request configuration

Override global settings for individual requests with a `cache` object:

```ts
// Disable cache for a single request
await axios.get('/api/live-feed', { cache: { enabled: false } });

// Custom TTL for an expensive endpoint
await axios.get('/api/heavy-report', {
  cache: { ttl: 1000 * 60 * 60 } // 1 hour
});

// Force a fresh network call (ignores the existing cache, but still updates it)
await axios.get('/api/users', { cache: { override: true } });

// Assign a stable ID for easy invalidation later
await axios.get('/api/posts', { id: 'post-list' });
```

`cache: false` still works but is deprecated. Use `cache: { enabled: false }`.

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

The TTL is only applied when the response is **first cached**. Later requests return the cached value until it expires. With `interpretHeader: true`, response headers take precedence over `ttl`.

### `cache.cachePredicate`

Control which responses are cached:

```ts
await axios.get('/api/data', {
  cache: {
    cachePredicate: {
      // Only cache these status codes
      // (default: 200, 203, 300, 301, 302, 404, 405, 410, 414, 501)
      statusCheck: (status) => status >= 200 && status < 300,

      // Only cache if the response passes this test
      responseMatch: ({ data }) => data.cacheable === true,

      // Only cache if these response headers pass their tests
      containsHeaders: { 'x-cacheable': (value) => value === 'true' },

      // Never cache URLs matching these patterns
      ignoreUrls: [/\/admin/, '/internal'],

      // Only cache URLs matching these patterns
      allowUrls: ['weekly', /public/]
    }
  }
});
```

`ignoreUrls` and `allowUrls` are tested against `config.url` only (not `baseURL`). Strings match when the URL contains them, and `ignoreUrls` wins when both match.

### `cache.staleIfError`

When revalidating a stale entry fails (network error or rejected status code), return the stale data instead of the error:

```ts
// Default: return stale data on any error
await axios.get('/api/data', {
  cache: { staleIfError: true }
});

// Or use a predicate for fine-grained control
await axios.get('/api/data', {
  cache: {
    staleIfError: (response, cache, error) => !response // only for network errors
  }
});
```

A number limits the stale data's age in milliseconds. With `true`, a `Cache-Control: stale-if-error=N` header on the error response limits it to N seconds.

### `cache.hydrate`

Show stale data in the UI while the network refreshes it:

```ts
const response = await axios.get('/api/posts', {
  cache: {
    hydrate: (staleCache) => {
      // Called before the request is sent, with the old cache entry
      renderUI(staleCache.data.data);
    }
  }
});

// After the network resolves, re-render with fresh data
renderUI(response.data);
```

`hydrate` is **not called** when the response is served directly from a valid cache (no network involved) or for `must-revalidate` entries. The request waits for it to finish.

## Cache invalidation

### After a mutation with `cache.update`

```ts
// POST creates a post and invalidates the list cache
await axios.post('/api/posts', newPostData, {
  cache: {
    update: {
      'post-list': 'delete' // Forces the next GET /api/posts to hit the network
    }
  }
});
```

Update the cache programmatically instead of deleting it. The updater receives the cache entry, whose `data.data` holds the response body:

```ts
await axios.post('/api/posts', newPostData, {
  cache: {
    update: {
      'post-list': (cachedList, createResponse) => {
        if (cachedList.state !== 'cached') return 'ignore';
        (cachedList.data.data as { posts: Post[] }).posts.push(createResponse.data);
        return cachedList; // the updated entry is stored
      }
    }
  }
});
```

The updater can return the updated entry, `'delete'` or `'ignore'`. Updates only run when the request succeeds with a network response (not a cache hit).

### From external sources

```ts
// Remove a single cache entry
await axios.storage.remove('post-list');

// Wipe the entire cache
await axios.storage.clear?.();
```

## Storage backends

### Memory storage (default)

```ts
import { buildMemoryStorage } from 'axios-cache-interceptor';

const storage = buildMemoryStorage(
  /* cloneData        */ false,        // true clones on read, 'double' on read and write
  /* cleanupInterval  */ 5 * 60_000,  // run cleanup every 5 min (false to disable)
  /* maxEntries       */ 1024,         // max number of entries (false to disable)
  /* maxStaleAge      */ 60 * 60_000  // remove stale entries with a TTL 1 hour after they expire
);
```

Without `cloneData`, the response data and the cached data are the same object, so mutating one mutates the other.

### Web storage (browser only)

```ts
import { buildWebStorage } from 'axios-cache-interceptor';

// Persists across page reloads
setupCache(axios, {
  storage: buildWebStorage(localStorage, 'axios-cache:')
});

// Cleared when the tab closes
setupCache(axios, {
  storage: buildWebStorage(sessionStorage, 'axios-cache:')
});
```

Entries are stored as JSON. When the quota is exceeded, expired entries and then the oldest entries are evicted.

### Custom storage (for example, Redis)

```ts
import {
  buildStorage,
  canStale,
  type CacheRequestConfig,
  type NotEmptyStorageValue,
  type StorageValue
} from 'axios-cache-interceptor';
import { createClient } from 'redis';

const client = createClient();
await client.connect();

// Absolute expiration time (ms) for each entry
function getExpiresAt(value: NotEmptyStorageValue, request?: CacheRequestConfig) {
  switch (value.state) {
    case 'loading': {
      // Abandoned loading entries must not remain forever
      const ttl =
        request?.cache && typeof request.cache.ttl === 'number' ? request.cache.ttl : 60_000;
      return Date.now() + ttl;
    }

    case 'stale':
      if (value.ttl) return value.createdAt + value.ttl;
      break;

    case 'cached': {
      // Keep entries that can become stale long enough to be revalidated
      const staleFor = Math.max(value.staleTtl ?? 0, canStale(value) ? 60 * 60_000 : 0);
      return value.createdAt + value.ttl + staleFor;
    }
  }

  // Keep stale entries without a TTL for at most one hour
  return Date.now() + 60 * 60_000;
}

const redisStorage = buildStorage({
  async find(key) {
    const result = await client.get(`cache:${key}`);
    return result ? (JSON.parse(result) as StorageValue) : undefined;
  },

  async set(key, value, req) {
    await client.set(`cache:${key}`, JSON.stringify(value), {
      PXAT: getExpiresAt(value, req)
    });
  },

  async remove(key) {
    await client.del(`cache:${key}`);
  }
});
```

`setupCache` only accepts storages created by `buildStorage`. Implement `find`, `set` and `remove`; `clear` is optional. `find` only returns what was saved: the built storage handles expiration and stale transitions.

Deduplication of concurrent requests is local to each axios instance. A shared storage such as Redis shares cached entries, but two processes may still send the same uncached request at the same time.

## HTTP caching standards

### ETag / If-None-Match

Enabled by default. When an expired entry has an ETag, it becomes stale instead of being removed. The next request sends `If-None-Match` with the stored ETag, and a `304 Not Modified` response refreshes the cached entry without downloading the body again.

```ts
// Disable ETag handling globally
setupCache(axios, { etag: false });

// Disable per request
await axios.get('/api/data', { cache: { etag: false } });
```

### Vary header

When the server responds with `Vary: Authorization`, the cache stores the request's `Authorization` value with the entry. A request with a different value gets its own cache entry, so different users never share cached responses. `Vary: *` responses are stored as stale and revalidated on every request.

```ts
// Good: vary is true by default
await axios.get('/api/profile', { headers: { authorization: 'Bearer token-A' } });

// Dangerous: can cause cache poisoning
setupCache(axios, { vary: false });
```

### Cache-Control / Expires

When `interpretHeader: true` (default), server headers override the configured `ttl` and control staleness:

| Server header                                   | Effect                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Cache-Control: max-age=60`                     | TTL = 60 s (minus the `Age` header, if present)                                             |
| `Cache-Control: no-store`                       | Not cached                                                                                  |
| `Cache-Control: no-cache`                       | Not cached                                                                                  |
| `Cache-Control: private`                        | Not cached on the server (Node.js)                                                          |
| `Cache-Control: immutable`                      | TTL = 1 year                                                                                |
| `Expires: <date>`                               | TTL = remaining time until that date (not cached if already past)                           |
| `stale-while-revalidate=N` / `max-stale=N`      | With `max-age`, the expired entry stays stale for N s and is revalidated on the next request |
| `stale-if-error=N` (on the error response)      | With `staleIfError: true`, stale data is returned on errors for N s                         |

Disable header interpretation for backends that always send `no-cache` / `no-store`:

```ts
await axios.get('/legacy-api', { cache: { interpretHeader: false } });
```

## Request ID / cache key

Each request gets an ID derived from `method + baseURL + url + params + data` (plus request headers listed by `Vary`, when needed). You can assign a custom stable ID to make cache management easier:

```ts
const response = await axios.get('/api/users', { id: 'user-list' });
response.id; // 'user-list'

// Later, invalidate by that ID
await axios.storage.remove('user-list');
```

For persistent caches with many unique keys, use a stronger hash. Keep every field the default uses, including `meta.vary`; otherwise requests that differ only in `Vary` headers (such as `Authorization`) share one entry:

```ts
import { buildKeyGenerator } from 'axios-cache-interceptor';
import { createHash } from 'crypto';

setupCache(axios, {
  generateKey: buildKeyGenerator(({ method, baseURL, url, params, data }, meta) =>
    createHash('sha256')
      .update(JSON.stringify([method, baseURL, url, params, data, meta?.vary]))
      .digest('hex')
  )
});
```

> The default 32-bit hash has a 50% collision probability at about 77,000 unique keys.

## Interceptor order

Axios runs request interceptors in reverse order (last added runs first) and response interceptors in insertion order. Request interceptors added after `setupCache` run before the cache; response interceptors added after it run after the cache. For full control, use `register: false` and register `axios.requestInterceptor` / `axios.responseInterceptor` yourself.

## Custom adapters

Custom adapters must throw an `AxiosError` on failure. Any other error leaves the cache entry stuck in `loading`, and later requests for that key hang.

## Debugging

Use the development build for detailed logging:

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(Axios.create(), {
  debug: ({ id, msg, data }) => console.log(`[${id}] ${msg}`, data)
});
```

The debug callback receives events for cache hits and misses, concurrent request deduplication, header interpretation, Vary mismatches and error handling decisions.

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

## Common patterns

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
