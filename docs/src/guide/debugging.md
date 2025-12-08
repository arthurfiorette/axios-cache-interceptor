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

## Understanding Debug Messages

To help you understand what each debug message means and what action is being taken, we've created comprehensive flow diagrams that document the entire request/response cycle and explain every debug message:

- **[Debug Messages Guide](/diagrams/debug-messages)** - Complete guide explaining what each debug message means, why it occurred, and what happens next
- **[Request/Response Flow Overview](/diagrams/overview)** - High-level diagram of the complete request flow
- **[All Flow Diagrams](/diagrams)** - Complete documentation of all available diagrams

These diagrams will help you:
- Understand what conditions led to a specific debug message
- Follow the path your request takes through the interceptors
- Troubleshoot unexpected caching behavior
- Learn how different cache states transition

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
    "msg": "Waiting list had an deferred for this key, waiting for it to finish"
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
