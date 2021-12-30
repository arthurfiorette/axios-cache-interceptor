/* eslint-disable @typescript-eslint/no-var-requires */

const { create: createAxios } = require('axios').default;
const { setupCache } = require('../dist');

async function main() {
  const axios = setupCache(
    // creating axios instance
    createAxios({
      baseUrl: 'https://registry.npmjs.org/'
    }),

    // configuring the cache
    {
      ttl: 99999,

      // Parse the Cache-Control header to determine the cache strategy
      interpretHeader: true
    }
  );

  const fetchedResponse = await axios.get('/axios-cache-interceptor');

  // This won't made a network request, because the response is already cached
  const cachedResponse = await axios.get('/axios-cache-interceptor');

  console.log('First request was cached?');
  console.log(fetchedResponse.cached, '\n');

  console.log('Second request was cached?');
  console.log(cachedResponse.cached, '\n');

  console.log('The interpretHeader option used a different strategy', '\n');
  console.log('See the received Cache-Control header');
  console.log(fetchedResponse.headers['cache-control'], '\n');
  console.log('And also the received Age header');
  console.log(fetchedResponse.headers['age'], '\n');

  const cacheInformation = await axios.storage.get(fetchedResponse.id);

  console.log(
    'As you can see, the TTL used was the maxAge cache directive minus the Age header',
    '\n'
  );
  console.log('See the time to live in the cache: ');
  console.log(cacheInformation.ttl, '\n');

  console.log(
    "If you disable the interpretHeader option you'll see that the TTL will be the default (99999)\n"
  );

  // Remove the old cache by brute force
  await axios.storage.remove(fetchedResponse.id);

  const refetchedResponse = await axios.get('/axios-cache-interceptor', {
    cache: {
      // This time with interpretHeader disabled
      interpretHeader: false
    }
  });

  const refetchedInformation = await axios.storage.get(refetchedResponse.id);

  console.log('Third request TTL:');
  console.log(refetchedInformation.ttl);
}

main();
