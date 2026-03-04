# Header Interpretation

How axios-cache-interceptor interprets HTTP headers to determine TTL.

## Default Interpreter

The library includes a default header interpreter that follows HTTP standards:

```ts
function defaultHeaderInterpreter(headers) {
  // Check for no-cache directives
  if (headers['cache-control']?.includes('no-cache')) {
    return 'dont cache';
  }

  if (headers['cache-control']?.includes('no-store')) {
    return 'dont cache';
  }

  // Calculate from max-age
  const maxAge = parseMaxAge(headers['cache-control']);
  if (maxAge !== null) {
    return maxAge * 1000; // Convert to milliseconds
  }

  // Calculate from Expires header
  const expires = parseExpires(headers['expires']);
  if (expires !== null) {
    return expires - Date.now();
  }

  // Not enough headers to determine TTL
  return 'not enough headers';
}
```

## Return Values

The interpreter can return:

**`'dont cache'`** - Response should not be cached
- Cache-Control: no-cache
- Cache-Control: no-store

**`'not enough headers'`** - Use configured TTL
- No caching headers present
- Headers cannot be parsed

**`number`** - TTL in milliseconds
- Calculated from Cache-Control or Expires

**`{ cache: number, stale: number }`** - TTL and stale TTL
- Cache-Control: max-age=600, stale-while-revalidate=86400

## Custom Interpreter

Implement custom header logic:

```ts
import { setupCache, type HeaderInterpreter } from 'axios-cache-interceptor';

const myInterpreter: HeaderInterpreter = (headers) => {
  // Custom header support
  if (headers['x-cache-ttl']) {
    return Number(headers['x-cache-ttl']) * 1000;
  }

  // Different no-cache logic
  if (headers['x-no-cache'] === 'true') {
    return 'dont cache';
  }

  // Fallback to default behavior
  return 'not enough headers';
};

const axios = setupCache(instance, {
  headerInterpreter: myInterpreter
});
```

## Disabling Interpretation

Ignore headers entirely:

```ts
const axios = setupCache(instance, {
  interpretHeader: false,
  ttl: 1000 * 60 * 5 // Always use 5 minutes
});
```

## Per-Request Override

```ts
await axios.get('/api/data', {
  cache: {
    interpretHeader: false,
    ttl: 1000 * 60 * 15
  }
});
```

## Next Steps

- [HTTP Caching Headers](/concepts/http-caching-headers.md) - Header reference
- [Header Interpreter API](/api/header-interpreter.md) - Custom interpreter guide
