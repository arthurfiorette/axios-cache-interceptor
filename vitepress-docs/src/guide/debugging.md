# Debugging

I'm certainly sure that along the way you will find some cache behavior that is not the
expected to the current situation. To help with that, the library has a separate build
with debug logs enabled. You can use it by changing the `setupCache` import to:

<code-group>
<code-block title="CommonJS">

```ts{2,5}
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor/dev');
 
// same object, but with updated typings.
const axios = setupCache(Axios, { debug: console.log });
 
const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
 
const [res1, res2] = await Promise.all([req1, req2]);
 
res1.cached; // false
res2.cached; // true
```

</code-block>

<code-block title="EcmaScript">

```ts{2,5}
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor/dev';
 
// same object, but with updated typings.
const axios = setupCache(Axios, { debug: console.log });
 
const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
 
const [res1, res2] = await Promise.all([req1, req2]);
 
res1.cached; // false
res2.cached; // true 
```
</code-block>

<code-block title="Browser">

```ts{2,5}

const Axios = window.axios;
const { setupCache } = window.AxiosCacheInterceptor; /* choose development bundle */
 
// same object, but with updated typings.
const axios = setupCache(Axios, { debug: console.log });
 
const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
 
const [res1, res2] = await Promise.all([req1, req2]);
 
res1.cached; // false
res2.cached; // true

```
</code-block>

<code-block title="Skypack">

```ts{2,5}
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor/dev';
 
// same object, but with updated typings.
const axios = setupCache(Axios, { debug: console.log });
 
const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
 
const [res1, res2] = await Promise.all([req1, req2]);
 
res1.cached; // false
res2.cached; // true
```

</code-block>

</code-group>

::: tip

You can change the import where you use `setupCache`. Types from `axios-cache-interceptor`
and `axios-cache-interceptor/dev` literally comes from the same file, so you can use them
interchangeably.

:::

::: details When running the above code, these logs will be printed to the console:

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

And much more, depending on your context, situation and configuration. **I'm sure any
misbehavior that you find will have a log to explain it.**
