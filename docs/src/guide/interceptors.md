# Other Interceptors

When combining `axios-cache-interceptors` with other interceptors, you may encounter some
inconsistencies. Which is explained in the next section.

## TL;DR

- **Request** interceptors registered before `setupCache()` are ran before and
  registrations made after are ran after.
- **Response** interceptors registered before `setupCache()` are ran **after** and
  registrations made after are ran **before**.

## Explanation

Axios interceptors are ran differently for the request and response ones.

- **Request interceptors** are FILO _(First In Last Out)_
- **Response interceptors** are FIFO _(First In First Out)_

As explained better in the
[Axios documentation](https://github.com/axios/axios#interceptors) and in
[this issue](https://github.com/arthurfiorette/axios-cache-interceptor/issues/449#issuecomment-1370327566).

```ts
// This will be ran BEFORE the cache interceptor
axios.interceptors.request.use((req) => req);

// This will be ran AFTER the cache interceptor
axios.interceptors.response.use((res) => res);

setupCache(axios);

// This will be ran AFTER the cache interceptor
axios.interceptors.request.use((req) => req);

// This will be ran BEFORE the cache interceptor
axios.interceptors.response.use((res) => res);
```

---

## Extending types

When using axios-cache-interceptor, you'll note that it have a different type than the
defaults `AxiosInstance`, `AxiosRequestConfig` and `AxiosResponse`. That's because was
chosen to override axios's interfaces instead of extending, to avoid breaking changes with
other libraries.

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

To do so, you can use the axios's native `transformResponse` option, which is a function
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
