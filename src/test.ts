import axios from 'axios';
import { createCache } from './';
import { SessionCacheStorage } from './storage';

// My own api
const api = axios.create();

const cache = createCache(api, {
  // Store values on window.sessionStorage
  storage: new SessionCacheStorage(),

  // Use the max-age header to determina the cache expiration time
  interpretHeader: true
});

cache.get('http://example.com/');
