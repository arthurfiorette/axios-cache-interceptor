# Compiled code

## NodeJS

The code is compiled with `tsc` with support to `>= ES6`. See the
[build config](/tsconfig.build.json).

- `axios-cache-interceptor`: Redirects to `/dist/index.js`
- `axios-cache-interceptor/dist/index.js`: The main library file.
- `axios-cache-interceptor/dist/index.d.ts`: The Typescript definition file.

Every browser build is also compatible with CommonsJS because it builds with UMD, so you
can use them too.

## Browsers

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