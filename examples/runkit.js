/* eslint-disable */

const { create: createAxios } = require('axios').default;
const { setupCache } = require('axios-cache-interceptor');
const { log } = console;

//
// Complete documentation at:
// https://axios-cache-interceptor.js.org/
//

(async () => {
  const axios = setupCache(
    // creating axios instance
    createAxios({ baseURL: 'https://registry.npmjs.org/' }),
    // configuring the cache
    { ttl: 99999, interpretHeader: true }
  );

  const fetchedResponse = await axios.get('/axios-cache-interceptor');
  // fetchedResponse.cached == false

  //
  // The next request won't do a network request, because the response is already cached
  //

  const cachedResponse = await axios.get('/axios-cache-interceptor');
  // cachedResponse.cached == true

  log(`First request was ${fetchedResponse.cached ? 'cached' : 'fetched'}`);
  log(`Second request was ${cachedResponse.cached ? 'cached' : 'fetched'}`);

  //
  // The interpretHeader option used a different strategy, see the received Cache-Control header
  // (server may return undefined if this is the first request in a while :))
  //

  log(`Fetched response Cache-Control: ${fetchedResponse.headers['cache-control']}`);
  log(`Fetched response Age: ${fetchedResponse.headers['age']}`);

  const cacheInformation = await axios.storage.get(fetchedResponse.id);

  //
  // As you can see, the TTL used was the maxAge cache directive minus the Age header
  //

  log(`Cache TTL info: ${cacheInformation.ttl}`);

  //
  // If you disable the interpretHeader option you'll see that the TTL will be the default (99999)\n
  //

  // Remove the old cache by brute force
  await axios.storage.remove(fetchedResponse.id);

  const refetchedResponse = await axios.get('/axios-cache-interceptor', {
    cache: {
      // This time with interpretHeader disabled
      interpretHeader: false
    }
  });

  const refetchedInformation = await axios.storage.get(refetchedResponse.id);

  log(`Third request TTL: ${refetchedInformation.ttl}`);
})().catch(console.error);
