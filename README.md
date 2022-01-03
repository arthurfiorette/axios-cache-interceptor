<br />
<div align="center">
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/issues"
      ><img
        src="https://img.shields.io/github/issues/ArthurFiorette/axios-cache-interceptor?logo=github&label=Issues"
        target="_blank"
        alt="Issues" /></a
  ></code>
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/stargazers"
      ><img
        src="https://img.shields.io/github/stars/ArthurFiorette/axios-cache-interceptor?logo=github&label=Stars"
        target="_blank"
        alt="Stars" /></a
  ></code>
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/blob/main/LICENSE"
      ><img
        src="https://img.shields.io/github/license/ArthurFiorette/axios-cache-interceptor?logo=githu&label=License"
        target="_blank"
        alt="License" /></a
  ></code>
  <code
    ><a href="https://codecov.io/gh/arthurfiorette/axios-cache-interceptor"
      ><img
        src="https://codecov.io/gh/arthurfiorette/axios-cache-interceptor/branch/main/graph/badge.svg?token=ML0KGCU0VM"
        target="_blank"
        alt="Codecov" /></a
  ></code>
  <br />
  <code
    ><a href="https://www.npmjs.com/package/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/npm/dm/axios-cache-interceptor?style=flat"
        target="_blank"
        alt="Downloads" /></a
  ></code>
  <code
    ><a href="https://bundlephobia.com/package/axios-cache-interceptor@latest"
      ><img
        src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat"
        target="_blank"
        alt="Minified Size" /></a
  ></code>
  <code
    ><a href="https://packagephobia.com/result?p=axios-cache-interceptor@latest"
      ><img
        src="https://packagephobia.com/badge?p=axios-cache-interceptor@latest"
        target="_blank"
        alt="Install Size" /></a
  ></code>
  <code
    ><a href="https://npm.runkit.com/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/badge/try%20on-RunKit-brightgreen"
        target="_blank"
        alt="Try on RunKit" /></a
  ></code>
  <br />
  <br />
  <br />
  <pre>
  <br />
  <h1>🗄️🔥💨
Axios Cache Interceptor</h1>
  <br />
  </pre>
  <br />
</div>

<h1></h1>
<br />
<br />

### `axios-cache-interceptor` is a axios wrapper for caching and preventing unneeded requests

<br />

```ts
import { setupCache, SessionCacheStorage } from 'axios-cache-interceptor';

// The default axios instance or your custom one
let axios;

// Apply the interceptor to the provided instance
setupCache(axios, {
  /* options */
});

// Make a simple request, with caching support, to the api
const resp1 = await axios.get('https://api.example.com/');
// resp1.cached = false

const resp2 = await axios.get('https://api.example.com/');
// resp2.cached = true
```

<br />
<br />

