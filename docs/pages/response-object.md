# Response object

Every response that came from our custom axios instance will have some extras properties.

```js #runkit
const axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

setupCache(axios);

const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');

console.log(response);
```

Every response that came from our custom axios instance, will have some extras properties,
that you can retrieve like that:

```js
const result = await cache.get(/* ... */);
const id = result['propertyName'];
```

## `cached`

A simple boolean to check whether this request was cached or not.

**NOTE**: The first response of a request capable of being cached will return
`cached: false`, as only your next requests will return `cached: true`.

## `id`

The resolved [request id](pages/request-id.md). This property represents the ID used
throughout the internal code.

Remember that, depending on the
[Key Generator](pages/global-configuration?id=generateKey), it can be different as the
provided on the [Request Id](pages/per-request-configuration?id=id).
