## What is this library?

This package is an interceptor for [axios](https://axios-http.com/) that adds caching capabilities to it. It is a simple, easy to use and powerful library.

You can use it to optimize requests and not have to worry about duplicated requests or even needing one of those fat javascript libraries for state management.

## Features

- [x] Concurrent requests
- [x] Typescript support
- [x] Unit tests
- [x] Header interpretation
- [x] ETag and If-Modified-Since cache support
- [x] Infinity storage options
- [x] Cache revalidation from responses
- [x] Support for external storages

## Compiled code

### NodeJS

The code is compiled with `tsc` with support to `>= ES6`. See the
[build config](/tsconfig.build.json).

- `axios-cache-interceptor`: Redirects to `/dist/index.js`
- `axios-cache-interceptor/dist/index.js`: The main library file.
- `axios-cache-interceptor/dist/index.d.ts`: The Typescript definition file.

Every browser build is also compatible with CommonsJS because it builds with UMD, so you
can use them too.

### Url Imports

For those who wants to import this package as a http url, the `index.es2020.min.js` is for
you.

```ts
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest/dist/index.es2020.min.js';
```

### Browsers

> _NOTE_: Axios itself requires [ES6 Promises](https://axios-http.com/docs/notes#promises)

The UMD code is compiled with `webpack` with support to `>= ES5`. See the
[build config](/webpack.config.js). You can import these files anywhere (Browser,
CommonsJS and more)

- `axios-cache-interceptor/dist/index.min.js`: Production file for ES6+
- `axios-cache-interceptor/dist/index.es5.min.js`: Production file for ES5+
- `axios-cache-interceptor/dist/index.es2020.min.js`: Production file for ES2020+
- `axios-cache-interceptor/dist/index.development.js`: Development file

```html
<!-- You can use the cdn of your choice -->

<!-- UNPKG -->
<script crossorigin src="https://unpkg.com/axios-cache-interceptor@latest"></script>

<!-- JSDELIVR -->
<script
  crossorigin
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@latest"
></script>

<!-- Etc... -->
```

## Typescript Users

This package does not pollute the global axios typings. Instead, the `setupCache` returns
the same axios instance but with **extended** typings.

```ts
const axios = axios.create();
axios == setupCache(axios, {});
```

In this way, we recommend you to not use a global axios instance with typescript, so you
can use all exported types from `axios-cache-interceptor` by creating a new variable.

```ts
import Axios from 'axios';
import { setupCache, AxiosCacheInstance } from 'axios-cache-interceptor';

// instance will have our custom typings from the return of this function
const instance = setupCache(
  Axios.create({
    // Axios options
  }),
  {
    // Axios-cache-interceptor options
  }
);

// OR

const instance = axios.create({
  // Axios options
}) as AxiosCacheInstance;

// As this functions returns the same axios instance but only with
// different typings, you can ignore the function return.
setupCache(instance, {
  // Axios-cache-interceptor options
});
```