# Storages

A storage is the main object responsible for saving, retrieving and serializing (if
needed) cache data. There are two simple ones that comes by default:

- [In Memory](src/storage/memory.ts) with `buildMemoryStorage` (Node and Web)
- [Web Cache](src/storage/web-api.ts) with `buildWebStorage` (Web only)

Both of them are included in all bundles.

You can create your own storage by using the `buildStorage` function. Take a look at this
example with [NodeRedis](https://github.com/redis/node-redis) v4.

```js
import { createClient } from 'redis'; // 4.0.1
import { buildStorage } from 'axios-cache-interceptor';

const client = createClient();

await client.connect();

const myCustomStorage = buildStorage({
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
```