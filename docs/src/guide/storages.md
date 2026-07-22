# Storages

Storage adapters save and retrieve cache entries. They can also serialize entries when the
underlying storage requires it. You can use a built-in adapter, create your own, or install
one published on npm.

A storage adapter connects the cache interceptor to a persistent or in-memory data store.
The interceptors call it automatically, and you can also access the configured storage
through `axios.storage` when you need to inspect or invalidate entries manually.

Currently, two storages are included in the library by default:

- [Memory Storage](#memory-storage), created with `buildMemoryStorage` (Node.js and web)
- [Web Storage API](#web-storage-api), created with `buildWebStorage` (web only)

## Concurrent requests

Concurrent request deduplication is local to each cache instance. When an eligible request
is tracked in an instance's in-memory waiting map, later requests for the same key can wait
for its result instead of reaching the network. Overrides and Vary mismatches can still
produce additional requests.

Shared storage, such as Redis, shares completed cache entries but does not share that
in-memory coordination. If two processes request the same uncached key at the same time,
both may send a network request. This is supported: each response completes normally, local
waiting requests are settled, and they either read the shared result or retry if no result
is available. The library does not provide a distributed lock or guarantee a single network
request across processes.

Duplicate requests are normally harmless for the default `GET` and `HEAD` methods. If you
enable caching for non-idempotent methods, you are responsible for making duplicate network
requests safe.

## Memory Storage

::: warning

**This is the storage chosen by default**

:::

Memory storage works in Node.js and browsers. Its entries are lost when the page reloads or
the process exits.

By default, responses and cached entries share object references. Mutating a response can
therefore mutate its cached value. Set `cloneData` to `true` to clone values returned by
`get()`, or use `'double'` to clone values on both `set()` and `get()`. See
[#163](https://github.com/arthurfiorette/axios-cache-interceptor/issues/163) and many
similar reports.

For long-running processes, use `cleanupInterval`, `maxEntries`, and `maxStaleAge` to bound
memory usage and remove old entries.

The storage uses a JavaScript `Map` internally for efficient key-value lookups and
iteration.

```ts
import axios from 'axios';
import {
  setupCache,
  buildMemoryStorage
} from 'axios-cache-interceptor';

setupCache(axios, {
  // Memory storage is already the default.
  storage: buildMemoryStorage(
    /* cloneData default=*/ false,
    /* cleanupInterval default=*/ 5 * 60 * 1000,
    /* maxEntries default=*/ 1024,
    /* maxStaleAge default=*/ 60 * 60 * 1000
  )
});
```

Options:

- **cloneData**: Clones values returned by `get()` when set to `true`. Use `'double'` to
  also clone values before saving them. The default is `false`.

- **cleanupInterval**: How often, in milliseconds, to remove old entries. Set it to `false`
  to disable automatic cleanup. The default is 5 minutes (`300_000`).

- **maxEntries**: The maximum number of entries to retain. The storage uses a FIFO-based
  eviction order because entry sizes cannot be determined reliably. Set it to `false` to
  disable the limit. The default is `1024`.

- **maxStaleAge**: How long, in milliseconds, a stale entry with a defined TTL can remain
  before removal. The default is 1 hour (`3_600_000`).

## Web Storage API

Use `buildWebStorage` to preserve cached entries across page refreshes. It connects the
cache storage API to the browser's
[Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage).

::: code-group

```ts{7} [Local Storage]
import axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

setupCache(axios, { // [!code focus:5]
  // As localStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(localStorage, 'axios-cache:')
});
```

```ts{7} [Session Storage]
import axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

setupCache(axios, { // [!code focus:5]
  // As sessionStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(sessionStorage, 'axios-cache:')
});
```

```ts{4,7} [Custom Storage]
import axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const myStorage = new Storage(); // [!code focus:8]

setupCache(axios, {
  storage: buildWebStorage(
    myStorage,
    'axios-cache:', // prefix
    60 * 60 * 1000  // maxStaleAge (1 hour default)
  )
});
```

:::

Options:

- **storage**: The `Storage` instance to use, such as `localStorage` or `sessionStorage`.
- **prefix**: A prefix added to every key to avoid collisions. The default is
  `'axios-cache-'`.
- **maxStaleAge**: How long, in milliseconds, a stale entry can remain before removal. The
  default is 1 hour (`3_600_000`).

### Browser quota

From `v0.9.0` onwards, web storage is able to detect and evict older entries if the
browser's quota is reached.

The storage handles quota errors as follows:

1. Try to save the value.
2. If the quota is exceeded, remove expired entries that cannot become stale.
3. Retry the write. If it still fails, remove the oldest entry with the configured prefix.
4. Repeat until the write succeeds or no matching entries remain.
5. If the write still fails, leave the new value unstored. The value itself may exceed the
   available quota, or another application may be using the remaining capacity.

## buildStorage()

All built-in storage adapters use `buildStorage`. Use the same function to create a custom
adapter from the following methods:

- `set(key: string, value: NotEmptyStorageValue, currentRequest?: CacheRequestConfig): MaybePromise<void>`:
  Saves a cache value under the given key.

- `remove(key: string, currentRequest?: CacheRequestConfig): MaybePromise<void>`: Removes
  the value stored under the given key.

- `find(key: string, currentRequest?: CacheRequestConfig) => MaybePromise<StorageValue | undefined>`:
  Returns the stored value, or `undefined` when the key does not exist.

- `clear() => MaybePromise<void>`: Optionally clears all stored data. The interceptor does
  not call this method; it is available for application-level invalidation.

## Third-party storages

The following examples are not maintained as separate integrations. Use them as starting
points and adapt their expiration and serialization behavior to your application.

- [Node Redis v4](#node-redis-storage)
- [IndexedDB](#indexeddb)
- [Node Cache](#node-cache)
- [Open a pull request](https://github.com/arthurfiorette/axios-cache-interceptor/pulls) to
  add another example.

## Node Redis storage

This example uses the Node Redis v4 client. The `PXAT` option gives every entry an absolute
expiration time, including temporary `loading` entries left behind by interrupted requests.

The expiration of a `loading` entry is only cleanup for abandoned requests. It does not
provide distributed request deduplication; multiple processes can still send the same
uncached request concurrently.

```ts
import { createClient } from 'redis';
import {
  buildStorage,
  canStale,
  type CacheRequestConfig,
  type NotEmptyStorageValue,
  type StorageValue
} from 'axios-cache-interceptor';

const client = createClient(/* connection config */);
await client.connect();

function getExpiresAt(
  value: NotEmptyStorageValue,
  request?: CacheRequestConfig
) {
  switch (value.state) {
    case 'loading': {
      // Abandoned loading entries must not remain forever.
      const requestTtl =
        request?.cache && typeof request.cache.ttl === 'number'
          ? request.cache.ttl
          : 60_000;

      return Date.now() + requestTtl;
    }

    case 'stale':
      if (value.ttl) {
        return value.createdAt + value.ttl;
      }

      break;

    case 'cached':
      if (!canStale(value)) {
        return value.createdAt + value.ttl;
      }

      break;
  }

  // Keep revalidatable entries for at most one hour by default.
  return Date.now() + 60 * 60 * 1000;
}

const redisStorage = buildStorage({
  async find(key) {
    const result = await client.get(`axios-cache-${key}`);
    return result ? (JSON.parse(result) as StorageValue) : undefined;
  },

  async set(key, value, request) {
    await client.set(`axios-cache-${key}`, JSON.stringify(value), {
      PXAT: getExpiresAt(value, request)
    });
  },

  async remove(key) {
    await client.del(`axios-cache-${key}`);
  }
});
```

You can use [`buildStorage`](#buildstorage) to integrate other systems such as localForage,
ioredis, or Memcached.

## IndexedDB

This example uses `idb-keyval` to store cache entries in IndexedDB.

```ts
import { buildStorage } from 'axios-cache-interceptor';
import { del, get, set } from 'idb-keyval';

const indexedDbStorage = buildStorage({
  async find(key) {
    const value = await get(key);

    if (!value) {
      return;
    }

    return JSON.parse(value);
  },

  async set(key, value) {
    await set(key, JSON.stringify(value));
  },

  async remove(key) {
    await del(key);
  }
});
```

## Node Cache

This example uses [node-cache](https://github.com/node-cache/node-cache). Check the package's
current maintenance status before using it in a new application.

```ts
import { buildStorage } from 'axios-cache-interceptor';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7 });

const cacheStorage = buildStorage({
  find(key) {
    return cache.get(key);
  },

  set(key, value) {
    cache.set(key, value);
  },

  remove(key) {
    cache.del(key);
  }
});
```
