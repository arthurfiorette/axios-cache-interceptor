# Installing

<a href="https://bundlephobia.com/package/axios-cache-interceptor@latest"
    ><img
      src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat"
      target="_blank"
      alt="Minified Size"
  /></a> <a href="https://packagephobia.com/result?p=axios-cache-interceptor@latest"
    ><img
      src="https://packagephobia.com/badge?p=axios-cache-interceptor@latest"
      target="_blank"
      alt="Install Size"
  /></a>

At **0.7.8**, this library got tuned to be more smaller, so it provides **5** different
bundling options.

## With Npm

```sh
# Npm
npm install --save axios axios-cache-interceptor

# Yarn
yarn add axios axios-cache-interceptor
```

```js
// CommonJS
const { setupCache } = require('axios-cache-interceptor');
import { setupCache } from 'axios-cache-interceptor';

// ES Modules
import { setupCache } from 'axios-cache-interceptor/esm';

// Universal
const { setupCache } = require('axios-cache-interceptor/umd');
```

## With CDNs

```js
const { setupCache } = window.AxiosCacheInterceptor;
```

```html
<!-- Replace latest with the desired version -->

<!-- Production for ES6+ (~11.3KB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.1/umd/es6.min.js"
  crossorigin
></script>

<!-- Production for ES5+ (~18.2KB) (Needs polyfill) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.1/umd/es5.min.js"
  crossorigin
></script>
```

## With URL imports

You can import any [CDN Url](#with-cdns) and use it in your code. **UMD Compatible**

```js
// ESM with Skypack CDN (Preferred!)
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor@0.8.1?dts';

// UMD bundled code
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.1/umd/index.min.js';
```

## Support List

Below you can check what version of this package is supported by your version of axios.
But that does not mean that won't work with any version. **Most of "breaking changes" made
by axios was it's types.**

> **NOTE**: Below v0.3, axios was not configured as a peer dependency

| [Version](https://github.com/arthurfiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.5`                                                                     | `>= v0.24`                                       |
| `~ v0.4`                                                                      | `>= v0.23`                                       |
| `~ v0.3`                                                                      | `>= v0.22`                                       |
| `<= v0.2`                                                                     | `v0.21`                                          |
