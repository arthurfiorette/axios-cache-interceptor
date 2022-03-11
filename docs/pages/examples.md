# Usage and Examples

> There are more examples in the
> [examples folder](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/examples)
> github repository, check them out!
>
> Please, don't hesitate to open an PR with your own examples and use cases.

## Nodejs server example

An **NodeJS** with **ExpressJS** example to return data from another api.

```js #runkit endpoint
const express = require('express');
const app = express();

const Axios = require('axios');
const { setupCache } = require('axios-cache-interceptor');

const api = setupCache(
  Axios.create({ baseURL: 'https://jsonplaceholder.typicode.com/' }),
  // 5 seconds
  { ttl: 5 * 1000 }
);

// Every time an api call reaches here, it will
// make another internal request and forward the response.
app.get('/', (req, res) => {
  api.get('/users').then(
    ({ data, cached, id }) => {
      res.json({
        cached,
        id: {
          value: id,
          deleteUrl: `/cache/${id}/delete`,
          getUrl: `/cache/${id}/get`
        },
        data
      });
    },
    (error) => {
      res.json({ error });
    }
  );
});

app.get('/cache/:id/delete', async (req, res) => {
  await api.storage.remove(req.params.id);
  res.send({
    status: 'Deleted!',
    current: await api.storage.get(req.params.id)
  });
});

app.get('/cache/:id/get', async (req, res) => {
  const cache = await api.storage.get(req.params.id);
  res.json(cache);
});

app.listen(3000);
```

## Jsx component example

You shouldn't
[store cache in state libraries](https://betterprogramming.pub/why-you-should-be-separating-your-server-cache-from-your-ui-state-1585a9ae8336),
it even is a bad practice. And even if you do so, you probably will have to write a lot of
code to handle cache invalidation, strategies and etc.

With this library, you can just call any axios method without worrying about requesting
thousands of times for every component draw. Simple as that!

```jsx
function Component() {
  // React component state (but can be from any other framework, library and etc)
  const [data, setData] = useState(null);

  // Calling this function every component redraw does not have any
  // problems, as the response is cached in the first request. This
  // even work with concurrent requests and for many components at
  // the same time
  axios.get('https://api.example.com').then((response) => {
    setData(response.data);
  });

  return (
    <div class=":)">
      <div>{data}</div>
    </div>
  );
}
```
