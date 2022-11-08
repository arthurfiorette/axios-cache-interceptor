# Storages

Storages are the responsible to save, retrieve and serialize (if needed) cache data. They
are completely customizable and you can code or using another one's published on NPM.

They are meant to be the middleware between the cache interceptor and some sort of
database (persistent or not) you may have. Our interceptors will call its methods
internally to save and retrieve data. But you can do it manually to work programmatically
on your way.

Currently, two storages are included in the library by default:

- [Memory Storage](#memory-storage) accessible with `buildMemoryStorage` _(works on Node
  and Web)_
- [Web Storage API](#web-storage-api) accesible with `buildWebStorage` _(works on Web
  only)_

## Memory Storage

::: warning

**This is the storage chosen by default**

:::

A memory storage is the simplest one. It works everywhere and its values are lost upon
page reload or when the process is killed.

If you are directly mutating some response property, you probably will face some reference
issues because the storage will also get mutated. To avoid that, you can use the `clone`
option to clone the response before saving it. _Just like
[#136](https://github.com/arthurfiorette/axios-cache-interceptor/issues/163) and many
others._

```ts
import Axios from 'axios';
import { setupCache, buildMemoryStorage } from 'axios-cache-interceptor';

setupCache(axios, {
  // You don't need to to that, as it is the default option.
  storage: buildMemoryStorage(/* cloneData default=*/ false)
});
```

## Web Storage API

If you need persistent caching between page refreshes, you can use the `buildWebStorage`
to get this behavior. It works by connecting our storage API to the browser's
[Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage).

<code-group>
<code-block title="Local Storage">
```ts{7}
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';
 
setupCache(axios, {
  // As localStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(localStorage, 'axios-cache:')
});
```
</code-block>

<code-block title="Session Storage">
```ts{7}
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';
 
setupCache(axios, {
  // As sessionStorage is a public storage, you can add a prefix
  // to all keys to avoid collisions with other code.
  storage: buildWebStorage(sessionStorage, 'axios-cache:')
});
```
</code-block>

<code-block title="Custom Storage">
```ts{4,7}
import Axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';
 
const myStorage = new Storage();
 
setupCache(axios, {
  storage: buildWebStorage(myStorage)
});
```
</code-block>

</code-group>

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

## Third Party Storages

These are not guaranteed to work with the latest version of the library, neither are
maintained by the axios cache interceptor team. But, as we provide a minimal interface for
storages, you can use them as a base to also create your own.

- [Node Redis v4](#node-redis-v4-example)
- **Have another one?**
  [Open a PR](https://github.com/arthurfiorette/axios-cache-interceptor/pulls) to add it
  here.

The exported `buildStorage` abstracts the storage interface and requires a super simple
object to build the storage. It has 3 methods:

- `set(key: string, value: NotEmptyStorageValue, currentRequest?: CacheRequestConfig): MaybePromise<void>`:
  Receives the key and the value, and optionally the current request. It should save the
  value in the storage.

- `remove(key: string, currentRequest?: CacheRequestConfig): MaybePromise<void>`: Receives
  the key and optionally the current request. It should remove the value from the storage.

- `find(key: string, currentRequest?: CacheRequestConfig) => MaybePromise<StorageValue | undefined>`:
  Receives the key and optionally the current request. It should return the value from the
  storage or `undefined` if not found.

### Node Redis v4 Example

To inspire you, here is an example for a server-side application that uses Redis as the
storage.

```ts{8,13,21}
import axios from 'axios';
import { createClient } from 'redis';
import { buildStorage, setupCache, canStale } from 'axios-cache-interceptor';

const client = createClient(/* connection config */);

const redisStorage = buildStorage({
  async find(key) {
    const result = await client.get(`axios-cache:${key}`);
    return JSON.parse(result);
  },

  async set(key, value) {
    await client.set(`axios-cache:${key}`, JSON.stringify(value), {
      // We use canStale function here because we shouldn't let
      // redis remove it if it can stale.
      PXAT: canStale(value) ? value.expiresAt : undefined
    });
  },

  async remove(key) {
    await client.del(`axios-cache:${key}`);
  }
});
```
