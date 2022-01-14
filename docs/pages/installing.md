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

## With CDN

```js
const { setupCache } = window.AxiosCacheInterceptor;
```

```html
<!-- Production for ES6+ (~12.2KB) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.2/umd/es6.js" integrity="sha256-knwlPudOCSuVUXzq9OMCFjjP/jg+nYQi5oLpZTFmzAk=" crossorigin="anonymous"></script>

<!-- Production for ES5+ (~20.5KB) (Needs Promise polyfill) -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.2/umd/es5.js" integrity="sha256-CKHNTt/NYMXYFQlGdJM2Uc0IWSCQBBhdIPVuFGfEBJ8=" crossorigin="anonymous"></script>
```

## With URL imports

You can import any [CDN Url](#with-cdns) and use it in your code. **UMD Compatible**

```js
// UMD bundled code
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.2/umd/es6.js';

// ESM with Skypack CDN
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor@0.8.2';
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
