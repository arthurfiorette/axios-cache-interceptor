# Storages

Storages are responsible for saving, retrieving and serializing (if needed) cache data. They
are completely customizable and you can code your own, or use one published on NPM.

They are meant to be the middleware between the cache interceptor and some sort of
database (persistent or not) you may have. Our interceptors will call its methods
internally to save and retrieve data, but you can do it manually to work programmatically
your own way.

Currently, two storages are included in the library by default:

- [Memory Storage](#memory-storage) accessible with `buildMemoryStorage` _(works on Node
  and Web)_
- [Web Storage API](#web-storage-api) accessible with `buildWebStorage` _(works on Web
  only)_

## Memory Storage

::: warning

**This is the storage chosen by default**

:::

Memory storage is the simplest one. It works everywhere and its values are lost upon
page reload or when the process is killed.

If you are directly mutating some response property, you probably will face some reference
issues because the storage will also get mutated. To avoid that, you can use the
`clone: true` option to clone the response before saving it or `clone: 'double'` to also
clone both ways, on `set()` and on `get()`. _Just like
[#136](https://github.com/arthurfiorette/axios-cache-interceptor/issues/163) and many
others._

For long running processes, you can avoid memory leaks by using playing with the
`cleanupInterval` option. And can reduce memory usage with `maxEntries`.

```ts
import Axios from 'axios';
import { setupCache, buildMemoryStorage } from 'axios-cache-interceptor';

setupCache(axios, {
  // You don't need to to that, as it is the default option.
  storage: buildMemoryStorage(
    /* cloneData default=*/ false,
    /* cleanupInterval default=*/ false,
    /* maxEntries default=*/ false
  )
});
```

Options:

- **cloneData**: Use `true` if the data returned by `find()` should be cloned to avoid
  mutating the original data outside the `set()` method. Use `'double'` to also clone
  before saving value in storage using `set()`. Disabled is default

- **cleanupInterval**: The interval in milliseconds to run a setInterval job of cleaning
  old entries. If false, the job will not be created. Disabled is default

- **maxEntries**: The maximum number of entries to keep in the storage. Its hard to
  determine the size of the entries, so a smart FIFO order is used to determine eviction.
  If false, no check will be done and you may grow up memory usage. Disabled is default

## Web Storage API

If you need persistent caching between page refreshes, you can use the `buildWebStorage`
to get this behavior. It works by connecting our storage API to the browser's
[Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage).

::: code-group

```ts{7} [Local Storage]
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

setupCache(axios, { // [!code focus:5]
  // As localStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(localStorage, 'axios-cache:')
});
```

```ts{7} [Session Storage]
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

setupCache(axios, { // [!code focus:5]
  // As sessionStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(sessionStorage, 'axios-cache:')
});
```

```ts{4,7} [Custom Storage]
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';

const myStorage = new Storage(); // [!code focus:5]

setupCache(axios, {
  storage: buildWebStorage(myStorage)
});
```

:::

### Browser quota

From `v0.9.0` onwards, web storage is able to detect and evict older entries if the
browser's quota is reached.

The eviction is done by the following algorithm:

1. Just saved an value and got an error. _(Probably quota exceeded)_
2. Evicts all expired keys that cannot enter the `stale` state.
3. If it fails again, evicts the oldest key with the given prefix.
4. Repeat step 2 and 3 until the object can be saved or the storage has been emptied.
5. If it still fails, the data is not saved. _Probably because the whole key is greater
   than the quota or other libraries already consumed the whole usable space._

## buildStorage()

All integrated storages are wrappers around the `buildStorage` function. External
libraries use it and if you want to build your own, `buildStorage` is the way to go!

The exported `buildStorage` function abstracts the storage interface and requires a super
simple object to build the storage. It has 3 methods:

- `set(key: string, value: NotEmptyStorageValue, currentRequest?: CacheRequestConfig): MaybePromise<void>`:
  Receives the key and the value, and optionally the current request. It should save the
  value in the storage.

- `remove(key: string, currentRequest?: CacheRequestConfig): MaybePromise<void>`: Receives
  the key and optionally the current request. It should remove the value from the storage.

- `find(key: string, currentRequest?: CacheRequestConfig) => MaybePromise<StorageValue | undefined>`:
  Receives the key and optionally the current request. It should return the value from the
  storage or `undefined` if not found.

## Third Party Storages

These are not guaranteed to work with the latest version of the library as neither are
maintained by the axios cache interceptor team. But, as we provide a minimal interface for
storages, you can use them as a base to also create your own.

- [Node Redis v4](#node-redis-storage)
- [IndexedDb](#indexeddb)
- **Have another one?**
- [Open a PR](https://github.com/arthurfiorette/axios-cache-interceptor/pulls) to add it
  here.

## Node Redis storage

The node redis storage implementation is listed here because it shows the only tricky part
when implementing a storage with an third party client that allows auto-evicting entries,
as show on the `PXAT` property.

```ts{4}
import { createClient } from 'redis'; // v4
import { buildStorage, canStale } from 'axios-cache-interceptor';

const client = createClient(/* connection config */);
// [!code focus:36]
const redisStorage = buildStorage({
  find(key) {
    return client
      .get(`axios-cache-${key}`)
      .then((result) => result && (JSON.parse(result) as StorageValue));
  },

  set(key, value, req) {
    return client.set(`axios-cache-${key}`, JSON.stringify(value), {
      PXAT:
        // We don't want to keep indefinitely values in the storage if
        // their request don't finish somehow. Either set its value as
        // the TTL or 1 minute.
        value.state === 'loading'
          ? Date.now() +
            (req?.cache && typeof req.cache.ttl === 'number'
              ? req.cache.ttl
              : // 1 minute in seconds
                60000)
          : // When a stale state has a determined value to expire, we can use it.
          //   Or if the cached value cannot enter in stale state.
          (value.state === 'stale' && value.ttl) ||
            (value.state === 'cached' && !canStale(value))
          ?
            value.createdAt + value.ttl!
          : // otherwise, we can't determine when it should expire, so we keep
            //   it indefinitely.
            undefined
    });
  },

  remove(key) {
    return client.del(`axios-cache-${key}`);
  }
});
```

However you can use the [`buildStorage`](#buildstorage) function to integrate with ANY storage you
want, like `localForage`, `ioredis`, `memcache` and others.

## IndexedDB

Here is an example of how to use the `idb-keyval` library to create a storage that uses
IndexedDB.

```ts
import axios from 'axios';
import { buildStorage } from 'axios-cache-interceptor';
import { clear, del, get, set } from 'idb-keyval';

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
