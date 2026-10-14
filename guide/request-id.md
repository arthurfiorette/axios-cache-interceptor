---
url: https://axios-cache-interceptor.js.org/guide/request-id.md
---
# Request ID

Every request has an `id` that tells it apart from other requests. The ID is the key used
to store its cache entry.

The ID binds a cache entry to its request, so you can reference or invalidate it later, and
it lets requests to the same endpoint with the same parameters share one cache entry.

The default ID generator ignores leading and trailing slashes, so
`{ baseURL: 'https://a.com/', url: '/b' }` and `{ url: 'https://a.com/b/' }` get the same ID.

::: code-group

```ts [Different requests]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);
// [!code focus:5]
// These requests go to different endpoints, but they share
// the same cache entry because both use the same ID.
const reqA = await axios.get('/a', { id: 'custom-id' });
const reqB = await axios.get('/b', { id: 'custom-id' });
```

```ts [Different contexts]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);
// [!code focus:7]
// The same approach creates two separate cache entries for one endpoint,
// so each use case gets its own cache.
const userForPageX = await axios.get('/users', { id: 'users-page-x' });
const userForPageY = await axios.get('/users', { id: 'users-page-y' });
```

:::

::: warning

If you give two different requests the same ID, the library ignores any differences between
them and both share the same cache entry.

:::

## Custom generator

By default, the ID generator takes the request's `method`, `baseURL`, `url`, `params` and
`data` (plus, when [`Vary`](../config/request-specifics.md#cache-vary) requires it, the values
of the request headers it lists), and hashes them with [`object-code`](https://www.npmjs.com/package/object-code) into a 32-bit
number.

This is unique enough for most applications, but there is a
[theoretical 50% chance of a collision after about 77,000 keys](https://preshing.com/20110504/hash-collision-probabilities/).

With [`buildWebStorage`](./storages.md#web-storage-api), this limit rarely matters, because
the ~5 MB quota of `localStorage` and `sessionStorage` fills up long before that many
entries.

::: warning

If you may exceed 77,000 unique keys, write a custom key generator that uses a hash with a
lower collision probability, such as
[`object-hash`](https://www.npmjs.com/package/object-hash).

:::

Create a generator with `buildKeyGenerator`. The resulting generator still returns
`config.id` when it is set. If your function returns a string or number, it is used as the
key directly; any other value is hashed with `object-code`.

The second argument, `meta`, holds the request header values selected by `Vary`. Include it
in the key, otherwise requests that differ in those headers share the same cache entry.

This example only uses the `url`, `method`, a `custom` property and the `Vary` values:

```ts
import Axios from 'axios';
import { setupCache, buildKeyGenerator } from 'axios-cache-interceptor';

const axios = setupCache(Axios, {
  generateKey: buildKeyGenerator((request, meta /* [!code focus:6] */) => ({
    method: request.method,
    url: request.url,
    custom: logicWith(request.method, request.url),
    vary: meta?.vary
  }))
});
```
