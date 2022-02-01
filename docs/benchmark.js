/* eslint-disable */

const Benny = require('benny');
const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

const Axios = require('axios').default;
const AxiosInstance = Axios.create();

const AxiosCacheInterceptor = require('../cjs');
const InterceptorInstance = AxiosCacheInterceptor.setupCache(Axios.create());

const AxiosCacheAdapter = require('axios-cache-adapter');
const AdapterInstance = AxiosCacheAdapter.setup({});

const config = {
  port: 8734,
  host: '0.0.0.0'
};

const data = {};
const runs = {};
const app = require('express')();

app.get('/:name', ({ params }, res) => {
  data[params.name] ? data[params.name]++ : (data[params.name] = 1);

  return res.json({
    computation: Math.random(),
    name: params.name
  });
});

const server = app.listen(config.port, config.host);

Benny.suite(
  'Benchmark Result',

  Benny.add('axios', async () => {
    const name = 'axios';
    runs[name] ? runs[name]++ : (runs[name] = 1);

    await AxiosInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.add('cache-interceptor', async () => {
    const name = 'cache-interceptor';
    runs[name] ? runs[name]++ : (runs[name] = 1);

    await InterceptorInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.add('cache-adapter', async () => {
    const name = 'cache-adapter';
    runs[name] ? runs[name]++ : (runs[name] = 1);

    await AdapterInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.cycle(),
  Benny.complete((summary) => {
    server.close();

    writeFileSync(
      'pages/_comparison-benchmark.md',
      `# Result

Run at ${new Date().toUTCString()}
Commit: ${execSync('git rev-parse HEAD').toString()}
${summary.results
  .sort((a, b) => a.percentSlower - b.percentSlower)
  .map(
    (options) => `
${options.name.split('-').join(' ').toUpperCase()}
Operations: ${options.ops}/s
Network requests: ${data[options.name]} of ${runs[options.name]}
Performance: ${100 - Math.round(options.percentSlower)}%`
  )
  .join('\n')}
`
    );
  })
);
