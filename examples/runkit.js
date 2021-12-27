/* eslint-disable @typescript-eslint/no-var-requires */

const Axios = require('axios');
const { createCache } = require('axios-cache-interceptor');

async function main() {
  const axios = Axios.create({
    baseUrl: 'https://api.github.com'
  });

  /**
   * The same instance of the previous axios, but has custom Typescript types to better intellisense
   *
   * @example
   *
   * ```js
   * axios === axiosWithCache;
   * ```
   */

  const axiosWithCache = createCache(axios, {
    ttl: 99999,

    // Parse the Cache-Control header to determine the cache strategy
    interpretHeader: true
  });

  const fetchedResponse = await axiosWithCache.get(
    'https://registry.npmjs.org//axios-cache-interceptor'
  );

  // This won't made a network request, because the response is already cached
  const cachedResponse = await axiosWithCache.get(
    'https://registry.npmjs.org//axios-cache-interceptor'
  );

  console.log('First request was cached?');
  console.log(fetchedResponse.cached, '\n');

  console.log('Second request was cached?');
  console.log(cachedResponse.cached, '\n');

  console.log('The interpretHeader option used a different strategy', '\n');
  console.log('See the received Cache-Control header');
  console.log(fetchedResponse.headers['cache-control'], '\n');
  console.log('And also the received Age header');
  console.log(fetchedResponse.headers['age'], '\n');

  const cacheInformation = await axiosWithCache.storage.get(fetchedResponse.id);

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
  await axiosWithCache.storage.remove(fetchedResponse.id);

  const refetchedResponse = await axiosWithCache.get(
    'https://registry.npmjs.org//axios-cache-interceptor',
    {
      cache: {
        // This time with interpretHeader disabled
        interpretHeader: false
      }
    }
  );

  const refetchedInformation = await axiosWithCache.storage.get(refetchedResponse.id);

  console.log('Third request TTL:');
  console.log(refetchedInformation.ttl);
}

main();
