# Compiled code

## CommonJS

The code compiled with `CommonJS` is for ES2017+.

```js
import { setupCache } from 'axios-cache-interceptor'; // (Defaults to cjs)
import { setupCache } from 'axios-cache-interceptor/cjs';
```

## UMD

> _NOTE_: Axios itself requires [ES6 Promises](https://axios-http.com/docs/notes#promises)

The UMD code is compiled with `webpack` to support `>= ES5`. See the
[build config](build/webpack.config.js). You can import these files anywhere (Browser,
CommonsJS, ESM and more)

- `axios-cache-interceptor/umd/index.js`: Production file for ES2017+
- `axios-cache-interceptor/umd/dev.js`: Development file (ES2020+)
- `axios-cache-interceptor/umd/es5.js`: Production file for ES5+

```html
<!-- You can also use the cdn of your choice -->

<!-- UNPKG -->
<script src="https://unpkg.com/axios-cache-interceptor"></script>

<!-- JSDELIVR -->
<script src="https://cdn.jsdelivr.net/npm/axios-cache-interceptor"></script>

<!-- Etc... -->
```

```js
import { setupCache } from 'axios-cache-interceptor/umd';
```

## ESModule

The code compiled with `ESModule` is for ES2017+.

This library exports its `ESM` code at `axios-cache-interceptor/esm`. It's useful to
enable _tree-shaking_ and other optimizations. You probably won't have to directly import
from this folder, instead, bundlers should do that for you.

```js
import { setupCache } from 'axios-cache-interceptor/esm';
```

## Development bundles

All development bundles are compiled with support for ES2020+, and are available as UMD,
CJS and ESM.

```js
import { setupCache } from 'axios-cache-interceptor/esm/dev';
const { setupCache } = require('axios-cache-interceptor/umd/dev');

// https://cdn.jsdelivr.net/npm/axios-cache-interceptor/umd/dev.js
const { setupCache } = window.AxiosCacheInterceptor;
```

See more about them at [Development mode](pages/development-mode.md)
