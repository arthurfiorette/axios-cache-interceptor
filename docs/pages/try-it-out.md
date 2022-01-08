# Try it out!

```js #runkit
const Axios = require('axios');
const { setupCache, buildWebStorage } = require('axios-cache-interceptor');

const axios = Axios.create({});
setupCache(axios, {});

const result = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
```
