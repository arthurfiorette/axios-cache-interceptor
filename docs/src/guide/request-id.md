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
// These two requests are from completely endpoints, but they will share
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

If the default generator is not enough for your use case, you can provide your own custom
generator with the `keyGenerator` option.

By default, it extracts `method`, `baseURL`, `params`, `data` and `url` properties from
the request object and hashes it into a number with
[`object-code`](https://www.npmjs.com/package/object-code).

Here's an example of a generator that only uses the `url` and `method` and `custom`
properties:

```ts
import Axios from 'axios';
import { setupCache, buildKeyGenerator } from 'axios-cache-interceptor';

const axios = setupCache(Axios, {
  keyGenerator: buildKeyGenerator((request /* [!code focus:5] */) => ({
    method: request.method,
    url: request.url,
    custom: logicWith(request.method, request.url)
  }))
});
```
