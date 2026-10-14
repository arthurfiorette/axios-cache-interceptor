# Debugging

When the cache does not behave as you expect, switch to the development build. It logs the
decisions the interceptors make, and why, through the [`debug`](../config.md#debug) option.

To use it, import `setupCache` from `/dev` and pass a `debug` function:

::: code-group

```ts [ECMAScript]
import Axios from 'axios';

// Import `setupCache` from `/dev`.
import { setupCache } from 'axios-cache-interceptor'; // [!code --]
import { setupCache } from 'axios-cache-interceptor/dev'; // [!code ++]

// Same API as the production build.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts [CommonJS]
const Axios = require('axios');

// Import `setupCache` from `/dev`.
const { setupCache } = require('axios-cache-interceptor'); // [!code --]
const { setupCache } = require('axios-cache-interceptor/dev'); // [!code ++]

// Same API as the production build.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts{3,4} [Browser]
const Axios = window.axios;

// Load the development bundle (dev/index.bundle.js) instead of dist. // [!code ++]
const { setupCache } = window.AxiosCacheInterceptor;

// Same API as the production build.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts {5,9} [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';

// Import `setupCache` from `/dev`.
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor'; // [!code --]
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor/dev'; // [!code ++]

// Same API as the production build.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

:::

The logs cover cache hits and misses, concurrent request deduplication, header
interpretation, `Vary` mismatches, error handling and more, depending on your configuration.
The development build also logs a message with `console.error` when it loads, as a reminder
not to ship it to production.

::: details Sample of logs for two concurrent requests followed by a third one.

```json
[
  // First request reaches the network
  {
    "id": "-644704205",
    "msg": "Making network request",
    "data": { "overrideCache": false, "cacheState": "empty" }
  },
  // Second request waits for the first one
  {
    "id": "-644704205",
    "msg": "Concurrent request found, reusing result"
  },
  {
    "id": "-644704205",
    "msg": "Concurrent request detected, waiting..."
  },
  // First request's response arrives
  {
    "id": "-644704205",
    "msg": "Caching response",
    "data": { "ttl": 300000, "interpretHeader": true }
  },
  {
    "id": "-644704205",
    "msg": "Found waiting deferred(s) and resolve them"
  },
  {
    "id": "-644704205",
    "msg": "Response cached successfully",
    "data": { "state": "cached", "ttl": 300000 }
  },
  // Second request reuses the cached response
  {
    "id": "-644704205",
    "msg": "Using cached response"
  },
  {
    "id": "-644704205",
    "msg": "Returned cached response"
  },

  // A third request, made later, is answered from the cache
  {
    "id": "-644704205",
    "msg": "Using cached response"
  },
  {
    "id": "-644704205",
    "msg": "Returned cached response"
  }
]
```

:::
