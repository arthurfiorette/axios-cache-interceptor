<br />
<div align="center">
  <pre>
  <br />
  <h1>🗄️🔥💨
Axios Cache Interceptor</h1>
  <br />
  </pre>
  <br />
  <br />
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
  <code
    ><a href="https://www.npmjs.com/package/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/npm/dm/axios-cache-interceptor?style=flat"
        target="_blank"
        alt="Downloads" /></a
  ></code>
  <code
    ><a href="https://bundlephobia.com/package/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat"
        target="_blank"
        alt="Size" /></a
  ></code>
  <code
    ><a href="https://npm.runkit.com/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/badge/try%20on-RunKit-brightgreen"
        target="_blank"
        alt="Try on RunKit" /></a
  ></code>
</div>

<h1></h1>
<br />
<br />

### `axios-cache-interceptor` is a axios wrapper for caching and preventing unneeded requests

<br />

```ts
import axios from 'axios';
import { useCache, SessionCacheStorage } from 'axios-cache-interceptor';

// An axios instance with modified types
const api = useCache(axios.create(), {
  /* options */
});

// Make a simple request, with caching support, to the api
const resp1 = await api.get('https://api.example.com/');
// resp1.cached = false

const resp2 = await api.get('https://api.example.com/');
// resp2.cached = true
```

<br />
<br />

## Table of contents

- [Table of contents](#table-of-contents)
- [Features](#features)
- [Installing](#installing)
  - [Via NPM](#via-npm)
  - [Via CDN](#via-cdn)
- [Support list](#support-list)
- [Getting Started](#getting-started)
- [Compiled code](#compiled-code)
- [Basic Knowledge](#basic-knowledge)
  - [Request id](#request-id)
  - [Response object](#response-object)
    - [response.cached](#responsecached)
    - [response.id](#responseid)
- [Global configuration](#global-configuration)
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
const { useCache } = require('axios-cache-interceptor');
// or
import { useCache } from 'axios-cache-interceptor';
```

### Via CDN

![Version](https://img.shields.io/npm/v/axios-cache-interceptor?style=flat)

```html
<!-- Replace VERSION with the desired version -->

<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@VERSION/dist/index.bundle.js"
></script>
<!-- or -->
<script
  crossorigin
  src="https://unpkg.com/axios-cache-interceptor@VERSION/dist/index.bundle.js"
></script>
```

```js
const { useCache } = window.AxiosCacheInterceptor;
```

<br />

## Support list

Below you can check what version of this package is supported by your version of axios.
But that does not mean that won't work with any version. **Most of "breaking changes" made
by axios was it's types.**

> **NOTE**: Below v0.3, axios was not configured as a peer dependency

| [Version](https://github.com/ArthurFiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `~v0.5`                                                                       | `>= v0.24`                                       |
| `~v0.4`                                                                       | `>= v0.23`                                       |
| `~v0.3`                                                                       | `>= v0.22`                                       |
| `<= v0.2`                                                                     | `v0.21`                                          |

<br />

## Getting Started

To you use this cache interceptor, you can apply to an existing instance or create a new
one.

```js
import { useCache } from 'axios-cache-interceptor';

// Your axios instance
let axios;

// Return the same axios instance, but with a modified Typescript type.
axios = useCache(axios, {
  /* options here */
});
```

After that, you can made your own requests normally.

<br />

## Compiled code

The compiled code is built in two different ways, one as nodejs module and one as a
browser. Both of them uses **Babel** with
[Browserslist `default` preset](https://github.com/browserslist/browserslist#full-list).

You can see more here about compiling options:

- [Browser Build config](/webpack.config.js)
- [NodeJS Build Config](/tsconfig.build.json)

If, for some reason, you have a bug with the compiled code, such as a user have an
incompatible browser, please contact me.

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

<br />

## Global configuration

When applying the interceptor, you can customize some properties:

```js
const axios = useCache(axios, {
  // Properties here
});
```

### config.storage

The storage used to save the cache. Here will probably be the most changed property.
Defaults to [MemoryStorage](src/storage/memory.ts).

You can create your own implementation by implementing
[CacheStorage](src/storage/types.ts).

There are few built in storage implementations, you can use them by importing:

> With the cdn served bundle, the **MemoryStorage** and **BrowserAxiosStorage** comes by
> default. Just get them by `window.AxiosCacheInterceptor.BrowserAxiosStorage` or
> `window.AxiosCacheInterceptor.MemoryAxiosStorage`.

```js
import {} from 'axios-cache-interceptor/dist/storage/{name}';
```

- [MemoryAxiosStorage](src/storage/memory.ts)
  `import 'axios-cache-interceptor/dist/storage/memory';`
- [BrowserAxiosStorage](src/storage/browser.ts)
  `import 'axios-cache-interceptor/dist/storage/browser';`
- _Maybe your own?_ (PR's are welcome)

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

The time that the request will remain in cache. Some custom storage implementations may
not respect 100% the time.

When using `interpretHeader`, this value is ignored.

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
