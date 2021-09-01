// Readme example

import axios from 'axios';
import { createCache, SessionCacheStorage } from '../src/index';

// Any custom axios instance
const api = axios.create();

// Other axios instance with caching enabled
const cache = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determina the cache expiration time
  interpretHeader: true
});

// Exactly the same as before
cache.get('http://example.com/');
