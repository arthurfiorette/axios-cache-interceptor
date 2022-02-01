/* eslint-disable */

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
