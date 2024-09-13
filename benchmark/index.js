const Benny = require('benny');
const { execSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

// Outputs into the documentation folder
const output = path.resolve(__dirname, '../docs/src/generated/benchmark.md');

const Axios = require('axios').default;
const AxiosInstance = Axios.create();

const AxiosCacheInterceptor = require('../dist/index.cjs');
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
  if (data[params.name] === undefined) {
    data[params.name] = 1;
  } else {
    data[params.name]++;
  }

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

    if (runs[name] === undefined) {
      runs[name] = 1;
    } else {
      runs[name]++;
    }

    await AxiosInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.add('cache-interceptor', async () => {
    const name = 'cache-interceptor';

    if (runs[name] === undefined) {
      runs[name] = 1;
    } else {
      runs[name]++;
    }

    await InterceptorInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.add('cache-adapter', async () => {
    const name = 'cache-adapter';

    if (runs[name] === undefined) {
      runs[name] = 1;
    } else {
      runs[name]++;
    }

    await AdapterInstance.get(`http://${config.host}:${config.port}/${name}`);
  }),

  Benny.cycle(),

  Benny.complete((summary) => {
    server.close();

    writeFileSync(
      output,
      `# Result

Run at ${new Date().toUTCString()}

Commit: ${execSync('git rev-parse HEAD').toString()}
${summary.results
  .sort((a, b) => a.percentSlower - b.percentSlower)
  .map(
    (options) => `
## ${options.name.split('-').join(' ').toUpperCase()}
-  Operations: ${options.ops}/s
-  Network requests: ${data[options.name]} of ${runs[options.name]}
-  Performance: ${(100 - options.percentSlower).toFixed(2)}%`
  )
  .join('\n')}
`
    );
  })
);
