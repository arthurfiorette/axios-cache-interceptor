# Development

#### TL;DR: `import { setupCache } from 'axios-cache-interceptor/dev';`

All debugging information is emitted into a different bundle, this way it's possible to
prevent unnecessary code from being bundled into the production build.

Checkout how it helps debugging:

```js #runkit
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor/dev');

const axios = setupCache(Axios, {
  // Print all debug information to the console
  debug: console.log
});

const req1 = axios.get('https://jsonplaceholder.typicode.com/posts/1');
const req2 = axios.get('https://jsonplaceholder.typicode.com/posts/1');

const [res1, res2] = await Promise.all([req1, req2]);

console.log('Request 1:', res1.cached);
console.log('Request 2:', res2.cached);
```
