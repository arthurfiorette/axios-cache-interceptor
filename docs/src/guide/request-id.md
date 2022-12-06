# Request Id

We can distinguish requests from each other by assigning an **non unique** `id` to each
request. Theses IDs are the same provided to the storages as keys.

Each ID is responsible for binding a cache to its request, for referencing or invalidating
it later and to make the interceptor use the same cache for requests to the same endpoint
and parameters.

The default id generator is smart enough to generate the same ID for theoretically same
requests. E.g. `{ baseURL: 'https://a.com/', url: '/b' }` results to the same ID as
`{ url: 'https://a.com/b/' }`.

::: warning If, for some reason, you send two different requests forcefully with the same
ID. This library will ignore any possible differences between them and share the same
cache for both.

:::

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);

// These two requests are from completely endpoints, but they will share the same resources
// and cache, as both have the same ID.
const request1 = await axios.get('some endpoint', { id: 'custom-id' });
const request2 = await axios.get('different endpoint', { id: 'custom-id' });

// You can use the same logic to create two caches for the same endpoint. These two requests
// will have different caches, as they have different IDs. This allows you to have different
// use cases and scenarios for the coincident same endpoint.
const userForPageX = await axios.get('api.com/users/id', { id: 'page-x' });
const userForPageY = await axios.get('api.com/users/id', { id: 'page-y' });
```

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
  keyGenerator: buildKeyGenerator((/* request */ { url, method }) => ({
    method,
    url,
    custom: logicWith(method, url)
  }))
});
```
