---
url: https://axios-cache-interceptor.js.org/config.md
---
# setupCache()

`setupCache` receives an axios instance and the optional properties described below. It
modifies the instance in place and returns it. Call it only once per instance; a second call
throws an error.

```ts
const axios = setupCache(axiosInstance, OPTIONS);
```

::: tip

`setupCache` also accepts every `cache.*` [request-specific](./config/request-specifics.md)
option, passed at the top level (`{ ttl }`, not `{ cache: { ttl } }`). Values passed here
become the defaults for all requests made with this instance.

:::

::: warning

Calling `setupCache(Axios, OPTIONS)` on the default axios export only caches requests made
through that default instance. Instances created afterwards with `Axios.create()` do not get
the cache interceptors, and calling `setupCache` on them throws, because they inherit the
`defaults.cache` value set by the first call.

To share cached data between instances, call `setupCache` on each instance and pass them the
same [`storage`](#storage).

:::

## location

* Type: `InstanceLocation` (`'client' | 'server'`)
* Default: `typeof window === 'undefined' ? 'server' : 'client'`

A hint to the library about where the axios instance is running. The default header
interpreter uses it for `Cache-Control: private`. When the location is `'server'`, those
responses are not cached.

`setupCache` always detects this value and ignores any `location` passed in its options. To
change it, assign the property after setup:

```ts
const axios = setupCache(Axios.create());

// Treat this instance as a browser client, even when running in Node.js
axios.location = 'client';
```

## storage

* Type: `AxiosStorage`
* Default: `buildMemoryStorage()`

The storage saves, retrieves and, when needed, serializes the responses received from the
network.

See the [Storages](./guide/storages.md) page for more information.

## generateKey

* Type: `KeyGenerator<unknown, unknown>`
* Default: `defaultKeyGenerator`

The function that generates the cache key (the request ID) for each request.

The default generator returns the request's `id` when one is set. Otherwise, it hashes the
request's `method`, `baseURL`, `url`, `params` and `data` into a 32-bit key. When
[`Vary`](./config/request-specifics.md#cache-vary) requires it, the values of the request
headers it lists are included too.

::: warning

If a persistent cache may hold more than 77K unique keys, use a stronger hashing algorithm.

[Read more](./guide/request-id.md#custom-generator)

:::

## waiting

* Type: `Map<string, Deferred<void>>`
* Default: `new Map()`

A map holding a deferred promise for each pending request, used to deduplicate concurrent
requests.

You shouldn't change it. It is exposed in case you want to use it as a listener, for example
to know when a request is waiting for another one to finish.

## headerInterpreter

* Type: `HeaderInterpreter`
* Default: `defaultHeaderInterpreter`

The function that reads the response headers and determines the time to live (`ttl`) of the
cache entry. It receives the response headers and the instance's [`location`](#location).

The default interpreter handles `Cache-Control` (`no-cache`, `no-store`, `private`,
`immutable`, `max-age`, `max-stale` and `stale-while-revalidate`), `Age` and `Expires`.

::: warning

Many REST backends return some variation of `Cache-Control: no-cache` or
`Cache-Control: no-store`, which tells the library not to cache the response at all. Set
[`cache.interpretHeader`](./config/request-specifics.md#cache-interpretheader) to `false` for
those requests.

*If the debug mode prints `Cache-Control header indicates: do not cache`, this is probably
the reason.*

:::

The possible return values are:

* `'dont cache'`: the response will not be cached.
* `'not enough headers'`: the [`cache.ttl`](./config/request-specifics.md#cache-ttl) option
  is used instead.
* `number`: used as the TTL, in milliseconds.
* `{ cache: number, stale?: number }`: used as the TTL and the stale TTL, in milliseconds.

::: details Example of a custom headerInterpreter

```ts
import Axios from 'axios';
import {
  setupCache,
  type HeaderInterpreter
} from 'axios-cache-interceptor';

const myHeaderInterpreter: HeaderInterpreter = (headers) => {
  if (headers['x-my-custom-header']) {
    const seconds = Number(headers['x-my-custom-header']);

    if (seconds < 1) {
      return 'dont cache';
    }

    // The TTL is in milliseconds
    return seconds * 1000;
  }

  return 'not enough headers';
};

const axios = setupCache(Axios.create(), {
  headerInterpreter: myHeaderInterpreter
});
```

:::

## requestInterceptor

* Type: `AxiosInterceptor<InternalCacheRequestConfig<unknown, unknown>>`
* Default: `defaultRequestInterceptor(axios)`

The interceptor that runs before the request is sent to the axios adapter.

It is the main function of this library and connects the axios request to the cache.

It isn't meant to be replaced, but you can pass your own implementation to this property if
you need to.

See [its source code](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors)
for more information.

## responseInterceptor

* Type: `AxiosInterceptor<Partial<CacheAxiosResponse<unknown, unknown>> & AxiosResponse<unknown, unknown>>`
* Default: `defaultResponseInterceptor(axios)`

The interceptor that runs after the axios adapter returns a response.

It is the second most important function of this library and connects the axios response
to the cache.

It isn't meant to be replaced, but you can pass your own implementation to this property if
you need to.

See [its source code](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors)
for more information.

## register

* Type: `boolean`
* Default: `true`

Controls whether `setupCache()` registers the cache interceptors automatically.

* `true`: registers both cache interceptors (default).
* `false`: does not register them.

Use `false` when you need full control over the interceptor order. See
[Other interceptors](./guide/interceptors.md) for how axios orders interceptors.

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create(), { register: false });

// Register the cache response interceptor first (response interceptors are FIFO)
axios.interceptors.response.use(
  axios.responseInterceptor.onFulfilled,
  axios.responseInterceptor.onRejected
);

// Register your own interceptors
axios.interceptors.request.use((req) => req);
axios.interceptors.response.use((res) => res);

// Register the cache request interceptor last (request interceptors are LIFO)
axios.interceptors.request.use(
  axios.requestInterceptor.onFulfilled,
  axios.requestInterceptor.onRejected
);
```

## debug

&#x20;

* Type: `(msg: { id?: string; msg?: string; data?: unknown }) => void` or `undefined`
* Default: `undefined` (no logging)

::: warning

This option only works with the [development build](./guide/debugging.md).

:::

A function that receives debug information about every caching decision. Use it to trace
unexpected behavior. It receives an object with optional `id`, `msg` and `data` fields, and
returns nothing.

Read the [Debugging](./guide/debugging.md) page for the complete guide.

::: details Example of a custom debug function

```ts
// Alternatives: pick one per instance.

// Prints debug info to the console.
setupCache(Axios.create(), { debug: console.log });

// Sends it to your own logging platform.
setupCache(Axios.create(), {
  debug: ({ id, msg, data }) =>
    myLoggerExample.emit({ id, msg, data })
});

// Disables debugging (default).
setupCache(Axios.create(), { debug: undefined });
```

:::
