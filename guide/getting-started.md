---
url: https://axios-cache-interceptor.js.org/guide/getting-started.md
---
# Getting started

[Looking for axios v0?](https://axios-cache-interceptor.js.org/v0/)

## Install

Install Axios and Axios Cache Interceptor:

::: code-group

```bash [NPM]
npm install axios@^1 axios-cache-interceptor@^1
```

```html [Browser]
<!-- Development UMD build (~22 KiB) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dev/index.bundle.js"></script>

<!-- Production UMD build (~18 KiB) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1/dist/index.bundle.js"></script>
```

```ts [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor';
```

:::

## Setup

Import `setupCache` and apply it to your axios instance:

::: code-group

```ts [ECMAScript]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create(); // [!code focus]
const axios = setupCache(instance); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [CommonJS]
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const instance = Axios.create(); // [!code focus]
const axios = setupCache(instance); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [Browser]
const Axios = window.axios;
const { setupCache } = window.AxiosCacheInterceptor;

const instance = Axios.create(); // [!code focus]
const axios = setupCache(instance); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor';

const instance = Axios.create(); // [!code focus]
const axios = setupCache(instance); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

:::

`setupCache(instance)` registers both cache interceptors. If you need a custom interceptor
order, see [Other interceptors](./interceptors.md).

This is enough for most use cases. To change the defaults, pass a
[configuration object](../config.md) to `setupCache`. To change the behavior of a single
request, use the [`cache` option](../config/request-specifics.md#cache) in its request
config.

## Support table

Most breaking changes in Axios v0 were typing issues, so your version may work with a
combination outside this table. **Axios and Axios Cache Interceptor v0 are not compatible
with Axios and Axios Cache Interceptor v1.**

> **Note**: Not every v0 release declared Axios as a `peerDependency`, because Axios did not
> follow stable semver at the time.
> [See #145 (Comment)](https://github.com/arthurfiorette/axios-cache-interceptor/issues/145#issuecomment-1042710481)

| [Axios](https://github.com/axios/axios/releases) | [Axios Cache Interceptor](https://github.com/arthurfiorette/axios-cache-interceptor/releases) |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `>= v1.7.8`                                      | `>= v1.7.0`                                                                                   |
| `>= v1.6`                                        | `>= v1.3.0 && <= 1.6.2`                                                                       |
| `>= v1.4`                                        | `>= v1.2.0`                                                                                   |
| `>= v1.3.1`                                      | `>= v1`                                                                                       |
| `>= v0.27`                                       | `>= v0.10.3`                                                                                  |
| `>= v0.26`                                       | `>= v0.8.4`                                                                                   |
| `~ v0.25`                                        | `~ v0.8.4`                                                                                    |
| `~ v0.24`                                        | `>= v0.5 && <= 0.8.3`                                                                         |
| `~ v0.23`                                        | `~ v0.4`                                                                                      |
| `~ v0.22`                                        | `~ v0.3`                                                                                      |
| `v0.21`                                          | `<= v0.2`                                                                                     |

## AI / LLM skill

If you use an AI coding assistant, install the axios-cache-interceptor skill to give it
up-to-date context about this library:

```bash
npx skills add arthurfiorette/axios-cache-interceptor
```

This uses the [Skills](https://github.com/vercel-labs/skills) CLI. Once installed, your
assistant can read the library's API reference and common usage patterns.

## Read more

* [Debugging requests](./debugging.md)
* [Storages](./storages.md)
* [Global config](../config.md)
* [Per-request config](../config/request-specifics.md)
* [Response object](../config/response-object.md)
