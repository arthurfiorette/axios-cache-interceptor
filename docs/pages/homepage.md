<br />
<div align="center">
  <code
    ><a href="https://github.com/arthurfiorette/axios-cache-interceptor/issues"
      ><img
        src="https://img.shields.io/github/issues/arthurfiorette/axios-cache-interceptor?logo=github&label=Issues"
        target="_blank"
        alt="Issues" /></a
  ></code>
  <code
    ><a href="https://github.com/arthurfiorette/axios-cache-interceptor/stargazers"
      ><img
        src="https://img.shields.io/github/stars/arthurfiorette/axios-cache-interceptor?logo=github&label=Stars"
        target="_blank"
        alt="Stars" /></a
  ></code>
  <code
    ><a href="https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/LICENSE"
      ><img
        src="https://img.shields.io/github/license/arthurfiorette/axios-cache-interceptor?logo=githu&label=License"
        target="_blank"
        alt="License" /></a
  ></code>
  <code
    ><a href="https://codecov.io/gh/arthurfiorette/axios-cache-interceptor"
      ><img
        src="https://codecov.io/gh/arthurfiorette/axios-cache-interceptor/branch/main/graph/badge.svg?token=ML0KGCU0VM"
        target="_blank"
        alt="Codecov" /></a
  ></code>
  <code
    ><a href="https://twitter.com/acdlite/status/974390255393505280"
      ><img
        src="https://img.shields.io/badge/speed-Blazing%20%F0%9F%94%A5-brightgreen.svg"
        target="_blank"
        alt="Blazing Fast" /></a
  ></code>
  <br />
  <code
    ><a href="https://www.npmjs.com/package/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/npm/dm/axios-cache-interceptor?style=flat"
        target="_blank"
        alt="Downloads" /></a
  ></code>
  <code
    ><a href="https://bundlephobia.com/package/axios-cache-interceptor@latest"
      ><img
        src="https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat"
        target="_blank"
        alt="Minified Size" /></a
  ></code>
  <code
    ><a href="https://packagephobia.com/result?p=axios-cache-interceptor@latest"
      ><img
        src="https://packagephobia.com/badge?p=axios-cache-interceptor@latest"
        target="_blank"
        alt="Install Size" /></a
  ></code>
  <code
    ><a href="https://npm.runkit.com/axios-cache-interceptor"
      ><img
        src="https://img.shields.io/badge/try%20on-RunKit-brightgreen"
        target="_blank"
        alt="Try on RunKit" /></a
  ></code>
  <br />
  <br />
</div>

<h3 align="center">
  <code>axios-cache-interceptor</code> is a small and efficient cache interceptor for axios.
  <br />
  <br />
</h3>

<br />

```js #runkit
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

// same object, but with updated typings.
const axios = setupCache(Axios);

const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');

const [res1, res2] = await Promise.all([req1, req2]);

console.log('Request 1:', res1.cached);
console.log('Request 2:', res2.cached);
```
