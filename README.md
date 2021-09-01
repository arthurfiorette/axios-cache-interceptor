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
</div>

#

<br />
<br />

<div align="center"><b><pre>This library is in beta and can have breaking changes until v1.</pre></b></div>

<br />
<br />

#### `axios-cache-interceptor` is a axios adapter for caching and preventing unneeded requests

<br />

```ts
import axios from 'axios';
import { createCache, SessionCacheStorage } from 'axios-cache-interceptor';

// Any custom axios instance
const api = axios.create();

// Other axios instance with caching enabled
const cache = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determina the cache expiration time
  interpretHeader: true
});

// Exactly the same as before
cache.get('http://example.com/');
```

<br />
<br />

### Installing

```sh
# Npm
npm install --save axios-cache-interceptor

# Yarn
yarn add axios-cache-interceptor
```

<br />

### Inspiration

This project is highly inspired by several projects, written entirely in typescript, supporting https headers and much more,

Take a look at some projects:

- [axios-cache-adapter](https://github.com/RasCarlito/axios-cache-adapter)
- [axios-cache-plugin](https://github.com/jin5354/axios-cache-plugin)
- [@tusbar/cache-control](https://github.com/tusbar/cache-control)

<br />

### License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more informations.

<br />

### Contact

See my contact information on my [github profile](https://github.com/ArthurFiorette) or open a new issue.

<br />
