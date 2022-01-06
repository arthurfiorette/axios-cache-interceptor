# Storages

A storage is the main object responsible for saving, retrieving and serializing (if
needed) cache data. There are two simple ones that comes by default:

- [In Memory](src/storage/memory.ts) with `buildMemoryStorage` (Node and Web)
- [Web Storage API](src/storage/web-api.ts) with `buildWebStorage` (Web only)

Both of them are included in all bundles.

## Memory storage

A simple storage that works everywhere. You can access his values with the `data`
property;

```js
import { buildMemoryStorage, setupCache } from 'axios-cache-interceptor';

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
import { buildWebStorage, setupCache } from 'axios-cache-interceptor';

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

## Creating your own storage

There's no mystery implementing a custom storage. You can create your own storage by using
the `buildStorage` function. It is also internally used to build the built-in ones.

This function is needed to add a simple method `get`. It is used to retrieve the value of
a key and handle cache invalidation.

Look at this simple [NodeRedis v4](https://github.com/redis/node-redis) example.

```js
import { createClient } from 'redis'; // v4.0.1
import { buildStorage, setupCache } from 'axios-cache-interceptor';

const client = createClient();

await client.connect();

const redisStorage = buildStorage({
  find: async (key) => {
    return await client.get(`axios-cache:${key}`);
  },
  set: async (key, value) => {
    await client.set(`axios-cache:${key}`, JSON.stringify(value));
  },
  remove: async (key) => {
    await client.del(`axios-cache:${key}`);
  }
});

setupCache(axios, { storage: redisStorage });
```
