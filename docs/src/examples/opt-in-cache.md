# Opt-in Cache Pattern

Enable caching selectively instead of by default.

## The Pattern

Disable caching globally, enable it per-request:

```ts
import { setupCache } from 'axios-cache-interceptor';

// Disable cache by default
const axios = setupCache(Axios.create(), {
  enabled: false
});

// Most requests won't cache
await axios.get('/api/realtime-prices'); // Not cached

// Enable for specific requests
await axios.get('/api/categories', {
  cache: {
    enabled: true,
    ttl: 1000 * 60 * 60 // Cache for 1 hour
  }
}); // Cached
```

## Complete Example

```ts
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Opt-in configuration
const axios = setupCache(Axios.create({
  baseURL: 'https://api.example.com'
}), {
  enabled: false // Disabled by default
});

// API methods
export const api = {
  // Realtime data - never cache
  async getLivePrices() {
    return axios.get('/prices/live');
  },

  // Static data - cache for 1 hour
  async getCategories() {
    return axios.get('/categories', {
      cache: {
        enabled: true,
        ttl: 1000 * 60 * 60
      }
    });
  },

  // User profile - cache for 5 minutes
  async getUserProfile(userId: string) {
    return axios.get(`/users/${userId}`, {
      id: `user-${userId}`,
      cache: {
        enabled: true,
        ttl: 1000 * 60 * 5
      }
    });
  }
};
```

## Next Steps

- [Cache Predicate](/api/cache-predicate.md) - URL filtering
- [Production Checklist](/journey/production-checklist.md) - Best practices
