# Compiled code

## CommonJS

The code compiled with `CommonJS` is for ES2017+.

```js
import { setupCache } from 'axios-cache-interceptor'; // (Default is CJS)
import { setupCache } from 'axios-cache-interceptor/cjs';
```

## UMD

> _NOTE_: Axios itself requires [ES6 Promises](https://axios-http.com/docs/notes#promises)

The UMD code is compiled with `webpack` to support `>= ES5`. See the
[build config](build/webpack.config.js). You can import these files anywhere (Browser,
CommonsJS, ESM and more)

- `axios-cache-interceptor/umd/es6.min.js`: Production file for ES6+
- `axios-cache-interceptor/umd/es5.min.js`: Production file for ES5+
- `axios-cache-interceptor/umd/index.js`: Production file for ES2017+

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
