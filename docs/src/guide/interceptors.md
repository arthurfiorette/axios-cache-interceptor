# Other Interceptors

When combining `axios-cache-adapter` with other interceptors, you may encounter some
inconsistences. Which is explained in the next section.

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

As this package overrides the `AxiosInstance` interface with its own types,
in case of adding other interceptors or custom code, you need to create
a proper namespace for them:

```ts
declare module 'axios-cache-interceptor' {
  interface CacheRequestConfig<R = any, D = any> {
    customProperty: string;
  }
}
```

