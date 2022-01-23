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

// Universal (UMD)
const { setupCache } = require('axios-cache-interceptor/umd');
```

## With CDN

```html
<!-- Development build (~12.4 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.5/umd/dev.js"
  integrity="sha256-xIjKHhIfSz8UWokNvc19uUpKpgyScXiT6IODLPEPKlA="
  crossorigin="anonymous"
></script>

<!-- Production for ES6+ (~10.4 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.5/umd/index.js"
  integrity="sha256-qhS8QSRF2iNnqxtAwe4NJ5v/kcxYsLvD0Jf3ss2iLpk="
  crossorigin="anonymous"
></script>

<!-- Production for ES5+ (~13.9 KiB) (Needs Promise polyfill) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.5/umd/es5.js"
  integrity="sha256-EzMv9XzLARcJMVDg0UrCT3r3+sMgnSriAI/nK1opXTI="
  crossorigin="anonymous"
></script>
```

```js
const { setupCache } = window.AxiosCacheInterceptor;
```

## With URL imports

You can import any [CDN Url](#with-cdns) and use it in your code. **UMD Compatible**

```js
// ESM with Skypack CDN
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor@0.8.5';

// UMD with JSDeliver CDN
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.8.5/umd/index.js';
```

## Official support table

Below you can check what version of this package is supported by your version of axios.
**But that does not mean that it won't work.**. Axios had many "breaking changes" made
with type declarations. But remember, new features, bug fixes and etc only comes with
newer versions, so upgrade it <3.

> **NOTE**: Below v0.3, axios was not configured as a peer dependency

| [Axios Cache Interceptor](https://github.com/arthurfiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.8.4`                                                                                   | `>= v0.25`                                       |
| `>= v0.5 && <= 0.8.3`                                                                         | `>= v0.24`                                       |
| `~ v0.4`                                                                                      | `>= v0.23`                                       |
| `~ v0.3`                                                                                      | `>= v0.22`                                       |
| `<= v0.2`                                                                                     | `v0.21`                                          |
