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

If you want to use the same cache interceptor for all your axios instances, you can
call `setupCache` with the default axios instance.

```ts
import Axios from 'axios';
setupCache(Axios, OPTIONS);
```

:::

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

The function used to create different keys for each request. Defaults to a function that
priorizes the id, and if not specified, a string is generated using the `method`,
`baseURL`, `params`, `data` and `url`.

You can learn on how to use them on the
[Request ID](./guide/request-id.md#custom-generator) page.

## waiting

<Badge text="optional" type="warning"/>

- Type: `Record<string, Deferred<CachedResponse>>`
- Default: `{}`

A simple object that will hold a promise for each pending request. Used to handle
concurrent requests.

You'd normally not need to change this, but it is exposed in case you need to use it as
some sort of listener of know when a request is waiting for other to finish.

## headerInterpreter

 <Badge text="optional" type="warning"/>

- Type: `HeadersInterpreter`
- Default: `defaultHeaderInterpreter`

The function used to interpret all headers from a request and determine a time to live
(`ttl`) number.

::: warning

Many REST backends returns some variation of `Cache-Control: no-cache` or
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
import { setupCache, type HeadersInterpreter } from 'axios-cache-interceptor';

const myHeaderInterpreter: HeadersInterpreter = (headers) => {
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
  debug: ({ id, msg, data }) => myLoggerExample.emit({ id, msg, data })
});

// Disables debug. (default)
setupCache(axiosInstance, { debug: undefined });
```

:::
