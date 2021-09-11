// Readme example

import axios from 'axios';
import { createCache, SessionCacheStorage } from '../src/index';

// Any custom axios instance
const api = axios.create();

// Other axios instance with caching enabled
const cachedApi = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determine the cache expiration time
  interpretHeader: true
});

// Make a requests that's only cached if the response comes with success header
cachedApi.get('http://example.com/', {
  cache: {
    cachePredicate: {
      containsHeaders: ['success']
    }
  }
});
