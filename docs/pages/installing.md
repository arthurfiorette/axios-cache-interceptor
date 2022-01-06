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
bundling, ranging around `12Kb`.

## With Npm

```sh
# Npm
npm install --save axios axios-cache-interceptor

# Yarn
yarn add axios axios-cache-interceptor
```

```js
const { setupCache } = require('axios-cache-interceptor');
import { setupCache } from 'axios-cache-interceptor';
```

## With CDNs

```js
const { setupCache } = window.AxiosCacheInterceptor;
```

<!-- https://www.jsdelivr.com/package/npm/axios-cache-interceptor?path=dist -->

```html
<!-- Replace latest with the desired version -->

<!-- Development for ES2020+ (~30KB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.7.9/dist/index.development.js"
  integrity="sha256-cc2xzKkQUWztnCDJX78AMx94lDaGvtzjO9yWiKgRX20="
  crossorigin="anonymous"
></script>

<!-- Production for ES6+ (~12KB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.7.9/dist/index.min.js"
  integrity="sha256-okV+KLrPdAAEelxNjua//SqIBcQvlsAy/4ukw9uegVk="
  crossorigin="anonymous"
></script>

<!-- Production for ES5+ (~22KB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.7.9/dist/index.es5.min.js"
  integrity="sha256-++wSj3PlGEihoffpOH1y5/vC44MBGYLDfp8fXZBjba4="
  crossorigin="anonymous"
></script>

<!-- Production for ES2020+ (~9KB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.7.9/dist/index.es2020.min.js"
  integrity="sha256-yAK7c5kbqsc3IP6c28fiatnYaFE8yKDTOOatiNgBM9g="
  crossorigin="anonymous"
></script>
```

## With URL imports

You can import any [CDN Url](#with-cdns) and use it in your code. **UMD Compatible**

```js
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.7.9/dist/index.es2020.min.js';
```

## Support List

Below you can check what version of this package is supported by your version of axios.
But that does not mean that won't work with any version. **Most of "breaking changes" made
by axios was it's types.**

> **NOTE**: Below v0.3, axios was not configured as a peer dependency

| [Version](https://github.com/ArthurFiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.5`                                                                     | `>= v0.24`                                       |
| `~ v0.4`                                                                      | `>= v0.23`                                       |
| `~ v0.3`                                                                      | `>= v0.22`                                       |
| `<= v0.2`                                                                     | `v0.21`                                          |
