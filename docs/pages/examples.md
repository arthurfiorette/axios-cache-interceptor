# Usage and Examples

> There are more examples in the
> [examples folder](https://github.com/arthurfiorette/axios-cache-interceptor/tree/main/examples)
> github repository, check them out!
>
> Please, don't hesitate to open an PR with your own examples and use cases.

## Nodejs Server

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

## React Component

> You shouldn't
> [store cache in state libraries](https://betterprogramming.pub/why-you-should-be-separating-your-server-cache-from-your-ui-state-1585a9ae8336),
> it even is a bad practice. And even if you do so, you are going to write a lot of error
> prone code to handle cache invalidation, caching strategies and so on.

I'm also the maintainer of
[`Axios Cache Hooks`](https://tinylibs.js.org/packages/axios-cache-hooks/), a
[**950B**](https://bundlephobia.com/package/axios-cache-hooks) library that just provide
you a simple and complete react hook to use with your axios cached instance.

It is a super powerful hook, because it will share the same updatable piece of data for
every request with the same [id](pages/request-id.md). By using a
[web storage](pages/storages.md?id=Web-storage) with it, you are up to **share component
level data in a micro frontend scale**.

```ts
import Axios from 'axios';
import { createAxiosHooks } from 'axios-cache-hooks';
import { setupCache } from 'axios-cache-interceptor';

const axios = setupCache(Axios);
const { useQuery, useMutation } = createAxiosHooks();

function Component() {
  const [user, { loading, error }] = useQuery<User>(() => axios.get('/users/123'));

  if (loading)
    return (
      <div class=":)">
        <p>Loading...</p>
      </div>
    );

  if (error) {
    console.error(error);

    return (
      <div class=":(">
        <p>Error!</p>
      </div>
    );
  }

  return (
    <div class=":)">
      <div>{user.name}</div>
    </div>
  );
}
```
