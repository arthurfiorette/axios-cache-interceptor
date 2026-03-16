---
url: 'https://axios-cache-interceptor.js.org/guide/interceptors.md'
---
# Other Interceptors

When combining `axios-cache-interceptor` with other interceptors, execution order matters.
This page explains the default behavior and how to customize it.

## TL;DR

* **Request** interceptors registered **before** `setupCache()` run **after** the cache
  interceptor; those registered **after** `setupCache()` run **before** the cache interceptor.
* **Response** interceptors registered **before** `setupCache()` run **before** the cache
  interceptor; those registered **after** `setupCache()` run **after** the cache interceptor.
* By default, `setupCache(axios)` attaches both cache interceptors immediately.
* You can disable automatic registration with `register: false` and register manually.

## Explanation

Axios interceptors are run differently for the request and response ones.

* **Request interceptors** are executed in **reverse order** - the last interceptor added runs first (LIFO - *Last In First Out*)
* **Response interceptors** are executed in **normal order** - the first interceptor added runs first (FIFO - *First In First Out*)

As explained better in the
[Axios documentation](https://github.com/axios/axios#interceptors) and in
[this issue](https://github.com/arthurfiorette/axios-cache-interceptor/issues/449#issuecomment-1370327566).

```ts
// This will run AFTER the cache interceptor
axios.interceptors.request.use((req) => req);

// This will run BEFORE the cache interceptor
axios.interceptors.response.use((res) => res);

setupCache(axios);

// This will run BEFORE the cache interceptor
axios.interceptors.request.use((req) => req);

// This will run AFTER the cache interceptor
axios.interceptors.response.use((res) => res);
```

## Custom order

If you need full control, disable automatic registration and register cache interceptors
yourself.

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios.create(), { register: false });

// Register cache response interceptor first (response interceptors are FIFO)
axios.interceptors.response.use(
  axios.responseInterceptor.onFulfilled,
  axios.responseInterceptor.onRejected
);

// Register your own interceptors
axios.interceptors.request.use((req) => req);
axios.interceptors.response.use((res) => res);

// Register cache request interceptor last (request interceptors are LIFO)
axios.interceptors.request.use(
  axios.requestInterceptor.onFulfilled,
  axios.requestInterceptor.onRejected
);
```

***

## Extending types

When using axios-cache-interceptor, you'll notice that it has a different type than the defaults `AxiosInstance`, `AxiosRequestConfig` and `AxiosResponse`. That's because we chose to override axios's interfaces instead of extending, to avoid breaking changes with other libraries.

However, this also means that when integrating with other packages or creating your own
custom interceptor, you need to override/extend our own types, `CacheInstance`,
`CacheRequestConfig` and `CacheAxiosResponse` to match your needs.

This can be done as shown below:

```ts
declare module 'axios-cache-interceptor' {
  interface CacheRequestConfig<R = unknown, D = unknown> {
    customProperty: string;
  }
}
```

## Streams and non-JSON

Sometimes you may want to cache a response that is not `JSON`, or that is a `Stream`.
Either created by another interceptor or even by the axios adapter itself.

To do so, you can use axios's native `transformResponse` option, which is a function
that receives the response and returns a string or a buffer.

**Axios Cache Interceptor** can only handle serializable data types, so you need to
convert the response to a string or a buffer.

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);
// [!code focus:8]
const response = await axios.get('my-url-that-returns-a-stream', {
  responseType: 'stream',
  transformResponse(response) {
    // You will need to implement this function.
    return convertStreamToStringOrObject(response.data);
  }
});

response.data; // Will be a string and will be able to be cached.
```

This library cannot handle streams or buffers, so if you still need `response.data` to be
a stream or buffer, you will need to cache it manually.

If you can collect the response data into a serializable format, `axios-cache-interceptor`
can handle it for you with help of the `transformResponse` option.

## Custom Adapters

If you are writing a custom Axios adapter, **always throw an `AxiosError`** (not a plain
`Error` or any other type) when the request fails. The cache interceptor relies on the
`AxiosError.config` property to identify which in-flight request failed so it can clean up
internal state (the deferred waiting map and the loading cache entry).

If your adapter throws a non-`AxiosError`, the interceptor cannot determine which request
failed, which will leave the cache entry stuck in a `loading` state and cause all
subsequent requests to that key to hang indefinitely. The development build will log a
debug message when this happens.

```ts
import { AxiosError } from 'axios';

// ✅ Correct – always throw AxiosError
const myAdapter = async (config) => {
  try {
    // ... perform request ...
  } catch (err) {
    throw new AxiosError(err.message, err.code, config);
  }
};

// ❌ Incorrect – plain errors bypass the cache error handler
const badAdapter = async (config) => {
  throw new TypeError('socket hang up'); // cache state becomes stuck!
};
```
