// @ts-nocheck
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

// Make a simple request, with caching support, to the api
const { data } = await cachedApi.get('https://api.example.com/');
