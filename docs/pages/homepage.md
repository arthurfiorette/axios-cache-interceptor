[![Issues](https://img.shields.io/github/issues/arthurfiorette/axios-cache-interceptor?logo=github&label=Issues)](https://github.com/arthurfiorette/axios-cache-interceptor/issues)
[![Stars](https://img.shields.io/github/stars/arthurfiorette/axios-cache-interceptor?logo=github&label=Stars)](https://github.com/arthurfiorette/axios-cache-interceptor/stargazers)
[![License](https://img.shields.io/github/license/arthurfiorette/axios-cache-interceptor?logo=githu&label=License)](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/LICENSE)
[![Try on Runkit](https://img.shields.io/badge/try%20on-RunKit-brightgreen?logo=runkit&logoColor=e83e8c)](https://npm.runkit.com/axios-cache-interceptor)
[![Codecov](https://codecov.io/gh/arthurfiorette/axios-cache-interceptor/branch/main/graph/badge.svg?token=ML0KGCU0VM)](https://codecov.io/gh/arthurfiorette/axios-cache-interceptor)
[![Downloads](https://img.shields.io/npm/dw/axios-cache-interceptor?style=flat)](https://www.npmjs.com/package/axios-cache-interceptor)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/axios-cache-interceptor/latest?style=flat)](https://bundlephobia.com/package/axios-cache-interceptor@latest)
[![Packagephobia](https://packagephobia.com/badge?p=axios-cache-interceptor@latest)](https://packagephobia.com/result?p=axios-cache-interceptor@latest)

<br />

## What is this library?

This package is an interceptor for [axios](https://axios-http.com/) that adds caching
capabilities to it. It is a simple, easy to use and powerful library.

You can use it to optimize requests and not have to worry about duplicated requests or
even needing one of those fat javascript libraries for state management.

Axios Cache Interceptor can be understood as an intermediary that will analyze each
request made, check if no similar request has been made before, if so, return it, if not,
wait for the response, warn other requests if they are waiting and return the response.

## Where to start?

- ##### [Installing](pages/installing.md) choose the right bundle to compose in your application.
- ##### [Comparison](pages/comparison.md) see if this package suits all your needs.
- ##### [Nodejs example](pages/usage-examples.md?id=nodejs-server-example) to speed up your server.
- ##### [Jsx (React) example](pages/usage-examples.md?id=jsx-component-example) and avoid state management libraries.
- ##### [Request Configuration](pages/per-request-configuration.md) to make every request unique!

## Interactive example

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
