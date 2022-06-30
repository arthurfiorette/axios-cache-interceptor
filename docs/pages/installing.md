# Installing

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat)](https://bundlephobia.com/package/axios-cache-interceptor@latest)
[![Install Size](https://packagephobia.com/badge?p=axios-cache-interceptor@latest)](https://packagephobia.com/result?p=axios-cache-interceptor@latest)

<br />

```bash
npm install axios axios-cache-interceptor
# or
yarn add axios axios-cache-interceptor
```

```js
// CommonJS (ES2017+)
const { setupCache } = require('axios-cache-interceptor');

// EcmaScript (ES2017+)
import { setupCache } from 'axios-cache-interceptor';

// UMD (ES5+)
const { setupCache } = window.AxiosCacheInterceptor;

// ESM with Skypack CDN
import { setupCache } from 'https://cdn.skypack.dev/axios-cache-interceptor@0.10.6';
```

```html
<!-- Development UMD build for ES2017+ (~12.6 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.10.6/dev/index.bundle.js"
  integrity="sha256-LGlGEg6regUeSdKir1yYXDGQEAtSz/cCyJrIBzU1bYg="
  crossorigin="anonymous"
></script>

<!-- Production UMD build for ES5+ (~14.2 KiB) -->
<script
  src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor@0.10.6/dist/index.bundle.js"
  integrity="sha256-yJbSlTxKmgU+sjlMx48OSjoiUsboy18gXTxUBniEEO0="
  crossorigin="anonymous"
></script>
```

<br />

## Axios support table

Below you can check what version of this package is supported by your version of axios.
**But that does not mean that it won't work.**. Axios had many "breaking changes" made
with type declarations. But remember, new features and bug fixes only comes with newer
versions. Please keep your dependencies up to date <3.

> **Note**: Axios is not defined as a `peerDependency`, because it has a non-stable semver
> version (0.x.y).
> [See #145 (Comment)](https://github.com/arthurfiorette/axios-cache-interceptor/issues/145#issuecomment-1042710481)

| [Axios Cache Interceptor](https://github.com/arthurfiorette/axios-cache-interceptor/releases) | [Axios](https://github.com/axios/axios/releases) |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `>= v0.10.3`                                                                                  | `>= v0.27`                                       |
| `>= v0.8.4`                                                                                   | `>= v0.26`                                       |
| `~ v0.8.4`                                                                                    | `~ v0.25`                                        |
| `>= v0.5 && <= 0.8.3`                                                                         | `~ v0.24`                                        |
| `~ v0.4`                                                                                      | `~ v0.23`                                        |
| `~ v0.3`                                                                                      | `~ v0.22`                                        |
| `<= v0.2`                                                                                     | `v0.21`                                          |
