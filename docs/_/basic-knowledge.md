## Request id

A good thing to know is that every request passed through this interceptor, has an id.
**This does not mean that is a unique id**. The id is used in a number of ways, but the
most important is to bind a request to its cache.

The id generation is good enough to generate the same id for theoretically sames requests.
The example of this is a request with `{ baseUrl: 'https://a.com/', url: '/b' }` results
to the same id with `{ url: 'https://a.com/b/' }`.

Also, a custom id can be used to treat two requests as the same.

```js
axios.get('...', {
  id: 'my-custom-id',
  cache: {
    // other properties...
  }
});
```

The [default](src/util/key-generator.ts) id generation can clarify this idea.

## Response object

Every response that came from our custom axios instance, will have some extras properties,
that you can retrieve like that:

```js
const result = await cache.get(/* ... */);
const id = result['propertyName'];
```

### response.cached

A simple boolean to check whether this request was cached or not.

**NOTE**: The first response of a request capable of being cached will return
`cached: false`, as only your next requests will return `cached: true`.

### response.id

The [request id](#request-id) resolved. This property represents the ID used throughout
the internal code. Remember that, depending on the
[config.keyGenerator](#configgeneratekey), it can be different as the provided on the
[request.id](#requestid).

## Storages

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