- [Features](#features)
- [Installing](#installing)
  - [Via NPM](#via-npm)
  - [Via CDN](#via-cdn)
- [Support List](#support-list)
- [Getting Started](#getting-started)
- [Default Axios Instance](#default-axios-instance)
- [Compiled code](#compiled-code)
  - [NodeJS](#nodejs)
  - [Browsers](#browsers)
- [Typescript Users](#typescript-users)
- [Basic Knowledge](#basic-knowledge)
  - [Request id](#request-id)
  - [Response object](#response-object)
    - [response.cached](#responsecached)
    - [response.id](#responseid)
  - [Storages](#storages)
- [Global Configuration](#global-configuration)
  - [config.storage](#configstorage)
  - [config.generateKey](#configgeneratekey)
  - [config.waiting](#configwaiting)
  - [config.headerInterpreter](#configheaderinterpreter)
  - [config.requestInterceptor and config.responseInterceptor](#configrequestinterceptor-and-configresponseinterceptor)
- [Per-request configuration](#per-request-configuration)
  - [request.id](#requestid)
  - [request.cache.ttl](#requestcachettl)
  - [request.cache.interpretHeader](#requestcacheinterpretheader)
  - [request.cache.methods](#requestcachemethods)
  - [request.cache.cachePredicate](#requestcachecachepredicate)
  - [request.cache.update](#requestcacheupdate)
  - [request.cache.etag](#requestcacheetag)
  - [request.cache.modifiedSince](#requestcachemodifiedsince)
- [License](#license)
- [Contact](#contact)

<br />

## Features

- [x] Concurrent requests
- [x] Typescript support
- [x] Unit tests
- [x] Header interpretation
- [x] ETag and If-Modified-Since cache support
- [x] Infinity storage options
- [x] Cache revalidation from responses
- [x] Support for external storages

<br />

## Installing

> Axios must be installed separately.

### Via NPM

```sh
npm install --save axios axios-cache-interceptor
# or
yarn add axios axios-cache-interceptor
```

```js
const { setupCache } = require('axios-cache-interceptor');
// or
import { setupCache } from 'axios-cache-interceptor';
```

### Via CDN

![Version](https://img.shields.io/npm/v/axios-cache-interceptor?style=flat)

```html
<!-- Replace latest with the desired version -->

<!-- Development for ES2020+ (~30KB, use index.development.min.js for ~10KB) -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest/dist/index.development.js"
></script>

<!-- Production for ES6+ (~12KB) -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest/dist/index.min.js"
></script>

<!-- Production for ES5+ (~22KB) -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest/dist/index.es5.min.js"
></script>

<!-- Production for ES2020+ (~9KB) -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest/dist/index.es2020.min.js"
></script>
```

```js
const { setupCache } = window.AxiosCacheInterceptor;
```

<br />

## Support List

Below you can check what version of this package is supported by your version of axios.
But that does not mean that won't work with any version. **Most of "breaking changes" made
by axios was it's types.**

> **NOTE**: Below v0.3, axios was not configured as a peer dependency

| [Version](https://github.com/ArthurFiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.5`                                                                     | `>= v0.24`                                       |
| `~ v0.4`                                                                      | `>= v0.23`                                       |
| `~ v0.3`                                                                      | `>= v0.22`                                       |
| `<= v0.2`                                                                     | `v0.21`                                          |

<br />

## Getting Started

To you use this cache interceptor, you can apply to an existing instance or create a new
one.

```js
import { setupCache } from 'axios-cache-interceptor';

// Your axios instance (Can also be the global one)
let axios;

// Return the same axios instance, but with a modified Typescript type.
axios = setupCache(axios, {
  /* options here */
});
```

After that, you can made your own requests normally, as this library respects axios API.

Afterwards, the only thing you may need to configure is per-request configuration, you can
change them with the `cache` property.

```js
import { setupCache } from 'axios-cache-interceptor';

// Your axios-cache-interceptor instance
let axios;

axios.get('url', {
  cache: {
    /** Options here */
  }
});
```

You will get syntax highlighting for all options and what they do. But you can also read
here: [Per-request configuration](#per-request-configuration).

<br />

## Default Axios Instance

Sometimes, by using other libraries, frameworks and etc, you may want or need to use the
global axios instance, (the one exported by default). That's no big deal, as the
`setupCache` function returns the same axios instance, you can just do that:

**_Attention! Using the global axios can break any other code that also uses the default
axios instance._**

```js
// index.js
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

setupCache(axios, {
  /* options here */
});
```

```js
// my-other-file.js
import axios from 'axios';

// caching is enabled!
axios.get('url');
```

But, you'll see that the typescript intellisense won't work, as the global axios instance
has the defaults axios typings. To fix that, you'll have to override the global axios
typings or force the type for every parameter:

```ts
import axios from 'axios';
import { AxiosCacheInstance } from 'axios-cache-interceptor';

const Axios = axios as AxiosCacheInstance;

axios.defaults.cache; // works!
```

<br />

## Compiled code

### NodeJS

The code is compiled with `tsc` with support to `>= ES6`. See the
[build config](/tsconfig.build.json).

- `axios-cache-interceptor`: Redirects to `/dist/index.js`
- `axios-cache-interceptor/dist/index.js`: The main library file.
- `axios-cache-interceptor/dist/index.d.ts`: The Typescript definition file.

Every browser build is also compatible with CommonsJS because it builds with UMD, so you
can use them too.

### Browsers

> _NOTE_: Axios itself requires [ES6 Promises](https://axios-http.com/docs/notes#promises)

The UMD code is compiled with `webpack` with support to `>= ES5`. See the
[build config](/webpack.config.js). You can import these files anywhere (Browser,
CommonsJS and more)

- `axios-cache-interceptor/dist/index.min.js`: Production file for ES6+
- `axios-cache-interceptor/dist/index.es5.min.js`: Production file for ES5+
- `axios-cache-interceptor/dist/index.development.js`: Development file

```html
<!-- You can use the cdn of your choice -->

<!-- UNPKG -->
<script crossorigin src="https://unpkg.com/axios-cache-interceptor@latest"></script>

<!-- JSDELIVR -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest"
></script>

<!-- Etc... -->
```

<br />

## Typescript Users

This package does not pollute the global axios typings. Instead, the `setupCache` returns
the same axios instance but with **extended** typings.

```ts
const axios = axios.create();
axios === setupCache(axios, {});
```

In this way, we recommend you to not use a global axios instance with typescript, so you
can use all exported types from `axios-cache-interceptor` by creating a new variable.

```ts
import Axios from 'axios';
import { setupCache, AxiosCacheInstance } from 'axios-cache-interceptor';

// instance will have our custom typings from the return of this function
const instance = setupCache(
  Axios.create({
    // Axios options
  }),
  {
    // Axios-cache-interceptor options
  }
);

// OR

const instance = axios.create({
  // Axios options
}) as AxiosCacheInstance;

// As this functions returns the same axios instance but only with
// different typings, you can ignore the function return.
setupCache(instance, {
  // Axios-cache-interceptor options
});
```

<br />

## Basic Knowledge

### Request id

A good thing to know is that every request passed through this interceptor, has an id.
**This does not mean that is a unique id**. The id is used in a number of ways, but the
most important is to bind a request to its cache.

The id generation is good enough to generate the same id for theoretically sames requests.
The example of this is a request with `{ baseUrl: 'https://a.com/', url: '/b' }` results
to the same id with `{ url: 'https://a.com/b/' }`.

Also, a custom id can be used to treat two requests as the same.

```js
axios.get('...', {
  id: 'my-custom-id',
  cache: {
    // other properties...
  }
});
```

The [default](src/util/key-generator.ts) id generation can clarify this idea.

### Response object

Every response that came from our custom axios instance, will have some extras properties,
that you can retrieve like that:

```js
const result = await cache.get(/* ... */);
const id = result['propertyName'];
```

#### response.cached

A simple boolean to check whether this request was cached or not.

**NOTE**: The first response of a request capable of being cached will return
`cached: false`, as only your next requests will return `cached: true`.

#### response.id

The [request id](#request-id) resolved. This property represents the ID used throughout
the internal code. Remember that, depending on the
[config.keyGenerator](#configgeneratekey), it can be different as the provided on the
[request.id](#requestid).

### Storages

A storage is the main object responsible for saving, retrieving and serializing (if
needed) cache data. There are two simple ones that comes by default:

- [In Memory](src/storage/memory.ts) with `buildMemoryStorage` (Node and Web)
- [Web Cache](src/storage/web-api.ts) with `buildWebStorage` (Web only)

Both of them are included in all bundles.

You can create your own storage by using the `buildStorage` function. Take a look at this
example with [NodeRedis](https://github.com/redis/node-redis) v4.

```js
import { createClient } from 'redis'; // 4.0.1
import { buildStorage } from 'axios-cache-interceptor';

const client = createClient();

await client.connect();

const myCustomStorage = buildStorage({
  find: async (key) => {
    return await client.get(`axios-cache:${key}`);
  },
  set: async (key, value) => {
    await client.set(`axios-cache:${key}`, JSON.stringify(value));
  },
  remove: async (key) => {
    await client.del(`axios-cache:${key}`);
  }
});
```

<br />

## Global Configuration

When applying the interceptor, you can customize some properties:

```js
const axios = setupCache(axios, {
  // Properties here
});
```

### config.storage

The storage used to save the cache. Defaults to a simple in-memory storage.

See more about storages [here](#storages).

### config.generateKey

The function used to create different keys for each request. Defaults to a function that
priorizes the id, and if not specified, a string is generated using the method, baseUrl,
params, and url.

### config.waiting

A simple object that will hold a promise for each pending request. Used to handle
concurrent requests.

Can also be used as type of _listener_ to know when a request is finished.

### config.headerInterpreter

The function used to interpret all headers from a request and determine a time to live
(`ttl`) number.

Check out the [inline documentation](src/header/types.ts) to know how to modify your own.

### config.requestInterceptor and config.responseInterceptor

The used request and response interceptor. Basically the core function of this library.
Check out the used [request](src/interceptors/request.ts) and
[response](src/interceptors/response.ts) to see the default used.

<br />

## Per-request configuration

By using this axios client and using an ide with intellisense, you'll see a custom
property called `cache`.

The inline documentation is self explanatory, but here are some examples and information:

### request.id

You can override the request id used by this property.

### request.cache.ttl

The time until the cached value is expired in milliseconds.

If a function is used, it will receive the complete response and waits to return a TTL
value

When using `interpretHeader: true`, this value will only be used if the interpreter can't
determine their TTL value to override this

### request.cache.interpretHeader

If activated, when the response is received, the `ttl` property will be inferred from the
requests headers. See the actual implementation of the
[`interpretHeader`](src/header/interpreter.ts) method for more information. You can
override the default behavior by setting the `headerInterpreter` when creating the cached
axios client.

### request.cache.methods

Specify what request methods should be cached.

Defaults to only `GET` methods.

### request.cache.cachePredicate

An object or function that will be tested against the response to test if it can be
cached. See the [inline documentation](src/util/cache-predicate.ts) for more.

An simple example with all values:

```js
axios.get('url', {
  cache: {
    cachePredicate: {
      // Only cache if the response comes with a *good* status code
      statusCheck: [200, 399],

      // Tests against any header present in the response.
      containsHeader: {
        'x-custom-header': true,
        'x-custom-header-2': 'only if matches this string',
        'x-custom-header-3': (value) => /* some calculation */ true
      },

      // Check custom response body
      responseMatch: (response) => {
        // Sample that only caches if the response is authenticated
        return response.auth.status === 'authenticated':
      }
    }
  }
});
```

### request.cache.update

Once the request is resolved, this specifies what other responses should change their
cache. Can be used to update the request or delete other caches. It is a simple `Record`
with the request id.

Example:

```js
// Retrieved together with their responses
let otherResponseId;
let userInfoResponseId;

axios.get('url', {
  cache: {
    update: {
      // Evict the otherRequestId cache when this response arrives
      [otherResponseId]: 'delete',

      // An example that update the "user info response cache" when doing a login.
      // Imagine this request is a login one.
      [userInfoResponseId]: (cachedValue, thisResponse) => {
        return { ...cachedValue, user: thisResponse.user.info };
      }
    }
  }
});
```

### request.cache.etag

If the request should handle `ETag` and `If-None-Match support`. Use a string to force a
custom static value or true to use the previous response ETag. To use `true` (automatic
etag handling), `interpretHeader` option must be set to `true`. Default: `false`

### request.cache.modifiedSince

Use `If-Modified-Since` header in this request. Use a date to force a custom static value
or true to use the last cached timestamp. If never cached before, the header is not set.
If `interpretHeader` is set and a `Last-Modified` header is sent then value from that
header is used, otherwise cache creation timestamp will be sent in `If-Modified-Since`.
Default: `true`

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

<br />

## Contact

See my contact information on my [github profile](https://github.com/ArthurFiorette) or
open a new issue.

<br />
