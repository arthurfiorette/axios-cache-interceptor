# Request id

A good thing to know is that every request passed through this interceptor, has an id.
**This does not mean that is a unique id**. The id is used in a number of ways, but the
most important is to bind a request to its cache.

The id generation is good enough to generate the same id for theoretically sames requests.
The example of this is a request with `{ baseUrl: 'https://a.com/', url: '/b' }` results
to the same id with `{ url: 'https://a.com/b/' }`.

Also, a custom id can be used to treat two requests as the same.

```js #runkit
const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

// Global
setupCache(Axios);

const { id } = await Axios.get('https://jsonplaceholder.typicode.com/posts/1', {
  baseURL: 'baseURL',
  query: { name: 'value' }
});

console.log('Id 1: ' + id);
console.log('Cache 1:', await Axios.storage.get(id));

const { id: id2 } = await Axios.get('https://jsonplaceholder.typicode.com/posts/1', {
  id: 'my-overrided-id'
});

console.log('Id 2: ' + id2);
console.log('Cache 2:', await Axios.storage.get(id2));
```

The
[default](https://github.com/arthurfiorette/axios-cache-interceptor/blob/main/src/util/key-generator.ts)
id generation can clarify this idea.
