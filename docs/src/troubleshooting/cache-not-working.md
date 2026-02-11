# Cache Not Working

Diagnostic guide when requests are not being cached.

## Quick Checklist

### 1. Is the HTTP method cacheable?

**Problem:** Only GET and HEAD are cached by default.

**Check:**
```ts
console.log(response.config.method); // Should be 'get' or 'head'
```

**Solution:**
```ts
const axios = setupCache(instance, {
  methods: ['get', 'head', 'post'] // Add methods as needed
});
```

### 2. Is caching enabled?

**Check:**
```ts
const response = await axios.get('/api/users');
console.log(response.config.cache?.enabled); // Should not be false
```

**Solution:**
```ts
cache: { enabled: true }
```

### 3. Does status code pass?

**Problem:** Status code might not be cacheable.

**Default cacheable codes:** 200, 203, 300, 301, 302, 404, 405, 410, 414, 501

**Solution:**
```ts
const axios = setupCache(instance, {
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 300
  }
});
```

### 4. Server headers saying "don't cache"?

**Check debug output:**
```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});
```

Look for: "Cache header interpreted as 'dont cache'"

**Solution:**
```ts
cache: {
  interpretHeader: false,
  ttl: 1000 * 60 * 5
}
```

### 5. URL excluded?

**Check:**
```ts
// Your URL might match ignoreUrls pattern
```

**Solution:**
```ts
const axios = setupCache(instance, {
  cachePredicate: {
    ignoreUrls: [] // Remove or adjust patterns
  }
});
```

## Diagnostic Script

```ts
import { setupCache } from 'axios-cache-interceptor/dev';

const axios = setupCache(instance, {
  debug: console.log
});

async function diagnose() {
  const res1 = await axios.get('/api/users');
  console.log({ cached: res1.cached, id: res1.id });

  const cache = await axios.storage.get(res1.id);
  console.log('Storage:', cache.state);

  const res2 = await axios.get('/api/users');
  console.log({ cached: res2.cached });
}
```

## Next Steps

- [Debugging Guide](/journey/debugging-issues.md) - Systematic debugging
- [Cache Predicate](/api/cache-predicate.md) - Configuration reference
