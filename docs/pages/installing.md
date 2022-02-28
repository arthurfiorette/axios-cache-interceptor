# Installing

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat)](https://bundlephobia.com/package/axios-cache-interceptor@latest)
[![Install Size](https://packagephobia.com/badge?p=axios-cache-interceptor@latest)](https://packagephobia.com/result?p=axios-cache-interceptor@latest)

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
<!-- Development build for ES2020+ (~11.2 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.9.2/umd/dev.js"
  integrity="sha256-ppGTu7loKobC0whY8JMCs7u+f4IC25Sxy1SEdkQV8pw="
  crossorigin="anonymous"
></script>

<!-- Production for ES2017+ (~9.76 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.9.2/umd/index.js"
  integrity="sha256-GVujhv/FjIcQS7CSJQmH4jAq0apkRyUwnhpTpmhwmrE="
  crossorigin="anonymous"
></script>

<!-- Production for ES5+ (~14 KiB) (Needs Promise polyfill) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.9.2/umd/es5.js"
  integrity="sha256-IwfbnPJdKLj4NDcX3I9yccqTBcFroIHnmuPb2zqb+6w="
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
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor@0.9.2';

// UMD with JSDeliver CDN
import { setupCache } from 'https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.9.2/umd/index.js';
```

## Official support table

Below you can check what version of this package is supported by your version of axios.
**But that does not mean that it won't work.**. Axios had many "breaking changes" made
with type declarations. But remember, new features and bug fixes only comes with newer
versions. Please keep your dependencies up to date <3.

> **Note**: Axios is not defined as a `peerDependency`, because it has a non-stable semver
> version (0.x.y).
> [See #145 (Comment)](https://github.com/arthurfiorette/axios-cache-interceptor/issues/145#issuecomment-1042710481)

| [Axios Cache Interceptor](https://github.com/arthurfiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.8.4`                                                                                   | `>= v0.26`                                       |
| `~ v0.8.4`                                                                                    | `~ v0.25`                                        |
| `>= v0.5 && <= 0.8.3`                                                                         | `~ v0.24`                                        |
| `~ v0.4`                                                                                      | `~ v0.23`                                        |
| `~ v0.3`                                                                                      | `~ v0.22`                                        |
| `<= v0.2`                                                                                     | `v0.21`                                          |
