---
url: 'https://axios-cache-interceptor.js.org/guide/request-id.md'
---
# Request Id

We can distinguish requests from each other by assigning an **non unique** `id` to each
request. These IDs are the same provided to the storage as keys.

Each ID is responsible for binding a cache to its request, for referencing or invalidating
it later and to make the interceptor use the same cache for requests to the same endpoint
and parameters.

The default id generator is smart enough to generate the same ID for theoretically same
requests. `{ baseURL: 'https://a.com/', url: '/b' }` **==** `{ url: 'https://a.com/b/' }`.

::: code-group

```ts [Different requests]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);
// [!code focus:5]
// These two requests are from completely different endpoints, but they will share
// the same resources and cache, as both have the same ID.
const reqA = await axios.get('/a', { id: 'custom-id' });
const reqB = await axios.get('/b', { id: 'custom-id' });
```

```ts [Different contexts]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);
// [!code focus:7]
// You can use the same logic to create two caches for the same endpoint.
// Allows you to have different use cases for the coincident same endpoint.
const userForPageX = await axios.get('/users', { id: 'users-page-x' });
const userForPageY = await axios.get('/users', { id: 'users-page-y' });
```

:::

::: warning

If you send two different requests forcefully with the same ID. This library will ignore
any possible differences between them and share the same cache for both.

:::

## Custom Generator

By default, the id generator extracts `method`, `baseURL`, `query`, `params`, `data` and
`url` properties from the request object and hashes it into a number with
[`object-code`](https://www.npmjs.com/package/object-code).

While this default implementation offers reasonable uniqueness for most scenarios, it's
worth noting that there's a
[theoretical 50% probability of collisions after approximately 77,000 keys](https://preshing.com/20110504/hash-collision-probabilities/)
have been generated.

However, this limitation is typically inconsequential in browser environments due to their
5MB storage limit, which is reached long before the collision threshold.

::: warning

Consider implementing a custom key generator function using libraries like
[`object-hash`](https://www.npmjs.com/package/object-hash) for generating hash keys with
significantly lower collision probabilities when hitting over 77K unique keys is a
possibility

:::

Here's an example of a generator that only uses the `url` and `method` and `custom`
properties:

```ts
import Axios from 'axios';
import { setupCache, buildKeyGenerator } from 'axios-cache-interceptor';

const axios = setupCache(Axios, {
  generateKey: buildKeyGenerator((request /* [!code focus:5] */) => ({
    method: request.method,
    url: request.url,
    custom: logicWith(request.method, request.url)
  }))
});
```
