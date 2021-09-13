<br />
<div align="center">
  <pre>
  <br />
  <h1>🗄️📦💿
Axios Cache Interceptor</h1>
  <br />
  </pre>
  <br />
  <br />
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/network/members"
      ><img
        src="https://img.shields.io/github/forks/ArthurFiorette/axios-cache-interceptor?logo=github&label=Forks"
        target="_blank"
        alt="Forks" /></a
  ></code>
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/issues"
      ><img
        src="https://img.shields.io/github/issues/ArthurFiorette/axios-cache-interceptor?logo=github&label=Issues"
        target="_blank"
        alt="Issues" /></a
  ></code>
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/stargazers"
      ><img
        src="https://img.shields.io/github/stars/ArthurFiorette/axios-cache-interceptor?logo=github&label=Stars"
        target="_blank"
        alt="Stars" /></a
  ></code>
  <code
    ><a href="https://github.com/ArthurFiorette/axios-cache-interceptor/blob/main/LICENSE"
      ><img
        src="https://img.shields.io/github/license/ArthurFiorette/axios-cache-interceptor?logo=githu&label=License"
        target="_blank"
        alt="License" /></a
  ></code>
  <code
    ><a href="https://codecov.io/gh/arthurfiorette/axios-cache-adapter"
      ><img
        src="https://codecov.io/gh/arthurfiorette/axios-cache-adapter/branch/main/graph/badge.svg"
        target="_blank"
        alt="Codecov" /></a
  ></code>
  <code
    ><a href="https://www.npmjs.com/package/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/npm/v/axios-cache-interceptor?color=CB3837&logo=npm&label=Npm"
        target="_blank"
        alt="Npm" /></a
  ></code>
</div>

<h1></h1>

<br />
<br />

<div align="center"><b><pre>This library is in beta and can have breaking changes until v1.<br />Not ready for production usage!</pre></b></div>

<br />
<br />

#### `axios-cache-interceptor` is a axios wrapper for caching and preventing unneeded requests

<br />

```ts
import axios from 'axios';
import { createCache, SessionCacheStorage } from 'axios-cache-interceptor';

// Any custom axios instance
const api = axios.create();

// Other axios instance with caching enabled
const cachedApi = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determine the cache expiration time
  interpretHeader: true
});

// Make a simple request, with caching support, to the api
const { data } = await cachedApi.get('https://api.example.com/');
```

<br />
<br />

### Installing

> Axios is a peer dependency and must be installed separately.

```sh
# Npm
npm install --save axios axios-cache-interceptor

# Yarn
yarn add axios axios-cache-interceptor
```

<br />

### Inspiration

This project is highly inspired by several projects, written entirely in typescript, supporting
https headers and much more.

Take a look at some similar projects:

- [axios-cache-adapter](https://github.com/RasCarlito/axios-cache-adapter)
- [axios-cache-plugin](https://github.com/jin5354/axios-cache-plugin)
- [@tusbar/cache-control](https://github.com/tusbar/cache-control)

<br />

### License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

<br />

### Contact

See my contact information on my [github profile](https://github.com/ArthurFiorette) or open a new
issue.

<br />
