# Getting Started

[Looking for axios v0?](https://axios-cache-interceptor.js.org/v0/)

## Install Axios Cache Interceptor

Add Axios Cache Interceptor and Axios to your project using your favorite package manager:

::: code-group

```bash [Yarn]
yarn add axios@^1 axios-cache-interceptor@^1
```

```bash [NPM]
npm install axios@^1 axios-cache-interceptor@^1
```

```html [Browser]
<!-- Development UMD build for ES2017+ (~14.6 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1.2.0/dev/index.bundle.js"
  integrity="sha256-NdXx0Etotu1oQmet3yjRcfG77l8ka2EGr46sdUcgIcQ="
  crossorigin="anonymous"
></script>

<!-- Production UMD build for ES5+ (~16 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@1.2.0/dist/index.bundle.js"
  integrity="sha256-mJ0VeAeWEARil2GvKXBVCD5bgcUhD2IUoD3sAl/gtOQ="
  crossorigin="anonymous"
></script>
```

```ts [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor';
```

:::

## Setup Axios Cache Interceptor

After installing, you can import the package and apply the interceptor to your axios
instance, as shown below:

::: code-group

```ts [EcmaScript]
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// same object, but with updated typings.
const axios = setupCache(Axios); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [CommonJS]
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

// same object, but with updated typings.
const axios = setupCache(Axios); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [Browser]
const Axios = window.axios;
const { setupCache } = window.AxiosCacheInterceptor;

// same object, but with updated typings.
const axios = setupCache(Axios); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

```ts [Skypack]
import Axios from 'https://cdn.skypack.dev/axios';
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor';

// same object, but with updated typings.
const axios = setupCache(Axios); // [!code focus]

const req1 = axios.get('https://api.example.com/'); // [!code focus]
const req2 = axios.get('https://api.example.com/'); // [!code focus]

const [res1, res2] = await Promise.all([req1, req2]);

res1.cached; // false // [!code focus]
res2.cached; // true // [!code focus]
```

:::

Just the above is sufficient for most use cases. However, you can also customize each
cache behavior by passing a configuration object to the `setupCache` function. And you can
also customize some behaviors each request by using the `cache` option in the request
config.

## Support Table

Most of axios v0 breaking changes were about typing issues, so your version may work with
one outside of this table. **Axios and Axios Cache Interceptor v0 are not compatible with
Axios and Axios Cache Interceptor v1**

> **Note**: Axios was not defined as a `peerDependency` for all v0 versions, because it
> had a non-stable semver version.
> [See #145 (Comment)](https://github.com/arthurfiorette/axios-cache-interceptor/issues/145#issuecomment-1042710481)

| [Axios](https://github.com/axios/axios/releases) | [Axios Cache Interceptor](https://github.com/arthurfiorette/axios-cache-interceptor/releases) |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `>= v1.4`                                        | `>= v1.2.0`                                                                                   |
| `>= v1.3.1`                                      | `>= v1`                                                                                       |
| `>= v0.27`                                       | `>= v0.10.3`                                                                                  |
| `>= v0.26`                                       | `>= v0.8.4`                                                                                   |
| `~ v0.25`                                        | `~ v0.8.4`                                                                                    |
| `~ v0.24`                                        | `>= v0.5 && <= 0.8.3`                                                                         |
| `~ v0.23`                                        | `~ v0.4`                                                                                      |
| `~ v0.22`                                        | `~ v0.3`                                                                                      |
| `v0.21`                                          | `<= v0.2`                                                                                     |

### Read More

Some useful links to get you more familiar with the library:

- [Debugging requests](./debugging.md)
- [Storages](./storages.md)
- [Global config](../config.md)
- [Per request config](../config/request-specifics.md)
- [Response object](../config/response-object.md)
