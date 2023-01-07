# Other Interceptors

When combining `axios-cache-adapter` with other interceptors, you may encounter some
inconsistences. Which is explained in the next section.

## TL;DR

- **Request** interceptors registered **before** `setupCache()` are ran **before** and
  registrations made **after** are ran **after**.
- **Response** interceptors registered
  <strong style="color: var(--vp-c-yellow-light)">before</strong> `setupCache()` are ran
  <strong style="color: var(--vp-c-yellow-light)">after</strong> and registrations made
  <strong style="color: var(--vp-c-yellow-light)">after</strong> are ran
  <strong style="color: var(--vp-c-yellow-light)">before</strong>.

::: details Example

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-adapter';

const axios = Axios.create();

// This will be ran BEFORE the cache interceptor
axios.interceptors.request.use((req) => {
  return req;
});

// This will be ran AFTER the cache interceptor
axios.interceptors.response.use((res) => {
  return res;
});

setupCache(axios);

// This will be ran AFTER the cache interceptor
axios.interceptors.request.use((req) => {
  return req;
});

// This will be ran BEFORE the cache interceptor
axios.interceptors.response.use((res) => {
  return res;
});
```

:::

## Explanation

Axios interceptors are ran differently for the request and response ones.

- **Request interceptors** are FILO _(First In Last Out)_
- **Response interceptors** are FIFO _(First In First Out)_

As explained better in the
[Axios documentation](https://github.com/axios/axios#interceptors) and in
[this issue](https://github.com/arthurfiorette/axios-cache-interceptor/issues/449#issuecomment-1370327566).

::: details Another example

```ts
axios.interceptors.request.use((req) => {
  console.log(1);
  return req;
});

axios.interceptors.response.use((res) => {
  console.log(2);
  return res;
});

// setupCache registers internal interceptors
setupCache(axios);

axios.interceptors.request.use((req) => {
  console.log(3);
  return req;
});

axios.interceptors.response.use((res) => {
  console.log(4);
  return res;
});
```

Which prints out `3`, `1`, `2`, `4` when the request is made.

:::
