# setupCache()

The `setupCache` function receives the axios instance and a set of optional properties
described below. This modifies the axios instance in place and returns it.

```ts
const axios = setupCache(axiosInstance, OPTIONS);
```

::: tip

The `setupCache` function receives global options and all
[request specifics](./config/request-specifics.md) ones too. This way, you can customize
the defaults for all requests.

:::

::: tip

If you want to use the same cache interceptor for all your axios instances, you can call
`setupCache` with the default axios instance.

```ts
import Axios from 'axios';
setupCache(Axios, OPTIONS);
```

:::

## location

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158?utm_source=docs&utm_medium=badge&utm_campaign=deprecation">
 <Badge text="deprecated" type="danger"/>
</a>

<Badge text="optional" type="warning"/>

- Type: `InstanceLocation`
- Default: `typeof window === 'undefined' ? 'server' : 'client'`

A hint to the library about where the axios instance is being used.

Used to take some decisions like handling or not `Cache-Control: private`.

```ts
// NodeJS
const cache = setupCache(Axios.create(), {
  location: 'server'
});

// Browser
const cache = setupCache(Axios.create(), {
  location: 'client'
});
```

## storage

<Badge text="optional" type="warning"/>

- Type: `AxiosStorage`
- Default: `buildMemoryStorage()`

A storage interface is the entity responsible for saving, retrieving and serializing data
received from network and requested when a axios call is made.

See the [Storages](./guide/storages.md) page for more information.

## generateKey

 <Badge text="optional" type="warning"/>

- Type: `KeyGenerator<unknown, unknown>`
- Default: `defaultKeyGenerator`

The `generateKey` property defines the function responsible for generating unique keys for
each request cache.

By default, it employs a strategy that prioritizes the `id` if available, falling back to
a string generated using various request properties. The default implementation generates
a 32-bit hash key using the `method`, `baseURL`, `params`, `data`, and `url` of the
request.

::: warning

In any persistent cache scenario where hitting over 77K unique keys is a possibility, you
should use a more robust hashing algorithm.

[Read more](./guide/request-id.md#custom-generator)

:::

## waiting

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158?utm_source=docs&utm_medium=badge&utm_campaign=deprecation" target="_blank">
 <Badge text="deprecated" type="danger"/>
</a>

<Badge text="optional" type="warning"/>

- Type: `Map<string, Deferred<void>>`
- Default: `new Map`

A simple object that will hold a promise for each pending request. Used to handle
concurrent requests.

You shouldn't change this property, but it is exposed in case you need to use it as some
sort of listener or know when a request is waiting for others to finish.

## headerInterpreter

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158?utm_source=docs&utm_medium=badge&utm_campaign=deprecation" target="_blank">
 <Badge text="deprecated" type="danger"/>
</a>

<Badge text="optional" type="warning"/>

- Type: `HeaderInterpreter`
- Default: `defaultHeaderInterpreter`

The function used to interpret all headers from a request and determine a time to live
(`ttl`) number.

::: warning

Many REST backends return some variation of `Cache-Control: no-cache` or
`Cache-Control: no-store` headers, which tell us to ignore caching at all. You shall
disable `headerInterpreter` for those requests.

_If the debug mode prints `Cache header interpreted as 'dont cache'` this is probably the
reason._

:::

The possible returns are:

- `'dont cache'`: the request will not be cached.
- `'not enough headers'`: the request will find other ways to determine the TTL value.
- `number`: used as the TTL value.
- `{ cache: number, stale: number }`: used as the TTL value and stale TTL value

::: details Example of a custom headerInterpreter

```ts
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

    return seconds;
  }

  return 'not enough headers';
};
```

:::

## requestInterceptor

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158?utm_source=docs&utm_medium=badge&utm_campaign=deprecation" target="_blank">
 <Badge text="deprecated" type="danger"/>
</a>

<Badge text="optional" type="warning"/>

- Type: `AxiosInterceptor<CacheRequestConfig<unknown, unknown>>`
- Default: `defaultRequestInterceptor()`

The function that will be used to intercept the request before it is sent to the axios
adapter.

It is the main function of this library, as it is the bridge between the axios request and
the cache.

It wasn't meant to be changed, but if you need to, you can do it by passing a new function
to this property.

See its code for more information
[here](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors).

## responseInterceptor

<a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues/1158?utm_source=docs&utm_medium=badge&utm_campaign=deprecation" target="_blank">
 <Badge text="deprecated" type="danger"/>
</a>

<Badge text="optional" type="warning"/>

- Type: `AxiosInterceptor<CacheAxiosResponse<unknown, unknown>>`
- Default: `defaultResponseInterceptor()`

The function that will be used to intercept the request after it is returned by the axios
adapter.

It is the second most important function of this library, as it is the bridge between the
axios response and the cache.

It wasn't meant to be changed, but if you need to, you can do it by passing a new function
to this property.

See its code for more information
[here](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/src/interceptors).

## debug

<Badge text="dev only" type="danger"/> <Badge text="optional" type="warning"/>

- Type: `(msg: { id?: string; msg?: string; data?: unknown }) => void` or `undefined`
- Default: `undefined`

::: warning

This option only works when targeting a [Development](./guide/debugging.md) build.

:::

The debug option will print debug information in the console. It is good if you need to
trace any undesired behavior or issue. You can enable it by setting `debug` to a function
that receives an string and returns nothing.

Read the [Debugging](./guide/debugging.md) page for the complete guide.

::: details Example of a custom debug function

```ts
// Will print debug info in the console.
setupCache(axiosInstance, { debug: console.log });

// Own logging platform.
setupCache(axiosInstance, {
  debug: ({ id, msg, data }) =>
    myLoggerExample.emit({ id, msg, data })
});

// Disables debug. (default)
setupCache(axiosInstance, { debug: undefined });
```

:::
