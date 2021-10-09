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
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/network/members"
      ><img
        src="https://img.shields.io/github/forks/ArthurFiorette/axios-cache-interceptor?logo=github&label=Forks"
        target="_blank"
        alt="Forks" /></a
  ></code>
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
        src="https://img.shields.io/npm/v/axios-cache-interceptor?color=CB3837&logo=npm&label=Npm"
        target="_blank"
        alt="Npm" /></a
  ></code>
</div>

<h1></h1>

<br />
<br />

### `axios-cache-interceptor` is a axios wrapper for caching and preventing unneeded requests

<br />

```ts
import axios from 'axios';
import { createCache, SessionCacheStorage } from 'axios-cache-interceptor';

// Any custom axios instance
const api = axios.create();

// Other axios instance with caching enabled
const cachedApi = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determine the cache expiration time
  interpretHeader: true
});

// Make a simple request, with caching support, to the api
const { data } = await cachedApi.get('https://api.example.com/');
```

<br />
<br />

## Installing

> Axios is a peer dependency and must be installed separately.

```sh
# Npm
npm install --save axios axios-cache-interceptor

# Yarn
yarn add axios axios-cache-interceptor
```

<br />

## Support list

Below you can check what version of this package is supported by your version of axios.

> **NOTE**: Below v2.9, axios was not configured as a peer dependency

| [Version](https://github.com/ArthurFiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) | Supported          |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | ------------------ |
| `v2.9`                                                                        | `>= v0.22`                                       | :white_check_mark: |
| `<= v2.8`                                                                     | `v0.21`                                          | :x:                |

<br />

## Getting Started

To you use this cache interceptor, you can apply to an existing instance or create a new
one.

```js
import { applyCache } from 'axios-cache-interceptor';

// Your axios instance
let axios;

// Return the same axios instance, but with a modified Typescript type.
axios = applyCache(axios, {
  /* options here */
});
```

or by creating a new one:

```js
import { createCache } from 'axios-cache-interceptor';

const axios = createCache({
  /* options here */
});
```

After that, you can made your own requests normally.

<br />

## What we support

- [x] Cache concurrent requests
- [x] Typescript support
- [x] Unit tests
- [x] Header interpretation
- [x] Infinity storage options
- [x] Cache revalidation from responses
- [ ] External storages, like redis

## Basic Knowledge

### Request id

A good thing to know is that every request passed through this interceptor, has an id.
**This does not mean that is a unique id**. The id is used in a number of ways, but the
most important is to bind a request to its cache.

The id generation is good enough to generate the same id for theoretically sames requests.
The example of this is a request with `{ baseUrl: 'https://a.com/', url: '/b' }` results
to the same id with `{ url: 'https://a.com/b/' }`.

The id is retrieved with the response object.

```js
const result = await cache.get(/* ... */);

const id = result.id; // <-- The id to find the cache and more;
```

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

<br />

## Global configuration

When applying the interceptor, you can customize some properties:

```js
const axios = createCache({
  // Properties here
});
```

### storage

The storage used to save the cache. Here will probably be the most changed property.
Defaults to [MemoryStorage](src/storage/memory.ts).

You can create your own implementation by implementing
[CacheStorage](src/storage/types.ts).

There are few built in storage implementations, you can use them by importing:

```js
import /* ... */ 'axios-cache-interceptor/dist/storage/{name}';
```

- [MemoryStorage](src/storage/memory.ts)
  `import 'axios-cache-interceptor/dist/storage/memory';`
- [Session and Local Storage](src/storage/web.ts)
  `import 'axios-cache-interceptor/dist/storage/web';`
- _Maybe your own?_ (PR's are welcome)

### generateKey

The function used to create different keys for each request. Defaults to a function that
priorizes the id, and if not specified, a string is generated using the method, baseUrl,
params, and url.

### waiting

A simple object that will hold a promise for each pending request. Used to handle
concurrent requests.

Can also be used as type of _listener_ to know when a request is finished.

### headerInterpreter

The function used to interpret all headers from a request and determine a time to live
(`ttl`) number.

Check out the [inline documentation](src/header/types.ts) to know how to modify your own.

### requestInterceptor and responseInterceptor

The used request and response interceptor. Basically the core function of this library.
Check out the used [request](src/interceptors/request.ts) and
[response](src/interceptors/response.ts) to see the default used.

<br />

## Per-request configuration

By using this axios client and using an ide with intellisense, you'll see a custom
property called `cache`.

The inline documentation is self explanatory, but here are some examples and information:

### ttl

The time that the request will remain in cache. Some custom storage implementations may
not respect 100% the time.

When using `interpretHeader`, this value is ignored.

### interpretHeader

If activated, when the response is received, the `ttl` property will be inferred from the
requests headers. See the actual implementation of the
[`interpretHeader`](src/header/interpreter.ts) method for more information. You can
override the default behavior by setting the `headerInterpreter` when creating the cached
axios client.

### methods

Specify what request methods should be cached.

Defaults to only `GET` methods.

### cachePredicate

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

### update

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

<br />

## Inspiration

This project is highly inspired by several projects, written entirely in typescript,
supporting https headers and much more.

Take a look at some similar projects:

- [axios-cache-adapter](https://github.com/RasCarlito/axios-cache-adapter)
- [axios-cache-plugin](https://github.com/jin5354/axios-cache-plugin)
- [@tusbar/cache-control](https://github.com/tusbar/cache-control)

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

<br />

## Contact

See my contact information on my [github profile](https://github.com/ArthurFiorette) or
open a new issue.

<br />
