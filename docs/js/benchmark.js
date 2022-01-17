const Axios = require('axios').default;
const express = require('express');
const { execSync } = require('child_process');
const interceptor = require('../../cjs');
const adapter = require('axios-cache-adapter');

const TIMES = 1_000_000;

const port = 8734;
const host = '0.0.0.0';

async function bench(axios) {
  const init = Date.now();

  let times = TIMES;

  while (times--) {
    await axios.get(`http://${host}:${port}/`);
  }

  return Date.now() - init;
}

function printResult(name, milliseconds, networkRequests, axiosTime) {
  const seconds = milliseconds / 1000;
  const axiosSeconds = axiosTime ? axiosTime / 1000 : seconds;

  console.log();
  console.log(`# ${name}`);
  console.log(`Time: ${seconds}s`);
  console.log(`Requests per second: ${(TIMES / seconds).toFixed(3)}/s`);
  console.log(`Network requests: ${networkRequests} of ${TIMES}`);
  console.log(
    `Increase from pure axios: ${((100 * axiosSeconds) / seconds).toFixed(3)}%`
  );
  console.log();
}

(async () => {
  const counter = { name: 'none' };

  const app = express();
  app.get('/', (_, res) => {
    counter[counter.name] = counter[counter.name] + 1;
    return res.json({ rnd: Math.random(), text: 'Hello World' });
  });

  const server = app.listen(port, host);

  console.log(`Simulating ${TIMES} requests...`);
  console.log(`Run at ${new Date().toUTCString()}`);
  console.log(`Commit: ${execSync('git rev-parse HEAD').toString()}`);

  counter.name = 'axios';
  counter.axios = 0;
  const withAxios = Axios.create();
  const axiosTime = await bench(withAxios);

  printResult('Raw axios', axiosTime, counter.axios);

  counter.name = 'interceptor';
  counter.interceptor = 0;
  const withInterceptor = interceptor.setupCache(Axios.create(), { ttl: 1000 });
  const interceptorTime = await bench(withInterceptor);

  printResult('Axios Cache Interceptor', interceptorTime, counter.interceptor, axiosTime);

  counter.name = 'adapter';
  counter.adapter = 0;
  const withAdapter = adapter.setup({
    cache: { maxAge: 1000 }
  });
  const adapterTime = await bench(withAdapter);

  printResult('Axios Cache Adapter', adapterTime, counter.adapter, axiosTime);

  server.close();
})().catch(console.error);
