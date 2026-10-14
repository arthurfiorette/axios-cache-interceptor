---
url: https://axios-cache-interceptor.js.org/guide/interceptors.md
---
# Other interceptors

When you combine `axios-cache-interceptor` with other interceptors, the order in which they run
matters.

## Default order

`setupCache(axios)` registers both cache interceptors immediately, and axios runs the two kinds
of interceptors in different orders:

* Request interceptors run in **reverse order**: the last one added runs first (LIFO,
  *Last In, First Out*). Request interceptors registered before `setupCache()` run after the
  cache interceptor, and those registered after it run before it.
* Response interceptors run in **insertion order**: the first one added runs first (FIFO,
  *First In, First Out*). Response interceptors registered before `setupCache()` run before
  the cache interceptor, and those registered after it run after it.

See the [Axios documentation](https://github.com/axios/axios#interceptors) and
[this issue](https://github.com/arthurfiorette/axios-cache-interceptor/issues/449#issuecomment-1370327566)
for more details.

```ts
// Runs AFTER the cache interceptor
axios.interceptors.request.use((req) => req);

// Runs BEFORE the cache interceptor
axios.interceptors.response.use((res) => res);

setupCache(axios);

// Runs BEFORE the cache interceptor
axios.interceptors.request.use((req) => req);

// Runs AFTER the cache interceptor
axios.interceptors.response.use((res) => res);
```

## Custom order

For full control, disable automatic registration with `register: false` and register the
cache interceptors yourself.

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

***

## Extending types

axios-cache-interceptor uses its own types instead of the default `AxiosInstance`,
`AxiosRequestConfig` and `AxiosResponse`. The library defines new interfaces instead of
augmenting axios's own, to avoid breaking other libraries that use axios.

As a result, when you integrate with other packages or write your own interceptor, you need
to extend our `AxiosCacheInstance`, `CacheRequestConfig` and `CacheAxiosResponse` types:

```ts
declare module 'axios-cache-interceptor' {
  interface CacheRequestConfig<R = any, D = any, P = any> {
    customProperty?: string;
  }
}
```

## Streams and non-JSON data

The cache stores `response.data` as it is. A stream can only be read once, so a cached stream
cannot be served again, and storages that serialize entries with `JSON.stringify`, such as
[`buildWebStorage`](./storages.md#web-storage-api), cannot keep buffers either.

To cache non-JSON responses in any storage, ask axios for a serializable type with
`responseType`, such as `'text'`, and use axios's native `transformResponse` option to turn
the data into a string or plain object. It receives the response data and must return the
transformed value synchronously:

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const instance = Axios.create();
const axios = setupCache(instance);
// [!code focus:8]
const response = await axios.get('my-url-that-returns-csv', {
  responseType: 'text',
  transformResponse(data) {
    // You will need to implement this function.
    return convertCsvToObject(data);
  }
});

response.data; // A plain object that can be cached.
```

`transformResponse` only runs for network responses. Cached responses already hold the
transformed data, so it is not applied again.

If you need `response.data` to stay a stream or a buffer, disable the cache for that request
and cache the data manually.

## Custom adapters

If you write a custom axios adapter, **always throw an `AxiosError`** (not a plain `Error` or
any other type) when the request fails. The cache interceptor reads `AxiosError.config` to
identify which in-flight request failed, so it can clean up its internal state (the
deferred in the waiting map and the loading cache entry).

If your adapter throws anything else, the interceptor cannot tell which request failed. The
cache entry stays in the `loading` state, and every later request for that key hangs
indefinitely. The development build logs a debug message when this happens.

```ts
import { AxiosError } from 'axios';

// Correct: always throw an AxiosError
const myAdapter = async (config) => {
  try {
    // ... perform request ...
  } catch (err) {
    throw new AxiosError(err.message, err.code, config);
  }
};

// Incorrect: plain errors bypass the cache error handler
const badAdapter = async (config) => {
  throw new TypeError('socket hang up'); // The cache state gets stuck!
};
```
