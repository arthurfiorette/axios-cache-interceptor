# Homepage

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
