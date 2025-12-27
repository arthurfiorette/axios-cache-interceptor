const http = require('node:http');
const axios = require('axios');
const { setupCache } = require('./dev/index.cjs');

// Server that returns different responses based on Authorization
const server = http.createServer((req, res) => {
  const auth = req.headers.authorization;

  res.setHeader('Vary', 'Authorization');

  if (auth === 'Bearer 123') {
    res.write('Hello, user 123!');
  } else if (auth === 'Bearer 456') {
    res.write('Hello, user 456!');
  } else {
    res.write('Unknown');
  }

  res.end();
});

server.listen(5000);

// Client making requests with different tokens
const cachedAxios = setupCache(axios.create());

const server2 = http.createServer(async (_req, res) => {
  const authHeader = Math.random() < 0.5 ? 'Bearer 123' : 'Bearer 456';

  const response = await cachedAxios.get('http://localhost:5000', {
    headers: { Authorization: authHeader },
    cache: { vary: true }
  });

  console.log({ response: response.data, cached: response.cached, auth: authHeader });
  res.write(response.data);
  res.end();
});

server2.listen(5001);

// Trigger 10 requests
Promise.all(
  Array.from({ length: 10 }, () => axios.get('http://localhost:5001').catch(console.error))
).finally(() => {
  server.close();
  server2.close();
});
