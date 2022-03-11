# Storages

A storage is the main object responsible for saving, retrieving and serializing (if
needed) cache data. There are two simple ones that comes by default:

- [In Memory](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/storage/memory.ts)
  with `buildMemoryStorage` (Node and Web)
- [Web Storage API](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/storage/web-api.ts)
  with `buildWebStorage` (Web only)

Both of them are included in all bundles.

## How storages works

Storages are meant to be the middleware between the cache interceptor and some sort of
storage (persistent or not).

The interceptor will call his methods internally to save and retrieve cache objects. But
you can also do that manually.

```js #runkit
const axios = require('axios');
const { buildMemoryStorage, setupCache } = require('axios-cache-interceptor');

setupCache(axios);

const { id } = await axios.get('https://jsonplaceholder.typicode.com/posts/1');

// Now i want to retrieve all cache saved to the request above.
const cache = await axios.storage.get(id);

console.log('Cache information:', cache);
```

## Memory storage

**This storage is the default one**.

A simple storage that works everywhere. You can access his values with the `data`
property;

```js
const axios = require('axios');
const { buildMemoryStorage, setupCache } = require('axios-cache-interceptor');

const storage = buildMemoryStorage();

setupCache(axios, { storage });

const { id } = await axios.get('url');

console.log(`The request state is ${storage.data[id].state}`);
```

## Web storage

For web applications that needs persistent caching, you can use the `buildWebStorage`
function. It is a persistent storage that works in conjunction with the browser's
[Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage).

```js
const axios = require('axios');
const { buildWebStorage, setupCache } = require('axios-cache-interceptor');

const myStorage = buildWebStorage(sessionStorage, 'axios-cache:');

setupCache(axios, { storage: myStorage });
```

You can use the SessionStorage, LocalStorage or even a custom storage.

```js
const fromLocalStorage = buildWebStorage(localStorage);
const fromSessionStorage = buildWebStorage(sessionStorage);

const customStorage = new Storage();
const fromCustomStorage = buildWebStorage(myStorage);
```

To prevent collisions, you can choose a custom prefix for every index access.

```js
const withoutPrefix = buildWebStorage(localStorage);

const withPrefix = buildWebStorage(localStorage, 'axios-cache:');
```

From `v0.9.0`, the web storage is able to detect and evict entries if the browser's quota
is reached.

The eviction is done by the following algorithm:

1. Saves an value and got an error. (Probably quota exceeded)
2. Evicts all expired keys that cannot enter the `stale` state.
3. If it fails again, evicts the oldest key.
4. Repeat step 4 and 5 until the object could be saved or the storage is empty.
5. If the storage is empty, ignores the key and don't save it. _(Probably because only
   this key is greater than the whole quota)_

## Creating your own storage

There's no mystery implementing a custom storage. You can create your own storage by using
the `buildStorage` function. It is also internally used to build the built-in ones.

This function is needed to add a simple method `get`. It is used to retrieve the value of
a key and handle cache invalidation.

Look at this simple [NodeRedis v4](https://github.com/redis/node-redis) example.

```js
const axios = require('axios');
const { createClient } = require('redis');
const { buildStorage, setupCache } = require('axios-cache-interceptor');

const client = createClient();

const redisStorage = buildStorage({
  find: async (key) => {
    const result = await client.get(`axios-cache:${key}`);
    return JSON.parse(result);
  },

  set: async (key, value) => {
    await client.set(`axios-cache:${key}`, JSON.stringify(value));
  },

  remove: async (key) => {
    await client.del(`axios-cache:${key}`);
  }
});

setupCache(axios, {
  storage: redisStorage
});
```
