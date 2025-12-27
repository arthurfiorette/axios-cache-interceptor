---
url: 'https://axios-cache-interceptor.js.org/guide/debugging.md'
---
# Debugging

I'm certainly sure that along the way you will find some cache behavior that is not the
expected to the current situation. To help with that, the library has a separate robust
build with support to debug logs enabled.

You can use it by changing the `setupCache` import:

::: code-group

```ts [EcmaScript]
import Axios from 'axios';

// Only import from `/dev` where you import `setupCache`.
import { setupCache } from 'axios-cache-interceptor'; // [!code --]
import { setupCache } from 'axios-cache-interceptor/dev'; // [!code ++]

// same object, but with updated typings.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts [Common JS]
const Axios = require('axios');

// Only import from `/dev` where you import `setupCache`.
const { setupCache } = require('axios-cache-interceptor'); // [!code --]
const { setupCache } = require('axios-cache-interceptor/dev'); // [!code ++]

// same object, but with updated typings.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts{3,4} [Browser]
const Axios = window.axios;

// Choose development bundle. // [!code ++]
const { setupCache } = window.AxiosCacheInterceptor;

// same object, but with updated typings.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

```ts {5,11} [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';

// Only import from `/dev` where you import `setupCache`.
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor'; // [!code --]
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor/dev'; // [!code ++]

// same object, but with updated typings.
const axios = setupCache(Axios, {
  debug: console.log // [!code ++]
});
```

:::

And much more, depending on your context, situation and configuration. **Any misbehavior
that you find will have a log to explain it.**

::: details Sample of logs sent to console.

```json
[
  {
    "id": "-644704205",
    "msg": "Sending request, waiting …",
    "data": { "overrideCache": false, "state": "empty" }
  },
  {
    "id": "-644704205",
    "msg": "Waiting list had a deferred for this key, waiting for it to finish"
  },
  {
    "id": "-644704205",
    "msg": "Detected concurrent request, waiting for it to finish"
  },
  {
    "id": "-644704205",
    "msg": "Useful response configuration found",
    "data": {
      "cacheConfig": {
        /*...*/
      },
      "cacheResponse": {
        "data": {
          /*...*/
        },
        "status": 200,
        "statusText": "OK",
        "headers": {
          /*...*/
        }
      }
    }
  },
  {
    "id": "-644704205",
    "msg": "Found waiting deferred(s) and resolved them"
  },
  {
    "id": "-644704205",
    "msg": "Returning cached response"
  },

  // First request ended, second call below:
  {
    "id": "-644704205",
    "msg": "Response cached",
    "data": {
      "cache": {
        /*...*/
      },
      "response": {
        /*...*/
      }
    }
  },
  {
    "id": "-644704205",
    "msg": "Returning cached response"
  }
]
```

:::
